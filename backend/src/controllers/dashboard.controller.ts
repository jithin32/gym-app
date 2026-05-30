import { Request, Response } from 'express';
import pool from '../config/db';

export const getAdminStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalMembers, activeToday, pendingFees, revenue, coaches, newJoiners, overduePayments] =
      await Promise.all([
        pool.query("SELECT COUNT(*) FROM members WHERE status = 'active'"),
        pool.query("SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE"),
        pool.query("SELECT COUNT(*) FROM payments WHERE status IN ('pending','overdue')"),
        pool.query(`
          SELECT COALESCE(SUM(amount), 0) AS total
          FROM payments
          WHERE status = 'paid'
            AND DATE_TRUNC('month', paid_date) = DATE_TRUNC('month', CURRENT_DATE)
        `),
        pool.query('SELECT COUNT(*) FROM coaches'),
        pool.query(`
          SELECT COUNT(*) FROM members
          WHERE DATE_TRUNC('month', join_date) = DATE_TRUNC('month', CURRENT_DATE)
        `),
        pool.query(`
          SELECT COUNT(*) FROM payments WHERE status = 'overdue'
          OR (status = 'pending' AND due_date < CURRENT_DATE)
        `),
      ]);

    // Last 7 days attendance trend
    const attendanceTrend = await pool.query(`
      SELECT a.date::text, COUNT(a.id) AS count
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'
      ) AS d(date)
      LEFT JOIN attendance a ON a.date = d.date
      GROUP BY a.date, d.date
      ORDER BY d.date ASC
    `);

    // Monthly revenue last 6 months
    const revenueChart = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', paid_date), 'Mon') AS month,
        COALESCE(SUM(amount), 0) AS total
      FROM payments
      WHERE status = 'paid'
        AND paid_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', paid_date)
      ORDER BY DATE_TRUNC('month', paid_date) ASC
    `);

    res.json({
      stats: {
        totalMembers: parseInt(totalMembers.rows[0].count),
        activeToday: parseInt(activeToday.rows[0].count),
        pendingFees: parseInt(pendingFees.rows[0].count),
        revenueThisMonth: parseFloat(revenue.rows[0].total),
        totalCoaches: parseInt(coaches.rows[0].count),
        newJoiners: parseInt(newJoiners.rows[0].count),
        overduePayments: parseInt(overduePayments.rows[0].count),
      },
      charts: {
        attendanceTrend: attendanceTrend.rows,
        revenueChart: revenueChart.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCoachStats = async (req: Request, res: Response): Promise<void> => {
  const coachId = (req as import('../middleware/auth').AuthRequest).user!.id;
  try {
    const [members, todayAtt] = await Promise.all([
      pool.query(`
        SELECT m.id, m.member_id, m.full_name, m.goal, m.status, p.name AS plan_name
        FROM members m
        LEFT JOIN membership_plans p ON m.plan_id = p.id
        WHERE m.coach_id = $1 AND m.status = 'active'
        ORDER BY m.full_name
      `, [coachId]),
      pool.query(`
        SELECT COUNT(*) FROM attendance a
        JOIN members m ON a.member_id = m.id
        WHERE m.coach_id = $1 AND a.date = CURRENT_DATE
      `, [coachId]),
    ]);

    res.json({
      members: members.rows,
      totalMembers: members.rows.length,
      presentToday: parseInt(todayAtt.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const listPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, member_id } = req.query;
    let query = `
      SELECT py.*, m.full_name AS member_name, m.member_id AS member_code,
             p.name AS plan_name
      FROM payments py
      JOIN members m ON py.member_id = m.id
      LEFT JOIN membership_plans p ON py.plan_id = p.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (status) {
      query += ` AND py.status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (member_id) {
      query += ` AND py.member_id = $${idx}`;
      params.push(member_id);
      idx++;
    }

    query += ' ORDER BY py.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMemberPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  const memberId = req.params.id || req.user!.id;
  try {
    const result = await pool.query(`
      SELECT py.*, p.name AS plan_name
      FROM payments py
      LEFT JOIN membership_plans p ON py.plan_id = p.id
      WHERE py.member_id = $1
      ORDER BY py.created_at DESC
    `, [memberId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addPayment = async (req: Request, res: Response): Promise<void> => {
  const { member_id, plan_id, amount, due_date, paid_date, payment_mode, status, notes } = req.body;

  if (!member_id || !amount) {
    res.status(400).json({ message: 'member_id and amount are required' });
    return;
  }

  try {
    const result = await pool.query(`
      INSERT INTO payments (member_id, plan_id, amount, due_date, paid_date, payment_mode, status, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `, [member_id, plan_id, amount, due_date, paid_date || null, payment_mode, status || 'pending', notes]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  const { paid_date, payment_mode, status, notes } = req.body;
  try {
    const result = await pool.query(`
      UPDATE payments SET
        paid_date = COALESCE($1, paid_date),
        payment_mode = COALESCE($2, payment_mode),
        status = COALESCE($3, status),
        notes = COALESCE($4, notes)
      WHERE id = $5
      RETURNING *
    `, [paid_date, payment_mode, status, notes, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOverdue = async (_req: Request, res: Response): Promise<void> => {
  try {
    await pool.query(
      `UPDATE payments SET status = 'overdue' WHERE due_date < CURRENT_DATE AND status = 'pending'`
    );

    const result = await pool.query(`
      SELECT py.*, m.full_name AS member_name, m.member_id AS member_code, m.phone
      FROM payments py
      JOIN members m ON py.member_id = m.id
      WHERE py.status = 'overdue'
      ORDER BY py.due_date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMonthlyRevenue = async (req: Request, res: Response): Promise<void> => {
  const { months = 6 } = req.query;
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', paid_date), 'Mon YYYY') AS month,
        DATE_TRUNC('month', paid_date) AS month_start,
        SUM(amount) AS total
      FROM payments
      WHERE status = 'paid' AND paid_date IS NOT NULL
        AND paid_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${Number(months) - 1} months'
      GROUP BY DATE_TRUNC('month', paid_date)
      ORDER BY month_start ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

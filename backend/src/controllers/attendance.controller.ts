import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const memberId = req.user!.id;
  const today = new Date().toISOString().split('T')[0];

  try {
    const existing = await pool.query(
      'SELECT id FROM attendance WHERE member_id = $1 AND date = $2',
      [memberId, today]
    );

    if (existing.rows.length > 0) {
      res.status(200).json({ alreadyMarked: true, message: 'Attendance already marked for today' });
      return;
    }

    await pool.query(
      'INSERT INTO attendance (member_id, date) VALUES ($1, $2)',
      [memberId, today]
    );

    res.status(201).json({
      alreadyMarked: false,
      message: 'Attendance marked successfully',
      date: today,
      checkIn: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTodayAttendance = async (_req: Request, res: Response): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const present = await pool.query(`
      SELECT a.id, a.check_in, m.member_id, m.full_name, m.phone,
             c.full_name AS coach_name
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      LEFT JOIN coaches c ON m.coach_id = c.id
      WHERE a.date = $1
      ORDER BY a.check_in DESC
    `, [today]);

    const total = await pool.query('SELECT COUNT(*) FROM members WHERE status = \'active\'');

    res.json({
      date: today,
      present: present.rows,
      presentCount: present.rows.length,
      totalActive: parseInt(total.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMemberAttendance = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { month, year } = req.query;

  try {
    let query = `
      SELECT a.id, a.date, a.check_in FROM attendance a
      WHERE a.member_id = $1
    `;
    const params: unknown[] = [id];
    let idx = 2;

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM a.date) = $${idx} AND EXTRACT(YEAR FROM a.date) = $${idx + 1}`;
      params.push(month, year);
      idx += 2;
    }

    query += ' ORDER BY a.date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMonthlyReport = async (req: Request, res: Response): Promise<void> => {
  const { month, year } = req.query;
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();

  try {
    const result = await pool.query(`
      SELECT
        m.member_id, m.full_name,
        COUNT(a.id) AS days_present,
        ARRAY_AGG(a.date::text ORDER BY a.date) AS dates
      FROM members m
      LEFT JOIN attendance a ON a.member_id = m.id
        AND EXTRACT(MONTH FROM a.date) = $1
        AND EXTRACT(YEAR FROM a.date) = $2
      WHERE m.status = 'active'
      GROUP BY m.id, m.member_id, m.full_name
      ORDER BY days_present DESC
    `, [m, y]);

    res.json({ month: m, year: y, records: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkTodayStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const memberId = req.user!.id;
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      'SELECT id, check_in FROM attendance WHERE member_id = $1 AND date = $2',
      [memberId, today]
    );
    res.json({
      marked: result.rows.length > 0,
      checkIn: result.rows[0]?.check_in ?? null,
      date: today,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

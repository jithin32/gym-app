import { Request, Response } from 'express';
import pool from '../config/db';

export const getAttendanceHeatmap = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT date::text, COUNT(*) AS count
      FROM attendance
      WHERE date >= CURRENT_DATE - INTERVAL '89 days'
      GROUP BY date
      ORDER BY date
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMemberGrowth = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', join_date), 'YYYY-MM') AS month,
        TO_CHAR(DATE_TRUNC('month', join_date), 'Mon YYYY') AS label,
        COUNT(*) AS count
      FROM members
      WHERE join_date >= CURRENT_DATE - INTERVAL '11 months'
      GROUP BY DATE_TRUNC('month', join_date)
      ORDER BY DATE_TRUNC('month', join_date)
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getWorkoutStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', completed_at), 'Mon YYYY') AS label,
        COUNT(*) AS count
      FROM workout_completions
      WHERE completed_at >= CURRENT_DATE - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', completed_at)
      ORDER BY DATE_TRUNC('month', completed_at)
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

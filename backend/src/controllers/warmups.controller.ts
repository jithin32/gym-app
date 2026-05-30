import { Request, Response } from 'express';
import pool from '../config/db';

export const getWarmupsByDay = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM warmups WHERE day_type = $1 ORDER BY order_index',
      [req.params.dayType]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const listDayTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT day_type FROM warmups ORDER BY day_type'
    );
    res.json(result.rows.map((r) => r.day_type));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const listAllWarmups = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM warmups ORDER BY day_type, order_index');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

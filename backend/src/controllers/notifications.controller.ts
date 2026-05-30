import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1 AND user_role = $2
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user!.id, req.user!.role]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND user_role = $2 AND is_read = FALSE',
      [req.user!.id, req.user!.role]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const markRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );
    res.json({ message: 'Marked read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND user_role = $2',
      [req.user!.id, req.user!.role]
    );
    res.json({ message: 'All marked read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

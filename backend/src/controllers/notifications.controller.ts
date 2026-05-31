import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const checkExpiringMemberships = async (req: AuthRequest, res: Response): Promise<void> => {
  const coachId = req.user!.id;
  try {
    const expiring = await pool.query(
      `SELECT m.id, m.full_name, m.end_date
       FROM members m
       WHERE m.coach_id = $1
         AND m.status = 'active'
         AND m.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 days'`,
      [coachId]
    );

    for (const member of expiring.rows) {
      const msLeft = new Date(member.end_date).setHours(23, 59, 59) - Date.now();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      const msg = daysLeft <= 0
        ? `${member.full_name}'s membership expires today!`
        : `${member.full_name}'s membership expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;

      const exists = await pool.query(
        `SELECT id FROM notifications
         WHERE user_id = $1 AND user_role = 'coach' AND type = 'membership_expiry'
           AND message = $2 AND created_at::date = CURRENT_DATE`,
        [coachId, msg]
      );
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO notifications (user_id, user_role, message, type)
           VALUES ($1, 'coach', $2, 'membership_expiry')`,
          [coachId, msg]
        );
      }
    }

    res.json({ checked: expiring.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

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

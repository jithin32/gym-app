import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    res.status(400).json({ message: 'Identifier and password required' });
    return;
  }

  try {
    // 1. Check admins
    let result = await pool.query(
      'SELECT id, full_name, password_hash, \'admin\' AS role FROM admins WHERE email = $1',
      [identifier]
    );

    // 2. Check coaches
    if (result.rows.length === 0) {
      result = await pool.query(
        'SELECT id, full_name, password_hash, \'coach\' AS role FROM coaches WHERE email = $1',
        [identifier]
      );
    }

    // 3. Check members (by member_id or email)
    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT id, full_name, password_hash, 'member' AS role, member_id
         FROM members WHERE member_id = $1 OR email = $1`,
        [identifier]
      );
    }

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.full_name },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      role: user.role,
      name: user.full_name,
      id: user.id,
      memberId: user.member_id ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;
  const role = req.user!.role;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ message: 'New password must be at least 6 characters' });
    return;
  }

  try {
    const table = role === 'admin' ? 'admins' : role === 'coach' ? 'coaches' : 'members';
    const result = await pool.query(`SELECT password_hash FROM ${table} WHERE id = $1`, [userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Current password incorrect' });
      return;
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE ${table} SET password_hash = $1 WHERE id = $2`, [hash, userId]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetMemberPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { memberId } = req.params;
  try {
    const result = await pool.query('SELECT member_id FROM members WHERE id = $1', [memberId]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    const defaultPassword = result.rows[0].member_id;
    const hash = await bcrypt.hash(defaultPassword, 10);
    await pool.query('UPDATE members SET password_hash = $1 WHERE id = $2', [hash, memberId]);
    res.json({ message: `Password reset to member ID: ${defaultPassword}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

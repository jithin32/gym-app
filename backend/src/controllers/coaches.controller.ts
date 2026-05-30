import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { generateCoachId } from '../utils/memberIdGen';

export const listCoaches = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(m.id) AS member_count
      FROM coaches c
      LEFT JOIN members m ON m.coach_id = c.id AND m.status = 'active'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCoach = async (req: Request, res: Response): Promise<void> => {
  try {
    const coachResult = await pool.query('SELECT * FROM coaches WHERE id = $1', [req.params.id]);
    if (coachResult.rows.length === 0) {
      res.status(404).json({ message: 'Coach not found' });
      return;
    }

    const membersResult = await pool.query(`
      SELECT m.id, m.member_id, m.full_name, m.status, m.goal, p.name AS plan_name
      FROM members m
      LEFT JOIN membership_plans p ON m.plan_id = p.id
      WHERE m.coach_id = $1 AND m.status = 'active'
      ORDER BY m.full_name
    `, [req.params.id]);

    res.json({ ...coachResult.rows[0], members: membersResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCoach = async (req: Request, res: Response): Promise<void> => {
  const { full_name, phone, email, specialty, experience_yr } = req.body;
  if (!full_name || !email) {
    res.status(400).json({ message: 'full_name and email are required' });
    return;
  }

  try {
    const coach_id = await generateCoachId();
    const password_hash = await bcrypt.hash(coach_id, 10);

    const result = await pool.query(`
      INSERT INTO coaches (coach_id, full_name, phone, email, specialty, experience_yr, password_hash)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, coach_id, full_name, email, specialty
    `, [coach_id, full_name, phone, email, specialty, experience_yr || 0, password_hash]);

    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    console.error(err);
    const e = err as { code?: string };
    if (e.code === '23505') {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCoach = async (req: Request, res: Response): Promise<void> => {
  const { full_name, phone, email, specialty, experience_yr } = req.body;
  try {
    const result = await pool.query(`
      UPDATE coaches SET
        full_name = COALESCE($1, full_name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        specialty = COALESCE($4, specialty),
        experience_yr = COALESCE($5, experience_yr)
      WHERE id = $6
      RETURNING id, coach_id, full_name, email, specialty, experience_yr
    `, [full_name, phone, email, specialty, experience_yr, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Coach not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCoach = async (req: Request, res: Response): Promise<void> => {
  try {
    const members = await pool.query(
      'SELECT COUNT(*) FROM members WHERE coach_id = $1 AND status = \'active\'',
      [req.params.id]
    );
    if (parseInt(members.rows[0].count) > 0) {
      res.status(400).json({ message: 'Reassign active members before deleting this coach' });
      return;
    }
    const result = await pool.query('DELETE FROM coaches WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Coach not found' });
      return;
    }
    res.json({ message: 'Coach deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

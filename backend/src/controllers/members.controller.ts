import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { generateMemberId } from '../utils/memberIdGen';

export const listMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, coach_id } = req.query;
    let query = `
      SELECT m.id, m.member_id, m.full_name, m.age, m.gender, m.phone, m.email,
             m.join_date, m.start_date, m.end_date, m.goal, m.experience, m.status,
             m.emergency_contact, m.injuries, m.address,
             p.name AS plan_name, p.price AS plan_price,
             c.full_name AS coach_name, c.id AS coach_id,
             m.plan_id
      FROM members m
      LEFT JOIN membership_plans p ON m.plan_id = p.id
      LEFT JOIN coaches c ON m.coach_id = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (search) {
      query += ` AND (m.full_name ILIKE $${idx} OR m.member_id ILIKE $${idx} OR m.phone ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      query += ` AND m.status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (coach_id) {
      query += ` AND m.coach_id = $${idx}`;
      params.push(coach_id);
      idx++;
    }

    query += ' ORDER BY m.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.name AS plan_name, p.price AS plan_price, p.duration_days,
             c.full_name AS coach_name
      FROM members m
      LEFT JOIN membership_plans p ON m.plan_id = p.id
      LEFT JOIN coaches c ON m.coach_id = c.id
      WHERE m.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMember = async (req: Request, res: Response): Promise<void> => {
  const {
    full_name, age, gender, phone, email, address, join_date,
    plan_id, start_date, end_date, coach_id, goal, injuries,
    experience, emergency_contact
  } = req.body;

  if (!full_name || !plan_id) {
    res.status(400).json({ message: 'full_name and plan_id are required' });
    return;
  }

  try {
    const member_id = await generateMemberId();
    const password_hash = await bcrypt.hash(member_id, 10);

    const result = await pool.query(`
      INSERT INTO members
        (member_id, full_name, age, gender, phone, email, address, join_date,
         plan_id, start_date, end_date, coach_id, goal, injuries, experience,
         emergency_contact, password_hash)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING id, member_id, full_name, status
    `, [member_id, full_name, age, gender, phone, email, address,
        join_date || new Date().toISOString().split('T')[0],
        plan_id, start_date, end_date, coach_id || null,
        goal, injuries, experience || 'beginner', emergency_contact, password_hash]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMember = async (req: Request, res: Response): Promise<void> => {
  const {
    full_name, age, gender, phone, email, address,
    plan_id, start_date, end_date, coach_id, goal,
    injuries, experience, emergency_contact
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE members SET
        full_name = COALESCE($1, full_name),
        age = COALESCE($2, age),
        gender = COALESCE($3, gender),
        phone = COALESCE($4, phone),
        email = COALESCE($5, email),
        address = COALESCE($6, address),
        plan_id = COALESCE($7, plan_id),
        start_date = COALESCE($8, start_date),
        end_date = COALESCE($9, end_date),
        coach_id = $10,
        goal = COALESCE($11, goal),
        injuries = COALESCE($12, injuries),
        experience = COALESCE($13, experience),
        emergency_contact = COALESCE($14, emergency_contact)
      WHERE id = $15
      RETURNING id, member_id, full_name, status
    `, [full_name, age, gender, phone, email, address, plan_id, start_date, end_date,
        coach_id || null, goal, injuries, experience, emergency_contact, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.json({ message: 'Member deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const freezeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `UPDATE members SET status = CASE WHEN status = 'frozen' THEN 'active' ELSE 'frozen' END
       WHERE id = $1 RETURNING id, member_id, full_name, status`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const renewMember = async (req: Request, res: Response): Promise<void> => {
  const { plan_id, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE members SET plan_id = COALESCE($1, plan_id), start_date = $2, end_date = $3, status = 'active'
       WHERE id = $4 RETURNING id, member_id, full_name, end_date, status`,
      [plan_id, start_date, end_date, req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listPlans = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM membership_plans ORDER BY duration_days');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

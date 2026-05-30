import { Request, Response } from 'express';
import pool from '../config/db';

export const listExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const { body_part, category, difficulty, search } = req.query;
    let query = 'SELECT * FROM exercises WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;

    if (search) {
      query += ` AND (name ILIKE $${idx} OR muscles_targeted ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (body_part) { query += ` AND body_part = $${idx}`; params.push(body_part); idx++; }
    if (category) { query += ` AND category = $${idx}`; params.push(category); idx++; }
    if (difficulty) { query += ` AND difficulty = $${idx}`; params.push(difficulty); idx++; }

    query += ' ORDER BY body_part, name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM exercises WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) { res.status(404).json({ message: 'Exercise not found' }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createExercise = async (req: Request, res: Response): Promise<void> => {
  const { name, category, body_part, image_url, difficulty, equipment, how_to_do, muscles_targeted } = req.body;
  if (!name) { res.status(400).json({ message: 'name is required' }); return; }
  try {
    const result = await pool.query(
      `INSERT INTO exercises (name, category, body_part, image_url, difficulty, equipment, how_to_do, muscles_targeted)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, category, body_part, image_url, difficulty, equipment, how_to_do, muscles_targeted]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateExercise = async (req: Request, res: Response): Promise<void> => {
  const { name, category, body_part, image_url, difficulty, equipment, how_to_do, muscles_targeted } = req.body;
  try {
    const result = await pool.query(
      `UPDATE exercises SET
        name = COALESCE($1, name), category = COALESCE($2, category),
        body_part = COALESCE($3, body_part), image_url = COALESCE($4, image_url),
        difficulty = COALESCE($5, difficulty), equipment = COALESCE($6, equipment),
        how_to_do = COALESCE($7, how_to_do), muscles_targeted = COALESCE($8, muscles_targeted)
       WHERE id = $9 RETURNING *`,
      [name, category, body_part, image_url, difficulty, equipment, how_to_do, muscles_targeted, req.params.id]
    );
    if (result.rows.length === 0) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM exercises WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const listBodyParts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT DISTINCT body_part FROM exercises WHERE body_part IS NOT NULL ORDER BY body_part');
    res.json(result.rows.map((r) => r.body_part));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

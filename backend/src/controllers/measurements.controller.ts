import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getMemberMeasurements = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT m.*, c.full_name AS recorded_by_name
       FROM measurements m
       LEFT JOIN coaches c ON m.recorded_by = c.id
       WHERE m.member_id = $1
       ORDER BY m.recorded_date DESC`,
      [req.params.memberId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    member_id, recorded_date, weight_kg, height_cm, chest_cm,
    waist_cm, bicep_left_cm, bicep_right_cm, body_fat_pct, notes
  } = req.body;

  const effectiveMemberId = req.user!.role === 'member' ? req.user!.id : member_id;
  if (!effectiveMemberId) { res.status(400).json({ message: 'member_id is required' }); return; }

  try {
    const result = await pool.query(
      `INSERT INTO measurements
         (member_id, recorded_date, weight_kg, height_cm, chest_cm, waist_cm,
          bicep_left_cm, bicep_right_cm, body_fat_pct, notes, recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        effectiveMemberId,
        recorded_date || new Date().toISOString().split('T')[0],
        weight_kg || null, height_cm || null, chest_cm || null,
        waist_cm || null, bicep_left_cm || null, bicep_right_cm || null,
        body_fat_pct || null, notes || null,
        req.user!.role === 'coach' ? req.user!.id : null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMeasurement = async (req: Request, res: Response): Promise<void> => {
  const {
    recorded_date, weight_kg, height_cm, chest_cm,
    waist_cm, bicep_left_cm, bicep_right_cm, body_fat_pct, notes
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE measurements SET
         recorded_date = COALESCE($1, recorded_date),
         weight_kg = COALESCE($2, weight_kg), height_cm = COALESCE($3, height_cm),
         chest_cm = COALESCE($4, chest_cm), waist_cm = COALESCE($5, waist_cm),
         bicep_left_cm = COALESCE($6, bicep_left_cm), bicep_right_cm = COALESCE($7, bicep_right_cm),
         body_fat_pct = COALESCE($8, body_fat_pct), notes = COALESCE($9, notes)
       WHERE id = $10 RETURNING *`,
      [recorded_date, weight_kg, height_cm, chest_cm, waist_cm,
       bicep_left_cm, bicep_right_cm, body_fat_pct, notes, req.params.id]
    );
    if (result.rows.length === 0) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMeasurement = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM measurements WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

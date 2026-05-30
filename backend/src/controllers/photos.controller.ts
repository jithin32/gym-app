import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/photos'));
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

export const uploadPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) { res.status(400).json({ message: 'No file uploaded' }); return; }
  const memberId = parseInt(req.params.memberId);
  const { notes } = req.body;
  const imageUrl = `/uploads/photos/${req.file.filename}`;

  try {
    const result = await pool.query(
      'INSERT INTO progress_photos (member_id, image_url, notes) VALUES ($1,$2,$3) RETURNING *',
      [memberId, imageUrl, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM progress_photos WHERE member_id = $1 ORDER BY uploaded_at DESC',
      [req.params.memberId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM progress_photos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) { res.status(404).json({ message: 'Not found' }); return; }

    const filePath = path.join(__dirname, '../../', result.rows[0].image_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM progress_photos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

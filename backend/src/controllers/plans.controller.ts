import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const listPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.user!.role;
    const coachId = req.user!.id;

    let query = `
      SELECT wp.*, c.full_name AS coach_name,
             COUNT(wpe.id) AS exercise_count
      FROM workout_plans wp
      LEFT JOIN coaches c ON wp.created_by = c.id
      LEFT JOIN workout_plan_exercises wpe ON wpe.plan_id = wp.id
    `;
    if (role === 'coach') {
      query += ` WHERE wp.created_by = ${coachId}`;
    }
    query += ' GROUP BY wp.id, c.full_name ORDER BY wp.created_at DESC';

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const planResult = await pool.query(
      `SELECT wp.*, c.full_name AS coach_name
       FROM workout_plans wp
       LEFT JOIN coaches c ON wp.created_by = c.id
       WHERE wp.id = $1`,
      [req.params.id]
    );
    if (planResult.rows.length === 0) { res.status(404).json({ message: 'Plan not found' }); return; }

    const exercisesResult = await pool.query(
      `SELECT wpe.*, e.name AS exercise_name, e.body_part, e.category,
              e.difficulty, e.equipment, e.how_to_do, e.muscles_targeted, e.image_url
       FROM workout_plan_exercises wpe
       JOIN exercises e ON wpe.exercise_id = e.id
       WHERE wpe.plan_id = $1
       ORDER BY wpe.order_index`,
      [req.params.id]
    );

    res.json({ ...planResult.rows[0], exercises: exercisesResult.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, exercises } = req.body;
  if (!name) { res.status(400).json({ message: 'Plan name is required' }); return; }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const planResult = await client.query(
      'INSERT INTO workout_plans (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, req.user!.id]
    );
    const planId = planResult.rows[0].id;

    if (exercises && exercises.length > 0) {
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        await client.query(
          `INSERT INTO workout_plan_exercises
             (plan_id, exercise_id, sets, reps, suggested_weight, rest_seconds, notes, order_index)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [planId, ex.exercise_id, ex.sets, ex.reps, ex.suggested_weight, ex.rest_seconds, ex.notes, i]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(planResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

export const updatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, exercises } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (name) {
      await client.query('UPDATE workout_plans SET name = $1 WHERE id = $2', [name, req.params.id]);
    }

    if (exercises) {
      await client.query('DELETE FROM workout_plan_exercises WHERE plan_id = $1', [req.params.id]);
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        await client.query(
          `INSERT INTO workout_plan_exercises
             (plan_id, exercise_id, sets, reps, suggested_weight, rest_seconds, notes, order_index)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [req.params.id, ex.exercise_id, ex.sets, ex.reps, ex.suggested_weight, ex.rest_seconds, ex.notes, i]
        );
      }
    }

    await client.query('COMMIT');
    const result = await pool.query('SELECT * FROM workout_plans WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM workout_plans WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignPlan = async (req: Request, res: Response): Promise<void> => {
  const { member_ids, day_label } = req.body;
  if (!member_ids?.length) { res.status(400).json({ message: 'member_ids required' }); return; }

  try {
    const planResult = await pool.query('SELECT name FROM workout_plans WHERE id = $1', [req.params.id]);
    const planName = planResult.rows[0]?.name ?? 'a workout plan';

    for (const memberId of member_ids) {
      await pool.query(
        `INSERT INTO member_plan_assignments (member_id, plan_id, day_label)
         VALUES ($1, $2, $3)`,
        [memberId, req.params.id, day_label || null]
      );
      await pool.query(
        `INSERT INTO notifications (user_id, user_role, message, type)
         VALUES ($1, 'member', $2, 'plan_assigned')`,
        [memberId, `New workout plan assigned: "${planName}"${day_label ? ` (${day_label})` : ''}`]
      );
    }
    res.json({ message: `Plan assigned to ${member_ids.length} member(s)` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMemberActivePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignResult = await pool.query(
      `SELECT mpa.*, wp.name AS plan_name
       FROM member_plan_assignments mpa
       JOIN workout_plans wp ON mpa.plan_id = wp.id
       WHERE mpa.member_id = $1
       ORDER BY mpa.assigned_at DESC
       LIMIT 1`,
      [req.params.memberId]
    );

    if (assignResult.rows.length === 0) {
      res.json(null);
      return;
    }

    const planId = assignResult.rows[0].plan_id;
    const exercisesResult = await pool.query(
      `SELECT wpe.*, e.name AS exercise_name, e.body_part, e.category,
              e.difficulty, e.equipment, e.how_to_do, e.muscles_targeted
       FROM workout_plan_exercises wpe
       JOIN exercises e ON wpe.exercise_id = e.id
       WHERE wpe.plan_id = $1
       ORDER BY wpe.order_index`,
      [planId]
    );

    res.json({ ...assignResult.rows[0], exercises: exercisesResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const completeWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  const { plan_id, notes, duration_minutes } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO workout_completions (member_id, plan_id, notes, duration_minutes) VALUES ($1,$2,$3,$4)',
      [req.user!.id, plan_id || null, notes || null, duration_minutes || null]
    );
    await client.query(
      'DELETE FROM member_plan_assignments WHERE member_id = $1',
      [req.user!.id]
    );
    await client.query('COMMIT');
    res.status(201).json({ message: 'Workout logged!' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

export const getMemberWorkoutStats = async (req: Request, res: Response): Promise<void> => {
  const { memberId } = req.params;
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*)                                                        AS total_workouts,
        COALESCE(SUM(duration_minutes), 0)                             AS total_minutes,

        COUNT(*) FILTER (WHERE completed_at::date = CURRENT_DATE)      AS today_workouts,
        COALESCE(SUM(duration_minutes) FILTER (
          WHERE completed_at::date = CURRENT_DATE), 0)                 AS today_minutes,

        COUNT(*) FILTER (WHERE completed_at >= date_trunc('week', NOW()))   AS week_workouts,
        COALESCE(SUM(duration_minutes) FILTER (
          WHERE completed_at >= date_trunc('week', NOW())), 0)          AS week_minutes,

        COUNT(*) FILTER (WHERE completed_at >= date_trunc('month', NOW()))  AS month_workouts,
        COALESCE(SUM(duration_minutes) FILTER (
          WHERE completed_at >= date_trunc('month', NOW())), 0)         AS month_minutes,

        COUNT(*) FILTER (WHERE completed_at >= date_trunc('year', NOW()))   AS year_workouts,
        COALESCE(SUM(duration_minutes) FILTER (
          WHERE completed_at >= date_trunc('year', NOW())), 0)          AS year_minutes
      FROM workout_completions
      WHERE member_id = $1`,
      [memberId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

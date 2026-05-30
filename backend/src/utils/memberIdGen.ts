import pool from '../config/db';

export async function generateMemberId(): Promise<string> {
  const result = await pool.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING(member_id, 4) AS INT)), 0) + 1 AS next_num FROM members`
  );
  const num: number = result.rows[0].next_num;
  return `AG-${String(num).padStart(5, '0')}`;
}

export async function generateCoachId(): Promise<string> {
  const result = await pool.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING(coach_id, 4) AS INT)), 0) + 1 AS next_num FROM coaches`
  );
  const num: number = result.rows[0].next_num;
  return `CH-${String(num).padStart(5, '0')}`;
}

-- ArenaGym Database Schema
-- For Supabase: paste this entire file into the Supabase SQL Editor and click Run.
-- For local PostgreSQL: psql -U postgres -d gymapp -f migrations/001_init.sql

-- MEMBERSHIP PLANS
CREATE TABLE IF NOT EXISTS membership_plans (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(50) NOT NULL,
  duration_days INTEGER NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ADMINS
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- COACHES
CREATE TABLE IF NOT EXISTS coaches (
  id             SERIAL PRIMARY KEY,
  coach_id       VARCHAR(10) UNIQUE NOT NULL,
  full_name      VARCHAR(100) NOT NULL,
  phone          VARCHAR(20),
  email          VARCHAR(100) UNIQUE,
  specialty      VARCHAR(100),
  experience_yr  INTEGER DEFAULT 0,
  password_hash  VARCHAR(255) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- MEMBERS
CREATE TABLE IF NOT EXISTS members (
  id              SERIAL PRIMARY KEY,
  member_id       VARCHAR(10) UNIQUE NOT NULL,
  full_name       VARCHAR(100) NOT NULL,
  age             INTEGER,
  gender          VARCHAR(10),
  phone           VARCHAR(20),
  email           VARCHAR(100),
  address         TEXT,
  join_date       DATE DEFAULT CURRENT_DATE,
  plan_id         INTEGER REFERENCES membership_plans(id),
  start_date      DATE,
  end_date        DATE,
  coach_id        INTEGER REFERENCES coaches(id) ON DELETE SET NULL,
  goal            VARCHAR(30),
  injuries        TEXT,
  experience      VARCHAR(20) DEFAULT 'beginner',
  emergency_contact VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'active',
  password_hash   VARCHAR(255) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_coach ON members(coach_id);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id          SERIAL PRIMARY KEY,
  member_id   INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);

-- MEASUREMENTS
CREATE TABLE IF NOT EXISTS measurements (
  id               SERIAL PRIMARY KEY,
  member_id        INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  recorded_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg        DECIMAL(5,2),
  height_cm        DECIMAL(5,2),
  chest_cm         DECIMAL(5,2),
  waist_cm         DECIMAL(5,2),
  bicep_left_cm    DECIMAL(5,2),
  bicep_right_cm   DECIMAL(5,2),
  body_fat_pct     DECIMAL(4,2),
  notes            TEXT,
  recorded_by      INTEGER REFERENCES coaches(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS / FEES
CREATE TABLE IF NOT EXISTS payments (
  id            SERIAL PRIMARY KEY,
  member_id     INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id       INTEGER REFERENCES membership_plans(id),
  amount        DECIMAL(10,2) NOT NULL,
  due_date      DATE,
  paid_date     DATE,
  payment_mode  VARCHAR(30),
  status        VARCHAR(20) DEFAULT 'pending',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);

-- EXERCISES
CREATE TABLE IF NOT EXISTS exercises (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  category         VARCHAR(50),
  body_part        VARCHAR(50),
  image_url        TEXT,
  difficulty       VARCHAR(20),
  equipment        VARCHAR(100),
  how_to_do        TEXT,
  muscles_targeted TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- WARMUPS
CREATE TABLE IF NOT EXISTS warmups (
  id           SERIAL PRIMARY KEY,
  day_type     VARCHAR(50) NOT NULL,
  title        VARCHAR(100) NOT NULL,
  image_url    TEXT,
  duration     VARCHAR(50),
  instructions TEXT,
  order_index  INTEGER DEFAULT 0
);

-- WORKOUT PLANS
CREATE TABLE IF NOT EXISTS workout_plans (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  created_by  INTEGER REFERENCES coaches(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- WORKOUT PLAN EXERCISES
CREATE TABLE IF NOT EXISTS workout_plan_exercises (
  id               SERIAL PRIMARY KEY,
  plan_id          INTEGER NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_id      INTEGER NOT NULL REFERENCES exercises(id),
  sets             INTEGER,
  reps             VARCHAR(20),
  suggested_weight VARCHAR(30),
  rest_seconds     INTEGER,
  notes            TEXT,
  order_index      INTEGER DEFAULT 0
);

-- MEMBER PLAN ASSIGNMENTS
CREATE TABLE IF NOT EXISTS member_plan_assignments (
  id          SERIAL PRIMARY KEY,
  member_id   INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id     INTEGER NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_label   VARCHAR(30),
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- WORKOUT COMPLETIONS
CREATE TABLE IF NOT EXISTS workout_completions (
  id           SERIAL PRIMARY KEY,
  member_id    INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id      INTEGER NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes        TEXT
);

-- PROGRESS PHOTOS
CREATE TABLE IF NOT EXISTS progress_photos (
  id          SERIAL PRIMARY KEY,
  member_id   INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  notes       TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  user_role   VARCHAR(10) NOT NULL,
  message     TEXT NOT NULL,
  type        VARCHAR(30),
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- SEED: default plans
INSERT INTO membership_plans (name, duration_days, price) VALUES
  ('Monthly', 30, 1500.00),
  ('Quarterly', 90, 4000.00),
  ('Annual', 365, 14000.00)
ON CONFLICT DO NOTHING;

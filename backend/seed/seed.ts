import bcrypt from 'bcryptjs';
import pool from '../src/config/db';

const SALT = 10;

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    // Admin
    const adminHash = await bcrypt.hash('Admin@123', SALT);
    await client.query(`
      INSERT INTO admins (full_name, email, password_hash)
      VALUES ('Admin Owner', 'admin@gymapp.com', $1)
      ON CONFLICT (email) DO NOTHING
    `, [adminHash]);

    // Coaches
    const coachHash1 = await bcrypt.hash('CH-00001', SALT);
    const coachHash2 = await bcrypt.hash('CH-00002', SALT);
    await client.query(`
      INSERT INTO coaches (coach_id, full_name, phone, email, specialty, experience_yr, password_hash)
      VALUES
        ('CH-00001', 'Rahul Sharma', '9876543210', 'rahul@gymapp.com', 'Strength & Conditioning', 5, $1),
        ('CH-00002', 'Anita Desai', '9876543211', 'anita@gymapp.com', 'Yoga & Flexibility', 7, $2)
      ON CONFLICT (coach_id) DO NOTHING
    `, [coachHash1, coachHash2]);

    const coachRes = await client.query('SELECT id FROM coaches ORDER BY id LIMIT 2');
    const coach1Id = coachRes.rows[0]?.id;

    const planRes = await client.query('SELECT id FROM membership_plans ORDER BY id');
    const monthly = planRes.rows[0]?.id;
    const quarterly = planRes.rows[1]?.id;
    const annual = planRes.rows[2]?.id;

    // Members
    const members = [
      { member_id: 'AG-00001', full_name: 'Priya Nair', age: 28, gender: 'Female', phone: '9000000001', email: 'priya@example.com', plan: monthly, goal: 'weight_loss', experience: 'beginner', coach: coach1Id },
      { member_id: 'AG-00002', full_name: 'Arjun Menon', age: 24, gender: 'Male', phone: '9000000002', email: 'arjun@example.com', plan: quarterly, goal: 'muscle_gain', experience: 'intermediate', coach: coach1Id },
      { member_id: 'AG-00003', full_name: 'Sneha Kapoor', age: 31, gender: 'Female', phone: '9000000003', email: 'sneha@example.com', plan: annual, goal: 'endurance', experience: 'advanced', coach: coach1Id },
      { member_id: 'AG-00004', full_name: 'Kiran Patel', age: 35, gender: 'Male', phone: '9000000004', email: 'kiran@example.com', plan: monthly, goal: 'weight_loss', experience: 'beginner', coach: null },
    ];

    for (const m of members) {
      const hash = await bcrypt.hash(m.member_id, SALT);
      const start = new Date();
      const end = new Date();
      const planDays = m.plan === monthly ? 30 : m.plan === quarterly ? 90 : 365;
      end.setDate(end.getDate() + planDays);

      await client.query(`
        INSERT INTO members (member_id, full_name, age, gender, phone, email, plan_id, start_date, end_date, coach_id, goal, experience, status, password_hash)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'active',$13)
        ON CONFLICT (member_id) DO NOTHING
      `, [m.member_id, m.full_name, m.age, m.gender, m.phone, m.email, m.plan,
          start.toISOString().split('T')[0], end.toISOString().split('T')[0],
          m.coach, m.goal, m.experience, hash]);
    }

    // Sample payments
    const memberRes = await client.query('SELECT id, plan_id FROM members ORDER BY id LIMIT 4');
    for (const mem of memberRes.rows) {
      await client.query(`
        INSERT INTO payments (member_id, plan_id, amount, due_date, paid_date, payment_mode, status)
        VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE, 'cash', 'paid')
        ON CONFLICT DO NOTHING
      `, [mem.id, mem.plan_id, 1500]);
    }

    // Overdue payment for member 4
    if (memberRes.rows[3]) {
      await client.query(`
        INSERT INTO payments (member_id, plan_id, amount, due_date, status)
        VALUES ($1, $2, 1500, CURRENT_DATE - 10, 'overdue')
      `, [memberRes.rows[3].id, memberRes.rows[3].plan_id]);
    }

    // Sample attendance (last 3 days for first 3 members)
    const attMembers = memberRes.rows.slice(0, 3);
    for (let d = 0; d < 3; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      for (const mem of attMembers) {
        await client.query(`
          INSERT INTO attendance (member_id, date)
          VALUES ($1, $2) ON CONFLICT DO NOTHING
        `, [mem.id, dateStr]);
      }
    }

    // Exercises
    await client.query(`
      INSERT INTO exercises (name, category, body_part, difficulty, equipment, how_to_do, muscles_targeted) VALUES
        ('Bench Press', 'strength', 'chest', 'intermediate', 'barbell', 'Lie on bench, grip bar shoulder-width. Lower to chest, press up. Keep feet flat and back arched slightly.', 'Pectorals, Triceps, Anterior Deltoids'),
        ('Incline Dumbbell Press', 'strength', 'chest', 'intermediate', 'dumbbells', 'Set bench to 30-45°. Press dumbbells up from chest level. Control the descent.', 'Upper Pectorals, Triceps'),
        ('Cable Fly', 'strength', 'chest', 'beginner', 'cable machine', 'Stand between cables at shoulder height. Bring hands together in front. Squeeze chest.', 'Pectorals'),
        ('Lat Pulldown', 'strength', 'back', 'beginner', 'cable machine', 'Grip bar wide. Pull down to upper chest. Squeeze shoulder blades. Controlled return.', 'Latissimus Dorsi, Biceps'),
        ('Barbell Row', 'strength', 'back', 'intermediate', 'barbell', 'Hinge at hips, keep back straight. Pull bar to lower chest. Lower with control.', 'Lats, Rhomboids, Biceps'),
        ('Pull-Up', 'strength', 'back', 'advanced', 'pull-up bar', 'Hang from bar. Pull chest to bar. Full extension at bottom. No swinging.', 'Lats, Biceps, Core'),
        ('Squat', 'strength', 'legs', 'intermediate', 'barbell', 'Bar on traps, feet shoulder-width. Sit back and down. Knees track over toes. Drive through heels up.', 'Quads, Glutes, Hamstrings'),
        ('Leg Press', 'strength', 'legs', 'beginner', 'leg press machine', 'Feet on platform hip-width. Lower until 90°. Press through heels. Do not lock knees.', 'Quads, Glutes'),
        ('Romanian Deadlift', 'strength', 'legs', 'intermediate', 'barbell', 'Hip hinge with soft knees. Lower bar along legs. Feel hamstring stretch. Drive hips forward to stand.', 'Hamstrings, Glutes, Lower Back'),
        ('Bicep Curl', 'strength', 'biceps', 'beginner', 'dumbbells', 'Hold dumbbells at sides. Curl up keeping elbows fixed. Squeeze at top. Lower slowly.', 'Biceps, Brachialis'),
        ('Hammer Curl', 'strength', 'biceps', 'beginner', 'dumbbells', 'Neutral grip (thumbs up). Curl up. Full range of motion. Avoid swinging.', 'Biceps, Brachioradialis'),
        ('Tricep Pushdown', 'strength', 'triceps', 'beginner', 'cable machine', 'Elbows at sides. Push bar down to full extension. Squeeze triceps. Controlled return.', 'Triceps'),
        ('Skull Crushers', 'strength', 'triceps', 'intermediate', 'barbell', 'Lie on bench. Lower bar to forehead. Keep elbows fixed. Press to full extension.', 'Triceps'),
        ('Overhead Press', 'strength', 'shoulders', 'intermediate', 'barbell', 'Bar at shoulder height. Press overhead to full extension. Lower with control.', 'Anterior Deltoid, Triceps'),
        ('Lateral Raise', 'strength', 'shoulders', 'beginner', 'dumbbells', 'Raise arms to shoulder level. Slight bend in elbows. Lower slowly. Avoid shrugging.', 'Medial Deltoid'),
        ('Plank', 'strength', 'abs', 'beginner', 'bodyweight', 'Forearms and toes on ground. Keep body straight. Engage core. Hold position.', 'Core, Abs, Lower Back'),
        ('Crunches', 'strength', 'abs', 'beginner', 'bodyweight', 'Hands behind head. Curl shoulders to knees. Lower slowly. Do not pull on neck.', 'Rectus Abdominis'),
        ('Treadmill Run', 'cardio', 'full_body', 'beginner', 'treadmill', 'Start at walking pace. Gradually increase speed. Maintain upright posture. Land midfoot.', 'Full Body, Cardiovascular System')
      ON CONFLICT DO NOTHING
    `);

    // Warmups
    await client.query(`
      INSERT INTO warmups (day_type, title, image_url, duration, instructions, order_index) VALUES
        ('chest', 'Arm Circles', NULL, '2 minutes', 'Stand tall. Rotate arms forward 10 times, then backward 10 times. Gradually increase the circle size.', 1),
        ('chest', 'Band Pull-Aparts', NULL, '3 sets × 15 reps', 'Hold resistance band at shoulder height. Pull band apart to sides. Squeeze shoulder blades. Return slowly.', 2),
        ('chest', 'Push-Up Warm-Up', NULL, '2 sets × 10 reps', 'Do slow push-ups with a 3-second lowering phase. Focus on chest stretch at bottom.', 3),
        ('back', 'Cat-Cow Stretch', NULL, '10 reps', 'On hands and knees. Arch back upward (cat), then dip down (cow). Move with breathing rhythm.', 1),
        ('back', 'Band Row', NULL, '2 sets × 15 reps', 'Attach band to fixed point. Pull elbows back, squeezing shoulder blades. Perfect warm-up for rows.', 2),
        ('back', 'Doorway Chest Stretch', NULL, '30 seconds each side', 'Place forearm on doorframe. Turn body away until chest and shoulder stretch. Hold and breathe.', 3),
        ('legs', 'Bodyweight Squats', NULL, '2 sets × 20 reps', 'Feet shoulder-width apart. Sit back and down. Keep chest up. Full depth. Stand through heels.', 1),
        ('legs', 'Leg Swings', NULL, '10 reps each leg', 'Hold wall for balance. Swing leg forward and back. Then side to side. Controlled momentum.', 2),
        ('legs', 'Hip Circles', NULL, '10 reps each direction', 'Hands on hips. Rotate hips in large circles. Mobilises hip joint before heavy leg work.', 3),
        ('shoulder', 'Shoulder Rotation', NULL, '10 reps each direction', 'Arms at sides. Shrug shoulders up, back, down, forward in circular motion. Reverse direction.', 1),
        ('shoulder', 'Face Pulls (light)', NULL, '3 sets × 15 reps', 'Cable at eye height. Pull toward face, elbows high. Activates rear deltoids and rotator cuff.', 2),
        ('shoulder', 'Wall Slides', NULL, '10 reps', 'Stand against wall, arms raised in W position. Slide arms up overhead keeping contact with wall.', 3),
        ('full_body', 'Jumping Jacks', NULL, '3 minutes', 'Alternate jumping with legs out and arms up. Keep rhythm. Elevates heart rate and warms all muscles.', 1),
        ('full_body', 'Inchworm', NULL, '8 reps', 'From standing, walk hands out to plank. Hold 1 second. Walk feet to hands. Stand. Repeat.', 2),
        ('full_body', 'World''s Greatest Stretch', NULL, '5 reps per side', 'Lunge forward, drop back knee. Rotate upper body, reach arm to sky. Hold 2 seconds each.', 3),
        ('biceps', 'Wrist Circles', NULL, '10 reps each direction', 'Extend arms. Rotate wrists in full circles. Loosens elbow and wrist joints before curls.', 1),
        ('biceps', 'Light Dumbbell Curls', NULL, '2 sets × 15 reps (very light)', 'Use half your working weight. Focus on full range and the mind-muscle connection.', 2),
        ('triceps', 'Overhead Tricep Stretch', NULL, '30 seconds each arm', 'Raise arm overhead. Bend elbow behind head. Press elbow back with other hand. Hold.', 1),
        ('triceps', 'Diamond Push-Ups (slow)', NULL, '2 sets × 8 reps', 'Hands close together under chest. Lower slowly for 3 counts. Feel tricep stretch.', 2)
      ON CONFLICT DO NOTHING
    `);

    console.log('Seed complete!');
    console.log('Admin login: admin@gymapp.com / Admin@123');
    console.log('Coach login: rahul@gymapp.com / CH-00001');
    console.log('Member login: AG-00001 / AG-00001');
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

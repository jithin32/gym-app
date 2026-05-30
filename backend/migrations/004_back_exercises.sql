-- Additional back exercises
-- Safe to run multiple times: uses WHERE NOT EXISTS to skip duplicates

INSERT INTO exercises (name, category, body_part, difficulty, equipment, how_to_do, muscles_targeted)
SELECT * FROM (VALUES
  (
    'Seated Cable Row',
    'strength', 'back', 'beginner', 'cable machine',
    'Sit upright with feet on platform. Grip the handle and pull toward your lower chest, leading with elbows. Squeeze shoulder blades together at the end. Slowly extend arms back to start.',
    'Lats, Rhomboids, Middle Trapezius, Biceps'
  ),
  (
    'Single-Arm Dumbbell Row',
    'strength', 'back', 'beginner', 'dumbbells',
    'Place one knee and hand on a bench. Hold dumbbell in opposite hand. Pull it toward your hip, leading with your elbow. Keep back flat and parallel to ground. Lower slowly.',
    'Lats, Rhomboids, Rear Deltoid, Biceps'
  ),
  (
    'T-Bar Row',
    'strength', 'back', 'intermediate', 'barbell',
    'Straddle the barbell, hinge at hips with flat back. Grip the handle and pull the bar toward your chest. Squeeze shoulder blades at the top. Lower under control.',
    'Lats, Rhomboids, Trapezius, Biceps'
  ),
  (
    'Deadlift',
    'strength', 'back', 'advanced', 'barbell',
    'Stand with bar over mid-foot. Grip just outside legs. Brace core, push floor away to lift bar. Keep bar close to body. Lock hips and knees at top. Return with control.',
    'Erector Spinae, Lats, Glutes, Hamstrings, Traps'
  ),
  (
    'Face Pull',
    'strength', 'back', 'beginner', 'cable machine',
    'Set cable at eye level with rope attachment. Pull rope toward face, elbows flaring out and up. Externally rotate shoulders at end position. Squeeze rear delts. Controlled return.',
    'Rear Deltoids, Rhomboids, Middle Trapezius, Rotator Cuff'
  ),
  (
    'Straight-Arm Pulldown',
    'strength', 'back', 'beginner', 'cable machine',
    'Stand facing cable with bar at chest height. Grip bar with straight arms. Pull down and back in an arc until bar reaches your thighs. Squeeze lats at bottom. Return slowly.',
    'Latissimus Dorsi, Teres Major, Triceps'
  ),
  (
    'Chest-Supported Row',
    'strength', 'back', 'beginner', 'dumbbells',
    'Set bench to 30–45°. Lie chest-down on bench with dumbbells hanging. Row elbows back and up. Squeeze shoulder blades. Lower slowly. Chest stays in contact with bench throughout.',
    'Rhomboids, Middle Trapezius, Rear Deltoids, Biceps'
  ),
  (
    'Rack Pull',
    'strength', 'back', 'intermediate', 'barbell',
    'Set safety pins at knee height. Position as a deadlift but start from knee level. Brace core, pull bar up by driving hips forward. Lock out completely. Lower under control.',
    'Erector Spinae, Trapezius, Lats, Glutes'
  ),
  (
    'Inverted Row',
    'strength', 'back', 'beginner', 'barbell',
    'Set bar at hip height on a rack. Hang below bar with straight body. Pull chest to bar, leading with elbows. Keep body rigid throughout. Lower slowly to full arm extension.',
    'Lats, Rhomboids, Rear Deltoids, Biceps, Core'
  ),
  (
    'Back Extension',
    'strength', 'back', 'beginner', 'bodyweight',
    'Secure legs in hyperextension bench. Lower torso toward floor until 90° bend. Drive hips into pad and raise torso until parallel to floor. Squeeze glutes and lower back at top.',
    'Erector Spinae, Glutes, Hamstrings'
  ),
  (
    'Pendlay Row',
    'strength', 'back', 'advanced', 'barbell',
    'Bar starts on floor each rep. Grip shoulder-width, back parallel to floor. Explosively pull bar to lower chest. Lower back to floor under control. Reset position each rep.',
    'Lats, Rhomboids, Trapezius, Biceps, Core'
  ),
  (
    'Close-Grip Lat Pulldown',
    'strength', 'back', 'beginner', 'cable machine',
    'Use a narrow parallel grip attachment. Pull bar down to upper chest keeping torso upright. Squeeze lats fully at bottom. Resist the weight back up to full arm extension.',
    'Latissimus Dorsi, Teres Major, Biceps'
  ),
  (
    'Meadows Row',
    'strength', 'back', 'intermediate', 'barbell',
    'Stand to the side of a landmine barbell. Grip end of bar with one hand. Row bar up toward hip, elbow driving back and out. Squeeze lat at top. Lower with control.',
    'Lats, Teres Major, Rhomboids, Rear Deltoids'
  ),
  (
    'Good Morning',
    'strength', 'back', 'intermediate', 'barbell',
    'Place bar across upper traps. Brace core, push hips back with slight knee bend. Lower torso until parallel to floor or until hamstring stretch is felt. Drive hips forward to stand.',
    'Erector Spinae, Hamstrings, Glutes'
  ),
  (
    'Cable Pullover',
    'strength', 'back', 'beginner', 'cable machine',
    'Set cable high with rope or bar. Face away from stack, arms extended overhead. Pull cable down and back in an arc keeping arms straight. Squeeze lats at bottom. Return slowly.',
    'Latissimus Dorsi, Teres Major, Serratus Anterior'
  )
) AS new_exercises(name, category, body_part, difficulty, equipment, how_to_do, muscles_targeted)
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.name = new_exercises.name
);

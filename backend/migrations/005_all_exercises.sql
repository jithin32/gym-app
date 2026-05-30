-- Comprehensive exercise library for all body parts
-- Safe to run multiple times: inserts only exercises that don't already exist by name

INSERT INTO exercises (name, category, body_part, difficulty, equipment, how_to_do, muscles_targeted)
SELECT name, category, body_part, difficulty, equipment, how_to_do, muscles_targeted
FROM (VALUES

  -- ════════════════════════════════════════
  -- ABS
  -- ════════════════════════════════════════
  ('Hanging Leg Raise','strength','abs','intermediate','pull-up bar',
   'Hang from a pull-up bar with straight arms. Keeping legs straight, raise them until parallel to floor. Lower slowly without swinging.',
   'Lower Abs, Hip Flexors, Core'),

  ('Russian Twist','strength','abs','beginner','bodyweight',
   'Sit with knees bent and feet off floor. Lean back slightly. Rotate torso left and right, tapping the ground each side. Add weight for more challenge.',
   'Obliques, Rectus Abdominis, Transverse Abdominis'),

  ('Bicycle Crunch','strength','abs','beginner','bodyweight',
   'Lie flat. Hands behind head. Bring opposite knee and elbow toward each other in a cycling motion. Keep lower back pressed to floor throughout.',
   'Obliques, Rectus Abdominis'),

  ('V-Up','strength','abs','intermediate','bodyweight',
   'Lie flat, arms overhead. Simultaneously lift legs and torso, reaching hands toward feet to form a V shape. Lower both together with control.',
   'Rectus Abdominis, Hip Flexors, Core'),

  ('Ab Wheel Rollout','strength','abs','advanced','ab wheel',
   'Kneel on floor holding ab wheel. Roll forward until body is nearly parallel to ground. Use core to pull back to start. Keep hips low throughout.',
   'Rectus Abdominis, Transverse Abdominis, Lats, Shoulders'),

  ('Dead Bug','strength','abs','beginner','bodyweight',
   'Lie on back, arms pointing to ceiling, knees at 90°. Lower opposite arm and leg toward floor simultaneously. Return and repeat other side. Keep lower back pressed down.',
   'Transverse Abdominis, Rectus Abdominis, Hip Flexors'),

  ('Mountain Climbers','cardio','abs','beginner','bodyweight',
   'Start in push-up position. Drive one knee toward chest, then quickly switch legs in a running motion. Keep hips level and core tight throughout.',
   'Core, Hip Flexors, Shoulders, Cardiovascular System'),

  ('Cable Crunch','strength','abs','beginner','cable machine',
   'Kneel in front of cable with rope attachment at head height. Pull elbows toward knees, crunching torso down. Squeeze abs at bottom. Return slowly.',
   'Rectus Abdominis, Obliques'),

  ('Reverse Crunch','strength','abs','beginner','bodyweight',
   'Lie on back, knees bent at 90°. Curl pelvis off floor, bringing knees toward chest. Hold briefly. Lower slowly. Avoid using momentum.',
   'Lower Abs, Rectus Abdominis'),

  ('Flutter Kicks','strength','abs','beginner','bodyweight',
   'Lie flat, hands under glutes. Lift both legs slightly off floor. Alternate kicking legs up and down in small, quick movements. Keep core engaged.',
   'Lower Abs, Hip Flexors'),

  ('Side Plank','strength','abs','beginner','bodyweight',
   'Lie on side, prop on forearm with feet stacked. Lift hips until body is straight. Hold position. Do not let hips drop. Repeat both sides.',
   'Obliques, Transverse Abdominis, Glute Medius'),

  ('Pallof Press','strength','abs','beginner','cable machine',
   'Stand side-on to cable at chest height. Hold handle at chest. Press hands straight out, resisting rotation. Hold 2 seconds. Return. Repeat both sides.',
   'Transverse Abdominis, Obliques, Core'),

  ('Dragon Flag','strength','abs','advanced','bench',
   'Lie on bench, grip behind head. Raise entire body up on shoulder blades. Lower body straight as a plank toward bench. Stop before touching. Return.',
   'Rectus Abdominis, Core, Hip Flexors, Lats'),

  ('Hollow Body Hold','strength','abs','intermediate','bodyweight',
   'Lie flat. Raise shoulders and legs off floor, arms extended overhead. Press lower back to floor creating a hollow dish shape. Hold and breathe.',
   'Rectus Abdominis, Transverse Abdominis, Hip Flexors'),

  ('Toe Touches','strength','abs','beginner','bodyweight',
   'Lie flat, legs raised vertical. Crunch up and reach hands toward feet. Lower shoulders back down without fully resting. Controlled movement throughout.',
   'Upper Abs, Rectus Abdominis'),

  -- ════════════════════════════════════════
  -- BICEPS
  -- ════════════════════════════════════════
  ('Barbell Curl','strength','biceps','beginner','barbell',
   'Stand with barbell at hip level, underhand grip shoulder-width. Curl bar to upper chest keeping elbows pinned to sides. Squeeze at top. Lower slowly.',
   'Biceps, Brachialis'),

  ('Concentration Curl','strength','biceps','beginner','dumbbells',
   'Sit on bench, elbow resting on inner thigh. Curl dumbbell toward shoulder. Fully squeeze at top. Lower to full extension. Isolates the peak.',
   'Biceps Short Head, Brachialis'),

  ('Incline Dumbbell Curl','strength','biceps','intermediate','dumbbells',
   'Set bench to 60°. Lie back, arms hanging. Curl dumbbells up from the stretched position. The incline increases the range of motion for a fuller stretch.',
   'Biceps Long Head, Brachialis'),

  ('Preacher Curl','strength','biceps','beginner','barbell',
   'Rest upper arms on preacher bench pad. Curl bar up to chin level. Fully lower to stretch at bottom. Eliminates body momentum for strict isolation.',
   'Biceps, Brachialis'),

  ('Cable Curl','strength','biceps','beginner','cable machine',
   'Face cable with low pulley. Grip bar underhand. Curl up keeping elbows fixed. Squeeze at top. Cable maintains constant tension unlike free weights.',
   'Biceps, Brachialis'),

  ('Spider Curl','strength','biceps','intermediate','dumbbells',
   'Lie face-down on incline bench. Let arms hang. Curl dumbbells up toward shoulders. The prone position eliminates cheating with shoulders.',
   'Biceps Short Head'),

  ('Zottman Curl','strength','biceps','intermediate','dumbbells',
   'Curl up with a supinated grip. At top, rotate wrists to pronated grip. Lower slowly in this position. Rotate back at bottom. Targets both biceps and brachioradialis.',
   'Biceps, Brachioradialis, Brachialis'),

  ('Reverse Curl','strength','biceps','beginner','barbell',
   'Hold barbell with overhand grip. Curl bar up keeping elbows fixed. This grip shifts emphasis to the brachioradialis and trains the often-neglected forearm region.',
   'Brachioradialis, Biceps, Brachialis'),

  ('Cross-Body Hammer Curl','strength','biceps','beginner','dumbbells',
   'With a neutral grip, curl dumbbell across body toward opposite shoulder instead of straight up. Alternate arms. Hits the long head and brachialis uniquely.',
   'Biceps Long Head, Brachialis, Brachioradialis'),

  ('Drag Curl','strength','biceps','intermediate','barbell',
   'Hold barbell at hips. Instead of curling out, drag bar up your body keeping it close. Elbows move back as bar rises. Peaks the bicep differently than a standard curl.',
   'Biceps Long Head'),

  ('Cable Hammer Curl','strength','biceps','beginner','cable machine',
   'Attach rope to low cable. Stand and hold rope with neutral grip. Curl up, keeping thumbs up throughout. Squeeze at top. Lower to full extension.',
   'Biceps, Brachioradialis, Brachialis'),

  ('21s','strength','biceps','intermediate','barbell',
   'Do 7 reps from bottom to halfway up. Then 7 reps from halfway to top. Then 7 full reps. That equals 21 total. Covers all parts of the range of motion.',
   'Biceps, Brachialis'),

  -- ════════════════════════════════════════
  -- CHEST
  -- ════════════════════════════════════════
  ('Flat Dumbbell Press','strength','chest','beginner','dumbbells',
   'Lie on flat bench, dumbbells at chest level. Press up to full extension, bringing dumbbells close together at top. Lower with elbows at 45° from torso.',
   'Pectorals, Triceps, Anterior Deltoids'),

  ('Dumbbell Fly','strength','chest','beginner','dumbbells',
   'Lie on bench, dumbbells above chest with slight elbow bend. Open arms wide until stretch is felt in chest. Bring back together in a hugging arc. Do not lock elbows.',
   'Pectorals, Anterior Deltoids'),

  ('Decline Bench Press','strength','chest','intermediate','barbell',
   'Set bench to -15 to -30°. Grip bar slightly wider than shoulder-width. Lower to lower chest. Press up to full extension. Decline shifts emphasis to lower pecs.',
   'Lower Pectorals, Triceps, Anterior Deltoids'),

  ('Incline Barbell Press','strength','chest','intermediate','barbell',
   'Set bench to 30–45°. Grip bar slightly wider than shoulders. Lower to upper chest. Press up explosively. Incline targets the upper clavicular pec head.',
   'Upper Pectorals, Triceps, Anterior Deltoids'),

  ('Push-Up','strength','chest','beginner','bodyweight',
   'Place hands shoulder-width on floor in plank position. Lower chest to floor keeping body straight. Press back up. Keep elbows at 45° from torso throughout.',
   'Pectorals, Triceps, Anterior Deltoids, Core'),

  ('Chest Dip','strength','chest','intermediate','bodyweight',
   'Hold parallel bars. Lean torso forward 30°. Lower until upper arms parallel to floor. Press back up. The forward lean targets chest over triceps.',
   'Lower Pectorals, Triceps, Anterior Deltoids'),

  ('Cable Crossover','strength','chest','beginner','cable machine',
   'Stand between cables set high. Pull handles down and in front crossing at waist level. Squeeze chest at bottom. Return slowly with chest stretch at top.',
   'Pectorals, Anterior Deltoids'),

  ('Pec Deck Machine','strength','chest','beginner','machine',
   'Sit upright, elbows on pad wings. Bring wings together in front of chest. Squeeze pecs fully. Open back slowly until stretch is felt. Keep chest up.',
   'Pectorals, Anterior Deltoids'),

  ('Low-to-High Cable Fly','strength','chest','beginner','cable machine',
   'Set cables at low position. Pull handles up and across to shoulder height in an arc. Squeeze upper chest at top. Excellent for upper chest isolation.',
   'Upper Pectorals, Anterior Deltoids'),

  ('Decline Push-Up','strength','chest','beginner','bodyweight',
   'Place feet on elevated surface. Perform push-up with hands on floor. Body angled downward shifts more load to upper chest. Keep core tight.',
   'Upper Pectorals, Triceps, Anterior Deltoids'),

  ('Svend Press','strength','chest','beginner','weight plates',
   'Hold two plates pressed together at chest level. Press forward to arm extension while squeezing plates together. Return. The inward squeeze maximises pec contraction.',
   'Inner Pectorals, Anterior Deltoids'),

  ('Landmine Press (Chest)','strength','chest','beginner','barbell',
   'Hold end of landmine barbell at chest. Press it up and away at 45° angle. Brings the arm across the body at top, maximising chest squeeze. Alternate or use both arms.',
   'Upper Pectorals, Triceps, Anterior Deltoids'),

  -- ════════════════════════════════════════
  -- TRICEPS
  -- ════════════════════════════════════════
  ('Tricep Dip','strength','triceps','intermediate','bodyweight',
   'Hold parallel bars or bench edge. Lower body by bending elbows to 90°. Keep torso upright to target triceps. Press back up to full extension.',
   'Triceps, Anterior Deltoids, Chest'),

  ('Overhead Dumbbell Extension','strength','triceps','beginner','dumbbells',
   'Hold one dumbbell with both hands overhead. Lower behind head by bending elbows. Keep elbows close together pointing up. Press back to full extension.',
   'Triceps Long Head'),

  ('Rope Pushdown','strength','triceps','beginner','cable machine',
   'Attach rope at high cable. Grip rope, elbows at sides. Push down and slightly out at bottom, spreading rope handles to sides for full contraction. Return slowly.',
   'Triceps, All Three Heads'),

  ('Single-Arm Cable Extension','strength','triceps','beginner','cable machine',
   'Set high cable with single handle. Face away from stack. Extend arm forward to full lockout. Keep elbow fixed pointing down. Squeeze at extension. Return.',
   'Triceps Long Head, Lateral Head'),

  ('Tricep Kickback','strength','triceps','beginner','dumbbells',
   'Hinge at hips, upper arm parallel to floor. Extend forearm back to full lockout. Squeeze at full extension. Lower slowly. Avoid using momentum.',
   'Triceps Lateral Head'),

  ('Diamond Push-Up','strength','triceps','intermediate','bodyweight',
   'Form a diamond shape with index fingers and thumbs on floor. Lower chest toward hands. Press back up. The close hand position shifts load to triceps.',
   'Triceps, Inner Chest'),

  ('Tate Press','strength','triceps','intermediate','dumbbells',
   'Lie on bench, dumbbells pointing up. Tip them in toward chest by bending elbows outward (not back). Press back up. Hits the short head uniquely.',
   'Triceps Short Head, Medial Head'),

  ('Incline Tricep Extension','strength','triceps','intermediate','dumbbells',
   'Set bench to 30°. Lie back, dumbbells at shoulder level pointing up. Bend elbows to lower dumbbells behind head. Extend back up. Incline stretches the long head more.',
   'Triceps Long Head'),

  ('Reverse-Grip Pushdown','strength','triceps','beginner','cable machine',
   'Grip cable bar underhand with palms up. Elbows fixed at sides. Push bar down to full extension. Return to 90°. Underhand grip targets the medial head.',
   'Triceps Medial Head, Brachioradialis'),

  ('JM Press','strength','triceps','advanced','barbell',
   'Set up like a close-grip bench press. Lower bar toward upper chest/neck while flaring elbows out slightly. The bar path is a hybrid of a press and skull crusher.',
   'Triceps, Anterior Deltoids'),

  ('Board Press','strength','triceps','advanced','barbell',
   'Perform bench press with 1–3 boards stacked on chest. The boards limit range of motion, keeping you in the strongest portion and overloading the lockout.',
   'Triceps, Chest, Anterior Deltoids'),

  -- ════════════════════════════════════════
  -- LEGS
  -- ════════════════════════════════════════
  ('Hack Squat','strength','legs','intermediate','machine',
   'Load hack squat machine. Place feet shoulder-width on platform. Lower until thighs are parallel. Drive through heels to return. Machine guides the path safely.',
   'Quads, Glutes, Hamstrings'),

  ('Lunges','strength','legs','beginner','dumbbells',
   'Step forward and lower back knee toward floor. Front knee tracks over toes. Push through front heel to return to standing. Alternate legs each rep.',
   'Quads, Glutes, Hamstrings, Core'),

  ('Leg Extension','strength','legs','beginner','machine',
   'Sit in machine, pad across shins. Extend legs to full lockout. Squeeze quads at top. Lower slowly to 90°. Isolates quads completely.',
   'Quadriceps'),

  ('Lying Leg Curl','strength','legs','beginner','machine',
   'Lie face-down in machine, pad behind ankles. Curl legs toward glutes. Squeeze hamstrings at top. Lower with control. Keep hips pressed down.',
   'Hamstrings, Calves'),

  ('Bulgarian Split Squat','strength','legs','intermediate','dumbbells',
   'Rear foot elevated on bench. Hold dumbbells at sides. Lower front knee toward floor keeping torso upright. Drive through front heel to stand. Repeat both sides.',
   'Quads, Glutes, Hamstrings, Core'),

  ('Hip Thrust','strength','legs','intermediate','barbell',
   'Sit with upper back against bench. Barbell across hips. Drive hips up until torso is parallel to floor. Squeeze glutes at top. Lower slowly.',
   'Glutes, Hamstrings, Hip Flexors'),

  ('Standing Calf Raise','strength','legs','beginner','machine',
   'Stand on calf raise machine or step edge, balls of feet on pad. Lower heels below platform. Rise up on toes as high as possible. Pause and lower slowly.',
   'Gastrocnemius, Soleus'),

  ('Goblet Squat','strength','legs','beginner','dumbbells',
   'Hold dumbbell vertically at chest. Feet shoulder-width. Sit into a deep squat keeping elbows inside knees. Keep chest tall. Drive through heels to stand.',
   'Quads, Glutes, Core, Adductors'),

  ('Sumo Squat','strength','legs','beginner','dumbbells',
   'Take wide stance with toes pointed out 45°. Hold weight between legs. Sit straight down keeping knees tracking over toes. Wide stance hits inner thighs more.',
   'Quads, Glutes, Adductors, Hamstrings'),

  ('Step-Up','strength','legs','beginner','dumbbells',
   'Hold dumbbells. Step one foot onto box or bench. Drive through that heel to fully stand on box. Step down with control. Alternate leading legs.',
   'Quads, Glutes, Hamstrings'),

  ('Box Jump','cardio','legs','intermediate','bodyweight',
   'Stand in front of box. Dip into quarter squat. Jump explosively, landing softly with knees bent on box. Stand fully. Step down carefully. Repeat.',
   'Quads, Glutes, Hamstrings, Calves, Core'),

  ('Nordic Hamstring Curl','strength','legs','advanced','bodyweight',
   'Anchor feet under pad or have partner hold. Start kneeling upright. Slowly lower torso toward floor using hamstrings as brakes. Push up with hands. Return to start.',
   'Hamstrings, Glutes'),

  ('Wall Sit','strength','legs','beginner','bodyweight',
   'Lean back against wall. Lower until thighs are parallel to floor, knees at 90°. Hold position. Keep back flat against wall. An isometric quad burner.',
   'Quadriceps, Glutes'),

  ('Seated Calf Raise','strength','legs','beginner','machine',
   'Sit in machine with pad resting on thighs just above knees. Lower heels to full stretch. Rise up on toes as high as possible. Targets the soleus deeper muscle.',
   'Soleus, Gastrocnemius'),

  ('Sissy Squat','strength','legs','advanced','bodyweight',
   'Hold support for balance. Rise onto toes. Lean back and lower knees toward floor simultaneously. Go as low as possible. Drive back up through quads.',
   'Rectus Femoris, Quads, Hip Flexors'),

  -- ════════════════════════════════════════
  -- FOREARMS
  -- ════════════════════════════════════════
  ('Wrist Curl','strength','forearms','beginner','dumbbells',
   'Sit, forearms on thighs, palms up. Let dumbbells roll to fingers. Curl wrists up and squeeze. Lower fully. Works flexors on the inside of the forearm.',
   'Wrist Flexors, Forearm Muscles'),

  ('Reverse Wrist Curl','strength','forearms','beginner','dumbbells',
   'Sit, forearms on thighs, palms down. Curl wrists upward lifting dumbbells. Lower slowly. Targets the extensor muscles on top of the forearm.',
   'Wrist Extensors, Brachioradialis'),

  ('Farmers Walk','strength','forearms','beginner','dumbbells',
   'Pick up heavy dumbbells. Walk for a set distance or time maintaining upright posture. The heavy carry forces the grip to work continuously. Set them down with control.',
   'Grip, Forearms, Traps, Core, Entire Body'),

  ('Plate Pinch','strength','forearms','intermediate','weight plates',
   'Pinch two weight plates together smooth-side out using only fingers and thumb. Hold for time. Alternate hands. Builds crushing and pinch grip strength.',
   'Fingers, Thumb, Forearm Flexors'),

  ('Bar Hang','strength','forearms','beginner','pull-up bar',
   'Hang from pull-up bar for as long as possible. Keep shoulders active, not passive. Use both overhand and mixed grips across sets. Builds raw grip endurance.',
   'Grip, Forearms, Shoulder Stabilisers'),

  ('Wrist Roller','strength','forearms','intermediate','wrist roller',
   'Hold roller at shoulder height, arms extended. Roll weight up by rotating wrists alternately. Then lower it the same way. Both directions challenge different muscles.',
   'Wrist Flexors, Wrist Extensors, Forearms'),

  ('Behind-the-Back Wrist Curl','strength','forearms','beginner','barbell',
   'Hold barbell behind back with overhand grip. Let bar roll down fingers. Curl wrists up to lift bar. Very strict isolation with no ability to cheat.',
   'Wrist Flexors, Forearm Flexors'),

  ('Dead Hang','strength','forearms','beginner','pull-up bar',
   'Hang from bar with full body weight. Keep core lightly engaged. Hang for maximum time. Decompresses the spine while building grip and forearm endurance.',
   'Grip, Forearms, Lats, Shoulder Stabilisers'),

  ('Towel Pull-Up','strength','forearms','advanced','pull-up bar',
   'Drape towels over bar, grip one in each hand. Perform pull-ups gripping the towels. The unstable grip massively increases forearm and hand muscle recruitment.',
   'Forearms, Grip, Lats, Biceps'),

  ('Finger Extension Band','strength','forearms','beginner','resistance band',
   'Wrap band around fingers. Open hand against the band resistance. Slowly close back. Trains the often-neglected extensor muscles for balanced forearm development.',
   'Finger Extensors, Forearm Extensors'),

  -- ════════════════════════════════════════
  -- SHOULDERS
  -- ════════════════════════════════════════
  ('Arnold Press','strength','shoulders','intermediate','dumbbells',
   'Start with palms facing you at chin level. As you press overhead, rotate palms forward. Reverse rotation on the way down. Rotational path hits all three deltoid heads.',
   'Anterior Deltoid, Medial Deltoid, Posterior Deltoid, Triceps'),

  ('Rear Delt Fly','strength','shoulders','beginner','dumbbells',
   'Hinge at hips, dumbbells hanging. Raise arms out to sides keeping a slight bend in elbows. Squeeze rear delts at top. Lower slowly. Avoid using momentum.',
   'Posterior Deltoid, Rhomboids, Trapezius'),

  ('Cable Lateral Raise','strength','shoulders','beginner','cable machine',
   'Stand side-on to low cable. Grip handle with far hand. Raise arm out to shoulder level. Lower slowly. Cable provides constant tension unlike dumbbells.',
   'Medial Deltoid'),

  ('Front Raise','strength','shoulders','beginner','dumbbells',
   'Hold dumbbells in front of thighs. Raise one or both arms forward to shoulder level. Lower slowly. Keep slight bend in elbow. Avoid swinging.',
   'Anterior Deltoid'),

  ('Upright Row','strength','shoulders','intermediate','barbell',
   'Hold barbell with overhand grip shoulder-width. Pull bar up toward chin, leading with elbows flaring high. Lower slowly. Stop at collarbone level.',
   'Medial Deltoid, Trapezius, Biceps'),

  ('Machine Shoulder Press','strength','shoulders','beginner','machine',
   'Adjust seat so handles are at shoulder level. Press overhead to full extension. Lower to starting position. Machine provides stability to focus purely on pressing.',
   'Anterior Deltoid, Medial Deltoid, Triceps'),

  ('Landmine Press (Shoulder)','strength','shoulders','beginner','barbell',
   'Hold end of landmine barbell at shoulder. Press up at an angle until arm is extended. Lower with control. The angle reduces joint stress versus direct overhead pressing.',
   'Anterior Deltoid, Upper Pectorals, Triceps'),

  ('Push Press','strength','shoulders','intermediate','barbell',
   'Bar in rack position. Dip knees slightly. Drive through legs explosively to help press bar overhead. Lock out fully overhead. The leg drive allows heavier loads.',
   'Anterior Deltoid, Medial Deltoid, Triceps, Legs, Core'),

  ('Cable Front Raise','strength','shoulders','beginner','cable machine',
   'Face away from cable set at low position. Grip handle, raise arm forward to shoulder level. Lower with control. Constant tension from the cable throughout.',
   'Anterior Deltoid'),

  ('Bent-Over Dumbbell Raise','strength','shoulders','beginner','dumbbells',
   'Hinge at hips with dumbbells hanging. Raise arms out to sides in T shape at shoulder level. Lead with elbows slightly bent. Targets rear delts and upper back.',
   'Posterior Deltoid, Rhomboids, Trapezius'),

  ('Shrug','strength','shoulders','beginner','dumbbells',
   'Hold dumbbells at sides. Elevate shoulders straight up toward ears as high as possible. Hold briefly. Lower slowly. Do not roll shoulders, only vertical movement.',
   'Upper Trapezius, Levator Scapulae'),

  ('Dumbbell W Raise','strength','shoulders','beginner','dumbbells',
   'Lie face-down on incline bench or stand bent over. Raise arms bent into a W position, pulling elbows back. Squeeze shoulder blades and rear delts at top.',
   'Posterior Deltoid, Rhomboids, Lower Trapezius'),

  -- ════════════════════════════════════════
  -- FULL BODY
  -- ════════════════════════════════════════
  ('Burpee','cardio','full_body','intermediate','bodyweight',
   'From standing, drop hands to floor. Jump feet back to plank. Do a push-up. Jump feet forward. Explosively jump up with arms overhead. Repeat without rest.',
   'Full Body, Cardiovascular System, Core, Legs, Chest, Shoulders'),

  ('Kettlebell Swing','strength','full_body','intermediate','kettlebell',
   'Hinge at hips with kettlebell between legs. Drive hips forward explosively to swing bell to shoulder height. Let it swing back between legs and repeat. Power comes from hips.',
   'Glutes, Hamstrings, Core, Lats, Shoulders'),

  ('Clean and Press','strength','full_body','advanced','barbell',
   'Pull bar from floor, shrug and pull under it catching at shoulders in a squat. Stand up. Press bar overhead. Lower back to shoulders then to floor. Full body power move.',
   'Entire Body, Posterior Chain, Shoulders, Triceps, Core'),

  ('Thrusters','strength','full_body','intermediate','barbell',
   'Hold bar at shoulders. Squat to parallel. Drive up explosively. Use momentum to press bar overhead. Lower bar to shoulders as you descend into next squat. Non-stop.',
   'Quads, Glutes, Shoulders, Triceps, Core'),

  ('Turkish Get-Up','strength','full_body','advanced','kettlebell',
   'Lie holding kettlebell pressed above you. Stand up in a series of controlled steps: roll, post, kneel, stand, all with arm locked overhead. Reverse back to floor.',
   'Entire Body, Shoulder Stability, Core, Hip Flexors'),

  ('Battle Ropes','cardio','full_body','intermediate','battle ropes',
   'Hold one rope in each hand. Create alternating or simultaneous waves by raising and slamming ropes powerfully. Keep knees slightly bent. Maximum intensity.',
   'Shoulders, Arms, Core, Cardiovascular System'),

  ('Rowing Machine','cardio','full_body','beginner','rowing machine',
   'Sit with feet strapped. Drive legs first, lean back slightly, then pull handle to lower ribs. Return by extending arms, leaning forward then bending knees.',
   'Lats, Rhomboids, Legs, Core, Biceps, Cardiovascular System'),

  ('Sled Push','cardio','full_body','intermediate','sled',
   'Load sled with weight. Drive it across floor with arms extended or bent, using powerful leg drive. Stay low with chest angled forward. Push for distance or time.',
   'Quads, Glutes, Hamstrings, Core, Shoulders, Cardiovascular System'),

  ('Farmers Carry','strength','full_body','beginner','dumbbells',
   'Pick up heavy dumbbells. Walk upright with tight core and packed shoulders for a set distance or time. The heavy carry taxes grip, core and entire body simultaneously.',
   'Grip, Forearms, Traps, Core, Entire Body'),

  ('Jump Squat','cardio','full_body','intermediate','bodyweight',
   'Descend into a squat. Explode upward jumping off floor. Land softly absorbing with bent knees. Reset and repeat. Builds explosive lower body power and burns calories.',
   'Quads, Glutes, Hamstrings, Calves, Cardiovascular System'),

  ('Jump Rope','cardio','full_body','beginner','jump rope',
   'Hold handles at sides, rope behind you. Swing rope over head and jump with both feet as it passes below. Keep a consistent rhythm. Stay on balls of feet.',
   'Cardiovascular System, Calves, Shoulders, Core, Coordination'),

  ('Bear Crawl','cardio','full_body','beginner','bodyweight',
   'Start on hands and feet with knees hovering just above floor. Move opposite hand and foot forward simultaneously. Keep back flat and hips level. Travel for distance.',
   'Core, Shoulders, Chest, Quads, Hip Flexors'),

  ('Inchworm Walk','strength','full_body','beginner','bodyweight',
   'Stand tall. Bend and walk hands out to plank position. Perform a push-up. Walk feet toward hands. Stand up. Repeat. Combines mobility and strength in one movement.',
   'Core, Hamstrings, Chest, Shoulders, Triceps'),

  ('Tire Flip','strength','full_body','advanced','tire',
   'Stand over tire. Grip underside with fingers. Drive through legs and hips to flip tire forward. As it comes up, push it over. Reset and repeat. Full explosive movement.',
   'Entire Body, Posterior Chain, Quads, Core, Forearms'),

  ('Devil Press','strength','full_body','advanced','dumbbells',
   'Dumbbells on floor. Drop to plank with dumbbells in hands. Do a push-up. Jump feet forward. Clean dumbbells to shoulders. Press them overhead. Lower and repeat.',
   'Full Body, Shoulders, Chest, Legs, Core, Cardiovascular System')

) AS v(name, category, body_part, difficulty, equipment, how_to_do, muscles_targeted)
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.name = v.name
);

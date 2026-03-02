-- ============================================================================
-- FITNESS HUB - SECURITY & RLS POLICIES
-- Execute this script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. HELPER FUNCTIONS FOR JWT AUTHENTICATION
-- ============================================================================

-- Function to extract email from custom JWT (stored in 'sub' claim)
CREATE OR REPLACE FUNCTION auth.jwt_email()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    NULL
  );
$$;

-- Function to get current user ID by email from JWT
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT id FROM users WHERE email = auth.jwt_email();
$$;

-- Function to check if user is authenticated (email exists in JWT)
CREATE OR REPLACE FUNCTION auth.is_authenticated()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT auth.jwt_email() IS NOT NULL;
$$;

-- ============================================================================
-- 3. RLS POLICIES - USERS TABLE
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;

-- Users can only see their own record
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (id = auth.current_user_id());

-- Users can update their own record (e.g., change email)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (id = auth.current_user_id())
  WITH CHECK (id = auth.current_user_id());

-- No direct INSERT via RLS (handled by backend)
-- No direct DELETE via RLS (handled by backend)

-- ============================================================================
-- 4. RLS POLICIES - PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (user_id = auth.current_user_id());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (user_id = auth.current_user_id())
  WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  USING (user_id = auth.current_user_id());

-- ============================================================================
-- 5. RLS POLICIES - GOALS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "goals_select_own" ON goals;
DROP POLICY IF EXISTS "goals_insert_own" ON goals;
DROP POLICY IF EXISTS "goals_update_own" ON goals;
DROP POLICY IF EXISTS "goals_delete_own" ON goals;

CREATE POLICY "goals_select_own" ON goals
  FOR SELECT
  USING (user_id = auth.current_user_id());

CREATE POLICY "goals_insert_own" ON goals
  FOR INSERT
  WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "goals_update_own" ON goals
  FOR UPDATE
  USING (user_id = auth.current_user_id())
  WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "goals_delete_own" ON goals
  FOR DELETE
  USING (user_id = auth.current_user_id());

-- ============================================================================
-- 6. RLS POLICIES - MEALS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "meals_select_own" ON meals;
DROP POLICY IF EXISTS "meals_insert_own" ON meals;
DROP POLICY IF EXISTS "meals_update_own" ON meals;
DROP POLICY IF EXISTS "meals_delete_own" ON meals;

CREATE POLICY "meals_select_own" ON meals
  FOR SELECT
  USING (user_id = auth.current_user_id());

CREATE POLICY "meals_insert_own" ON meals
  FOR INSERT
  WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "meals_update_own" ON meals
  FOR UPDATE
  USING (user_id = auth.current_user_id())
  WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "meals_delete_own" ON meals
  FOR DELETE
  USING (user_id = auth.current_user_id());

-- ============================================================================
-- 7. RLS POLICIES - WORKOUTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "workouts_select_own" ON workouts;
DROP POLICY IF EXISTS "workouts_insert_own" ON workouts;
DROP POLICY IF EXISTS "workouts_update_own" ON workouts;
DROP POLICY IF EXISTS "workouts_delete_own" ON workouts;

CREATE POLICY "workouts_select_own" ON workouts
  FOR SELECT
  USING (user_id = auth.current_user_id());

CREATE POLICY "workouts_insert_own" ON workouts
  FOR INSERT
  WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "workouts_update_own" ON workouts
  FOR UPDATE
  USING (user_id = auth.current_user_id())
  WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "workouts_delete_own" ON workouts
  FOR DELETE
  USING (user_id = auth.current_user_id());

-- ============================================================================
-- 8. RLS POLICIES - WORKOUT_EXERCISES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "exercises_select_own" ON workout_exercises;
DROP POLICY IF EXISTS "exercises_insert_own" ON workout_exercises;
DROP POLICY IF EXISTS "exercises_update_own" ON workout_exercises;
DROP POLICY IF EXISTS "exercises_delete_own" ON workout_exercises;

CREATE POLICY "exercises_select_own" ON workout_exercises
  FOR SELECT
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.current_user_id()
    )
  );

CREATE POLICY "exercises_insert_own" ON workout_exercises
  FOR INSERT
  WITH CHECK (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.current_user_id()
    )
  );

CREATE POLICY "exercises_update_own" ON workout_exercises
  FOR UPDATE
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.current_user_id()
    )
  );

CREATE POLICY "exercises_delete_own" ON workout_exercises
  FOR DELETE
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.current_user_id()
    )
  );

-- ============================================================================
-- 9. RLS POLICIES - WATER_LOGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "water_logs_select_own" ON water_logs;
DROP POLICY IF EXISTS "water_logs_insert_own" ON water_logs;
DROP POLICY IF EXISTS "water_logs_update_own" ON water_logs;
DROP POLICY IF EXISTS "water_logs_delete_own" ON water_logs;

CREATE POLICY "water_logs_select_own" ON water_logs
  FOR SELECT
  USING (user_id = auth.current_user_id());

CREATE POLICY "water_logs_insert_own" ON water_logs
  FOR INSERT
  WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "water_logs_update_own" ON water_logs
  FOR UPDATE
  USING (user_id = auth.current_user_id())
  WITH CHECK (user_id = auth.current_user_id());

CREATE POLICY "water_logs_delete_own" ON water_logs
  FOR DELETE
  USING (user_id = auth.current_user_id());

-- ============================================================================
-- 10. PUBLIC CATALOG TABLES (No sensitive user data)
-- ============================================================================

-- Exercises Catalog - Public read access
CREATE TABLE IF NOT EXISTS exercises_catalog (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  muscle_group VARCHAR(50) NOT NULL,
  equipment VARCHAR(100),
  description TEXT,
  instructions TEXT,
  difficulty VARCHAR(20) DEFAULT 'intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meals Catalog - Public read access
CREATE TABLE IF NOT EXISTS meals_catalog (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  serving_size VARCHAR(100),
  image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Templates - Public read access
CREATE TABLE IF NOT EXISTS workout_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) DEFAULT 'intermediate',
  duration_minutes INTEGER,
  goal VARCHAR(50), -- strength, hypertrophy, endurance, weight_loss
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Template Exercises
CREATE TABLE IF NOT EXISTS workout_template_exercises (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises_catalog(id),
  sets INTEGER,
  reps VARCHAR(50),
  rest_seconds INTEGER,
  order_index INTEGER
);

-- Enable RLS on catalog tables
ALTER TABLE exercises_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_template_exercises ENABLE ROW LEVEL SECURITY;

-- Public read policies for catalog tables
CREATE POLICY "exercises_catalog_public_read" ON exercises_catalog
  FOR SELECT
  USING (true);

CREATE POLICY "meals_catalog_public_read" ON meals_catalog
  FOR SELECT
  USING (true);

CREATE POLICY "workout_templates_public_read" ON workout_templates
  FOR SELECT
  USING (true);

CREATE POLICY "workout_template_exercises_public_read" ON workout_template_exercises
  FOR SELECT
  USING (true);

-- Only service role can modify catalog tables
CREATE POLICY "exercises_catalog_service_write" ON exercises_catalog
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "meals_catalog_service_write" ON meals_catalog
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "workout_templates_service_write" ON workout_templates
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 11. SEED DATA FOR CATALOG TABLES
-- ============================================================================

-- Sample exercises
INSERT INTO exercises_catalog (name, muscle_group, equipment, description, difficulty) VALUES
('Supino Reto', 'chest', 'barbell', 'Exercício fundamental para peitoral', 'intermediate'),
('Supino Inclinado', 'chest', 'dumbbell', 'Foco na porção superior do peitoral', 'intermediate'),
('Crucifixo', 'chest', 'dumbbell', 'Isolamento do peitoral', 'beginner'),
('Puxada Frontal', 'back', 'cable', 'Exercício para dorsal', 'beginner'),
('Remada Curvada', 'back', 'barbell', 'Exercício composto para costas', 'intermediate'),
('Remada Unilateral', 'back', 'dumbbell', 'Remada com halteres', 'beginner'),
('Desenvolvimento', 'shoulders', 'dumbbell', 'Exercício para ombros', 'intermediate'),
('Elevação Lateral', 'shoulders', 'dumbbell', 'Isolamento do deltoide lateral', 'beginner'),
('Rosca Direta', 'biceps', 'barbell', 'Exercício básico para bíceps', 'beginner'),
('Rosca Martelo', 'biceps', 'dumbbell', 'Trabalha braquial e antebraço', 'beginner'),
('Tríceps Testa', 'triceps', 'barbell', 'Isolamento do tríceps', 'intermediate'),
('Tríceps Corda', 'triceps', 'cable', 'Exercício na polia', 'beginner'),
('Agachamento Livre', 'legs', 'barbell', 'Exercício composto para pernas', 'advanced'),
('Leg Press', 'legs', 'machine', 'Exercício para quadríceps', 'beginner'),
('Cadeira Extensora', 'legs', 'machine', 'Isolamento do quadríceps', 'beginner'),
('Mesa Flexora', 'legs', 'machine', 'Isolamento do posterior', 'beginner'),
('Panturrilha Em Pé', 'calves', 'machine', 'Exercício para panturrilha', 'beginner'),
('Abdominal Crunch', 'core', 'bodyweight', 'Exercício para abdômen', 'beginner'),
('Prancha', 'core', 'bodyweight', 'Exercício isométrico para core', 'beginner'),
('Abs Infra', 'core', 'bodyweight', 'Foco na porção inferior do reto abdominal', 'intermediate')
ON CONFLICT DO NOTHING;

-- Sample meals
INSERT INTO meals_catalog (name, category, calories, protein, carbs, fat, serving_size) VALUES
('Ovos Mexidos', 'breakfast', 220, 14, 2, 16, '2 ovos'),
('Aveia com Banana', 'breakfast', 280, 8, 48, 6, '40g aveia + 1 banana'),
('Iogurte com Granola', 'breakfast', 250, 12, 35, 7, '150g iogurte + 30g granola'),
('Peito de Frango Grelhado', 'lunch', 165, 31, 0, 3.6, '100g'),
('Arroz Integral', 'lunch', 216, 5, 45, 1.8, '1 xícara'),
('Feijão', 'lunch', 110, 7, 20, 0.5, '1 concha'),
('Salada Mista', 'lunch', 25, 2, 5, 0, '1 prato'),
('Salmão Grelhado', 'dinner', 208, 20, 0, 13, '100g'),
('Batata Doce', 'dinner', 103, 2, 24, 0, '100g'),
('Brócolis Refogado', 'dinner', 55, 4, 6, 2, '1 xícara'),
('Whey Protein', 'snack', 120, 24, 3, 1, '1 scoop'),
('Banana', 'snack', 105, 1, 27, 0, '1 unidade'),
('Castanha-do-Pará', 'snack', 185, 4, 3, 19, '30g'),
('Batata Doce Cozida', 'snack', 86, 2, 20, 0, '100g')
ON CONFLICT DO NOTHING;

-- Sample workout templates
INSERT INTO workout_templates (name, description, difficulty, duration_minutes, goal) VALUES
('Peito e Tríceps', 'Treino focado em peitoral e tríceps', 'intermediate', 60, 'hypertrophy'),
('Costas e Bíceps', 'Treino focado em costas e bíceps', 'intermediate', 60, 'hypertrophy'),
('Pernas Completo', 'Treino completo de membros inferiores', 'intermediate', 70, 'hypertrophy'),
('Ombros e Trapézio', 'Treino focado em ombros', 'intermediate', 50, 'hypertrophy'),
('Full Body Iniciante', 'Treino corpo inteiro para iniciantes', 'beginner', 45, 'strength'),
('HIIT Cardio', 'Treino intervalado de alta intensidade', 'advanced', 30, 'weight_loss')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 12. STORAGE POLICIES FOR AVATARS
-- ============================================================================

-- Create storage bucket for avatars (run in Supabase Dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false);

-- Policy: Users can only upload to their own folder
CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.current_user_id()::text
  );

-- Policy: Users can only read their own avatar
CREATE POLICY "avatars_read_own" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.current_user_id()::text
  );

-- Policy: Users can only update their own avatar
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.current_user_id()::text
  );

-- Policy: Users can only delete their own avatar
CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.current_user_id()::text
  );

-- ============================================================================
-- 13. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercises_catalog_muscle ON exercises_catalog(muscle_group);
CREATE INDEX IF NOT EXISTS idx_meals_catalog_category ON meals_catalog(category);

-- ============================================================================
-- 14. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to catalog tables
DROP TRIGGER IF EXISTS update_exercises_catalog_updated_at ON exercises_catalog;
CREATE TRIGGER update_exercises_catalog_updated_at
  BEFORE UPDATE ON exercises_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meals_catalog_updated_at ON meals_catalog;
CREATE TRIGGER update_meals_catalog_updated_at
  BEFORE UPDATE ON meals_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workout_templates_updated_at ON workout_templates;
CREATE TRIGGER update_workout_templates_updated_at
  BEFORE UPDATE ON workout_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 15. VERIFICATION QUERIES (Run after to verify setup)
-- ============================================================================

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies exist
-- SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
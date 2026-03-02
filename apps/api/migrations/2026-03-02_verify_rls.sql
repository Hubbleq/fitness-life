-- ============================================================================
-- RLS VERIFICATION SCRIPT
-- Run this after applying the security policies to verify everything is working
-- ============================================================================

-- ============================================================================
-- 1. VERIFY RLS IS ENABLED
-- ============================================================================
-- All tables should have 'rowsecurity' = true

SELECT
    tablename,
    CASE
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- 2. VERIFY POLICIES EXIST
-- ============================================================================

SELECT
    tablename,
    policyname,
    cmd as operation,
    '✅' as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 3. COUNT POLICIES PER TABLE
-- ============================================================================

SELECT
    tablename,
    COUNT(*) as policy_count,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Has policies'
        ELSE '❌ No policies'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 4. TEST: TRY TO ACCESS DATA WITHOUT AUTHENTICATION
-- ============================================================================

-- Reset any previous context
RESET request.jwt.claims;

-- This should return EMPTY (no rows) because no user is authenticated
-- If it returns data, RLS is NOT working correctly
SELECT 'users' as table_name, COUNT(*) as rows_accessible FROM users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'goals', COUNT(*) FROM goals
UNION ALL
SELECT 'meals', COUNT(*) FROM meals
UNION ALL
SELECT 'workouts', COUNT(*) FROM workouts
UNION ALL
SELECT 'water_logs', COUNT(*) FROM water_logs;

-- Expected result: All counts should be 0

-- ============================================================================
-- 5. TEST: ACCESS WITH SIMULATED USER CONTEXT
-- ============================================================================

-- Replace 'test@example.com' with an actual email from your users table
-- SET request.jwt.claims = '{"sub": "test@example.com"}';

-- This should return only the user's own data
-- SELECT * FROM profiles;
-- SELECT * FROM goals;
-- SELECT * FROM meals;

-- ============================================================================
-- 6. TEST: PUBLIC CATALOG ACCESS (Should work without auth)
-- ============================================================================

-- These should work even without authentication
SELECT 'exercises_catalog' as table_name, COUNT(*) as rows FROM exercises_catalog;
SELECT 'meals_catalog' as table_name, COUNT(*) as rows FROM meals_catalog;
SELECT 'workout_templates' as table_name, COUNT(*) as rows FROM workout_templates;

-- ============================================================================
-- 7. VERIFY HELPER FUNCTIONS
-- ============================================================================

SELECT
    'auth.jwt_email()' as function_name,
    CASE
        WHEN pg_get_functiondef(oid) LIKE '%auth.jwt_email%' THEN '✅ Exists'
        ELSE '❌ Missing'
    END as status
FROM pg_proc
WHERE proname = 'jwt_email' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');

SELECT
    'auth.current_user_id()' as function_name,
    CASE
        WHEN pg_get_functiondef(oid) LIKE '%auth.current_user_id%' THEN '✅ Exists'
        ELSE '❌ Missing'
    END as status
FROM pg_proc
WHERE proname = 'current_user_id' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');

-- ============================================================================
-- 8. CHECK FOR MISSING INDEXES
-- ============================================================================

SELECT
    t.relname as table_name,
    i.relname as index_name,
    a.attname as column_name
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relname IN ('meals', 'workouts', 'water_logs', 'exercises_catalog', 'meals_catalog')
AND a.attname IN ('user_id', 'date', 'muscle_group', 'category')
ORDER BY t.relname, i.relname;

-- ============================================================================
-- 9. SECURITY SUMMARY
-- ============================================================================

SELECT
    'RLS Status' as check_type,
    CASE
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) =
             (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public')
        THEN '✅ All tables have RLS enabled'
        ELSE '❌ Some tables missing RLS'
    END as result

UNION ALL

SELECT
    'Policies Status' as check_type,
    CASE
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') > 0
        THEN '✅ Policies are defined'
        ELSE '❌ No policies found'
    END as result

UNION ALL

SELECT
    'Catalog Tables' as check_type,
    CASE
        WHEN (SELECT COUNT(*) FROM exercises_catalog) > 0
        AND (SELECT COUNT(*) FROM meals_catalog) > 0
        THEN '✅ Catalog tables have data'
        ELSE '⚠️ Catalog tables may be empty'
    END as result

UNION ALL

SELECT
    'Helper Functions' as check_type,
    CASE
        WHEN (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('jwt_email', 'current_user_id')) = 2
        THEN '✅ Helper functions exist'
        ELSE '❌ Helper functions missing'
    END as result;
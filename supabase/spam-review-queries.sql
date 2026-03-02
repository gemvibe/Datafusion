-- Spam Detection Manual Review Queries
-- Use these queries in Supabase SQL Editor to manually review spam detection results

-- ========================================
-- 1. VIEW ALL SPAM REPORTS (Review these first)
-- ========================================
SELECT 
  id,
  type,
  address,
  description,
  reported_by,
  is_spam,
  spam_score,
  spam_reason,
  urgency,
  status,
  created_at
FROM incidents 
WHERE is_spam = true 
ORDER BY spam_score DESC;

-- ========================================
-- 2. VIEW BORDERLINE CASES (40-60% confidence - NEEDS MANUAL REVIEW)
-- ========================================
SELECT 
  id,
  type,
  address,
  description,
  spam_score,
  spam_reason,
  urgency,
  created_at
FROM incidents 
WHERE spam_score BETWEEN 40 AND 60
ORDER BY spam_score;

-- ========================================
-- 3. VIEW UNCHECKED REPORTS (Not yet analyzed)
-- ========================================
SELECT 
  id,
  type,
  address,
  description,
  urgency,
  created_at
FROM incidents 
WHERE spam_checked_at IS NULL
ORDER BY created_at DESC;

-- ========================================
-- 4. CRITICAL REPORTS MARKED AS SPAM (VERIFY IMMEDIATELY!)
-- ========================================
SELECT 
  id,
  type,
  urgency,
  address,
  description,
  spam_score,
  spam_reason,
  created_at
FROM incidents 
WHERE is_spam = true 
  AND urgency = 'critical'
ORDER BY created_at DESC;

-- ========================================
-- 5. STATISTICS - Spam vs Legitimate
-- ========================================
SELECT 
  CASE 
    WHEN is_spam = true THEN 'Spam'
    WHEN is_spam = false THEN 'Legitimate'
    ELSE 'Unchecked'
  END as category,
  COUNT(*) as count,
  ROUND(AVG(spam_score), 2) as avg_confidence
FROM incidents 
WHERE spam_checked_at IS NOT NULL
GROUP BY is_spam;

-- ========================================
-- 6. MANUALLY MARK AS SPAM
-- ========================================
-- UPDATE incidents 
-- SET 
--   is_spam = true,
--   spam_score = 100,
--   spam_reason = 'Manually marked as spam by admin',
--   spam_checked_at = NOW(),
--   manual_review_status = 'verified_spam',
--   reviewed_at = NOW()
-- WHERE id = 'YOUR_INCIDENT_ID_HERE';

-- ========================================
-- 7. MANUALLY MARK AS LEGITIMATE
-- ========================================
-- UPDATE incidents 
-- SET 
--   is_spam = false,
--   spam_score = 0,
--   spam_reason = 'Manually verified as legitimate by admin',
--   spam_checked_at = NOW(),
--   manual_review_status = 'verified_legitimate',
--   reviewed_at = NOW()
-- WHERE id = 'YOUR_INCIDENT_ID_HERE';

-- ========================================
-- 8. VIEW RECENT SPAM DETECTIONS (Last 24 hours)
-- ========================================
SELECT 
  id,
  type,
  address,
  is_spam,
  spam_score,
  spam_reason,
  spam_checked_at
FROM incidents 
WHERE spam_checked_at > NOW() - INTERVAL '24 hours'
ORDER BY spam_checked_at DESC;

-- ========================================
-- 9. EXPORT SPAM REPORTS FOR REVIEW (CSV format)
-- ========================================
SELECT 
  id,
  type,
  address,
  reported_by,
  reporter_phone,
  description,
  is_spam,
  spam_score,
  spam_reason,
  urgency,
  status,
  created_at,
  spam_checked_at
FROM incidents 
WHERE is_spam = true
ORDER BY spam_score DESC;

-- ========================================
-- 10. VIEW MANUAL REVIEW STATUS
-- ========================================
SELECT 
  manual_review_status,
  COUNT(*) as count
FROM incidents 
GROUP BY manual_review_status
ORDER BY count DESC;

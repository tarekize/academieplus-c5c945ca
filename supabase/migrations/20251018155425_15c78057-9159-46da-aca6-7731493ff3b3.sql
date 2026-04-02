-- Recréer la vue referral_stats pour utiliser profiles au lieu de auth.users
DROP VIEW IF EXISTS referral_stats;

CREATE VIEW referral_stats AS
SELECT 
  p.id AS user_id,
  rc.code,
  COUNT(r.id) FILTER (WHERE r.status = 'active') AS active_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'cancelled') AS cancelled_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'fraud') AS fraud_referrals,
  calculate_referral_discount(p.id) AS current_discount_percentage,
  rc.created_at AS code_created_at
FROM profiles p
LEFT JOIN referral_codes rc ON rc.user_id = p.id
LEFT JOIN referrals r ON r.referrer_id = p.id
GROUP BY p.id, rc.code, rc.created_at;
-- Update boarding_time for booking FT7Z554L
BEGIN;
UPDATE public.bookings
SET boarding_time = '2026-01-09T16:00:00Z'
WHERE UPPER(tracking_code) = 'FT7Z554L';
COMMIT;

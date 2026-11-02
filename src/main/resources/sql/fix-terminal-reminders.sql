-- One-time data correction for applications that reached a terminal status
-- while their reminder flag was still enabled.
UPDATE applications
SET reminder_enabled = FALSE
WHERE status IN ('OFFER', 'REJECTED', 'WITHDRAWN')
  AND reminder_enabled = TRUE;

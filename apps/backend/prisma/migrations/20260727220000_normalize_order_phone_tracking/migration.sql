-- Store Vietnamese order phone numbers in a consistent local format.
UPDATE "Order"
SET "phone" = CASE
  WHEN regexp_replace("phone", '[^0-9]', '', 'g') LIKE '84%'
    THEN '0' || substring(regexp_replace("phone", '[^0-9]', '', 'g') FROM 3)
  ELSE regexp_replace("phone", '[^0-9]', '', 'g')
END;

CREATE INDEX "Order_phone_createdAt_idx"
  ON "Order"("phone", "createdAt");

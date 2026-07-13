WITH parsed_dimensions AS (
  SELECT
    "id",
    regexp_match(
      COALESCE("label", "name"),
      '^\s*([0-9]+(?:\.[0-9]+)?)\s*[xX]\s*([0-9]+(?:\.[0-9]+)?)\s*$'
    ) AS matches
  FROM "FrameOption"
  WHERE "type" = 'size'
    AND ("widthCm" IS NULL OR "heightCm" IS NULL)
)
UPDATE "FrameOption"
SET
  "widthCm" = parsed_dimensions.matches[1]::double precision,
  "heightCm" = parsed_dimensions.matches[2]::double precision
FROM parsed_dimensions
WHERE "FrameOption"."id" = parsed_dimensions."id"
  AND parsed_dimensions.matches IS NOT NULL;

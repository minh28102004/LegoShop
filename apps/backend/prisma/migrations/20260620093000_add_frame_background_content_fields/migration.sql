ALTER TABLE "FrameBackground"
ADD COLUMN "description" TEXT,
ADD COLUMN "instructions" TEXT,
ADD COLUMN "contentFields" JSONB;

UPDATE "FrameBackground"
SET
  "description" = COALESCE("description", 'Mau nen tuy chinh cho khung LEGO.'),
  "instructions" = COALESCE("instructions", 'Dien cac thong tin ben duoi de designer canh dung bo cuc cua mau.'),
  "contentFields" = COALESCE(
    "contentFields",
    '[
      {
        "key": "title",
        "label": "Ten / loi tua ngan",
        "type": "text",
        "required": true,
        "placeholder": "VD: Tu & Lan"
      },
      {
        "key": "date",
        "label": "Ngay ky niem",
        "type": "date",
        "required": false,
        "placeholder": "VD: 01/06/2026"
      },
      {
        "key": "message",
        "label": "Loi nhan",
        "type": "textarea",
        "required": false,
        "placeholder": "Nhap loi nhan gui..."
      }
    ]'::jsonb
  );

UPDATE "FrameBackground"
SET
  "description" = 'Mau tot nghiep voi ten, ngay tot nghiep, nganh/truong va loi chuc.',
  "instructions" = 'Dien ten nguoi nhan, ngay tot nghiep, nganh/truong va loi nhan de designer canh dung bo cuc mau.',
  "contentFields" = '[
    {
      "key": "title",
      "label": "Ten nguoi nhan",
      "type": "text",
      "required": true,
      "placeholder": "VD: Nguyen Phuc Thien Nhi"
    },
    {
      "key": "date",
      "label": "Ngay tot nghiep",
      "type": "date",
      "required": false,
      "placeholder": "VD: 01/06/2026"
    },
    {
      "key": "major",
      "label": "Nganh / Truong",
      "type": "text",
      "required": false,
      "placeholder": "VD: Hospitality Management / USSH"
    },
    {
      "key": "message",
      "label": "Thong diep cua ban",
      "type": "textarea",
      "required": false,
      "placeholder": "Nhap loi nhan gui..."
    },
    {
      "key": "photoNote",
      "label": "Anh in them",
      "type": "image",
      "required": false,
      "placeholder": "Chon anh tai len"
    }
  ]'::jsonb
WHERE "id" = 'shared-bg-template-1';

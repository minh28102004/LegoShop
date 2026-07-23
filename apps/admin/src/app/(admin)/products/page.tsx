"use client";

import { useEffect, useMemo, useState } from "react";
import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";
import { listResource } from "@/modules/admin/services/adminApi";
import type { Collection } from "@/modules/admin/types/admin.types";

export default function ProductsPage() {
  const { t } = useI18n();
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    listResource("collections")
      .then((data) => setCollections(data as Collection[]))
      .catch(() => setCollections([]));
  }, []);

  const PRODUCT_FIELDS: EntityField[] = useMemo(
    () => [
      {
        key: "name",
        label: t("productsPage.name"),
        type: "text",
        required: true,
      },
      {
        key: "basePrice",
        label: t("productsPage.basePrice"),
        type: "number",
        required: true,
      },
      {
        key: "productType",
        label: "Loại sản phẩm",
        type: "select",
        options: [
          { label: "Sản phẩm thiết kế hoàn thiện", value: "finished" },
          { label: "Nhân vật LEGO ráp sẵn", value: "premade_character" },
          { label: "Bộ linh kiện DIY", value: "diy_kit" },
          { label: "Đồ lẻ dạng sản phẩm", value: "retail" },
        ],
      },
      {
        key: "collectionId",
        label: "Bộ sưu tập",
        type: "select",
        options: collections.map((collection) => ({
          label: collection.name,
          value: collection.id,
        })),
      },
      {
        key: "status",
        label: t("productsPage.status"),
        type: "select",
        options: [
          { label: t("status.active"), value: "active" },
          { label: t("status.inactive"), value: "inactive" },
        ],
      },
      {
        key: "slug",
        label: t("productsPage.slug"),
        type: "text",
      },
      {
        key: "description",
        label: t("productsPage.descriptionLabel"),
        type: "textarea",
        placeholder: t("productsPage.descriptionPlaceholder"),
      },
      {
        key: "images",
        label: t("productsPage.images"),
        type: "images",
        placeholder: t("productsPage.images"),
      },
      {
        key: "componentConfig",
        label: "Cấu hình mặc định và thành phần sản phẩm",
        type: "json",
        placeholder:
          "{\n" +
          '  "frame": { "id": "frame-option-id", "type": "frame", "name": "30x30", "quantity": 1 },\n' +
          '  "frameColor": { "id": "frame-color-id", "type": "frameColor", "name": "Đen", "quantity": 1 },\n' +
          '  "background": { "id": "background-id", "type": "background", "name": "Happy Wedding 1", "quantity": 1 },\n' +
          '  "characters": [{ "id": "character-id", "type": "character", "name": "Nhân vật LEGO", "quantity": 2 }],\n' +
          '  "accessories": [{ "id": "accessory-id", "type": "accessory", "name": "Charm trái tim", "quantity": 1 }],\n' +
          '  "includedItems": [{ "id": "gift-box", "name": "Hộp quà", "quantity": 1, "icon": "gift" }],\n' +
          '  "originalPrice": 350000\n' +
          "}",
        helpText:
          "ID phải tham chiếu tới dữ liệu khung, nền, nhân vật và phụ kiện đang có. Số NV/Charm trên Web được tính tự động từ quantity; không nhập số đếm riêng.",
      },
      { key: "featured", label: t("productsPage.featured"), type: "checkbox" },
    ],
    [collections, t],
  );

  return (
    <EntityManager
      title={t("productsPage.singularTitle")}
      resource="products"
      fields={PRODUCT_FIELDS}
      pageTitle={t("productsPage.title")}
      pageDescription={t("productsPage.description")}
      createButtonLabel={t("productsPage.createProduct")}
    />
  );
}

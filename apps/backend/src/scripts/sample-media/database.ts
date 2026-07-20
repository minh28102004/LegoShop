import {
  Prisma,
  PrismaClient,
  ProductStatus,
  type SampleMediaImport,
} from '@prisma/client';
import type {
  CollectionMapping,
  HomepageMapping,
  NormalizedManifestRecord,
} from './manifest';

export type PersistedAsset = {
  sourceHash: string;
  destinationUrl: string;
  storagePath: string;
  thumbnailUrl?: string;
  thumbnailStoragePath?: string;
  mimeType: string;
  byteSize: number;
  naturalWidth: number;
  naturalHeight: number;
  sourceWidth: number;
  sourceHeight: number;
  sourceHasAlpha: boolean;
};

export type TargetMapping = HomepageMapping | CollectionMapping | undefined;

export type JournalMutationResult = {
  targetEntity?: string;
  targetRecordId?: string;
  operation: 'created' | 'updated' | 'asset-only';
  previousData?: Prisma.InputJsonValue;
};

export type RollbackEvaluation = {
  canRollback: boolean;
  alreadyMissing: boolean;
  message: string;
};

const HOMEPAGE_SLOT_ORDER: Record<HomepageMapping['slot'], number> = {
  hero: 10,
  story: 20,
  friendship: 30,
  transformation: 40,
  'final-cta': 50,
};

const ACCESSORY_CATEGORY_NAMES: Record<string, string> = {
  'art-music': 'Nghệ thuật & Âm nhạc',
  'education-career': 'Giáo dục & Nghề nghiệp',
  'fashion-personal': 'Thời trang & Cá nhân',
  'food-drink': 'Đồ ăn & Thức uống',
  'love-family': 'Tình yêu & Gia đình',
  other: 'Khác',
  'sports-leisure': 'Thể thao & Giải trí',
  technology: 'Công nghệ',
  transport: 'Phương tiện',
};

const PREVIEW_COLLECTIONS = [
  {
    slug: 'qua-tot-nghiep',
    name: 'Quà tốt nghiệp',
    description:
      'Khung minifigure lưu dấu lễ tốt nghiệp và chặng đường đáng nhớ.',
    sortOrder: -60,
    productNames: [
      'Khung Vinh Danh Ngày Tốt Nghiệp',
      'Dấu Ấn Tân Cử Nhân',
      'Khoảnh Khắc Nhận Bằng',
      'Chặng Đường Rực Rỡ',
      'Ước Mơ Cất Cánh',
      'Kỷ Niệm Giảng Đường',
      'Lời Chúc Thành Công',
      'Hành Trình Mới',
    ],
  },
  {
    slug: 'qua-sinh-nhat',
    name: 'Quà sinh nhật',
    description:
      'Món quà sinh nhật cá nhân hóa theo tính cách và sở thích riêng.',
    sortOrder: -50,
    productNames: [
      'Ngày Sinh Nhật Rực Rỡ',
      'Bữa Tiệc Tuổi Mới',
      'Điều Ước Trong Khung',
      'Khoảnh Khắc Thổi Nến',
      'Niềm Vui Bất Ngờ',
      'Tuổi Mới Thật Vui',
      'Lời Chúc Dễ Thương',
      'Sinh Nhật Đáng Nhớ',
    ],
  },
  {
    slug: 'qua-ky-niem',
    name: 'Quà kỷ niệm',
    description:
      'Gói những cột mốc bên nhau thành một khung minifigure giàu cảm xúc.',
    sortOrder: -40,
    productNames: [
      'Cột Mốc Bên Nhau',
      'Chuyến Đi Đáng Nhớ',
      'Ngày Mình Gặp Gỡ',
      'Ký Ức Trong Khung',
      'Thanh Xuân Của Chúng Ta',
      'Một Chặng Đường Chung',
      'Khoảnh Khắc Không Quên',
      'Kỷ Niệm Ngọt Ngào',
    ],
  },
  {
    slug: 'qua-tinh-yeu',
    name: 'Quà tình yêu',
    description:
      'Thiết kế dành cho hai người với ngày đặc biệt và lời nhắn riêng.',
    sortOrder: -30,
    productNames: [
      'Hai Người Một Câu Chuyện',
      'Mình Bên Nhau Nhé',
      'Ngày Yêu Đầu Tiên',
      'Hẹn Hò Trong Khung',
      'Tình Yêu Nhỏ Xinh',
      'Nắm Tay Đi Muôn Nơi',
      'Lời Thương Gửi Bạn',
      'Mãi Là Chúng Mình',
    ],
  },
  {
    slug: 'qua-nghe-nghiep',
    name: 'Quà nghề nghiệp',
    description:
      'Tôn vinh nghề nghiệp, thành tựu và dấu ấn riêng trong công việc.',
    sortOrder: -20,
    productNames: [
      'Tự Hào Nghề Tôi',
      'Người Truyền Cảm Hứng',
      'Dấu Ấn Sự Nghiệp',
      'Ngày Đầu Đi Làm',
      'Đồng Nghiệp Tuyệt Vời',
      'Chuyên Gia Trong Khung',
      'Thành Tựu Đáng Nhớ',
      'Đam Mê Mỗi Ngày',
    ],
  },
  {
    slug: 'qua-doanh-nghiep',
    name: 'Quà doanh nghiệp',
    description: 'Quà tri ân cá nhân hóa cho đồng nghiệp, đối tác và đội ngũ.',
    sortOrder: -10,
    productNames: [
      'Đội Ngũ Đồng Lòng',
      'Cột Mốc Doanh Nghiệp',
      'Tri Ân Người Đồng Hành',
      'Hành Trình Phát Triển',
      'Khoảnh Khắc Vinh Danh',
      'Kết Nối Bền Vững',
      'Dấu Ấn Thương Hiệu',
    ],
  },
] as const;

export async function persistImportedRecord(options: {
  prisma: PrismaClient;
  item: NormalizedManifestRecord;
  asset: PersistedAsset;
  seedTag: string;
  mapping: TargetMapping;
  existingJournal?: SampleMediaImport;
}): Promise<JournalMutationResult> {
  return options.prisma.$transaction(async (transaction) => {
    const mutation = options.existingJournal?.targetEntity
      ? mutationFromJournal(options.existingJournal)
      : await mutateTarget({
          transaction,
          item: options.item,
          asset: options.asset,
          seedTag: options.seedTag,
          mapping: options.mapping,
        });
    const metadata = createJournalMetadata(options.item, options.asset, {
      mappingApplied: mutation.operation !== 'asset-only',
    });

    if (options.existingJournal) {
      await transaction.sampleMediaImport.update({
        where: { id: options.existingJournal.id },
        data: {
          sourceHash: options.asset.sourceHash,
          destinationUrl: options.asset.destinationUrl,
          storagePath: options.asset.storagePath,
          thumbnailUrl: options.asset.thumbnailUrl,
          thumbnailStoragePath: options.asset.thumbnailStoragePath,
          mimeType: options.asset.mimeType,
          byteSize: options.asset.byteSize,
          naturalWidth: options.asset.naturalWidth,
          naturalHeight: options.asset.naturalHeight,
          targetEntity: mutation.targetEntity,
          targetRecordId: mutation.targetRecordId,
          operation: mutation.operation,
          previousData: mutation.previousData,
          metadata,
        },
      });
    } else {
      await transaction.sampleMediaImport.create({
        data: {
          seedTag: options.seedTag,
          sourceKey: options.item.record.sourceKey,
          sourceHash: options.asset.sourceHash,
          kind: options.item.kind,
          destinationUrl: options.asset.destinationUrl,
          storagePath: options.asset.storagePath,
          thumbnailUrl: options.asset.thumbnailUrl,
          thumbnailStoragePath: options.asset.thumbnailStoragePath,
          mimeType: options.asset.mimeType,
          byteSize: options.asset.byteSize,
          naturalWidth: options.asset.naturalWidth,
          naturalHeight: options.asset.naturalHeight,
          targetEntity: mutation.targetEntity,
          targetRecordId: mutation.targetRecordId,
          operation: mutation.operation,
          previousData: mutation.previousData,
          metadata,
        },
      });
    }

    return mutation;
  });
}

async function mutateTarget(options: {
  transaction: Prisma.TransactionClient;
  item: NormalizedManifestRecord;
  asset: PersistedAsset;
  seedTag: string;
  mapping: TargetMapping;
}): Promise<JournalMutationResult> {
  switch (options.item.kind) {
    case 'backgrounds':
      return upsertBackground({ ...options, item: options.item });
    case 'charms':
      return upsertAccessory({ ...options, item: options.item });
    case 'homepage':
      return options.mapping?.target === 'banner'
        ? upsertHomepageBanner({
            ...options,
            item: options.item,
            mapping: options.mapping,
          })
        : { operation: 'asset-only' };
    case 'collection':
      if (options.mapping?.target === 'collection') {
        return upsertCollection({
          ...options,
          item: options.item,
          mapping: options.mapping,
        });
      }
      if (options.mapping?.target === 'product') {
        return appendProductImage({
          ...options,
          item: options.item,
          mapping: options.mapping,
        });
      }
      return upsertPreviewProduct({ ...options, item: options.item });
  }
}

async function upsertBackground(options: {
  transaction: Prisma.TransactionClient;
  item: Extract<NormalizedManifestRecord, { kind: 'backgrounds' }>;
  asset: PersistedAsset;
  seedTag: string;
}): Promise<JournalMutationResult> {
  const { record } = options.item;
  const existingBySourceKey =
    await options.transaction.frameBackground.findUnique({
      where: { sourceKey: record.sourceKey },
    });
  const existing =
    existingBySourceKey ??
    (await options.transaction.frameBackground.findUnique({
      where: { slug: record.slug },
    }));
  assertPreviewOwned(existing, options.seedTag, 'FrameBackground');
  const metadata = createTargetMetadata(options.item, options.asset);
  const data = {
    title: record.name,
    slug: record.slug,
    category: record.category,
    imageUrl: options.asset.destinationUrl,
    thumbnailUrl: options.asset.thumbnailUrl,
    naturalWidth: options.asset.naturalWidth,
    naturalHeight: options.asset.naturalHeight,
    sourceKey: record.sourceKey,
    sourceHash: options.asset.sourceHash,
    seedTag: options.seedTag,
    metadata,
    sortOrder: record.sortOrder,
    status: ProductStatus.inactive,
  } satisfies Prisma.FrameBackgroundUncheckedCreateInput;
  const before = existing ? snapshotFrameBackground(existing) : null;
  const saved = existing
    ? await options.transaction.frameBackground.update({
        where: { id: existing.id },
        data,
      })
    : await options.transaction.frameBackground.create({ data });

  return {
    targetEntity: 'FrameBackground',
    targetRecordId: saved.id,
    operation: existing ? 'updated' : 'created',
    previousData: jsonInput({
      before,
      applied: snapshotFrameBackground(saved),
    }),
  };
}

async function upsertAccessory(options: {
  transaction: Prisma.TransactionClient;
  item: Extract<NormalizedManifestRecord, { kind: 'charms' }>;
  asset: PersistedAsset;
  seedTag: string;
}): Promise<JournalMutationResult> {
  const { record } = options.item;
  const categoryName =
    ACCESSORY_CATEGORY_NAMES[record.category] ?? humanizeSlug(record.category);
  await options.transaction.$queryRaw`
    SELECT TRUE AS "locked"
    FROM (
      SELECT pg_advisory_xact_lock(
        hashtext(${`figure-lab:accessory-category:${record.category}`})
      )
    ) AS "categoryLock"
  `;
  const category = await options.transaction.accessoryCategory.upsert({
    where: { slug: record.category },
    create: {
      name: categoryName,
      slug: record.category,
      seedTag: options.seedTag,
    },
    update: {},
  });
  const existingBySourceKey = await options.transaction.accessory.findUnique({
    where: { sourceKey: record.sourceKey },
  });
  const existing =
    existingBySourceKey ??
    (await options.transaction.accessory.findUnique({
      where: { slug: record.slug },
    }));
  assertPreviewOwned(existing, options.seedTag, 'Accessory');
  const metadata = createTargetMetadata(options.item, options.asset);
  const data = {
    name: record.name,
    slug: record.slug,
    price: record.priceVnd,
    imageUrl: options.asset.destinationUrl,
    sortOrder: record.sortOrder,
    naturalWidth: options.asset.naturalWidth,
    naturalHeight: options.asset.naturalHeight,
    sourceKey: record.sourceKey,
    sourceHash: options.asset.sourceHash,
    seedTag: options.seedTag,
    metadata,
    status: ProductStatus.inactive,
    categoryId: category.id,
  } satisfies Prisma.AccessoryUncheckedCreateInput;
  const before = existing ? snapshotAccessory(existing) : null;
  const saved = existing
    ? await options.transaction.accessory.update({
        where: { id: existing.id },
        data,
      })
    : await options.transaction.accessory.create({ data });

  return {
    targetEntity: 'Accessory',
    targetRecordId: saved.id,
    operation: existing ? 'updated' : 'created',
    previousData: jsonInput({ before, applied: snapshotAccessory(saved) }),
  };
}

async function upsertHomepageBanner(options: {
  transaction: Prisma.TransactionClient;
  item: Extract<NormalizedManifestRecord, { kind: 'homepage' }>;
  asset: PersistedAsset;
  seedTag: string;
  mapping: HomepageMapping;
}): Promise<JournalMutationResult> {
  const { record } = options.item;
  const title = `homepage:${options.mapping.slot}`;
  const existingBySourceKey = await options.transaction.banner.findUnique({
    where: { sourceKey: record.sourceKey },
  });
  const existing =
    existingBySourceKey ??
    (await options.transaction.banner.findFirst({ where: { title } }));
  assertPreviewOwned(existing, options.seedTag, 'Banner');
  const metadata = createTargetMetadata(options.item, options.asset, {
    homepageSlot: options.mapping.slot,
  });
  const data = {
    title,
    imageUrl: options.asset.destinationUrl,
    linkUrl: options.mapping.linkUrl,
    sortOrder:
      options.mapping.sortOrder ?? HOMEPAGE_SLOT_ORDER[options.mapping.slot],
    naturalWidth: options.asset.naturalWidth,
    naturalHeight: options.asset.naturalHeight,
    sourceKey: record.sourceKey,
    sourceHash: options.asset.sourceHash,
    seedTag: options.seedTag,
    metadata,
    status: ProductStatus.inactive,
  } satisfies Prisma.BannerUncheckedCreateInput;
  const before = existing ? snapshotBanner(existing) : null;
  const saved = existing
    ? await options.transaction.banner.update({
        where: { id: existing.id },
        data,
      })
    : await options.transaction.banner.create({ data });

  return {
    targetEntity: 'Banner',
    targetRecordId: saved.id,
    operation: existing ? 'updated' : 'created',
    previousData: jsonInput({ before, applied: snapshotBanner(saved) }),
  };
}

async function upsertCollection(options: {
  transaction: Prisma.TransactionClient;
  item: Extract<NormalizedManifestRecord, { kind: 'collection' }>;
  asset: PersistedAsset;
  seedTag: string;
  mapping: Extract<CollectionMapping, { target: 'collection' }>;
}): Promise<JournalMutationResult> {
  const { record } = options.item;
  const existingBySourceKey = await options.transaction.collection.findUnique({
    where: { sourceKey: record.sourceKey },
  });
  const existing =
    existingBySourceKey ??
    (await options.transaction.collection.findUnique({
      where: { slug: options.mapping.slug },
    }));

  assertPreviewOwned(existing, options.seedTag, 'Collection');

  if (!existing && !options.mapping.createIfMissing) {
    throw new Error(
      `Curated collection ${options.mapping.slug} does not exist; set createIfMissing=true with a name to create it`,
    );
  }
  if (!existing && !options.mapping.name) {
    throw new Error(
      `Curated collection ${options.mapping.slug} requires name when createIfMissing=true`,
    );
  }

  const metadata = createTargetMetadata(options.item, options.asset);
  const before = existing ? snapshotCollection(existing) : null;
  const saved = existing
    ? await options.transaction.collection.update({
        where: { id: existing.id },
        data: {
          imageUrl: options.asset.destinationUrl,
          naturalWidth: options.asset.naturalWidth,
          naturalHeight: options.asset.naturalHeight,
          sourceKey: record.sourceKey,
          sourceHash: options.asset.sourceHash,
          seedTag: options.seedTag,
          metadata,
          ...(options.mapping.name ? { name: options.mapping.name } : {}),
          ...(options.mapping.description !== undefined
            ? { description: options.mapping.description }
            : {}),
          ...(options.mapping.sortOrder !== undefined
            ? { sortOrder: options.mapping.sortOrder }
            : {}),
        },
      })
    : await options.transaction.collection.create({
        data: {
          name: options.mapping.name as string,
          slug: options.mapping.slug,
          description: options.mapping.description,
          imageUrl: options.asset.destinationUrl,
          sortOrder: options.mapping.sortOrder ?? record.sortOrder,
          naturalWidth: options.asset.naturalWidth,
          naturalHeight: options.asset.naturalHeight,
          sourceKey: record.sourceKey,
          sourceHash: options.asset.sourceHash,
          seedTag: options.seedTag,
          metadata,
          status: ProductStatus.inactive,
        },
      });

  return {
    targetEntity: 'Collection',
    targetRecordId: saved.id,
    operation: existing ? 'updated' : 'created',
    previousData: jsonInput({ before, applied: snapshotCollection(saved) }),
  };
}

async function appendProductImage(options: {
  transaction: Prisma.TransactionClient;
  item: Extract<NormalizedManifestRecord, { kind: 'collection' }>;
  asset: PersistedAsset;
  mapping: Extract<CollectionMapping, { target: 'product' }>;
}): Promise<JournalMutationResult> {
  const product = await options.transaction.product.findUnique({
    where: { slug: options.mapping.slug },
  });
  if (!product) {
    throw new Error(`Curated product ${options.mapping.slug} does not exist`);
  }

  const beforeImages = Array.isArray(product.images) ? [...product.images] : [];
  const appliedImages = beforeImages.includes(options.asset.destinationUrl)
    ? beforeImages
    : [...beforeImages, options.asset.destinationUrl];
  if (!sameJson(beforeImages, appliedImages)) {
    await options.transaction.product.update({
      where: { id: product.id },
      data: { images: appliedImages },
    });
  }

  return {
    targetEntity: 'Product',
    targetRecordId: product.id,
    operation: 'updated',
    previousData: jsonInput({
      before: { images: beforeImages },
      applied: { images: appliedImages },
    }),
  };
}

async function upsertPreviewProduct(options: {
  transaction: Prisma.TransactionClient;
  item: Extract<NormalizedManifestRecord, { kind: 'collection' }>;
  asset: PersistedAsset;
  seedTag: string;
}): Promise<JournalMutationResult> {
  const { record } = options.item;
  const collectionIndex = (record.sortOrder - 1) % PREVIEW_COLLECTIONS.length;
  const collectionDefinition = PREVIEW_COLLECTIONS[collectionIndex];
  const nameIndex = Math.floor(
    (record.sortOrder - 1) / PREVIEW_COLLECTIONS.length,
  );
  const name =
    collectionDefinition.productNames[
      nameIndex % collectionDefinition.productNames.length
    ];
  const slug = `${slugifyVietnamese(name)}-${record.sourceKey.slice(-6)}`;
  const collection = await options.transaction.collection.findUnique({
    where: { slug: collectionDefinition.slug },
  });
  if (!collection || collection.seedTag !== options.seedTag) {
    throw new Error(
      `Preview collection ${collectionDefinition.slug} must be imported before product ${record.sourceKey}`,
    );
  }

  const existing = await options.transaction.product.findUnique({
    where: { slug },
  });
  if (
    existing &&
    !isOwnedPreviewProduct(
      existing.componentConfig,
      options.seedTag,
      record.sourceKey,
    )
  ) {
    throw new Error(`Product slug ${slug} is owned by non-preview data`);
  }

  const componentConfig = jsonInput({
    sampleMedia: {
      seedTag: options.seedTag,
      sourceKey: record.sourceKey,
      sourceHash: options.asset.sourceHash,
      sortOrder: record.sortOrder,
      thumbnailUrl: options.asset.thumbnailUrl ?? null,
    },
  });
  const data = {
    name,
    slug,
    description: `Khung minifigure cá nhân hóa thuộc bộ sưu tập ${collectionDefinition.name}.`,
    basePrice: 79_000 + ((record.sortOrder - 1) % 8) * 50_000,
    images: [options.asset.destinationUrl],
    productType: 'finished',
    componentConfig,
    status: ProductStatus.inactive,
    featured: record.sortOrder % 7 === 1,
    collectionId: collection.id,
  } satisfies Prisma.ProductUncheckedCreateInput;
  const before = existing ? snapshotProduct(existing) : null;
  const saved = existing
    ? await options.transaction.product.update({
        where: { id: existing.id },
        data,
      })
    : await options.transaction.product.create({ data });

  return {
    targetEntity: 'Product',
    targetRecordId: saved.id,
    operation: existing ? 'updated' : 'created',
    previousData: jsonInput({ before, applied: snapshotProduct(saved) }),
  };
}

export async function evaluateRollback(
  prisma: PrismaClient,
  journal: SampleMediaImport,
): Promise<RollbackEvaluation> {
  if (!journal.targetEntity || journal.operation === 'asset-only') {
    return {
      canRollback: true,
      alreadyMissing: false,
      message: 'Ledger-only asset can be released',
    };
  }

  const snapshot = parsePreviousData(journal.previousData);
  switch (journal.targetEntity) {
    case 'FrameBackground': {
      const row = await prisma.frameBackground.findUnique({
        where: { id: journal.targetRecordId ?? '' },
      });
      return evaluateRow(journal, row, snapshot, snapshotFrameBackground);
    }
    case 'Accessory': {
      const row = await prisma.accessory.findUnique({
        where: { id: journal.targetRecordId ?? '' },
      });
      return evaluateRow(journal, row, snapshot, snapshotAccessory);
    }
    case 'Banner': {
      const row = await prisma.banner.findUnique({
        where: { id: journal.targetRecordId ?? '' },
      });
      return evaluateRow(journal, row, snapshot, snapshotBanner);
    }
    case 'Collection': {
      const row = await prisma.collection.findUnique({
        where: { id: journal.targetRecordId ?? '' },
      });
      return evaluateRow(journal, row, snapshot, snapshotCollection);
    }
    case 'Product': {
      const row = await prisma.product.findUnique({
        where: { id: journal.targetRecordId ?? '' },
      });
      if (row && journal.operation === 'created') {
        const orderItemReferences = await prisma.orderItem.count({
          where: { productId: row.id },
        });
        if (orderItemReferences > 0) {
          return {
            canRollback: false,
            alreadyMissing: false,
            message: `Product has ${orderItemReferences} OrderItem reference(s)`,
          };
        }
      }
      const imagesOnly =
        snapshot?.applied &&
        Object.keys(snapshot.applied).length === 1 &&
        'images' in snapshot.applied;
      const current = row
        ? imagesOnly
          ? { images: Array.isArray(row.images) ? row.images : [] }
          : snapshotProduct(row)
        : undefined;
      return evaluateRow(journal, current, snapshot, (value) => value);
    }
    default:
      return {
        canRollback: false,
        alreadyMissing: false,
        message: `Unsupported rollback target ${journal.targetEntity}`,
      };
  }
}

export async function rollbackJournalRecord(
  prisma: PrismaClient,
  journal: SampleMediaImport,
): Promise<RollbackEvaluation> {
  const evaluation = await evaluateRollback(prisma, journal);
  if (!evaluation.canRollback) return evaluation;

  await prisma.$transaction(async (transaction) => {
    if (
      journal.targetEntity &&
      journal.operation !== 'asset-only' &&
      !evaluation.alreadyMissing
    ) {
      await restoreOrDeleteTarget(transaction, journal);
    }
    await transaction.sampleMediaImport.delete({ where: { id: journal.id } });
  });

  return evaluation;
}

function mutationFromJournal(
  journal: SampleMediaImport,
): JournalMutationResult {
  if (
    journal.operation !== 'created' &&
    journal.operation !== 'updated' &&
    journal.operation !== 'asset-only'
  ) {
    throw new Error(
      `Journal ${journal.sourceKey} has unsupported operation ${journal.operation ?? '(missing)'}`,
    );
  }

  return {
    targetEntity: journal.targetEntity ?? undefined,
    targetRecordId: journal.targetRecordId ?? undefined,
    operation: journal.operation,
    previousData:
      journal.previousData === null
        ? undefined
        : jsonInput(journal.previousData),
  };
}

async function restoreOrDeleteTarget(
  transaction: Prisma.TransactionClient,
  journal: SampleMediaImport,
): Promise<void> {
  const snapshot = parsePreviousData(journal.previousData);
  if (journal.operation === 'created') {
    switch (journal.targetEntity) {
      case 'FrameBackground':
        await transaction.frameBackground.delete({
          where: { id: journal.targetRecordId ?? '' },
        });
        return;
      case 'Accessory':
        await transaction.accessory.delete({
          where: { id: journal.targetRecordId ?? '' },
        });
        return;
      case 'Banner':
        await transaction.banner.delete({
          where: { id: journal.targetRecordId ?? '' },
        });
        return;
      case 'Collection':
        await transaction.collection.delete({
          where: { id: journal.targetRecordId ?? '' },
        });
        return;
      case 'Product':
        await transaction.product.delete({
          where: { id: journal.targetRecordId ?? '' },
        });
        return;
      default:
        throw new Error(
          `Cannot delete rollback target ${journal.targetEntity}`,
        );
    }
  }

  if (!snapshot?.before) {
    throw new Error('Rollback snapshot is missing before-values');
  }

  switch (journal.targetEntity) {
    case 'FrameBackground':
      await transaction.frameBackground.update({
        where: { id: journal.targetRecordId ?? '' },
        data: frameBackgroundRestoreData(snapshot.before),
      });
      return;
    case 'Accessory':
      await transaction.accessory.update({
        where: { id: journal.targetRecordId ?? '' },
        data: accessoryRestoreData(snapshot.before),
      });
      return;
    case 'Banner':
      await transaction.banner.update({
        where: { id: journal.targetRecordId ?? '' },
        data: bannerRestoreData(snapshot.before),
      });
      return;
    case 'Collection':
      await transaction.collection.update({
        where: { id: journal.targetRecordId ?? '' },
        data: collectionRestoreData(snapshot.before),
      });
      return;
    case 'Product': {
      const imagesOnly =
        Object.keys(snapshot.before).length === 1 &&
        'images' in snapshot.before;
      await transaction.product.update({
        where: { id: journal.targetRecordId ?? '' },
        data: imagesOnly
          ? { images: asStringArray(snapshot.before.images, 'Product images') }
          : productRestoreData(snapshot.before),
      });
      return;
    }
    default:
      throw new Error(`Cannot restore rollback target ${journal.targetEntity}`);
  }
}

export async function storagePathHasReferences(
  prisma: PrismaClient,
  storagePath: string,
  publicUrl: string,
): Promise<boolean> {
  const [
    journalReferences,
    productReferences,
    collectionReferences,
    bannerReferences,
    backgroundReferences,
    accessoryReferences,
  ] = await Promise.all([
    prisma.sampleMediaImport.count({
      where: {
        OR: [{ storagePath }, { thumbnailStoragePath: storagePath }],
      },
    }),
    prisma.product.count({ where: { images: { has: publicUrl } } }),
    prisma.collection.count({ where: { imageUrl: publicUrl } }),
    prisma.banner.count({ where: { imageUrl: publicUrl } }),
    prisma.frameBackground.count({
      where: { OR: [{ imageUrl: publicUrl }, { thumbnailUrl: publicUrl }] },
    }),
    prisma.accessory.count({
      where: { OR: [{ imageUrl: publicUrl }, { iconUrl: publicUrl }] },
    }),
  ]);

  return (
    journalReferences +
      productReferences +
      collectionReferences +
      bannerReferences +
      backgroundReferences +
      accessoryReferences >
    0
  );
}

export async function deleteUnusedSeedCategories(
  prisma: PrismaClient,
  seedTag: string,
  dryRun: boolean,
): Promise<string[]> {
  const categories = await prisma.accessoryCategory.findMany({
    where: { seedTag },
    select: { id: true, slug: true, _count: { select: { accessories: true } } },
  });
  const unused = categories.filter(
    (category) => category._count.accessories === 0,
  );

  if (!dryRun && unused.length > 0) {
    await prisma.accessoryCategory.deleteMany({
      where: { id: { in: unused.map((category) => category.id) }, seedTag },
    });
  }

  return unused.map((category) => category.slug);
}

function evaluateRow<T>(
  journal: SampleMediaImport,
  row: T | null | undefined,
  snapshot: SnapshotPair | undefined,
  takeSnapshot: (value: T) => Record<string, unknown>,
): RollbackEvaluation {
  if (!row) {
    return journal.operation === 'created'
      ? {
          canRollback: true,
          alreadyMissing: true,
          message: 'Seed-created target is already absent',
        }
      : {
          canRollback: false,
          alreadyMissing: true,
          message:
            'Updated target is missing; before-values cannot be restored safely',
        };
  }
  if (!snapshot?.applied) {
    return {
      canRollback: false,
      alreadyMissing: false,
      message: 'Rollback snapshot is missing applied values',
    };
  }

  const current = takeSnapshot(row);
  if (!sameJson(current, snapshot.applied)) {
    return {
      canRollback: false,
      alreadyMissing: false,
      message: 'Target changed after import; compare-and-set rollback refused',
    };
  }

  return {
    canRollback: true,
    alreadyMissing: false,
    message:
      journal.operation === 'created'
        ? 'Seed-owned target can be deleted'
        : 'Current values match import snapshot and can be restored',
  };
}

type SnapshotPair = {
  before: Record<string, unknown> | null;
  applied: Record<string, unknown>;
};

function parsePreviousData(
  value: Prisma.JsonValue | null,
): SnapshotPair | undefined {
  if (!isRecord(value)) return undefined;
  if (value.before !== null && !isRecord(value.before)) return undefined;
  if (!isRecord(value.applied)) return undefined;
  return {
    before: value.before as Record<string, unknown> | null,
    applied: value.applied,
  };
}

function snapshotFrameBackground(value: {
  title: string;
  slug: string | null;
  category: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  naturalWidth: number | null;
  naturalHeight: number | null;
  sourceKey: string | null;
  sourceHash: string | null;
  seedTag: string | null;
  metadata: Prisma.JsonValue | null;
  sortOrder: number;
  status: ProductStatus;
}) {
  return {
    title: value.title,
    slug: value.slug,
    category: value.category,
    imageUrl: value.imageUrl,
    thumbnailUrl: value.thumbnailUrl,
    naturalWidth: value.naturalWidth,
    naturalHeight: value.naturalHeight,
    sourceKey: value.sourceKey,
    sourceHash: value.sourceHash,
    seedTag: value.seedTag,
    metadata: value.metadata,
    sortOrder: value.sortOrder,
    status: value.status,
  };
}

function snapshotAccessory(value: {
  name: string;
  slug: string | null;
  price: number;
  imageUrl: string | null;
  iconUrl: string | null;
  sortOrder: number;
  naturalWidth: number | null;
  naturalHeight: number | null;
  sourceKey: string | null;
  sourceHash: string | null;
  seedTag: string | null;
  metadata: Prisma.JsonValue | null;
  status: ProductStatus;
  categoryId: string | null;
}) {
  return {
    name: value.name,
    slug: value.slug,
    price: value.price,
    imageUrl: value.imageUrl,
    iconUrl: value.iconUrl,
    sortOrder: value.sortOrder,
    naturalWidth: value.naturalWidth,
    naturalHeight: value.naturalHeight,
    sourceKey: value.sourceKey,
    sourceHash: value.sourceHash,
    seedTag: value.seedTag,
    metadata: value.metadata,
    status: value.status,
    categoryId: value.categoryId,
  };
}

function snapshotBanner(value: {
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  naturalWidth: number | null;
  naturalHeight: number | null;
  sourceKey: string | null;
  sourceHash: string | null;
  seedTag: string | null;
  metadata: Prisma.JsonValue | null;
  status: ProductStatus;
}) {
  return {
    title: value.title,
    imageUrl: value.imageUrl,
    linkUrl: value.linkUrl,
    sortOrder: value.sortOrder,
    naturalWidth: value.naturalWidth,
    naturalHeight: value.naturalHeight,
    sourceKey: value.sourceKey,
    sourceHash: value.sourceHash,
    seedTag: value.seedTag,
    metadata: value.metadata,
    status: value.status,
  };
}

function snapshotCollection(value: {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  naturalWidth: number | null;
  naturalHeight: number | null;
  sourceKey: string | null;
  sourceHash: string | null;
  seedTag: string | null;
  metadata: Prisma.JsonValue | null;
  status: ProductStatus;
}) {
  return {
    name: value.name,
    slug: value.slug,
    description: value.description,
    imageUrl: value.imageUrl,
    sortOrder: value.sortOrder,
    naturalWidth: value.naturalWidth,
    naturalHeight: value.naturalHeight,
    sourceKey: value.sourceKey,
    sourceHash: value.sourceHash,
    seedTag: value.seedTag,
    metadata: value.metadata,
    status: value.status,
  };
}

function snapshotProduct(value: {
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  images: string[];
  productType: string;
  componentConfig: Prisma.JsonValue | null;
  status: ProductStatus;
  featured: boolean;
  collectionId: string | null;
}) {
  return {
    name: value.name,
    slug: value.slug,
    description: value.description,
    basePrice: value.basePrice,
    images: value.images,
    productType: value.productType,
    componentConfig: value.componentConfig,
    status: value.status,
    featured: value.featured,
    collectionId: value.collectionId,
  };
}

function frameBackgroundRestoreData(before: Record<string, unknown>) {
  return {
    title: asString(before.title, 'FrameBackground title'),
    slug: asNullableString(before.slug, 'FrameBackground slug'),
    category: asNullableString(before.category, 'FrameBackground category'),
    imageUrl: asString(before.imageUrl, 'FrameBackground imageUrl'),
    thumbnailUrl: asNullableString(
      before.thumbnailUrl,
      'FrameBackground thumbnailUrl',
    ),
    naturalWidth: asNullableNumber(
      before.naturalWidth,
      'FrameBackground naturalWidth',
    ),
    naturalHeight: asNullableNumber(
      before.naturalHeight,
      'FrameBackground naturalHeight',
    ),
    sourceKey: asNullableString(before.sourceKey, 'FrameBackground sourceKey'),
    sourceHash: asNullableString(
      before.sourceHash,
      'FrameBackground sourceHash',
    ),
    seedTag: asNullableString(before.seedTag, 'FrameBackground seedTag'),
    metadata: jsonRestore(before.metadata),
    sortOrder: asNumber(before.sortOrder, 'FrameBackground sortOrder'),
    status: asStatus(before.status),
  } satisfies Prisma.FrameBackgroundUncheckedUpdateInput;
}

function accessoryRestoreData(before: Record<string, unknown>) {
  return {
    name: asString(before.name, 'Accessory name'),
    slug: asNullableString(before.slug, 'Accessory slug'),
    price: asNumber(before.price, 'Accessory price'),
    imageUrl: asNullableString(before.imageUrl, 'Accessory imageUrl'),
    iconUrl: asNullableString(before.iconUrl, 'Accessory iconUrl'),
    sortOrder: asNumber(before.sortOrder, 'Accessory sortOrder'),
    naturalWidth: asNullableNumber(
      before.naturalWidth,
      'Accessory naturalWidth',
    ),
    naturalHeight: asNullableNumber(
      before.naturalHeight,
      'Accessory naturalHeight',
    ),
    sourceKey: asNullableString(before.sourceKey, 'Accessory sourceKey'),
    sourceHash: asNullableString(before.sourceHash, 'Accessory sourceHash'),
    seedTag: asNullableString(before.seedTag, 'Accessory seedTag'),
    metadata: jsonRestore(before.metadata),
    status: asStatus(before.status),
    categoryId: asNullableString(before.categoryId, 'Accessory categoryId'),
  } satisfies Prisma.AccessoryUncheckedUpdateInput;
}

function bannerRestoreData(before: Record<string, unknown>) {
  return {
    title: asNullableString(before.title, 'Banner title'),
    imageUrl: asString(before.imageUrl, 'Banner imageUrl'),
    linkUrl: asNullableString(before.linkUrl, 'Banner linkUrl'),
    sortOrder: asNumber(before.sortOrder, 'Banner sortOrder'),
    naturalWidth: asNullableNumber(before.naturalWidth, 'Banner naturalWidth'),
    naturalHeight: asNullableNumber(
      before.naturalHeight,
      'Banner naturalHeight',
    ),
    sourceKey: asNullableString(before.sourceKey, 'Banner sourceKey'),
    sourceHash: asNullableString(before.sourceHash, 'Banner sourceHash'),
    seedTag: asNullableString(before.seedTag, 'Banner seedTag'),
    metadata: jsonRestore(before.metadata),
    status: asStatus(before.status),
  } satisfies Prisma.BannerUncheckedUpdateInput;
}

function collectionRestoreData(before: Record<string, unknown>) {
  return {
    name: asString(before.name, 'Collection name'),
    slug: asString(before.slug, 'Collection slug'),
    description: asNullableString(before.description, 'Collection description'),
    imageUrl: asNullableString(before.imageUrl, 'Collection imageUrl'),
    sortOrder: asNumber(before.sortOrder, 'Collection sortOrder'),
    naturalWidth: asNullableNumber(
      before.naturalWidth,
      'Collection naturalWidth',
    ),
    naturalHeight: asNullableNumber(
      before.naturalHeight,
      'Collection naturalHeight',
    ),
    sourceKey: asNullableString(before.sourceKey, 'Collection sourceKey'),
    sourceHash: asNullableString(before.sourceHash, 'Collection sourceHash'),
    seedTag: asNullableString(before.seedTag, 'Collection seedTag'),
    metadata: jsonRestore(before.metadata),
    status: asStatus(before.status),
  } satisfies Prisma.CollectionUncheckedUpdateInput;
}

function productRestoreData(before: Record<string, unknown>) {
  return {
    name: asString(before.name, 'Product name'),
    slug: asString(before.slug, 'Product slug'),
    description: asNullableString(before.description, 'Product description'),
    basePrice: asNumber(before.basePrice, 'Product basePrice'),
    images: asStringArray(before.images, 'Product images'),
    productType: asString(before.productType, 'Product productType'),
    componentConfig: jsonRestore(before.componentConfig),
    status: asStatus(before.status),
    featured: asBoolean(before.featured, 'Product featured'),
    collectionId: asNullableString(before.collectionId, 'Product collectionId'),
  } satisfies Prisma.ProductUncheckedUpdateInput;
}

function createTargetMetadata(
  item: NormalizedManifestRecord,
  asset: PersistedAsset,
  extra: Record<string, string | number | boolean> = {},
): Prisma.InputJsonValue {
  return jsonInput({
    importedSample: true,
    kind: item.kind,
    sourceFileName: item.record.sourceFileName,
    sourceWidth: asset.sourceWidth,
    sourceHeight: asset.sourceHeight,
    sourceHasAlpha: asset.sourceHasAlpha,
    ...extra,
  });
}

function createJournalMetadata(
  item: NormalizedManifestRecord,
  asset: PersistedAsset,
  extra: Record<string, string | number | boolean>,
): Prisma.InputJsonValue {
  return jsonInput({
    sourceFileName: item.record.sourceFileName,
    targetStorageFolder: item.record.targetStorageFolder,
    sourceWidth: asset.sourceWidth,
    sourceHeight: asset.sourceHeight,
    sourceHasAlpha: asset.sourceHasAlpha,
    ...extra,
  });
}

function jsonInput(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function jsonRestore(
  value: unknown,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value === null || value === undefined
    ? Prisma.DbNull
    : jsonInput(value);
}

function sameJson(left: unknown, right: unknown): boolean {
  return stableStringify(left) === stableStringify(right);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown, label: string): string {
  if (typeof value !== 'string') throw new Error(`${label} is invalid`);
  return value;
}

function asNullableString(value: unknown, label: string): string | null {
  if (value === null) return null;
  return asString(value, label);
}

function asNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} is invalid`);
  }
  return value;
}

function asBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`${label} is invalid`);
  return value;
}

function asNullableNumber(value: unknown, label: string): number | null {
  if (value === null) return null;
  return asNumber(value, label);
}

function asStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${label} is invalid`);
  }
  return value as string[];
}

function asStatus(value: unknown): ProductStatus {
  if (value === ProductStatus.active || value === ProductStatus.inactive) {
    return value;
  }
  throw new Error('Product status is invalid');
}

function humanizeSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function assertPreviewOwned(
  value: { seedTag: string | null } | null,
  seedTag: string,
  label: string,
): void {
  if (value && value.seedTag !== seedTag) {
    throw new Error(
      `${label} conflicts with data outside preview batch ${seedTag}`,
    );
  }
}

function isOwnedPreviewProduct(
  componentConfig: Prisma.JsonValue | null,
  seedTag: string,
  sourceKey: string,
): boolean {
  if (!isRecord(componentConfig)) return false;
  const sampleMedia = componentConfig.sampleMedia;
  return (
    isRecord(sampleMedia) &&
    sampleMedia.seedTag === seedTag &&
    sampleMedia.sourceKey === sourceKey
  );
}

function slugifyVietnamese(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

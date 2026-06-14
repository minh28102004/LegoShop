import { BadRequestException } from '@nestjs/common';
import { AdminListQueryDto } from '../dto/admin-list-query.dto';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

export type AdminSortDirection = 'asc' | 'desc';

export type AdminSortCriterion = {
  field: string;
  direction: AdminSortDirection;
};

export type AdminDateRange = {
  field: string;
  from?: Date;
  to?: Date;
};

export type AdminPagination = {
  page: number;
  limit: number;
  skip: number;
  take: number;
};

export type AdminListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  total_pages: number;
  sort_by: string;
  sort_dir: string;
  filters_applied: Record<string, unknown>;
};

export function hasAdminListQuery(query?: AdminListQueryDto): boolean {
  if (!query) return false;
  return Object.values(query).some(
    (value) => value !== undefined && value !== '',
  );
}

export function getAdminPagination(query?: AdminListQueryDto): AdminPagination {
  const page = Math.max(1, query?.page ?? 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, query?.limit ?? DEFAULT_LIMIT));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function splitCsv(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function getAllowedSearchFields(
  requestedFields: string | undefined,
  allowedFields: readonly string[],
  defaultFields: readonly string[],
): string[] {
  const fields = splitCsv(requestedFields);
  if (fields.length === 0) return [...defaultFields];

  const invalidField = fields.find((field) => !allowedFields.includes(field));
  if (invalidField) {
    throw new BadRequestException({
      error: {
        code: 'INVALID_SEARCH_FIELD',
        message: `Field '${invalidField}' is not searchable. Allowed: ${allowedFields.join(', ')}`,
        param: 'search_fields',
      },
    });
  }

  return fields;
}

export function getAllowedFilterValues<T extends string>(
  requestedValues: string | undefined,
  allowedValues: readonly T[],
  param: string,
): T[] {
  const values = splitCsv(requestedValues);
  const invalidValue = values.find(
    (value) => !allowedValues.includes(value as T),
  );

  if (invalidValue) {
    throw new BadRequestException({
      error: {
        code: 'INVALID_FILTER_VALUE',
        message: `Value '${invalidValue}' is not allowed for '${param}'. Allowed: ${allowedValues.join(', ')}`,
        param,
      },
    });
  }

  return values as T[];
}

export function resolveSort(
  sortBy: string | undefined,
  sortDir: AdminSortDirection | undefined,
  allowedFields: readonly string[],
  defaultField: string,
): { sortBy: string; sortDir: AdminSortDirection } {
  const resolvedSortBy = sortBy ?? defaultField;

  if (!allowedFields.includes(resolvedSortBy)) {
    throw new BadRequestException({
      error: {
        code: 'INVALID_SORT_FIELD',
        message: `Field '${resolvedSortBy}' is not sortable. Allowed: ${allowedFields.join(', ')}`,
        param: 'sort_by',
      },
    });
  }

  return {
    sortBy: resolvedSortBy,
    sortDir: sortDir ?? 'desc',
  };
}

export function resolveSorts(
  sortBy: string | undefined,
  sortDir: string | undefined,
  allowedFields: readonly string[],
  defaultField: string,
): {
  sortBy: string;
  sortDir: string;
  sortCriteria: AdminSortCriterion[];
} {
  const fields = splitCsv(sortBy ?? defaultField);
  const directions = splitCsv(sortDir);
  const sortFields = fields.length > 0 ? fields : [defaultField];
  const criteria: AdminSortCriterion[] = [];

  for (const field of sortFields) {
    if (!allowedFields.includes(field)) {
      throw new BadRequestException({
        error: {
          code: 'INVALID_SORT_FIELD',
          message: `Field '${field}' is not sortable. Allowed: ${allowedFields.join(', ')}`,
          param: 'sort_by',
        },
      });
    }
  }

  for (const direction of directions) {
    if (direction !== 'asc' && direction !== 'desc') {
      throw new BadRequestException({
        error: {
          code: 'INVALID_SORT_DIRECTION',
          message: `Direction '${direction}' is not supported. Allowed: asc, desc`,
          param: 'sort_dir',
        },
      });
    }
  }

  sortFields.forEach((field, index) => {
    if (criteria.some((criterion) => criterion.field === field)) return;

    const direction = directions[index] ?? directions[0] ?? 'desc';
    criteria.push({
      field,
      direction: direction as AdminSortDirection,
    });
  });

  return {
    sortBy: criteria.map((criterion) => criterion.field).join(','),
    sortDir: criteria.map((criterion) => criterion.direction).join(','),
    sortCriteria: criteria,
  };
}

export function resolveDateRange(
  query: AdminListQueryDto | undefined,
  allowedDateFields: readonly string[],
  defaultDateField: string,
): AdminDateRange | null {
  if (!query?.date_from && !query?.date_to && !query?.preset) return null;

  const field = query.date_field ?? defaultDateField;
  if (!allowedDateFields.includes(field)) {
    throw new BadRequestException({
      error: {
        code: 'INVALID_DATE_FIELD',
        message: `Field '${field}' cannot be used for date filtering. Allowed: ${allowedDateFields.join(', ')}`,
        param: 'date_field',
      },
    });
  }

  const presetRange = query.preset ? getPresetDateRange(query.preset) : null;
  const from = query.date_from
    ? startOfVietnamDate(query.date_from)
    : presetRange?.from;
  const to = query.date_to ? endOfVietnamDate(query.date_to) : presetRange?.to;

  if (from && to && from.getTime() > to.getTime()) {
    throw new BadRequestException({
      error: {
        code: 'INVALID_DATE_RANGE',
        message: 'date_from must be before or equal to date_to',
        param: 'date_from',
      },
    });
  }

  return { field, from, to };
}

export function buildDateFilter(
  range: AdminDateRange | null,
): Record<string, { gte?: Date; lte?: Date }> {
  if (!range || (!range.from && !range.to)) return {};

  return {
    [range.field]: {
      ...(range.from ? { gte: range.from } : {}),
      ...(range.to ? { lte: range.to } : {}),
    },
  };
}

export function buildFiltersApplied(
  query: AdminListQueryDto | undefined,
  sortBy: string,
  sortDir: string,
): Record<string, unknown> {
  const filters: Record<string, unknown> = {
    sort_by: sortBy,
    sort_dir: sortDir,
  };

  if (!query) return filters;

  [
    'search',
    'search_fields',
    'status',
    'category_id',
    'price_min',
    'price_max',
    'date_from',
    'date_to',
    'date_field',
    'preset',
  ].forEach((key) => {
    const value = query[key as keyof AdminListQueryDto];
    if (value !== undefined && value !== '') filters[key] = value;
  });

  return filters;
}

export function buildAdminListMeta(params: {
  page: number;
  limit: number;
  total: number;
  sortBy: string;
  sortDir: string;
  filtersApplied: Record<string, unknown>;
}): AdminListMeta {
  const totalPages =
    params.total > 0 ? Math.ceil(params.total / params.limit) : 1;

  return {
    page: params.page,
    limit: params.limit,
    total: params.total,
    totalPages,
    total_pages: totalPages,
    sort_by: params.sortBy,
    sort_dir: params.sortDir,
    filters_applied: params.filtersApplied,
  };
}

function getPresetDateRange(preset: string): { from: Date; to: Date } {
  const today = getVietnamDateKey(new Date());
  const todayStart = startOfVietnamDate(today);

  switch (preset) {
    case 'today':
      return { from: todayStart, to: endOfVietnamDate(today) };
    case 'yesterday': {
      const date = addDays(todayStart, -1);
      const key = getVietnamDateKey(date);
      return { from: startOfVietnamDate(key), to: endOfVietnamDate(key) };
    }
    case 'this_week':
      return getWeekRange(todayStart, 0);
    case 'last_week':
      return getWeekRange(todayStart, -1);
    case 'this_month':
      return getMonthRange(todayStart, 0);
    case 'last_month':
      return getMonthRange(todayStart, -1);
    case 'last_7_days':
      return { from: addDays(todayStart, -6), to: endOfVietnamDate(today) };
    case 'last_30_days':
      return { from: addDays(todayStart, -29), to: endOfVietnamDate(today) };
    case 'last_90_days':
      return { from: addDays(todayStart, -89), to: endOfVietnamDate(today) };
    default:
      throw new BadRequestException({
        error: {
          code: 'INVALID_PRESET',
          message: `Preset '${preset}' is not supported`,
          param: 'preset',
        },
      });
  }
}

function getVietnamDateKey(date: Date): string {
  return new Date(date.getTime() + VIETNAM_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

function startOfVietnamDate(dateKey: string): Date {
  assertDateKey(dateKey);
  return new Date(`${dateKey}T00:00:00.000+07:00`);
}

function endOfVietnamDate(dateKey: string): Date {
  assertDateKey(dateKey);
  return new Date(`${dateKey}T23:59:59.999+07:00`);
}

function assertDateKey(dateKey: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new BadRequestException({
      error: {
        code: 'INVALID_DATE_RANGE',
        message: `Date '${dateKey}' must use YYYY-MM-DD format`,
        param: 'date_from',
      },
    });
  }
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function getWeekRange(
  todayStart: Date,
  weekOffset: number,
): { from: Date; to: Date } {
  const vietnamDay = new Date(
    todayStart.getTime() + VIETNAM_OFFSET_MS,
  ).getUTCDay();
  const daysFromMonday = vietnamDay === 0 ? 6 : vietnamDay - 1;
  const monday = addDays(todayStart, -daysFromMonday + weekOffset * 7);
  return { from: monday, to: new Date(addDays(monday, 7).getTime() - 1) };
}

function getMonthRange(
  todayStart: Date,
  monthOffset: number,
): { from: Date; to: Date } {
  const vietnamDate = new Date(todayStart.getTime() + VIETNAM_OFFSET_MS);
  const year = vietnamDate.getUTCFullYear();
  const month = vietnamDate.getUTCMonth() + monthOffset;
  const firstDay = new Date(Date.UTC(year, month, 1, -7, 0, 0, 0));
  const nextMonth = new Date(Date.UTC(year, month + 1, 1, -7, 0, 0, 0));
  return { from: firstDay, to: new Date(nextMonth.getTime() - 1) };
}

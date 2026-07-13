export type ID = string;
export type ISODateString = string;
export type PriceInVND = number;
export type URLString = string;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

export type Nullable<T> = T | null;
export type OptionalNullable<T> = T | null | undefined;

export type Timestamped = {
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

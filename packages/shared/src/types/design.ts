import type { ID, JsonObject, Nullable, PriceInVND, URLString } from './common';

export type CustomFrameDesignPosition = JsonObject & {
  x: number;
  y: number;
  scale: number;
  rotate: number;
};

export type CustomFrameUploadedImageType =
  | 'background'
  | 'extraPhoto'
  | 'character'
  | 'reference';

export type CustomFrameContent = JsonObject & {
  recipientName: string;
  graduationDate: string;
  majorOrSchool: string;
  message: string;
};

export type CustomFrameUploadedImage = JsonObject & {
  id: ID;
  url: URLString;
  type: CustomFrameUploadedImageType;
  originalName: Nullable<string>;
  position: CustomFrameDesignPosition;
};

export type CustomFrameAccessoryDesign = JsonObject & {
  id: ID;
  name: string;
  quantity: number;
  position: CustomFrameDesignPosition;
};

export type CustomFrameCharacterDesign = JsonObject & {
  id: ID;
  catalogId?: Nullable<ID>;
  name: Nullable<string>;
  imageUrl: Nullable<URLString>;
  price?: PriceInVND;
  position: CustomFrameDesignPosition;
};

export type CustomFrameDesignData = JsonObject & {
  version: 1;
  type: 'CUSTOM_FRAME';
  frameOptionId: ID;
  frameOptionLabel?: string;
  frameColorName?: string;
  frameColorHex?: string;
  backgroundId: Nullable<ID>;
  backgroundName?: Nullable<string>;
  content: CustomFrameContent;
  uploadedImages: CustomFrameUploadedImage[];
  accessories: CustomFrameAccessoryDesign[];
  characters: CustomFrameCharacterDesign[];
  previewUrl: Nullable<URLString>;
};

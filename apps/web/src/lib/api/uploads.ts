"use client";

import { publicApiClient } from "./public-client";

export type UploadedImageResponse = {
  url: string;
  fileName: string;
  originalName: string;
};

export function uploadCustomerImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return publicApiClient.request<UploadedImageResponse>("uploads/customer/image", {
    method: "POST",
    body: formData,
  });
}

export function uploadPreviewImage(file: File, signal?: AbortSignal) {
  const formData = new FormData();
  formData.append("file", file);

  return publicApiClient.request<UploadedImageResponse>("uploads/previews/image", {
    method: "POST",
    body: formData,
    ...(signal ? { signal } : {}),
  });
}

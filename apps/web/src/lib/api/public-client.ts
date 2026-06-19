import { createApiClient } from "@lego-shop/api-client";
import { getApiBaseUrl } from "./base-url";

export const publicApiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
});

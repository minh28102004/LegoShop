import { createApiClient } from "@lego-shop/api";
import { getApiBaseUrl } from "./base-url";

export const publicApiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
});

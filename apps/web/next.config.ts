import path from "path";
import type { NextConfig } from "next";

type ImageRemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

const API_IMAGE_PATHS = ["/uploads/**", "/shared/images/**"] as const;

const LOOPBACK_API_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
] as const;

/**
 * Supabase Storage chứa media Figure Lab.
 */
const STORAGE_IMAGE_REMOTE_PATTERNS: ImageRemotePattern[] = [
  {
    protocol: "https",
    hostname: "akgcqvirfqumhaxyzenr.supabase.co",
    pathname: "/storage/v1/object/public/figure-lab-media/**",
  },
];

const CONTENT_IMAGE_REMOTE_PATTERNS: ImageRemotePattern[] = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
];

function getImageRemotePatterns(): ImageRemotePattern[] {
  const origins = new Set<string>(LOOPBACK_API_ORIGINS);
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredApiUrl) {
    try {
      const apiUrl = new URL(configuredApiUrl);

      if (apiUrl.protocol === "http:" || apiUrl.protocol === "https:") {
        origins.add(apiUrl.origin);
      }
    } catch {
      // Bỏ qua URL không hợp lệ để local build vẫn dùng allowlist loopback.
    }
  }

  const apiPatterns = [...origins].flatMap((origin) => {
    const url = new URL(origin);
    const protocol = url.protocol.slice(0, -1) as "http" | "https";

    return API_IMAGE_PATHS.map((pathname) => ({
      protocol,
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname,
    }));
  });

  return [
    ...apiPatterns,
    ...STORAGE_IMAGE_REMOTE_PATTERNS,
    ...CONTENT_IMAGE_REMOTE_PATTERNS,
  ];
}

function isConfiguredApiLoopback(): boolean {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredApiUrl) {
    return process.env.NODE_ENV !== "production";
  }

  try {
    const hostname = new URL(configuredApiUrl).hostname;

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    );
  } catch {
    return false;
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
  },

  images: {
    dangerouslyAllowLocalIP: isConfiguredApiLoopback(),
    qualities: [75, 78, 100],
    remotePatterns: getImageRemotePatterns(),
  },
};

export default nextConfig;

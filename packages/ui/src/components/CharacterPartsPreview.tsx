"use client";

import * as React from "react";

export type CharacterPartsPreviewPartType =
  "LEGS" | "TORSO" | "FACE" | "HAIR" | "HAT" | "ACCESSORY";

export type CharacterPartsPreviewPart = {
  id: string;
  type: CharacterPartsPreviewPartType;
  imageUrl: string;
};

type ImageBounds = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  opaqueBackground: boolean;
  processedUrl: string | null;
};

type CanvasSize = { width: number; height: number };
type BoundsTarget = {
  centerX: number;
  centerY: number;
  maxWidth: number;
  maxHeight: number;
};

const PART_ORDER: CharacterPartsPreviewPartType[] = [
  "LEGS",
  "TORSO",
  "FACE",
  "HAIR",
  "HAT",
  "ACCESSORY",
];
const boundsCache = new Map<string, ImageBounds>();

function removeEdgeBackground(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  imageData: ImageData,
  background: { red: number; green: number; blue: number },
) {
  const { width, height } = canvas;
  const pixels = imageData.data;
  const queued = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let start = 0;
  let end = 0;

  const isBackground = (pixelIndex: number) => {
    const offset = pixelIndex * 4;
    const alpha = pixels[offset + 3] ?? 0;
    if (alpha < 18) return true;
    const distance =
      Math.abs((pixels[offset] ?? 0) - background.red) +
      Math.abs((pixels[offset + 1] ?? 0) - background.green) +
      Math.abs((pixels[offset + 2] ?? 0) - background.blue);
    return distance < 54;
  };
  const enqueue = (pixelIndex: number) => {
    if (queued[pixelIndex] || !isBackground(pixelIndex)) return;
    queued[pixelIndex] = 1;
    queue[end] = pixelIndex;
    end += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (start < end) {
    const pixelIndex = queue[start] ?? 0;
    start += 1;
    pixels[pixelIndex * 4 + 3] = 0;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    if (x > 0) enqueue(pixelIndex - 1);
    if (x < width - 1) enqueue(pixelIndex + 1);
    if (y > 0) enqueue(pixelIndex - width);
    if (y < height - 1) enqueue(pixelIndex + width);
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function scanImageBounds(image: HTMLImageElement): ImageBounds | null {
  try {
    const ratio = Math.min(
      1,
      320 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const width = Math.max(1, Math.round(image.naturalWidth * ratio));
    const height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;

    context.drawImage(image, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
    ] as const;
    const background = corners.reduce(
      (current, [x, y]) => {
        const offset = (y * width + x) * 4;
        return {
          red: current.red + (pixels[offset] ?? 0),
          green: current.green + (pixels[offset + 1] ?? 0),
          blue: current.blue + (pixels[offset + 2] ?? 0),
          alpha: current.alpha + (pixels[offset + 3] ?? 0),
        };
      },
      { red: 0, green: 0, blue: 0, alpha: 0 },
    );
    const red = background.red / corners.length;
    const green = background.green / corners.length;
    const blue = background.blue / corners.length;
    const opaqueBackground = background.alpha / corners.length >= 245;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        const alpha = pixels[offset + 3] ?? 0;
        if (alpha < 18) continue;
        if (opaqueBackground) {
          const distance =
            Math.abs((pixels[offset] ?? 0) - red) +
            Math.abs((pixels[offset + 1] ?? 0) - green) +
            Math.abs((pixels[offset + 2] ?? 0) - blue);
          if (distance < 48) continue;
        }
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (maxX < minX || maxY < minY) return null;
    minX = Math.max(0, minX - 2);
    minY = Math.max(0, minY - 2);
    maxX = Math.min(width - 1, maxX + 2);
    maxY = Math.min(height - 1, maxY + 2);
    const bounds: ImageBounds = {
      top: minY / height,
      right: (maxX + 1) / width,
      bottom: (maxY + 1) / height,
      left: minX / width,
      width: (maxX - minX + 1) / width,
      height: (maxY - minY + 1) / height,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      opaqueBackground,
      processedUrl: opaqueBackground
        ? removeEdgeBackground(canvas, context, imageData, { red, green, blue })
        : null,
    };
    return bounds.width > 0.98 && bounds.height > 0.98 ? null : bounds;
  } catch {
    return null;
  }
}

function fitBounds(
  bounds: ImageBounds,
  canvas: CanvasSize,
  target: BoundsTarget,
): React.CSSProperties {
  const contentWidth = bounds.naturalWidth * bounds.width;
  const contentHeight = bounds.naturalHeight * bounds.height;
  const scale = Math.min(
    (canvas.width * target.maxWidth) / contentWidth,
    (canvas.height * target.maxHeight) / contentHeight,
  );
  const width = bounds.naturalWidth * scale;
  const height = bounds.naturalHeight * scale;
  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = (bounds.top + bounds.bottom) / 2;
  return {
    top: `${canvas.height * target.centerY - height * centerY}px`,
    left: `${canvas.width * target.centerX - width * centerX}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
}

function clipBounds(bounds: ImageBounds) {
  return `inset(${bounds.top * 100}% ${(1 - bounds.right) * 100}% ${(1 - bounds.bottom) * 100}% ${bounds.left * 100}%)`;
}

function bodyTarget(
  type: Exclude<CharacterPartsPreviewPartType, "ACCESSORY">,
  separateHeadwear: boolean,
): BoundsTarget {
  if (separateHeadwear) {
    if (type === "HAT")
      return { centerX: 0.5, centerY: 0.07, maxWidth: 0.32, maxHeight: 0.11 };
    if (type === "HAIR")
      return { centerX: 0.5, centerY: 0.2, maxWidth: 0.35, maxHeight: 0.12 };
    if (type === "FACE")
      return { centerX: 0.5, centerY: 0.34, maxWidth: 0.29, maxHeight: 0.14 };
    if (type === "TORSO")
      return { centerX: 0.5, centerY: 0.535, maxWidth: 0.44, maxHeight: 0.22 };
    return { centerX: 0.5, centerY: 0.77, maxWidth: 0.41, maxHeight: 0.21 };
  }
  if (type === "FACE")
    return { centerX: 0.5, centerY: 0.305, maxWidth: 0.3, maxHeight: 0.16 };
  if (type === "TORSO")
    return { centerX: 0.5, centerY: 0.52, maxWidth: 0.46, maxHeight: 0.24 };
  if (type === "LEGS")
    return { centerX: 0.5, centerY: 0.785, maxWidth: 0.42, maxHeight: 0.23 };
  if (type === "HAT")
    return { centerX: 0.5, centerY: 0.12, maxWidth: 0.34, maxHeight: 0.17 };
  return { centerX: 0.5, centerY: 0.12, maxWidth: 0.38, maxHeight: 0.17 };
}

function fallbackBodyStyle(
  type: Exclude<CharacterPartsPreviewPartType, "ACCESSORY">,
  separateHeadwear: boolean,
): React.CSSProperties {
  if (separateHeadwear) {
    if (type === "HAT")
      return { top: "1.5%", left: "34%", width: "32%", height: "11%" };
    if (type === "HAIR")
      return { top: "14%", left: "32.5%", width: "35%", height: "12%" };
    if (type === "FACE")
      return { top: "27%", left: "35.5%", width: "29%", height: "14%" };
    if (type === "TORSO")
      return { top: "42.5%", left: "28%", width: "44%", height: "22%" };
    return { top: "66.5%", left: "29.5%", width: "41%", height: "21%" };
  }
  if (type === "FACE")
    return { top: "22.5%", left: "35%", width: "30%", height: "16%" };
  if (type === "TORSO")
    return { top: "40%", left: "27%", width: "46%", height: "24%" };
  if (type === "LEGS")
    return { top: "67%", left: "29%", width: "42%", height: "23%" };
  if (type === "HAT")
    return { top: "3.5%", left: "33%", width: "34%", height: "17%" };
  return { top: "3.5%", left: "31%", width: "38%", height: "17%" };
}

function PreviewPart({
  canvas,
  index,
  part,
  separateHeadwear,
}: {
  canvas: CanvasSize;
  index: number;
  part: CharacterPartsPreviewPart;
  separateHeadwear: boolean;
}) {
  const [bounds, setBounds] = React.useState<ImageBounds | null>(
    () => boundsCache.get(part.imageUrl) ?? null,
  );
  const displayUrl = bounds?.processedUrl ?? part.imageUrl;
  const isAccessory = part.type === "ACCESSORY";
  const bodyType = part.type as Exclude<
    CharacterPartsPreviewPartType,
    "ACCESSORY"
  >;
  const accessoryTarget: BoundsTarget =
    index % 2 === 0
      ? { centerX: 0.84, centerY: 0.43, maxWidth: 0.23, maxHeight: 0.24 }
      : { centerX: 0.17, centerY: 0.67, maxWidth: 0.18, maxHeight: 0.2 };
  const placement =
    bounds && canvas.width > 0 && canvas.height > 0
      ? fitBounds(
          bounds,
          canvas,
          isAccessory
            ? accessoryTarget
            : bodyTarget(bodyType, separateHeadwear),
        )
      : isAccessory
        ? {
            top: index % 2 === 0 ? "30%" : "57%",
            left: index % 2 === 0 ? "72%" : "7%",
            width: index % 2 === 0 ? "25%" : "20%",
            height: "24%",
          }
        : fallbackBodyStyle(bodyType, separateHeadwear);

  return (
    <img
      src={displayUrl}
      alt=""
      aria-hidden="true"
      crossOrigin="anonymous"
      draggable={false}
      style={{
        position: "absolute",
        maxWidth: "none",
        objectFit: "contain",
        pointerEvents: "none",
        ...placement,
        clipPath: bounds ? clipBounds(bounds) : undefined,
        filter: "drop-shadow(0 8px 10px rgba(20, 51, 75, 0.11))",
        mixBlendMode:
          !bounds || bounds.opaqueBackground ? "multiply" : undefined,
        zIndex: isAccessory ? 60 : PART_ORDER.indexOf(part.type) + 10,
      }}
      onLoad={(event) => {
        if (boundsCache.has(part.imageUrl)) return;
        const nextBounds = scanImageBounds(event.currentTarget);
        if (!nextBounds) return;
        boundsCache.set(part.imageUrl, nextBounds);
        setBounds(nextBounds);
      }}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

export function CharacterPartsPreview({
  parts,
  className,
  label,
}: {
  parts: CharacterPartsPreviewPart[];
  className?: string;
  label?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = React.useState<CanvasSize>({
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const next = {
        width: container.clientWidth,
        height: container.clientHeight,
      };
      setCanvas((current) =>
        current.width === next.width && current.height === next.height
          ? current
          : next,
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();
    return () => observer.disconnect();
  }, []);

  const orderedParts = PART_ORDER.flatMap((type) =>
    parts.filter((part) => part.type === type),
  );
  const hasHair = orderedParts.some((part) => part.type === "HAIR");
  const hasHat = orderedParts.some((part) => part.type === "HAT");
  let accessoryIndex = 0;

  return (
    <div
      ref={containerRef}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      data-character-parts-preview="true"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {orderedParts.map((part) => {
        const index = part.type === "ACCESSORY" ? accessoryIndex++ : 0;
        return (
          <PreviewPart
            key={`${part.type}-${part.id}`}
            canvas={canvas}
            index={index}
            part={part}
            separateHeadwear={hasHair && hasHat}
          />
        );
      })}
    </div>
  );
}

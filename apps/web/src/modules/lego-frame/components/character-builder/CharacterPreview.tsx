"use client";

import type { CharacterPart, CharacterPartType } from "@lego-shop/shared";
import { motion, useAnimationControls } from "framer-motion";
import { Check, Circle, PencilLine, RotateCw } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { resolveApiAssetUrl } from "@/lib/api/assets";

import {
  getCharacterPartImageUrl,
  isCatalogSlotPart,
  isLayerCompatiblePart,
} from "./catalog-part-metadata";
import { CHARACTER_LAYER_ORDER, PROGRESS_PART_TYPES } from "./types";

type CharacterBuilderCopy = Dictionary["characterBuilder"];

type PartLayerConfig = {
  zIndex: number;
  top: string;
  left: string;
  width: string;
  height: string;
  scale: number;
};

type NormalizedImageBounds = {
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

type PreviewCanvasSize = {
  width: number;
  height: number;
};

type VisibleBoundsTarget = {
  centerX: number;
  centerY: number;
  maxWidth: number;
  maxHeight: number;
};

const visibleImageBoundsCache = new Map<string, NormalizedImageBounds>();
const CHARACTER_PREVIEW_VISUAL_SCALE = 1.12;

function removeEdgeConnectedBackground(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  imageData: ImageData,
  background: { red: number; green: number; blue: number },
) {
  const { width, height } = canvas;
  const pixels = imageData.data;
  const queued = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let queueStart = 0;
  let queueEnd = 0;

  const isBackgroundPixel = (pixelIndex: number) => {
    const offset = pixelIndex * 4;
    const alpha = pixels[offset + 3] ?? 0;
    if (alpha < 18) return true;

    const colorDistance =
      Math.abs((pixels[offset] ?? 0) - background.red) +
      Math.abs((pixels[offset + 1] ?? 0) - background.green) +
      Math.abs((pixels[offset + 2] ?? 0) - background.blue);
    return colorDistance < 54;
  };
  const enqueue = (pixelIndex: number) => {
    if (queued[pixelIndex] || !isBackgroundPixel(pixelIndex)) return;
    queued[pixelIndex] = 1;
    queue[queueEnd] = pixelIndex;
    queueEnd += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (queueStart < queueEnd) {
    const pixelIndex = queue[queueStart] ?? 0;
    queueStart += 1;
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

const CANVAS_PART_LAYER_CONFIG: Record<CharacterPartType, PartLayerConfig> = {
  LEGS: {
    zIndex: 10,
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    scale: 1,
  },
  TORSO: {
    zIndex: 20,
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    scale: 1,
  },
  FACE: {
    zIndex: 30,
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    scale: 1,
  },
  HAIR: {
    zIndex: 40,
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    scale: 1,
  },
  HAT: {
    zIndex: 50,
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    scale: 1,
  },
  ACCESSORY: {
    zIndex: 60,
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    scale: 1,
  },
};

// Catalog product photos use different camera angles and source canvases.
// Their visible pixels are normalized into slightly overlapping assembly
// zones so the neck, waist and head connections read as one minifigure.
const EXPLODED_PART_LAYER_CONFIG: Record<CharacterPartType, PartLayerConfig> = {
  FACE: {
    zIndex: 30,
    top: "17.5%",
    left: "38%",
    width: "24%",
    height: "22%",
    scale: 1,
  },
  HAIR: {
    zIndex: 40,
    top: "7.5%",
    left: "35%",
    width: "30%",
    height: "19%",
    scale: 1,
  },
  HAT: {
    zIndex: 50,
    top: "6.5%",
    left: "36.5%",
    width: "27%",
    height: "17%",
    scale: 1,
  },
  TORSO: {
    zIndex: 20,
    top: "31%",
    left: "31%",
    width: "38%",
    height: "28%",
    scale: 1,
  },
  LEGS: {
    zIndex: 10,
    top: "52.5%",
    left: "33%",
    width: "34%",
    height: "28%",
    scale: 1,
  },
  ACCESSORY: {
    zIndex: 60,
    top: "39%",
    left: "57%",
    width: "38%",
    height: "34%",
    scale: 1,
  },
};

function scanVisibleImageBounds(
  image: HTMLImageElement,
): NormalizedImageBounds | null {
  try {
    const maxScanSize = 320;
    const ratio = Math.min(
      1,
      maxScanSize / Math.max(image.naturalWidth, image.naturalHeight),
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
    const cornerCoordinates = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
    ] as const;
    const background = cornerCoordinates.reduce(
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
    const backgroundRed = background.red / cornerCoordinates.length;
    const backgroundGreen = background.green / cornerCoordinates.length;
    const backgroundBlue = background.blue / cornerCoordinates.length;
    const opaqueBackground = background.alpha / cornerCoordinates.length >= 245;
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
          const colorDistance =
            Math.abs((pixels[offset] ?? 0) - backgroundRed) +
            Math.abs((pixels[offset + 1] ?? 0) - backgroundGreen) +
            Math.abs((pixels[offset + 2] ?? 0) - backgroundBlue);
          if (colorDistance < 48) continue;
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
    const bounds = {
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
        ? removeEdgeConnectedBackground(canvas, context, imageData, {
            red: backgroundRed,
            green: backgroundGreen,
            blue: backgroundBlue,
          })
        : null,
    };

    // If neither alpha nor the corner background isolates the product, keep
    // the conservative fallback slot rather than over-cropping the image.
    return bounds.width > 0.98 && bounds.height > 0.98 ? null : bounds;
  } catch {
    return null;
  }
}

function fitVisibleBoundsToTarget(
  bounds: NormalizedImageBounds,
  canvasSize: PreviewCanvasSize,
  target: VisibleBoundsTarget,
): CSSProperties {
  const contentWidth = bounds.naturalWidth * bounds.width;
  const contentHeight = bounds.naturalHeight * bounds.height;
  const imageScale = Math.min(
    (canvasSize.width * target.maxWidth) / contentWidth,
    (canvasSize.height * target.maxHeight) / contentHeight,
  );
  const imageWidth = bounds.naturalWidth * imageScale;
  const imageHeight = bounds.naturalHeight * imageScale;
  const visibleCenterX = (bounds.left + bounds.right) / 2;
  const visibleCenterY = (bounds.top + bounds.bottom) / 2;

  return {
    top: `${
      canvasSize.height * target.centerY - imageHeight * visibleCenterY
    }px`,
    left: `${
      canvasSize.width * target.centerX - imageWidth * visibleCenterX
    }px`,
    width: `${imageWidth}px`,
    height: `${imageHeight}px`,
  };
}

function getVisibleBoundsClipPath(bounds: NormalizedImageBounds) {
  return `inset(${bounds.top * 100}% ${(1 - bounds.right) * 100}% ${
    (1 - bounds.bottom) * 100
  }% ${bounds.left * 100}%)`;
}

function getExplodedPlacementStyle(
  type: Exclude<CharacterPartType, "ACCESSORY">,
  bounds: NormalizedImageBounds,
  canvasSize: PreviewCanvasSize,
): CSSProperties {
  const target: VisibleBoundsTarget =
    type === "FACE"
      ? { centerX: 0.5, centerY: 0.285, maxWidth: 0.24, maxHeight: 0.22 }
      : type === "TORSO"
        ? { centerX: 0.5, centerY: 0.45, maxWidth: 0.38, maxHeight: 0.28 }
        : type === "LEGS"
          ? { centerX: 0.5, centerY: 0.665, maxWidth: 0.34, maxHeight: 0.28 }
          : type === "HAT"
            ? { centerX: 0.5, centerY: 0.15, maxWidth: 0.27, maxHeight: 0.17 }
            : { centerX: 0.5, centerY: 0.17, maxWidth: 0.3, maxHeight: 0.19 };

  return fitVisibleBoundsToTarget(bounds, canvasSize, target);
}

function getLayerEntrance(type: CharacterPartType) {
  switch (type) {
    case "HAIR":
    case "HAT":
      return { opacity: 0, y: -12 };
    case "FACE":
      return { opacity: 0, x: 8 };
    case "TORSO":
      return { opacity: 0, scale: 0.96 };
    case "LEGS":
      return { opacity: 0, y: 12 };
    case "ACCESSORY":
      return { opacity: 0, rotate: -5, scale: 0.9 };
  }
}

function CharacterMannequin() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="relative h-[72%] w-[58%] opacity-75">
        <div className="absolute left-1/2 top-[10%] h-[21%] w-[39%] -translate-x-1/2 rounded-[28%] border-2 border-[#c9deeb] bg-[#edf7fc] shadow-[inset_0_-10px_18px_rgba(42,147,208,0.08)]">
          <div className="absolute left-1/2 top-[-9%] h-[11%] w-[28%] -translate-x-1/2 rounded-t-md bg-[#c9deeb]" />
          <div className="absolute inset-x-[24%] top-[48%] h-px bg-[#b6d3e4]" />
        </div>
        <div
          className="absolute left-1/2 top-[32%] h-[30%] w-[52%] -translate-x-1/2 border-2 border-[#c9deeb] bg-[#e7f4fb]"
          style={{ clipPath: "polygon(18% 0, 82% 0, 100% 100%, 0 100%)" }}
        />
        <div className="absolute left-[7%] top-[35%] h-[29%] w-[15%] -rotate-6 rounded-full border-2 border-[#c9deeb] bg-[#edf7fc]" />
        <div className="absolute right-[7%] top-[35%] h-[29%] w-[15%] rotate-6 rounded-full border-2 border-[#c9deeb] bg-[#edf7fc]" />
        <div className="absolute bottom-[7%] left-[25%] h-[31%] w-[23%] rounded-b-[20%] border-2 border-[#c9deeb] bg-[#dceef8]" />
        <div className="absolute bottom-[7%] right-[25%] h-[31%] w-[23%] rounded-b-[20%] border-2 border-[#c9deeb] bg-[#dceef8]" />
      </div>
    </div>
  );
}

function CharacterLayer({
  canvasSize,
  compositionMode,
  part,
  reverse,
}: {
  canvasSize: PreviewCanvasSize;
  compositionMode: "canvas" | "exploded";
  part: CharacterPart;
  reverse: boolean;
}) {
  const src = resolveApiAssetUrl(getCharacterPartImageUrl(part, reverse));
  const [visibleBounds, setVisibleBounds] = useState(
    () => visibleImageBoundsCache.get(src) ?? null,
  );
  if (!src) return null;
  const displaySrc = visibleBounds?.processedUrl ?? src;
  const layer =
    compositionMode === "exploded"
      ? EXPLODED_PART_LAYER_CONFIG[part.type]
      : CANVAS_PART_LAYER_CONFIG[part.type];
  const isNormalizedExplodedPart =
    compositionMode === "exploded" &&
    part.type !== "ACCESSORY" &&
    visibleBounds !== null &&
    canvasSize.width > 0 &&
    canvasSize.height > 0;
  const normalizedPlacement = isNormalizedExplodedPart
    ? getExplodedPlacementStyle(
        part.type as Exclude<CharacterPartType, "ACCESSORY">,
        visibleBounds,
        canvasSize,
      )
    : null;
  const imageStyle: CSSProperties = normalizedPlacement ?? {
    height: layer.height,
    top: layer.top,
    left: layer.left,
    width: layer.width,
  };
  const motionProps = {
    initial: getLayerEntrance(part.type),
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: 0,
      scale: layer.scale,
    },
    exit: { opacity: 0, scale: 0.97 },
    transition: { duration: 0.2, ease: "easeOut" as const },
  };

  return (
    <motion.div
      key={`${part.type}-${part.id}-base`}
      {...motionProps}
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: layer.zIndex }}
    >
      {/* A native image element is required so the loaded pixels can be
          sampled for transparent-bound normalization. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displaySrc}
        alt=""
        crossOrigin={compositionMode === "exploded" ? "anonymous" : undefined}
        className="pointer-events-none absolute max-w-none object-contain"
        style={{
          ...imageStyle,
          clipPath:
            compositionMode === "exploded" && visibleBounds
              ? getVisibleBoundsClipPath(visibleBounds)
              : undefined,
          filter:
            compositionMode === "exploded"
              ? "drop-shadow(0 10px 12px rgba(20, 51, 75, 0.1))"
              : undefined,
          mixBlendMode:
            compositionMode === "exploded" &&
            (!isNormalizedExplodedPart || visibleBounds?.opaqueBackground)
              ? "multiply"
              : undefined,
        }}
        onLoad={(event) => {
          if (
            compositionMode !== "exploded" ||
            part.type === "ACCESSORY" ||
            visibleImageBoundsCache.has(src)
          ) {
            return;
          }

          const nextBounds = scanVisibleImageBounds(event.currentTarget);
          if (!nextBounds) return;
          visibleImageBoundsCache.set(src, nextBounds);
          setVisibleBounds(nextBounds);
        }}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </motion.div>
  );
}

function CatalogAccessoryLayer({
  canvasSize,
  index,
  part,
}: {
  canvasSize: PreviewCanvasSize;
  index: number;
  part: CharacterPart;
}) {
  const src = resolveApiAssetUrl(getCharacterPartImageUrl(part, false));
  const [visibleBounds, setVisibleBounds] = useState(
    () => visibleImageBoundsCache.get(src) ?? null,
  );
  if (!src) return null;
  const displaySrc = visibleBounds?.processedUrl ?? src;

  const target =
    index % 2 === 0
      ? { centerX: 0.84, centerY: 0.43, maxWidth: 0.23, maxHeight: 0.24 }
      : { centerX: 0.17, centerY: 0.67, maxWidth: 0.18, maxHeight: 0.2 };
  const placement =
    visibleBounds && canvasSize.width > 0 && canvasSize.height > 0
      ? fitVisibleBoundsToTarget(visibleBounds, canvasSize, target)
      : {
          top: index % 2 === 0 ? "30%" : "57%",
          left: index % 2 === 0 ? "72%" : "7%",
          width: index % 2 === 0 ? "25%" : "20%",
          height: "24%",
        };

  return (
    <motion.div
      data-character-accessory-slot="true"
      initial={{ opacity: 0, scale: 0.88, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="pointer-events-none absolute inset-[1.5%] z-[60]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displaySrc}
        alt=""
        crossOrigin="anonymous"
        className="pointer-events-none absolute max-w-none object-contain"
        style={{
          ...placement,
          clipPath: visibleBounds
            ? getVisibleBoundsClipPath(visibleBounds)
            : undefined,
          filter: "drop-shadow(0 9px 10px rgba(20, 51, 75, 0.13))",
          mixBlendMode: "multiply",
        }}
        onLoad={(event) => {
          if (visibleImageBoundsCache.has(src)) return;
          const nextBounds = scanVisibleImageBounds(event.currentTarget);
          if (!nextBounds) return;
          visibleImageBoundsCache.set(src, nextBounds);
          setVisibleBounds(nextBounds);
        }}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </motion.div>
  );
}

export function CharacterPreview({
  animationKey,
  copy,
  flipped,
  name,
  onFlippedChange,
  onNameChange,
  progress,
  selectedParts,
}: {
  animationKey: number;
  copy: CharacterBuilderCopy;
  flipped: boolean;
  name: string;
  onFlippedChange: (next: boolean) => void;
  onNameChange: (next: string) => void;
  progress: ReadonlySet<CharacterPartType>;
  selectedParts: CharacterPart[];
}) {
  const characterControls = useAnimationControls();
  const compositionRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<PreviewCanvasSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (animationKey === 0) return;
    void characterControls.start({
      scale: [1, 1.015, 1],
      transition: { duration: 0.22, ease: "easeOut" },
    });
  }, [animationKey, characterControls]);

  useEffect(() => {
    const composition = compositionRef.current;
    if (!composition) return;

    const updateCanvasSize = () => {
      const nextWidth = composition.clientWidth;
      const nextHeight = composition.clientHeight;
      setCanvasSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    };
    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(composition);
    updateCanvasSize();

    return () => observer.disconnect();
  }, []);

  const completedCount = PROGRESS_PART_TYPES.filter((type) =>
    progress.has(type),
  ).length;
  const orderedParts = CHARACTER_LAYER_ORDER.flatMap((type) =>
    selectedParts.filter((part) => part.type === type),
  );
  const canvasLayerParts = orderedParts.filter(
    (part) => part.type !== "ACCESSORY" && isLayerCompatiblePart(part),
  );
  const catalogSlotParts = orderedParts.filter(
    (part) => part.type !== "ACCESSORY" && isCatalogSlotPart(part),
  );
  const useExplodedView = catalogSlotParts.length > 0;
  const previewParts = orderedParts.filter((part) => part.type !== "ACCESSORY");
  const accessoryParts = orderedParts.filter(
    (part) => part.type === "ACCESSORY",
  );

  return (
    <section className="grid h-full min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3">
      <label className="block">
        <span className="mb-1.5 flex items-center gap-2 text-xs font-extrabold leading-5 text-slate-500">
          <PencilLine className="size-4" aria-hidden="true" />
          {copy.name}
        </span>
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          maxLength={40}
          className="form-control h-11 bg-white px-4 text-base font-extrabold text-navy"
          aria-label={copy.name}
        />
      </label>

      <div
        data-character-stage="true"
        className="relative min-h-[260px] overflow-hidden rounded-[18px] border border-[#dbe8f0] bg-[radial-gradient(circle_at_50%_42%,rgba(91,187,234,0.2),rgba(255,255,255,0.88)_48%,rgba(234,245,251,0.94)_76%)] sm:min-h-[300px] lg:min-h-0"
      >
        <div className="absolute inset-x-[16%] bottom-[7%] h-[6%] rounded-[50%] bg-[#173c58]/15 blur-xl" />
        <motion.div
          animate={characterControls}
          className="absolute inset-[1.5%] origin-center"
        >
          <div
            ref={compositionRef}
            className="relative h-full w-full transition-transform duration-200 motion-reduce:transition-none"
            style={{
              transform: `scale(${CHARACTER_PREVIEW_VISUAL_SCALE}) scaleX(${flipped ? -1 : 1})`,
            }}
          >
            {useExplodedView ? (
              previewParts.map((part) => (
                <CharacterLayer
                  key={`${part.id}-${flipped ? "reverse" : "front"}`}
                  canvasSize={canvasSize}
                  compositionMode="exploded"
                  part={part}
                  reverse={flipped}
                />
              ))
            ) : (
              <>
                <CharacterMannequin />
                {canvasLayerParts.map((part) => (
                  <CharacterLayer
                    key={`${part.id}-${flipped ? "reverse" : "front"}`}
                    canvasSize={canvasSize}
                    compositionMode="canvas"
                    part={part}
                    reverse={flipped}
                  />
                ))}
              </>
            )}
          </div>
        </motion.div>
        {accessoryParts.map((part, index) => (
          <CatalogAccessoryLayer
            key={part.id}
            canvasSize={canvasSize}
            index={index}
            part={part}
          />
        ))}

        {orderedParts.length === 0 ? (
          <p className="absolute inset-x-6 bottom-20 text-center text-sm font-semibold text-slate-500">
            {copy.previewEmpty}
          </p>
        ) : null}

        <div className="absolute bottom-3 right-3">
          <button
            type="button"
            onClick={() => onFlippedChange(!flipped)}
            className="group/rotate relative inline-flex size-11 items-center justify-center overflow-hidden rounded-full border border-[#d6e5ee] bg-white/95 text-slate-600 shadow-sm backdrop-blur transition-all duration-300 before:absolute before:inset-y-0 before:left-[-55%] before:w-1/3 before:-skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_12px_24px_-14px_rgba(37,143,206,0.9)] hover:before:translate-x-[480%] active:translate-y-0 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:before:hidden"
            aria-label={copy.flipCharacter}
          >
            <RotateCw
              className="relative z-10 size-4 transition-transform duration-500 ease-out group-hover/rotate:rotate-180 motion-reduce:transform-none motion-reduce:transition-none"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="min-h-[96px] rounded-[16px] border border-[#dce9f1] bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
            {copy.progressTitle}
          </p>
          <p className="text-sm font-black text-primary">
            {copy.progressSummary(completedCount)}
          </p>
        </div>
        <ul className="mt-2.5 grid grid-cols-5 gap-1.5">
          {PROGRESS_PART_TYPES.map((type) => {
            const complete = progress.has(type);
            return (
              <li
                key={type}
                className={`flex min-w-0 flex-col items-center gap-1.5 text-[10px] font-extrabold leading-tight ${
                  complete ? "text-navy" : "text-slate-400"
                }`}
              >
                {complete ? (
                  <Check className="size-4 text-primary" aria-hidden="true" />
                ) : (
                  <Circle className="size-4" aria-hidden="true" />
                )}
                <span className="whitespace-nowrap text-center">
                  {copy.tabs[type]}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

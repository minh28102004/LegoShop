import type {
  DesignSnapshot,
  StudioDesignState,
  StudioHistory,
} from "./studio.types";

function cloneSnapshot(snapshot: DesignSnapshot): DesignSnapshot {
  return {
    ...snapshot,
    contentValues: { ...snapshot.contentValues },
    elements: snapshot.elements.map((element) => ({ ...element })),
  };
}

export function createSnapshot(design: StudioDesignState): DesignSnapshot {
  return cloneSnapshot({
    frameSize: design.frameSize,
    activeTemplate: design.activeTemplate,
    customBackgroundUrl: design.customBackgroundUrl,
    customBackgroundOriginalName: design.customBackgroundOriginalName,
    contentValues: design.contentValues,
    elements: design.elements,
  });
}

export function createStudioHistory(present: DesignSnapshot): StudioHistory {
  return { past: [], present: cloneSnapshot(present), future: [] };
}

export function areSnapshotsEqual(
  left: DesignSnapshot,
  right: DesignSnapshot,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function pushHistory(
  history: StudioHistory,
  next: DesignSnapshot,
  limit = 50,
): StudioHistory {
  return {
    past: [...history.past, cloneSnapshot(history.present)].slice(-limit),
    present: cloneSnapshot(next),
    future: [],
  };
}

export function undoHistory(history: StudioHistory): StudioHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;

  return {
    past: history.past.slice(0, -1),
    present: cloneSnapshot(previous),
    future: [cloneSnapshot(history.present), ...history.future],
  };
}

export function redoHistory(history: StudioHistory): StudioHistory {
  const next = history.future[0];
  if (!next) return history;

  return {
    past: [...history.past, cloneSnapshot(history.present)],
    present: cloneSnapshot(next),
    future: history.future.slice(1),
  };
}

export function clearFuture(history: StudioHistory): StudioHistory {
  return { ...history, future: [] };
}

export function resetHistory(present: DesignSnapshot): StudioHistory {
  return createStudioHistory(present);
}

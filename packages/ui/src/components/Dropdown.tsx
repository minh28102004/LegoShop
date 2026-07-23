"use client";

import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  cloneElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../cn";

type DropdownProps = {
  trigger: ReactElement<Record<string, unknown>>;
  children: (props: { open: boolean; close: () => void }) => ReactNode;
  align?: "left" | "right";
  side?: "top" | "bottom";
  className?: string;
  panelClassName?: string;
  panelRole?: "menu" | "listbox";
  panelId?: string;
  onOpenChange?: (open: boolean) => void;
  portal?: boolean;
  matchTriggerWidth?: boolean;
  offset?: number;
};

export function Dropdown({
  trigger,
  children,
  align = "right",
  side = "bottom",
  className,
  panelClassName,
  panelRole = "menu",
  panelId,
  onOpenChange,
  portal = false,
  matchTriggerWidth = false,
  offset = 8,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState<CSSProperties>({});
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  const updatePortalPosition = useCallback(() => {
    if (!portal || !wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const panelWidth = matchTriggerWidth
      ? Math.min(rect.width, window.innerWidth - 24)
      : (panelRef.current?.offsetWidth ?? rect.width);
    const preferredLeft =
      align === "right" && !matchTriggerWidth
        ? rect.right - panelWidth
        : rect.left;
    const left = Math.min(
      Math.max(12, preferredLeft),
      window.innerWidth - panelWidth - 12,
    );
    const availableBelow = window.innerHeight - rect.bottom - offset - 12;
    const availableAbove = rect.top - offset - 12;
    const shouldOpenAbove =
      side === "top" ||
      (availableBelow < 220 && availableAbove > availableBelow);
    const maxHeight = Math.max(
      180,
      shouldOpenAbove ? availableAbove : availableBelow,
    );

    setPortalStyle({
      position: "fixed",
      top: shouldOpenAbove ? undefined : rect.bottom + offset,
      bottom: shouldOpenAbove
        ? window.innerHeight - rect.top + offset
        : undefined,
      left,
      width: matchTriggerWidth ? panelWidth : undefined,
      maxHeight,
      zIndex: 1700,
    });
  }, [align, matchTriggerWidth, offset, portal]);

  useLayoutEffect(() => {
    if (!open || !portal) return;

    updatePortalPosition();
    const frame = window.requestAnimationFrame(updatePortalPosition);
    window.addEventListener("resize", updatePortalPosition);
    window.addEventListener("scroll", updatePortalPosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePortalPosition);
      window.removeEventListener("scroll", updatePortalPosition, true);
    };
  }, [open, portal, updatePortalPosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (
      event: MouseEvent | TouchEvent | PointerEvent,
    ) => {
      const target = event.target as Node;
      const insideTrigger = wrapperRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);

      if (!insideTrigger && !insidePanel) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        window.requestAnimationFrame(() => {
          wrapperRef.current
            ?.querySelector<HTMLElement>(
              "button, [role='button'], [tabindex]:not([tabindex='-1'])",
            )
            ?.focus();
        });
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("mousedown", handlePointerDown, true);
    document.addEventListener("touchstart", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("mousedown", handlePointerDown, true);
      document.removeEventListener("touchstart", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    window.requestAnimationFrame(() => {
      wrapperRef.current
        ?.querySelector<HTMLElement>(
          "button, [role='button'], [tabindex]:not([tabindex='-1'])",
        )
        ?.focus();
    });
  };
  const toggle = () => setOpen((current) => !current);

  const triggerAriaHasPopup = (trigger.props as { "aria-haspopup"?: string })[
    "aria-haspopup"
  ];

  const triggerElement = cloneElement(trigger, {
    onClick(event: unknown) {
      const originalOnClick = (
        trigger.props as { onClick?: (event: unknown) => void }
      ).onClick;
      if (typeof originalOnClick === "function") {
        originalOnClick(event);
      }
      toggle();
    },
    "aria-expanded": open,
    "aria-haspopup": triggerAriaHasPopup ?? panelRole,
  });

  return (
    <div ref={wrapperRef} className={cn("relative min-w-0", className)}>
      {triggerElement}

      {portal && open && typeof document !== "undefined" ? (
        createPortal(
          <div
            ref={panelRef}
            role={panelRole}
            id={panelId}
            aria-hidden={false}
            style={portalStyle}
            className={cn(
              "overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_18px_44px_-30px_rgba(15,23,42,0.28)] transition-all duration-150 ease-out",
              "pointer-events-auto translate-y-0 scale-100 opacity-100 animate-zoom-in",
              panelClassName,
            )}
          >
            {children({ open, close })}
          </div>,
          document.body,
        )
      ) : !portal ? (
        <div
          ref={panelRef}
          role={panelRole}
          id={panelId}
          aria-hidden={!open}
          className={cn(
            "absolute z-[90] overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_18px_44px_-30px_rgba(15,23,42,0.28)] transition-all duration-150 ease-out",
            align === "right" ? "right-0" : "left-0",
            side === "top"
              ? "bottom-full mb-2 origin-bottom-right"
              : "top-full mt-2 origin-top-right",
            open
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100 animate-zoom-in"
              : "pointer-events-none -translate-y-1 scale-[0.99] opacity-0",
            panelClassName,
          )}
        >
          {children({ open, close })}
        </div>
      ) : null}
    </div>
  );
}

export default Dropdown;

import { cn, type FieldState } from "@lego-shop/ui";

export type ControlSize = "compact" | "default";

export const CONTROL_SIZE_CLASS: Record<ControlSize, string> = {
  compact: "form-control--compact",
  default: "",
};

export function formControlClassName({
  className,
  fieldState,
  size = "default",
}: {
  className?: string | undefined;
  fieldState?: FieldState | undefined;
  size?: ControlSize | undefined;
} = {}) {
  return cn(
    "form-control",
    CONTROL_SIZE_CLASS[size],
    fieldState === "error" && "is-invalid",
    fieldState === "success" && "is-success",
    className,
  );
}

export const FORM_LABEL_CLASS = "block text-sm font-semibold text-text-primary";
export const FORM_HINT_CLASS = "text-xs leading-5 text-text-muted";
export const FORM_ERROR_CLASS = "text-xs font-medium leading-5 text-error";
export const FORM_POPOVER_CLASS = "form-popover";
export const FORM_OPTION_CLASS = "form-option";

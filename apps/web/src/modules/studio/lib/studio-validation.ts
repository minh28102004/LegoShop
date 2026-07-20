import type {
  StudioDesignState,
  StudioStep,
  StudioValidationResult,
} from "../state/studio.types";
import { STUDIO_STEPS } from "../state/studio.types";

export type StudioValidationMessages = {
  frameRequired: string;
  fieldRequired: (label: string) => string;
  previewRequired: string;
};

const DEFAULT_VALIDATION_MESSAGES: StudioValidationMessages = {
  frameRequired: "Vui lòng chọn kích thước khung.",
  fieldRequired: (label) => `Vui lòng nhập ${label.toLowerCase()}.`,
  previewRequired: "Vui lòng chọn mẫu nền hoặc tải ảnh thiết kế.",
};

function invalid(
  fieldErrors: Record<string, string>,
  summaryErrors: string[],
): StudioValidationResult {
  const firstInvalidField = Object.keys(fieldErrors)[0];
  return {
    isValid: false,
    fieldErrors,
    summaryErrors,
    ...(firstInvalidField ? { firstInvalidField } : {}),
  };
}

export function validateStudioStep(
  step: StudioStep,
  design: StudioDesignState,
  messages: StudioValidationMessages = DEFAULT_VALIDATION_MESSAGES,
): StudioValidationResult {
  const fieldErrors: Record<string, string> = {};
  const summaryErrors: string[] = [];

  if (step === "frame" || step === "review") {
    if (!design.frameSize) {
      fieldErrors.frameSize = messages.frameRequired;
      summaryErrors.push(fieldErrors.frameSize);
    }
  }

  if (step === "content" || step === "review") {
    design.contentFields.forEach((field) => {
      if (field.required && !design.contentValues[field.key]?.trim()) {
        const message = messages.fieldRequired(field.label);
        fieldErrors[field.key] = message;
        summaryErrors.push(message);
      }
    });
  }

  if (step === "background" || step === "review") {
    const hasTemplate = Boolean(design.activeTemplate);
    const hasUploadedBackground = Boolean(design.customBackgroundUrl);
    if (!hasTemplate && !hasUploadedBackground) {
      fieldErrors.preview = messages.previewRequired;
      summaryErrors.push(fieldErrors.preview);
    }
  }

  return summaryErrors.length > 0
    ? invalid(fieldErrors, summaryErrors)
    : { isValid: true, fieldErrors: {}, summaryErrors: [] };
}

export function validateStudioThroughStep(
  targetStep: StudioStep,
  design: StudioDesignState,
  messages: StudioValidationMessages = DEFAULT_VALIDATION_MESSAGES,
): StudioValidationResult {
  const targetIndex = STUDIO_STEPS.indexOf(targetStep);
  const stepsToValidate = STUDIO_STEPS.slice(0, targetIndex + 1).filter(
    (step) => step !== "review",
  );
  const results = stepsToValidate.map((step) =>
    validateStudioStep(step, design, messages),
  );
  const fieldErrors = Object.assign(
    {},
    ...results.map((item) => item.fieldErrors),
  );
  const summaryErrors = results.flatMap((item) => item.summaryErrors);

  return summaryErrors.length > 0
    ? invalid(fieldErrors, summaryErrors)
    : { isValid: true, fieldErrors: {}, summaryErrors: [] };
}

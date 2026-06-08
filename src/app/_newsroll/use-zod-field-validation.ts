import { useMemo, useState } from "react";
import type { ZodTypeAny } from "zod";

function hasInputValue(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

export function useZodFieldValidation(schema: ZodTypeAny, value: unknown) {
  const [isTouched, setIsTouched] = useState(false);
  const result = useMemo(() => schema.safeParse(value), [schema, value]);
  const shouldShowError = isTouched || hasInputValue(value);
  const errorMessage =
    shouldShowError && !result.success ? result.error.errors[0]?.message : undefined;

  return {
    errorMessage,
    isValid: result.success,
    markTouched: () => setIsTouched(true),
  };
}

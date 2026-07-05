export function AuthValidationError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  return message ? (
    <p className="text_authValidationError" id={id} role="alert">
      {message}
    </p>
  ) : null;
}


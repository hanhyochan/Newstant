import type { ChangeEventHandler } from "react";

import { IconButton } from "../button/icon-button";
import { TextInput } from "./text-input";

export type CommentComposerInputProps = {
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  submitLabel: string;
  value: string;
};

export function CommentComposerInput({
  label,
  onChange,
  placeholder,
  submitLabel,
  value,
}: CommentComposerInputProps) {
  return (
    <>
      <TextInput
        aria-label={label}
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
        variant="comment"
      />
      <IconButton
        className="btn_commentSubmit"
        icon="submit"
        label={submitLabel}
        type="submit"
      />
    </>
  );
}

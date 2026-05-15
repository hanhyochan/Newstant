import type { ChangeEventHandler } from "react";

import { Icon } from "../icon/icon";
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
        inputSize="large"
        onChange={onChange}
        placeholder={placeholder}
        radius="rounded"
        type="text"
        value={value}
        variant="outline"
        wrapperClassNameOnly
        wrapperClassName="input_commentComposer"
      />
      <button aria-label={submitLabel} className="btn_commentSubmit" type="submit">
        <Icon name="submit" />
      </button>
    </>
  );
}

import {
  PrimaryButton,
  PrimaryButtonGroup,
  Textarea,
} from "@/design-system/components";

export function CommentInlineEditor({
  ariaLabel,
  onCancel,
  onChange,
  onSave,
  value,
}: {
  ariaLabel: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  value: string;
}) {
  return (
    <div className="wrapper_commentEdit">
      <Textarea
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        value={value}
        variant="commentEdit"
      />
      <PrimaryButtonGroup columns={2}>
        <PrimaryButton
          onClick={onSave}
          type="button"
        >
          저장
        </PrimaryButton>
        <PrimaryButton
          onClick={onCancel}
          tone="neutral"
          type="button"
        >
          취소
        </PrimaryButton>
      </PrimaryButtonGroup>
    </div>
  );
}


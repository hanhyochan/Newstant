import { NewsRollSwitch } from "@/design-system/components";

export type MySettingRowProps = {
  checked?: boolean;
  label: string;
  onClick?: () => void;
  showChevron?: boolean;
};

export function MySettingRow({
  checked,
  label,
  onClick,
  showChevron = false,
}: MySettingRowProps) {
  const className = `btn_mySettingRow${showChevron ? " btn_mySettingRowLink" : ""}`;

  return (
    <button
      aria-pressed={checked}
      className={className}
      onClick={onClick}
      type="button"
    >
      <span className="text_mySettingLabel">{label}</span>
      {typeof checked === "boolean" ? <NewsRollSwitch checked={checked} /> : null}
      {showChevron ? <span className="icon_myChevron" aria-hidden="true" /> : null}
    </button>
  );
}

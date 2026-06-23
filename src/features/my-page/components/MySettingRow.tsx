import { SettingRowButton } from "@/design-system/components";

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
  return (
    <SettingRowButton
      checked={checked}
      label={label}
      onClick={onClick}
      showChevron={showChevron}
    />
  );
}

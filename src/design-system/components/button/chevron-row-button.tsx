import type {
  ButtonHTMLAttributes,
  ChangeEventHandler,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { useId } from "react";

import { NewsRollCheckBox, type NewsRollCheckSize } from "../input/check-field";
import { cn } from "../shared/utils";

export type ChevronRowButtonType = "default" | "checkbox";

type ChevronRowDefaultProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children: ReactNode;
  rowType?: "default";
};

type ChevronRowCheckboxProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> & {
  checked?: boolean;
  children: ReactNode;
  checkboxSize?: NewsRollCheckSize;
  chevronLabel: string;
  disabled?: boolean;
  inputId?: string;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "checked" | "children" | "className" | "disabled" | "id" | "onChange" | "size" | "type"
  >;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onChevronClick?: () => void;
  rowType: "checkbox";
  value?: string;
};

export type ChevronRowButtonProps =
  | ChevronRowDefaultProps
  | ChevronRowCheckboxProps;

export function ChevronRowButton(props: ChevronRowButtonProps) {
  const generatedId = useId();

  if (props.rowType === "checkbox") {
    const {
      checked = false,
      checkboxSize = "md",
      chevronLabel,
      children,
      className,
      disabled = false,
      inputId,
      inputProps,
      name,
      onChange,
      onChevronClick,
      value,
      ...rowProps
    } = props;
    const resolvedInputId = inputId ?? generatedId;

    return (
      <div
        className={cn("btn_chevronRow", className)}
        data-row-type="checkbox"
        {...rowProps}
      >
        <label className="btn_chevronRowCheckField" data-size={checkboxSize}>
          <input
            {...inputProps}
            checked={checked}
            className="input_newsrollCheck"
            disabled={disabled}
            id={resolvedInputId}
            name={name}
            onChange={onChange}
            type="checkbox"
            value={value}
          />
          <NewsRollCheckBox checked={checked} size={checkboxSize} />
          <span>{children}</span>
        </label>
        <button
          aria-label={chevronLabel}
          className="btn_chevronRowArrow"
          disabled={disabled}
          onClick={onChevronClick}
          type="button"
        >
          <span className="icon_myChevron" aria-hidden="true" />
        </button>
      </div>
    );
  }

  const {
    children,
    className,
    rowType: _rowType,
    type = "button",
    ...buttonProps
  } = props;

  return (
    <button
      className={cn("btn_chevronRow", className)}
      data-row-type="default"
      type={type}
      {...buttonProps}
    >
      <span className="btn_chevronRowContent">{children}</span>
      <span className="icon_myChevron" aria-hidden="true" />
    </button>
  );
}

import { Fragment } from "react";
import { createPortal } from "react-dom";

import {
  IconButton,
  NewsRollDivider,
  PillTabMenu,
  PrimaryButton,
  PrimaryButtonGroup,
  TextInput,
} from "@/design-system/components";
import { getEnterFromRightMotionClassName } from "@/design-system/templates";
import { type BlockedKeywordSetting } from "@/features/news/NewsViews";

type CategoryGroup = {
  title: string;
};

function BlockedKeywordDialog({
  onCancel,
  onInputChange,
  onSave,
  value,
}: {
  onCancel: () => void;
  onInputChange: (value: string) => void;
  onSave: () => void;
  value: string;
}) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="container_myDialog"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="wrapper_myDialogContent"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text_myDialogTitle">차단 키워드 추가</h3>
        <TextInput
          aria-label="차단할 키워드"
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="키워드를 입력해주세요."
          type="text"
          value={value}
        />
        <PrimaryButtonGroup columns={2}>
          <PrimaryButton
            onClick={onCancel}
            tone="neutral"
            type="button"
          >
            취소
          </PrimaryButton>
          <PrimaryButton
            disabled={!value.trim()}
            onClick={onSave}
            type="button"
          >
            저장
          </PrimaryButton>
        </PrimaryButtonGroup>
      </div>
    </div>,
    document.body,
  );
}

function BlockedKeywordSettingsSection({
  blockedKeywordSettings,
  inputValue,
  isDialogOpen,
  onCancelDialog,
  onInputChange,
  onKeywordDelete,
  onKeywordToggle,
  onOpenDialog,
  onSaveKeyword,
}: {
  blockedKeywordSettings: BlockedKeywordSetting[];
  inputValue: string;
  isDialogOpen: boolean;
  onCancelDialog: () => void;
  onInputChange: (value: string) => void;
  onKeywordDelete: (keyword: string) => void;
  onKeywordToggle: (keyword: string) => void;
  onOpenDialog: () => void;
  onSaveKeyword: () => void;
}) {
  return (
    <section className="container_myBlockedKeywordSection">
      <h2 className="text_mySectionTitle">
        {"\uCC28\uB2E8/\uC228\uAE40 \uD0A4\uC6CC\uB4DC \uC124\uC815"}
      </h2>
      <p className="text_myBlockedKeywordDescription">
        {"\uBCF4\uACE0 \uC2F6\uC9C0 \uC54A\uC740 \uD0A4\uC6CC\uB4DC\uAC00 \uB4E4\uC5B4\uAC04 \uB274\uC2A4\uB97C \uC228\uAE38 \uC218 \uC788\uC2B5\uB2C8\uB2E4."}
      </p>
      <div className="wrapper_myBlockedKeywordChips">
        <PillTabMenu
          ariaLabel={"\uCC28\uB2E8 \uD0A4\uC6CC\uB4DC \uBAA9\uB85D"}
          className="tab_myBlockedKeywordMenu"
          getItemState={(keyword) =>
            blockedKeywordSettings.find((setting) => setting.keyword === keyword)
              ?.isActive
              ? "active"
              : "default"
          }
          getItemWrapperClassName={() => "wrapper_myBlockedKeywordTab"}
          items={blockedKeywordSettings.map((setting) => ({
            id: setting.keyword,
            label: setting.keyword,
          }))}
          onChange={onKeywordToggle}
          renderItemAddon={(item, state) =>
            state === "active" ? null : (
                <IconButton
                  icon="close"
                  iconSize={12}
                  label={`${item.label} \uC0AD\uC81C`}
                  onClick={() => onKeywordDelete(item.id)}
                  tone="danger"
                  variant="circle"
                />
              )
          }
          role="group"
          value={blockedKeywordSettings.find((setting) => setting.isActive)?.keyword ?? ""}
        />
        <IconButton
          icon="plus"
          iconSize={12}
          label={"\uCC28\uB2E8 \uD0A4\uC6CC\uB4DC \uCD94\uAC00"}
          onClick={onOpenDialog}
          tone="neutral"
          variant="circle"
        />
      </div>
      {isDialogOpen ? (
        <BlockedKeywordDialog
          onCancel={onCancelDialog}
          onInputChange={onInputChange}
          onSave={onSaveKeyword}
          value={inputValue}
        />
      ) : null}
    </section>
  );
}

export function MyCustomNewsSettingsPage({
  blockedKeywordInputValue,
  blockedKeywordSettings,
  categoryGroups,
  getCategoryTabItems,
  getCategoryValue,
  isBlockedKeywordDialogOpen,
  isLeaving,
  onCancelBlockedKeywordDialog,
  onDeleteBlockedKeyword,
  onInputBlockedKeywordChange,
  onOpenBlockedKeywordDialog,
  onSaveBlockedKeyword,
  onToggleBlockedKeyword,
  onToggleCategorySetting,
  selectedCategorySettings,
}: {
  blockedKeywordInputValue: string;
  blockedKeywordSettings: BlockedKeywordSetting[];
  categoryGroups: readonly CategoryGroup[];
  getCategoryTabItems: (groupIndex: number) => { id: string; label: string }[];
  getCategoryValue: (groupIndex: number) => string;
  isBlockedKeywordDialogOpen: boolean;
  isLeaving: boolean;
  onCancelBlockedKeywordDialog: () => void;
  onDeleteBlockedKeyword: (keyword: string) => void;
  onInputBlockedKeywordChange: (value: string) => void;
  onOpenBlockedKeywordDialog: () => void;
  onSaveBlockedKeyword: () => void;
  onToggleBlockedKeyword: (keyword: string) => void;
  onToggleCategorySetting: (groupIndex: number, optionId: string) => void;
  selectedCategorySettings: Set<string>[];
}) {
  return (
    <div
      className={`container_mySettingsPage ${getEnterFromRightMotionClassName(isLeaving)}`}
    >
      <h2 className="text_myTimeTitle">맞춤 뉴스 설정</h2>
      {categoryGroups.map((group, groupIndex) => (
        <Fragment key={group.title}>
          {groupIndex > 0 ? (
            <NewsRollDivider className="divider_mySection" />
          ) : null}
          <section className="container_myCategorySection">
            <h2 className="text_mySectionTitle">{group.title}</h2>
            <PillTabMenu
              ariaLabel={group.title}
              className="tab_myCategoryMenu"
              getItemState={(optionId) => {
                const isSelected =
                  selectedCategorySettings[groupIndex]?.has(optionId) ?? false;

                if (isSelected) {
                  return "active";
                }

                return "default";
              }}
              items={getCategoryTabItems(groupIndex)}
              keyboardNavigation={groupIndex === 1}
              onChange={(optionId) => onToggleCategorySetting(groupIndex, optionId)}
              role={groupIndex === 1 ? "radiogroup" : "group"}
              value={getCategoryValue(groupIndex)}
            />
          </section>
        </Fragment>
      ))}
      <NewsRollDivider className="divider_mySection" />
      <BlockedKeywordSettingsSection
        blockedKeywordSettings={blockedKeywordSettings}
        inputValue={blockedKeywordInputValue}
        isDialogOpen={isBlockedKeywordDialogOpen}
        onCancelDialog={onCancelBlockedKeywordDialog}
        onInputChange={onInputBlockedKeywordChange}
        onKeywordDelete={onDeleteBlockedKeyword}
        onKeywordToggle={onToggleBlockedKeyword}
        onOpenDialog={onOpenBlockedKeywordDialog}
        onSaveKeyword={onSaveBlockedKeyword}
      />
    </div>
  );
}

import { Fragment } from "react";

import {
  Button,
  Icon,
  NewsRollDivider,
  PillTabMenu,
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
  return (
    <div className="container_myDialog" role="dialog" aria-modal="true">
      <div className="wrapper_myDialogContent">
        <h3 className="text_myDialogTitle">차단 키워드 추가</h3>
        <TextInput
          aria-label="차단할 키워드"
          inputSize="large"
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="키워드를 입력해주세요."
          radius="rounded"
          type="text"
          value={value}
          variant="outline"
        />
        <div className="wrapper_myDialogActions">
          <Button
            className="btn_myDialogCancel"
            onClick={onCancel}
            radius="rounded"
            size="medium"
            type="button"
            variant="outline"
          >
            취소
          </Button>
          <Button
            className="btn_myDialogSave"
            disabled={!value.trim()}
            onClick={onSave}
            radius="rounded"
            size="medium"
            type="button"
          >
            저장
          </Button>
        </div>
      </div>
    </div>
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
      <div className="wrapper_myBlockedKeywordHeader">
        <div>
          <h2 className="text_mySectionTitle">차단/숨김 키워드 설정</h2>
          <p className="text_myBlockedKeywordDescription">
            보고 싶지 않은 키워드가 들어간 뉴스를 숨길 수 있습니다.
          </p>
        </div>
        <button
          aria-label="차단 키워드 추가"
          className="btn_myBlockedKeywordAdd"
          onClick={onOpenDialog}
          type="button"
        >
          <Icon name="plus" />
        </button>
      </div>
      <div className="wrapper_myBlockedKeywordList">
        {blockedKeywordSettings.map((setting) => (
          <div className="wrapper_myBlockedKeywordItem" key={setting.id}>
            <button
              aria-pressed={setting.isActive}
              className="btn_myBlockedKeywordToggle"
              onClick={() => onKeywordToggle(setting.keyword)}
              type="button"
            >
              {setting.keyword}
            </button>
            <button
              aria-label={`${setting.keyword} 삭제`}
              className="btn_myBlockedKeywordDelete"
              onClick={() => onKeywordDelete(setting.keyword)}
              type="button"
            >
              삭제
            </button>
          </div>
        ))}
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

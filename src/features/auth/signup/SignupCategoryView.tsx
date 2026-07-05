import { useState } from "react";

import {
  PillTabMenu,
  PrimaryButton,
  PrimaryButtonGroup,
} from "@/design-system/components";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthValidationError } from "@/features/auth/components/AuthValidationError";
import {
  defaultSignupCategoryIds,
  signupCategoryItems,
  type SignupCategoryId,
} from "@/features/auth/signup-profile-model";

export function SignupCategoryView({
  isSubmitting = false,
  onBack,
  submitError,
  onNext,
}: {
  isSubmitting?: boolean;
  onBack: () => void;
  submitError?: string;
  onNext: (categoryIds: SignupCategoryId[]) => Promise<void> | void;
}) {
  const [selectedCategories, setSelectedCategories] = useState<SignupCategoryId[]>(
    defaultSignupCategoryIds,
  );
  const tabValue = selectedCategories[0] ?? signupCategoryItems[0].id;

  function toggleCategory(categoryId: SignupCategoryId) {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  return (
    <AuthLayout ariaLabel="관심 카테고리 선택">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">관심 카테고리 선택</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedCategories.length > 0 && !isSubmitting) {
              onNext(selectedCategories);
            }
          }}
        >
          <PillTabMenu
            ariaLabel="관심 카테고리 선택"
            className="wrapper_authTabMenu wrapper_tabScroller"
            getItemState={(id) => (selectedCategories.includes(id) ? "active" : "default")}
            items={signupCategoryItems}
            keyboardNavigation={false}
            onChange={toggleCategory}
            role="group"
            value={tabValue}
          />

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={selectedCategories.length === 0 || isSubmitting}


            type="submit"

          >
            시작하기
          </PrimaryButton>
      </PrimaryButtonGroup>
          <AuthValidationError id="signup-submit-error" message={submitError} />
        </form>
      </div>
    </AuthLayout>
  );
}


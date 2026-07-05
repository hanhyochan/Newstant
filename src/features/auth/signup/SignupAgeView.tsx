import { useState } from "react";

import {
  PillTabMenu,
  PrimaryButton,
  PrimaryButtonGroup,
} from "@/design-system/components";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import {
  signupAgeItems,
  type SignupAgeId,
} from "@/features/auth/signup-profile-model";

export function SignupAgeView({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (ageId: SignupAgeId) => void;
}) {
  const [selectedAge, setSelectedAge] = useState<SignupAgeId | null>(null);

  return (
    <AuthLayout ariaLabel="나의 연령대 선택">
      <div className="wrapper_signupStepContent">
        <AuthBackButton onClick={onBack} />
        <h1 className="text_loginTitle">나의 연령대 선택</h1>

        <form
          className="form_signupStep"
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedAge) {
              onNext(selectedAge);
            }
          }}
        >
          <PillTabMenu
            ariaLabel="나의 연령대 선택"
            className="wrapper_authTabMenu wrapper_tabScroller"
            getItemState={(id) => (selectedAge === id ? "active" : "default")}
            items={signupAgeItems}
            onChange={setSelectedAge}
            role="group"
            value={selectedAge ?? signupAgeItems[0].id}
          />

          <PrimaryButtonGroup>
        <PrimaryButton
            className="btn_signupStepNext"
            disabled={!selectedAge}


            type="submit"

          >
            다음
          </PrimaryButton>
      </PrimaryButtonGroup>
        </form>
      </div>
    </AuthLayout>
  );
}


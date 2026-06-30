import type { Meta, StoryObj } from "@storybook/react";

import { SocialLoginButton } from "./social-login-button";

const providers = ["google", "naver", "kakao"] as const;

const meta: Meta<typeof SocialLoginButton> = {
  title: "Design System/Components/Button/Social Login Button",
  component: SocialLoginButton,
  parameters: {
    layout: "centered",
  },
  args: {
    provider: "kakao",
  },
  argTypes: {
    provider: { control: "radio", options: providers },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ProviderOptions: Story = {
  render: () => (
    <div className="ds_inline_stack">
      {providers.map((provider) => (
        <SocialLoginButton key={provider} provider={provider} />
      ))}
    </div>
  ),
};

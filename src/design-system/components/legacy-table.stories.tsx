import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  id: "design-system-components-table",
  title: "Design System/Components/Legacy Table",
  tags: ["docs-only"],
  parameters: {
    controls: { disable: true },
    docs: { disable: true },
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: "var(--size-320)" }}>
      <h2 className="type-title_2">Table story removed</h2>
      <p className="type-body_2">
        Table was removed from Storybook components. Use the component overview
        or foundation pages instead.
      </p>
    </div>
  ),
};


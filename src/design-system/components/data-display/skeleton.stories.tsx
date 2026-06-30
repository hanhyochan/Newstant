import type { Meta, StoryObj } from "@storybook/react";

import { Skeleton, SkeletonList, type SkeletonShape, type SkeletonWidth } from "./skeleton";

const shapes: SkeletonShape[] = ["text", "title", "chip", "media", "thumbnail", "circle"];
const widths: SkeletonWidth[] = ["full", "lg", "md", "sm", "xs"];

const meta: Meta<typeof Skeleton> = {
  title: "Design System/Components/Data Display/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
  },
  args: {
    shape: "text",
    width: "full",
  },
  argTypes: {
    shape: { control: "select", options: shapes },
    width: { control: "select", options: widths },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ShapeOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 360 }}>
      {shapes.map((shape) => (
        <div className="ds_stack" key={shape}>
          <span className="type-caption_1">{shape}</span>
          <Skeleton shape={shape} width={shape === "circle" ? "xs" : "full"} />
        </div>
      ))}
    </div>
  ),
};

export const WidthOptions: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 360 }}>
      {widths.map((width) => (
        <div className="ds_stack" key={width}>
          <span className="type-caption_1">{width}</span>
          <Skeleton shape="text" width={width} />
        </div>
      ))}
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div className="ds_stack" style={{ width: 360 }}>
      <SkeletonList
        count={3}
        renderItem={(index) => (
          <div className="ds_stack" key={index}>
            <Skeleton shape="title" width="lg" />
            <Skeleton shape="text" width="full" />
            <Skeleton shape="text" width="md" />
          </div>
        )}
      />
    </div>
  ),
};

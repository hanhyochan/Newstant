import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Chip } from "./chip";
import { DataTable } from "./data-table";
import { Select } from "./select";
import { Tabs } from "./tab";
import { Textarea } from "./textarea";
import { TextInput } from "./text-input";

const meta: Meta = {
  title: "Design System/Components/Overview",
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj;

const tabItems = [
  { id: "home", label: "Home", panel: "Home panel" },
  { id: "saved", label: "Saved", panel: "Saved panel" },
  { id: "settings", label: "Settings", panel: "Settings panel" },
];

const selectOptions = [
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
  { label: "Saved", value: "saved" },
];

export const AllComponents: Story = {
  render: () => (
    <div className="ds_stack">
      <Section title="Button">
        <div className="ds_inline_stack">
          <Button>Filled</Button>
          <Button variant="outline">Outline</Button>
          <Button radius="full">Full rounded</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Tab">
        <Tabs items={tabItems} />
      </Section>

      <Section title="Text Input">
        <div className="ds_stack" style={{ width: "var(--size-320)" }}>
          <TextInput placeholder="Outline rounded" />
          <TextInput placeholder="Filled full rounded" radius="full" variant="filled" />
          <TextInput placeholder="Error" state="error" />
        </div>
      </Section>

      <Section title="Textarea">
        <div style={{ width: "var(--size-320)" }}>
          <Textarea placeholder="Textarea" />
        </div>
      </Section>

      <Section title="Select">
        <div style={{ width: "var(--size-320)" }}>
          <Select options={selectOptions} />
        </div>
      </Section>

      <Section title="Chip">
        <div className="ds_inline_stack">
          <Chip variant="filled">Filled</Chip>
          <Chip variant="outline">Outline</Chip>
          <Chip variant="gray_line_outline">Gray line</Chip>
        </div>
      </Section>

      <Section title="Badge">
        <div className="ds_inline_stack">
          <Badge>Filled</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="gray_line_outline">Gray line</Badge>
          <Badge size="medium">Medium</Badge>
        </div>
      </Section>

      <Section title="Card">
        <Card style={{ width: "var(--size-320)" }} variant="gray_line_outline">
          <div className="ds_stack">
            <Badge>Pattern</Badge>
            <h3 className="type-title_2">Card pattern</h3>
            <p className="type-body_2">Radius, border, shadow, and spacing from the system.</p>
          </div>
        </Card>
      </Section>

      <Section title="Table">
        <DataTable />
      </Section>
    </div>
  ),
};

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="ds_stack">
      <h2 className="type-title_1">{title}</h2>
      {children}
    </section>
  );
}

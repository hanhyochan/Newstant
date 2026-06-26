import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";

const meta: Meta = {
  title: "Design System/Foundation",
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj;

type Token = {
  name: string;
  value: string;
};

const typographyClasses = [
  { className: "type-display_1", label: "Display 1" },
  { className: "type-display_2", label: "Display 2" },
  { className: "type-display_3", label: "Display 3" },
  { className: "type-headline_1", label: "Headline 1" },
  { className: "type-headline_2", label: "Headline 2" },
  { className: "type-headline_3", label: "Headline 3" },
  { className: "type-title_1", label: "Title 1" },
  { className: "type-title_2", label: "Title 2" },
  { className: "type-body_1", label: "Body 1" },
  { className: "type-body_2", label: "Body 2" },
  { className: "type-label_1", label: "Label 1" },
  { className: "type-caption_1", label: "Caption 1" },
  { className: "type-caption_2", label: "Caption 2" },
  { className: "type-caption_3", label: "Caption 3" },
];

export const Colors: Story = {
  render: () => <ColorTokens />,
};

export const Spacing: Story = {
  render: () => <SpacingTokens />,
};

export const Radius: Story = {
  render: () => (
    <NamedTokenPage
      filter={(token) =>
        [
          "--radius-0",
          "--radius-2",
          "--radius-8",
          "--radius-16",
          "--radius-20",
          "--radius-24",
          "--radius-32",
          "--radius-40",
          "--radius-full",
        ].includes(token.name)
      }
      preview="radius"
      title="Radius"
    />
  ),
};

export const Border: Story = {
  render: () => <NamedTokenPage prefix="--border-" preview="border" title="Border" />,
};

export const Shadow: Story = {
  render: () => (
    <NamedTokenPage
      filter={(token) => /^--shadow-\d/.test(token.name)}
      preview="shadow"
      title="Shadow"
    />
  ),
};

export const Typography: Story = {
  render: () => <TypographyPage />,
};

function ColorTokens() {
  const tokens = useCssVariableTokens();
  const colorTokens = useMemo(
    () => tokens.filter((token) => token.name.startsWith("--color-")),
    [tokens],
  );
  const colorGroups = useMemo(() => groupColorTokens(colorTokens), [colorTokens]);

  return (
    <div className="ds_stack">
      <PageHeader title="Colors" tokens={colorTokens} />
      <div className="ds_stack">
        <h2 className="type-title_1">Color Tokens</h2>
        {colorGroups.palette.map(([groupName, groupTokens]) => (
          <ColorGroup groupName={groupName} tokens={groupTokens} key={groupName} />
        ))}
      </div>
      <div className="ds_stack">
        <h2 className="type-title_1">Brand Color Tokens</h2>
        {colorGroups.brand.map(([groupName, groupTokens]) => (
          <ColorGroup groupName={groupName} tokens={groupTokens} key={groupName} />
        ))}
      </div>
      <div className="ds_stack">
        <h2 className="type-title_1">Semantic Color Tokens</h2>
        {colorGroups.semantic.map(([groupName, groupTokens]) => (
          <ColorGroup groupName={groupName} tokens={groupTokens} key={groupName} />
        ))}
      </div>
    </div>
  );
}

function SpacingTokens() {
  const tokens = useCssVariableTokens();
  const spacingGroups = useMemo(() => {
    const spacingTokens = tokens.filter((token) =>
      token.name.startsWith("--spacing-"),
    );

    return {
      all: spacingTokens,
      paddingHorizontal: getOrderedTokens(spacingTokens, "--spacing-padding-horizontal-"),
      paddingVertical: getOrderedTokens(spacingTokens, "--spacing-padding-vertical-"),
      gapHorizontal: getOrderedTokens(spacingTokens, "--spacing-gap-horizontal-"),
      gapVertical: getOrderedTokens(spacingTokens, "--spacing-gap-vertical-"),
    };
  }, [tokens]);

  return (
    <div className="ds_stack">
      <PageHeader title="Spacing" tokens={spacingGroups.all} />
      <TokenSection title="Padding Horizontal" tokens={spacingGroups.paddingHorizontal} />
      <TokenSection title="Padding Vertical" tokens={spacingGroups.paddingVertical} />
      <TokenSection title="Gap Horizontal" tokens={spacingGroups.gapHorizontal} />
      <TokenSection title="Gap Vertical" tokens={spacingGroups.gapVertical} />
    </div>
  );
}

function NamedTokenPage({
  filter,
  prefix,
  preview,
  title,
}: {
  filter?: (token: Token) => boolean;
  prefix?: string;
  preview?: "border" | "radius" | "shadow";
  title: string;
}) {
  const tokens = useCssVariableTokens();
  const pageTokens = useMemo(() => {
    const filteredTokens = tokens.filter((token) =>
      filter ? filter(token) : prefix ? token.name.startsWith(prefix) : false,
    );

    return sortTokens(filteredTokens);
  }, [filter, prefix, tokens]);

  return (
    <div className="ds_stack">
      <PageHeader title={title} tokens={pageTokens} />
      <TokenSection preview={preview} title={title} tokens={pageTokens} />
    </div>
  );
}

function TypographyPage() {
  const tokens = useCssVariableTokens();
  const typographyTokens = useMemo(
    () =>
      sortTokens(
        tokens.filter(
          (token) =>
            token.name.startsWith("--font-size-") ||
            token.name.startsWith("--line-height-"),
        ),
      ),
    [tokens],
  );

  return (
    <div className="ds_stack">
      <PageHeader title="Typography" tokens={typographyTokens} />
      <section className="ds_stack">
        <h2 className="type-title_1">Typography Styles</h2>
        <div className="ds_stack">
          {typographyClasses.map((item) => (
            <TypographyStyleRow item={item} key={item.className} />
          ))}
        </div>
      </section>
      <TokenSection title="Typography Variables" tokens={typographyTokens} />
    </div>
  );
}

function TypographyStyleRow({
  item,
}: {
  item: (typeof typographyClasses)[number];
}) {
  const [metrics, setMetrics] = useState({
    fontSize: "",
    lineHeight: "",
  });

  useEffect(() => {
    const element = document.querySelector<HTMLElement>(
      `[data-type-style="${item.className}"]`,
    );

    if (!element) {
      return;
    }

    const computedStyle = getComputedStyle(element);

    setMetrics({
      fontSize: computedStyle.fontSize,
      lineHeight: computedStyle.lineHeight,
    });
  }, [item.className]);

  return (
    <article
      className="card"
      style={{
        display: "grid",
        gap: "var(--spacing-gap-vertical-16)",
        width: "100%",
      }}
    >
      <div className="ds_inline_stack">
        <span className="type-caption_1">{item.label}</span>
        <code className="type-caption_1">{item.className}</code>
        {metrics.fontSize && metrics.lineHeight ? (
          <span className="type-caption_1">
            {metrics.fontSize} / {metrics.lineHeight}
          </span>
        ) : null}
      </div>
      <p
        className={item.className}
        data-type-style={item.className}
        style={{
          whiteSpace: "pre-line",
        }}
      >
        {"뉴스를 읽는 새로운 흐름\nNewsRoll typography sample"}
      </p>
    </article>
  );
}

function PageHeader({ title, tokens }: { title: string; tokens: Token[] }) {
  return (
    <section className="card ds_stack">
      <h1 className="type-title_1">{title}</h1>
      <span className="badge badge_small">{tokens.length} tokens</span>
    </section>
  );
}

function ColorGroup({
  groupName,
  tokens,
}: {
  groupName: string;
  tokens: Token[];
}) {
  return (
    <section className="ds_stack">
      <h3 className="type-title_2">{groupName}</h3>
      <div
        style={{
          display: "grid",
          gap: "var(--spacing-gap-vertical-16)",
          gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
        }}
      >
        {tokens.map((token) => (
          <article className="card ds_stack" key={token.name}>
            <div
              aria-hidden="true"
              style={{
                background: `var(${token.name})`,
                border: "var(--border-1) solid var(--color-line-normal-neutral)",
                borderRadius: "var(--radius-8)",
                height: "var(--size-44)",
              }}
            />
            <TokenName token={token} />
          </article>
        ))}
      </div>
    </section>
  );
}

function TokenSection({
  preview,
  title,
  tokens,
}: {
  preview?: "border" | "radius" | "shadow";
  title: string;
  tokens: Token[];
}) {
  return (
    <section className="ds_stack">
      <h2 className="type-title_1">{title}</h2>
      <div
        style={{
          display: "grid",
          gap: "var(--spacing-gap-vertical-16)",
          gridTemplateColumns:
            preview === "radius"
              ? "repeat(auto-fill, minmax(var(--size-320), 1fr))"
              : "repeat(auto-fill, minmax(var(--size-112), 1fr))",
        }}
      >
        {tokens.map((token) => (
          <article className="card ds_stack" key={token.name}>
            {preview ? <TokenPreview preview={preview} token={token} /> : null}
            <TokenName token={token} />
          </article>
        ))}
      </div>
    </section>
  );
}

function TokenPreview({
  preview,
  token,
}: {
  preview: "border" | "radius" | "shadow";
  token: Token;
}) {
  if (preview === "border") {
    return (
      <div
        aria-hidden="true"
        style={{
          alignItems: "center",
          display: "flex",
          height: "var(--size-44)",
        }}
      >
        <div
          style={{
            borderTop: `var(${token.name}) solid var(--color-line-normal-neutral)`,
            width: "100%",
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        background: "var(--color-background-elevated-normal)",
        border: "var(--border-1) solid var(--color-line-normal-neutral)",
        borderRadius: preview === "radius" ? `var(${token.name})` : "var(--radius-8)",
        boxShadow: preview === "shadow" ? `var(${token.name})` : undefined,
        height: preview === "radius" ? "var(--size-112)" : "var(--size-44)",
        width: preview === "radius" ? "var(--size-320)" : undefined,
      }}
    />
  );
}

function TokenName({ token }: { token: Token }) {
  return (
    <div className="ds_stack">
      <code className="type-caption_1">{token.name}</code>
      <span className="type-caption_2">{token.value}</span>
    </div>
  );
}

function useCssVariableTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    const nextTokens: Token[] = [];

    for (let index = 0; index < computedStyle.length; index += 1) {
      const name = computedStyle.item(index);

      if (!name.startsWith("--")) {
        continue;
      }

      nextTokens.push({
        name,
        value: computedStyle.getPropertyValue(name).trim(),
      });
    }

    setTokens(sortTokens(nextTokens));
  }, []);

  return tokens;
}

function groupColorTokens(tokens: Token[]) {
  const palette = new Map<string, Token[]>();
  const brand = new Map<string, Token[]>();
  const semantic = new Map<string, Token[]>();

  for (const token of tokens) {
    const groupName = getColorGroupName(token.name);
    const category = getColorGroupCategory(groupName);
    const target =
      category === "brand" ? brand : category === "semantic" ? semantic : palette;
    const groupTokens = target.get(groupName) ?? [];

    groupTokens.push(token);
    target.set(groupName, groupTokens);
  }

  for (const group of [palette, brand, semantic]) {
    for (const [groupName, groupTokens] of group) {
      group.set(groupName, sortTokens(groupTokens));
    }
  }

  return {
    palette: orderGroups(palette, [
      "common",
      "neutral",
      "cool-neutral",
      "blue",
      "red",
      "red-orange",
      "orange",
      "yellow",
      "green",
      "lime",
      "cyan",
      "light-blue",
      "violet",
      "purple",
      "pink",
    ]),
    brand: orderGroups(brand, [
      "newsroll-purple",
      "artskorealab-yellow",
      "artskorealab-cyan",
      "artskorealab-purple",
      "virtualdream-red",
    ]),
    semantic: orderGroups(semantic, [
      "accent-background",
      "accent-foreground",
      "background",
      "fill",
      "interaction",
      "inverse",
      "label",
      "line",
      "material",
      "static",
      "status",
      "alpha-shadow",
      "opacity",
    ]),
  };
}

function getColorGroupName(tokenName: string) {
  const withoutPrefix = tokenName.replace("--color-", "");
  const knownGroups = [
    "accent-background",
    "accent-foreground",
    "background",
    "cool-neutral",
    "red-orange",
    "light-blue",
    "line",
    "label",
    "fill",
    "interaction",
    "inverse",
    "material",
    "static",
    "status",
    "alpha-shadow",
    "opacity",
    "artskorealab-yellow",
    "artskorealab-cyan",
    "artskorealab-purple",
    "newsroll-purple",
    "virtualdream-red",
  ];
  const matchedGroup = knownGroups.find((group) =>
    withoutPrefix.startsWith(`${group}-`),
  );

  if (matchedGroup) {
    return matchedGroup;
  }

  return withoutPrefix.split("-")[0];
}

function getColorGroupCategory(groupName: string) {
  const brandGroups = [
    "newsroll-purple",
    "artskorealab-yellow",
    "artskorealab-cyan",
    "artskorealab-purple",
    "virtualdream-red",
  ];
  const semanticGroups = [
    "accent-background",
    "accent-foreground",
    "background",
    "fill",
    "interaction",
    "inverse",
    "label",
    "line",
    "material",
    "static",
    "status",
    "alpha-shadow",
    "opacity",
  ];

  if (brandGroups.includes(groupName)) {
    return "brand";
  }

  if (semanticGroups.includes(groupName)) {
    return "semantic";
  }

  return "palette";
}

function getOrderedTokens(tokens: Token[], prefix: string) {
  return sortTokens(tokens.filter((token) => token.name.startsWith(prefix)));
}

function sortTokens(tokens: Token[]) {
  return [...tokens].sort((first, second) => {
    const firstColorStep = getColorStep(first.name);
    const secondColorStep = getColorStep(second.name);

    if (
      firstColorStep !== null &&
      secondColorStep !== null &&
      firstColorStep !== secondColorStep
    ) {
      return firstColorStep - secondColorStep;
    }

    const firstNumber = getLastNumericPart(first.name);
    const secondNumber = getLastNumericPart(second.name);

    if (firstNumber !== null && secondNumber !== null && firstNumber !== secondNumber) {
      return firstNumber - secondNumber;
    }

    return first.name.localeCompare(second.name);
  });
}

function getLastNumericPart(value: string) {
  const match = value.match(/(\d+(?:-\d+)?)(?:px)?$/);

  if (!match) {
    return null;
  }

  return Number(match[1].replace("-", "."));
}

function getColorStep(value: string) {
  const match = value.match(/-(\d+(?:-\d+)?)$/);

  if (!match) {
    return null;
  }

  return Number(match[1].replace("-", "."));
}

function orderGroups(groups: Map<string, Token[]>, preferredOrder: string[]) {
  const preferred = preferredOrder
    .filter((groupName) => groups.has(groupName))
    .map((groupName) => [groupName, groups.get(groupName) ?? []] as [string, Token[]]);
  const remaining = Array.from(groups.entries())
    .filter(([groupName]) => !preferredOrder.includes(groupName))
    .sort(([first], [second]) => first.localeCompare(second));

  return [...preferred, ...remaining];
}

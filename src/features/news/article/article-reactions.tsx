import type { Ref } from "react";

import {
  IconTextButton,
  type IconName,
} from "@/design-system/components";

export type Reaction = "like" | "dislike" | "neutral" | null;
export type ReactionValue = Exclude<Reaction, null>;

const reactionItems: {
  icon: IconName;
  label: string;
  value: ReactionValue;
}[] = [
  { icon: "thumbUp", label: "좋아요", value: "like" },
  { icon: "thumbDown", label: "싫어요", value: "dislike" },
  { icon: "dots", label: "글쎄요", value: "neutral" },
];

export function getVisibleReactionCount(count: number) {
  return count > 0 ? count : null;
}

export function ReactionControls({
  className = "",
  counts,
  reaction,
  onReactionChange,
  rootRef,
}: {
  className?: string;
  counts: Record<ReactionValue, number>;
  reaction: Reaction;
  onReactionChange: (reaction: Reaction) => void;
  rootRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={rootRef}
      className={`wrapper_articleReaction ${className}`.trim()}
      aria-label="기사 평가"
      role="group"
    >
      {reactionItems.map((item) => (
        <IconTextButton
          aria-pressed={reaction === item.value}
          icon={item.icon}
          key={item.value}
          onClick={() =>
            onReactionChange(reaction === item.value ? null : item.value)
          }
          tone={item.value}
          size="default"
        >
          <strong>
            {item.label}
            {getVisibleReactionCount(counts[item.value]) == null
              ? ""
              : ` ${counts[item.value]}`}
          </strong>
        </IconTextButton>
      ))}
    </div>
  );
}

export function MiniReactionControls({
  counts,
  isVisible,
  reaction,
  onReactionChange,
}: {
  counts: Record<ReactionValue, number>;
  isVisible: boolean;
  reaction: Reaction;
  onReactionChange: (reaction: Reaction) => void;
}) {
  return (
    <span
      aria-label="기사 빠른 반응"
      className={`wrapper_articleMiniReaction${isVisible ? " is_visible" : ""}`}
      role="group"
    >
      {reactionItems.map((item) => {
        const visibleCount = getVisibleReactionCount(counts[item.value]);

        return (
          <IconTextButton
            aria-label={`${item.label} 빠른 반응`}
            aria-pressed={reaction === item.value}
            icon={item.icon}
            key={item.value}
            onClick={() =>
              onReactionChange(reaction === item.value ? null : item.value)
            }
            size="small"
            tone={item.value}
          >
            {visibleCount ?? ""}
          </IconTextButton>
        );
      })}
    </span>
  );
}

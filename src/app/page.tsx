import type { CSSProperties } from "react";

import { Button } from "@/design-system/components/button";
import { Chip } from "@/design-system/components/chip";

import styles from "./page.module.css";

const navItems = [
  { active: true, label: "홈", src: "/icons/Vector-5.svg" },
  { active: false, label: "글로벌", src: "/icons/Group 26672.svg" },
  { active: false, label: "알림", src: "/icons/Vector-6.svg" },
  { active: false, label: "계정", src: "/icons/Group.svg" },
  { active: false, label: "지원", src: "/icons/Group 26673.svg" },
] as const;

const articleActions = [
  { label: "공유", src: "/icons/Group 26674.svg" },
  { label: "북마크", src: "/icons/Vector 22.svg" },
] as const;

export default function HomePage() {
  return (
    <main className={styles.shell}>
      <div className={styles.frame}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <button className={styles.plainIconButton} type="button">
              <span className={styles.typeScale}>
                가가
                <span className={styles.typeScaleDot} aria-hidden="true" />
              </span>
            </button>
            <button
              className={`${styles.plainIconButton} ${styles.menuButton}`}
              type="button"
              aria-label="메뉴"
            >
              <MaskIcon src="/icons/Vector-7.svg" size={24} color="var(--color-common-100)" />
            </button>
          </div>

          <div className={styles.heroCopy}>
            <p className={`${styles.greeting} type-title_2`}>
              반갑습니다 <strong>콩콩이님!</strong>
            </p>
            <div className={styles.metric}>
              <span className={styles.metricValue}>11,343</span>
              <span className={styles.metricUnit}>개</span>
            </div>
            <p className={styles.heroMessage}>새로운 소식이 있습니다.</p>
          </div>

          <div className={styles.heroTop}>
            <div className={styles.switcher} aria-label="보기 전환">
              <button
                className={`${styles.switcherButton} ${styles.switcherButtonActive}`}
                type="button"
                aria-pressed="true"
                aria-label="목록 보기"
              >
                <span className={styles.listGlyph} aria-hidden="true" />
              </button>
              <button
                className={styles.switcherButton}
                type="button"
                aria-pressed="false"
                aria-label="격자 보기"
              >
                <span className={styles.gridGlyph} aria-hidden="true" />
              </button>
            </div>
            <Button
              aria-label="알림"
              className={styles.bellButton}
              iconOnly
              radius="full"
              size="large"
            >
              <MaskIcon src="/icons/Vector-4.svg" size={24} color="var(--color-common-0)" />
            </Button>
          </div>
        </section>

        <section className={styles.sheet}>
          <Button
            aria-label="검색"
            className={styles.searchFab}
            iconOnly
            radius="full"
            size="large"
          >
            <MaskIcon src="/icons/Vector-9.svg" size={32} color="var(--color-common-0)" />
          </Button>

          <div className={styles.sheetContent}>
            <article className={styles.storyCard}>
              <Chip
                chipSize="small"
                className={styles.categoryChip}
                radius="full"
                variant="filled"
              >
                정치
              </Chip>
              <h1 className={styles.storyTitle}>용인 수지, 강남·분당 가격 동조화로 15억 시대 진입</h1>
              <div className={styles.storyMeta}>
                <span className={`${styles.storyDate} type-caption_1`}>2026년 12월 31일 08:30</span>
                <div className={styles.storyActions}>
                  {articleActions.map((action) => (
                    <button
                      className={styles.actionButton}
                      key={action.label}
                      type="button"
                      aria-label={action.label}
                    >
                      <MaskIcon src={action.src} size={20} color="var(--color-neutral-70)" />
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.imageFrame}>
                <img
                  alt="부동산 기사 대표 이미지"
                  className={styles.storyImage}
                  src="/images/home-article-photo.png"
                />
              </div>
            </article>
          </div>

          <nav className={styles.bottomNav} aria-label="주요 탐색">
            {navItems.map((item) => (
              <button
                aria-current={item.active ? "page" : undefined}
                aria-label={item.label}
                className={`${styles.navItem} ${item.active ? styles.navItemActive : ""}`}
                key={item.label}
                type="button"
              >
                <MaskIcon
                  src={item.src}
                  size={24}
                  color={item.active ? "var(--color-brand-50)" : "var(--color-label-strong)"}
                />
                <span className={styles.visuallyHidden}>{item.label}</span>
              </button>
            ))}
          </nav>
        </section>
      </div>
    </main>
  );
}

function MaskIcon({
  color,
  size,
  src,
}: {
  color: string;
  size: number;
  src: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={styles.maskIcon}
      style={
        {
          "--icon-color": color,
          "--icon-mask": `url("${src}")`,
          "--icon-size": `${size}px`,
        } as CSSProperties
      }
    />
  );
}

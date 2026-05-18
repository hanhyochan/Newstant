"use client";

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from "react";

import {
  BreakingNewsLink,
  Button,
  ChipLabel,
  CommentComposerInput,
  Icon,
  IconButton,
  NewsViewToggle,
  PillTabMenu,
  ReactionButton,
  Select,
  TextInput,
  Textarea,
  type IconName,
  type PillTabItem,
} from "@/design-system/components";

type Tab = "home" | "all" | "policy" | "my" | "info";
type View = Tab | "search";
type InfoTab = "notice" | "faq" | "inquiry";
type HomeViewMode = "reels" | "block";
type Reaction = "like" | "dislike" | "neutral" | null;
type ReactionValue = Exclude<Reaction, null>;
type CommentReactionValue = "like" | "dislike";
type CommentSortOrder = "latest" | "popular";
type CommentAction = "delete" | "edit";
type SortOrder = "popular" | "latest";
type GuideKind = "stacked" | "binary";
type CommentScrollTarget = {
  bottomGap?: number;
  id: string;
};

type HomeArticle = {
  category: string;
  date: string;
  image: string;
  imageAlt: string;
  guideKind?: GuideKind;
  title: string;
};

type HomeHeaderControls = {
  isTextLarge: boolean;
  mode: HomeViewMode;
  onModeChange: (mode: HomeViewMode) => void;
  onOpenBreakingNews: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
};

type PolicyDetailItem = {
  label: string;
  value: string;
};

type PolicyItem = {
  details: PolicyDetailItem[];
  registeredAt: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: string;
};

type CommentItem = {
  author: string;
  body: string;
  choice: string;
  date: string;
  dislikes: number;
  id: number;
  isMine?: boolean;
  likes: number;
  replies: number;
};

const articleImage = "/images/news-apartment.png";
const homeSheetDockedGap = 16;
const homeSheetInitialGap = 40;
const commentScrollDelayMs = 120;

const homeArticle: HomeArticle = {
  category: "정치",
  date: "2026년 12월 31일 08:30",
  image: articleImage,
  imageAlt: "아파트 단지 전경",
  title: "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
};

const homeBreakingTitle = "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”";

const navItems: { icon: IconName; label: string; tab: Tab }[] = [
  { icon: "home", label: "메인화면", tab: "home" },
  { icon: "earth", label: "전체 뉴스", tab: "all" },
  { icon: "loudspeaker", label: "국가정책", tab: "policy" },
  { icon: "user", label: "마이페이지", tab: "my" },
  { icon: "question", label: "인포메이션", tab: "info" },
];

const noticeItems = [
  {
    date: "2026.12.31",
    title: "NewsRoll 맞춤 알림 설정이 개선되었습니다.",
  },
  {
    date: "2026.12.30",
    title: "개인정보 처리방침 개정 안내",
  },
];

const infoTabs: { id: InfoTab; label: string }[] = [
  { id: "notice", label: "공지사항" },
  { id: "faq", label: "FAQ" },
  { id: "inquiry", label: "1:1 문의" },
];

const faqItems = [
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
  {
    answer: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원).",
    question: "어쩌구 저쩌구 궁금합니다?",
  },
];

const inquiryTypes = ["서비스 이용", "뉴스 제보", "계정 문의", "오류 신고"];
const inquiryOptions = inquiryTypes.map((type) => ({ label: type, value: type }));

const searchSuggestions = [
  "예시텍스트",
  "예시텍스트",
  "예시텍스트",
  "예시텍스트",
  "예시텍스트",
  "예시텍스트",
];

const articleBody = `최근 국내 부동산 시장이 다시 한번 변곡점에 서고 있다. 상반기 동안 이어졌던 거래 회복 흐름이 둔화되며, 시장 전반에 신중한 분위기가 확산되는 모습이다.

특히 수도권과 일부 광역시를 중심으로 매수 심리가 빠르게 식고 있다. 한국부동산연구원이 발표한 자료에 따르면, 기준금리 유지에도 불구하고 주택담보대출 심사 강화와 보유세 부담이 실수요자와 투자자 모두에게 압박으로 작용하고 있다.

전문가들은 당분간 가격 급등이나 급락보다는 지역별 양극화가 심화될 가능성에 주목한다. 정책 변화와 금리 방향성이 명확해지기 전까지는 관망세가 이어질 것이며, 안정적인 실거주 중심의 시장 재편이 예상된다.`;

const guideOptions = [
  "어쩌구 저쩌구해서 어케 해야한다.",
  "상황을 더 지켜본 뒤 판단해야 한다.",
  "정책 지원을 먼저 확대해야 한다.",
];

const binaryGuideOptions = ["그렇다", "아니다"];

const homeReelArticles: HomeArticle[] = [
  { ...homeArticle, guideKind: "stacked" },
];

const reactionItems: { count: number; icon: IconName; label: string; value: ReactionValue }[] = [
  { count: 16, icon: "thumbUp", label: "좋아요", value: "like" },
  { count: 12, icon: "thumbDown", label: "싫어요", value: "dislike" },
  { count: 5, icon: "dots", label: "글쎄요", value: "neutral" },
];


const commentBodies = [
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
  "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트...",
];

const commentTemplates: Omit<CommentItem, "choice">[] = [
  {
    author: "콩콩이",
    body: commentBodies[0],
    date: "2026.12.31 08:30",
    dislikes: 16,
    id: 1,
    likes: 16,
    replies: 13,
  },
  {
    author: "콩콩이",
    body: commentBodies[1],
    date: "2026.12.31 08:30",
    dislikes: 16,
    id: 2,
    likes: 16,
    replies: 13,
  },
  {
    author: "콩콩이",
    body: commentBodies[2],
    date: "2026.12.31 08:30",
    dislikes: 16,
    id: 3,
    likes: 16,
    replies: 13,
  },
];

const commentReplyTemplates = [
  {
    author: "콩콩이",
    body: "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트~~",
    choice: "아모른직다",
    date: "2026.12.31 08:30",
    dislikes: 16,
    likes: 16,
  },
  {
    author: "콩콩이",
    body: "예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트예시텍스트~~",
    choice: "아모른직다",
    date: "2026.12.31 08:30",
    dislikes: 16,
    likes: 16,
  },
];

type CommentReplyItem = (typeof commentReplyTemplates)[number] & {
  id: string;
  isMine?: boolean;
};

const commentSortOptions: { label: string; value: CommentSortOrder }[] = [
  { label: "인기순", value: "popular" },
  { label: "최신순", value: "latest" },
];

const commentActionOptions: { label: string; value: CommentAction }[] = [
  { label: "삭제", value: "delete" },
  { label: "수정", value: "edit" },
];

const allNewsAssets = {
  comment: "https://www.figma.com/api/mcp/asset/3f35cfa2-0bc7-4d2a-9328-60390c1622a1",
  eye: "https://www.figma.com/api/mcp/asset/7c832f0b-f9d8-4bdc-a3df-8602d289353e",
  latest: "https://www.figma.com/api/mcp/asset/e19fd2c5-0cdc-49f3-b038-98f397c30d89",
  relayOne: "https://www.figma.com/api/mcp/asset/1a59a503-73ff-4503-8685-d29d170dbdf5",
  relayTwo: "https://www.figma.com/api/mcp/asset/1e86871e-c835-4bdc-b822-dc9d837e6dd2",
  relayThree: "https://www.figma.com/api/mcp/asset/51809d7f-3c59-4ce6-a2af-54b3350504af",
  relayFour: "https://www.figma.com/api/mcp/asset/530565e8-22ee-49ff-bc51-969b92bb5ee5",
  relayFive: "https://www.figma.com/api/mcp/asset/100ceedd-8afb-44a1-b9d1-1cf93a4c3cb9",
  thumbnail: "https://www.figma.com/api/mcp/asset/1a59a503-73ff-4503-8685-d29d170dbdf5",
};

const allNewsBreaking = [
  "정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”",
  "류지현호, 대만에 4-5 충격패... WVC ‘빨간불’",
  "대통령, 9일 중동 상황 경제/물가 비상 경제점검회의 주재",
  "여야, 민생 법안 처리 일정 두고 원내대표 회동",
  "정부, 수도권 주택 공급 추가 대책 이번 주 발표",
];

const allNewsLatest = [
  { category: "정치", image: allNewsAssets.latest, title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'" },
  { category: "경제", image: allNewsAssets.relayOne, title: "수도권 아파트 거래량 회복세, 실수요 중심으로 재편" },
  { category: "사회", image: allNewsAssets.relayTwo, title: "청년 주거 지원 확대 논의, 지자체별 신청 조건 달라" },
  { category: "국제", image: allNewsAssets.relayThree, title: "중동 긴장 재고조에 원유·물가 변동성 확대 우려" },
  { category: "문화", image: allNewsAssets.relayFour, title: "지역 축제 방문객 증가, 골목상권 매출도 동반 상승" },
];

const allNewsPresses = ["중앙일보", "국민일보", "한겨레"];

const allNewsHeadlinesByPress: Record<string, { image: string; title: string }[]> = {
  국민일보: Array.from({ length: 8 }, (_, index) => ({
    image: [allNewsAssets.thumbnail, allNewsAssets.relayOne, allNewsAssets.relayTwo][index % 3],
    title:
      index % 2 === 0
        ? "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입"
        : "대출 규제 강화 이후 실수요자 관망세 뚜렷",
  })),
  중앙일보: Array.from({ length: 8 }, (_, index) => ({
    image: [allNewsAssets.latest, allNewsAssets.relayThree, allNewsAssets.relayFour][index % 3],
    title:
      index % 2 === 0
        ? "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정"
        : "여야, 예산안 세부 쟁점 두고 막판 협상",
  })),
  한겨레: Array.from({ length: 8 }, (_, index) => ({
    image: [allNewsAssets.relayFive, allNewsAssets.relayTwo, allNewsAssets.thumbnail][index % 3],
    title:
      index % 2 === 0
        ? "청년 주거 정책, 신청 문턱 낮춰야 한다는 지적"
        : "지역 의료 공백 해소 위한 공공지원 논의 확대",
  })),
};

const allNewsRelayCategories = ["정치", "경제", "사회", "문화", "국제"];

const allNewsRelayByCategory: Record<string, { image: string; title: string }[]> = Object.fromEntries(
  allNewsRelayCategories.map((category, categoryIndex) => [
    category,
    Array.from({ length: 7 }, (_, index) => ({
      image:
        [
          allNewsAssets.relayOne,
          allNewsAssets.relayTwo,
          allNewsAssets.relayThree,
          allNewsAssets.relayFour,
          allNewsAssets.relayFive,
        ][(index + categoryIndex) % 5],
      title:
        category === "정치"
          ? index % 2 === 0
            ? "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입"
            : "여야, 민생 법안 처리 두고 본회의 일정 조율"
          : `${category} 주요 이슈 ${index + 1}, 오늘의 흐름을 한눈에 정리`,
    })),
  ]),
);

function NewsToolbar({
  isTextLarge,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  return (
    <div className="newsroll_toolbar" aria-label="상단 도구">
      <Button
        aria-label="글자 크기"
        aria-pressed={isTextLarge}
        classNameOnly
        className="newsroll_text_size_button"
        onClick={onToggleTextSize}
        size="medium"
        variant="filled"
      >
        <Icon name="sizeIncrease" />
      </Button>
      <IconButton baseClassName="newsroll_toolbar_icon" icon="search" label="검색" onClick={onOpenSearch} />
      <IconButton baseClassName="newsroll_toolbar_icon" icon="menu" label="메뉴" />
    </div>
  );
}

function HomeBlockItem({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn_newsBlockItem" onClick={onClick} type="button">
      <strong>{homeArticle.title}</strong>
      <span>1시간 전</span>
      <img alt="" src={homeArticle.image} />
    </button>
  );
}

function HomeMainHeader({
  isTextLarge,
  mode,
  onModeChange,
  onOpenBreakingNews,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls) {
  const [isAlarmOn, setIsAlarmOn] = useState(false);

  return (
    <>
      <header className="container_homeToolbar">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
      </header>

      <section className="container_hero" aria-label="홈 요약">
        <p className="text_greeting">
          반갑습니다 <strong>콩콩이</strong>님!
        </p>
        <p className="wrapper_hero">
          <strong>
            11,343<span className="text_heroUnit">개</span>
          </strong>
          <span className="text_heroCaption">새로운 소식이 있습니다.</span>
        </p>
        <div className="wrapper_homeDockedControls">
          <NewsViewToggle mode={mode} onModeChange={onModeChange} />
          <Button
            aria-label="알림"
            aria-pressed={isAlarmOn}
            className="newsroll_homeDockedAlarm"
            iconOnly
            onClick={() => setIsAlarmOn((current) => !current)}
            radius="full"
            size="large"
            variant="outline"
          >
            <Icon name="alarm" />
          </Button>
        </div>
      </section>

      <div className="wrapper_breakingNews">
        <BreakingNewsLink
          href="#all-breaking-news"
          onClick={(event) => {
            event.preventDefault();
            onOpenBreakingNews();
          }}
          title={homeBreakingTitle}
        />
      </div>
    </>
  );
}

function HomeShell({
  children,
  isTextLarge,
  mode,
  onModeChange,
  onOpenBreakingNews,
  onOpenSearch,
  onToggleTextSize,
}: HomeHeaderControls & { children: ReactNode }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const scrollerTopRef = useRef(0);
  const touchYRef = useRef<number | null>(null);
  const sheetTopRef = useRef(0);
  const sheetBoundsRef = useRef({ initialTop: 0, stopTop: 0 });
  const [isSheetDocked, setIsSheetDocked] = useState(false);

  const setSheetTop = (nextTop: number) => {
    const { initialTop, stopTop } = sheetBoundsRef.current;
    const boundedTop = Math.min(initialTop, Math.max(stopTop, nextTop));
    sheetTopRef.current = boundedTop;
    screenRef.current?.style.setProperty("--home-sheet-top", `${boundedTop}px`);
    setIsSheetDocked((current) => {
      const nextDocked = boundedTop <= stopTop + 1;
      return current === nextDocked ? current : nextDocked;
    });
  };

  const measureSheet = () => {
    const screen = screenRef.current;
    const home = homeRef.current;

    if (!screen || !home) {
      return;
    }

    const screenTop = screen.getBoundingClientRect().top;
    const toolbar = home.querySelector(".newsroll_toolbar");
    const dockedControls = home.querySelector(".wrapper_homeDockedControls");
    const toolbarRect = toolbar?.getBoundingClientRect();
    const toolbarTop = toolbar
      ? toolbarRect!.top - screenTop
      : 48;
    const toolbarBottom = toolbarRect ? toolbarRect.bottom - screenTop : toolbarTop + 40;
    const dockedControlsHeight = dockedControls?.getBoundingClientRect().height ?? 48;
    const stopTop = Math.round(
      toolbarBottom + homeSheetDockedGap + dockedControlsHeight + homeSheetDockedGap,
    );
    const initialTop = Math.max(
      stopTop,
      Math.round(home.getBoundingClientRect().bottom - screenTop + homeSheetInitialGap),
    );

    const previousBounds = sheetBoundsRef.current;
    const previousTop = sheetTopRef.current || previousBounds.initialTop || initialTop;
    const wasDocked = previousTop <= previousBounds.stopTop + 1;
    const wasPartiallyLifted = previousTop < previousBounds.initialTop;
    const nextTop = wasDocked
      ? stopTop
      : wasPartiallyLifted
        ? Math.min(initialTop, Math.max(stopTop, previousTop))
        : initialTop;

    sheetBoundsRef.current = { initialTop, stopTop };
    screen.style.setProperty("--home-sheet-initial-top", `${initialTop}px`);
    scrollerRef.current = sheetRef.current?.querySelector<HTMLElement>(
      ".container_newsFeed, .container_newsGrid",
    ) ?? null;
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = wasDocked ? scrollerTopRef.current : 0;
    }
    setSheetTop(nextTop);
  };

  const getActiveArticleScroller = () => {
    const feedScroller = scrollerRef.current;

    if (!feedScroller) {
      return null;
    }

    const articles = Array.from(
      feedScroller.querySelectorAll<HTMLElement>(".container_articleCard"),
    );

    if (articles.length === 0) {
      return null;
    }

    const activeArticle = articles.reduce((closest, article) => {
      const closestDistance = Math.abs(closest.offsetTop - feedScroller.scrollTop);
      const articleDistance = Math.abs(article.offsetTop - feedScroller.scrollTop);
      return articleDistance < closestDistance ? article : closest;
    }, articles[0]);

    return activeArticle.querySelector<HTMLElement>(".wrapper_articleCardContent");
  };

  const getArticleScrollLimit = (articleScroller: HTMLElement) => (
    Math.max(0, articleScroller.scrollHeight - articleScroller.clientHeight)
  );

  const moveSheet = (deltaY: number) => {
    const scroller = scrollerRef.current;
    const { initialTop, stopTop } = sheetBoundsRef.current;
    const currentTop = sheetTopRef.current || initialTop;
    const articleScroller = getActiveArticleScroller();
    const isArticleAtTop = !articleScroller || articleScroller.scrollTop <= 0;

    if (!scroller || initialTop <= stopTop) {
      return false;
    }

    if (deltaY > 0 && currentTop > stopTop) {
      scroller.scrollTop = 0;
      setSheetTop(currentTop - deltaY);
      return true;
    }

    if (deltaY < 0 && scroller.scrollTop <= 0 && currentTop < initialTop && isArticleAtTop) {
      scroller.scrollTop = 0;
      setSheetTop(currentTop - deltaY);
      return true;
    }

    return false;
  };

  const routeDockedArticleScroll = (deltaY: number) => {
    const feedScroller = scrollerRef.current;
    const articleScroller = getActiveArticleScroller();
    const { stopTop } = sheetBoundsRef.current;
    const isDocked = sheetTopRef.current <= stopTop + 1;

    if (!feedScroller || !articleScroller || !isDocked) {
      return false;
    }

    const maxScroll = getArticleScrollLimit(articleScroller);

    if (maxScroll <= 1) {
      return false;
    }

    if (deltaY < 0 && articleScroller.scrollTop > 0) {
      articleScroller.scrollTop = Math.max(0, articleScroller.scrollTop + deltaY);
      return true;
    }

    if (deltaY > 0) {
      if (articleScroller.scrollTop < maxScroll) {
        articleScroller.scrollTop = Math.min(maxScroll, articleScroller.scrollTop + deltaY);
        return true;
      }
    }

    return false;
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (moveSheet(event.deltaY)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (routeDockedArticleScroll(event.deltaY)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const currentY = event.touches[0]?.clientY;
    const previousY = touchYRef.current;

    if (currentY == null || previousY == null) {
      touchYRef.current = currentY ?? null;
      return;
    }

    const deltaY = previousY - currentY;
    if (moveSheet(deltaY)) {
      event.preventDefault();
      event.stopPropagation();
      touchYRef.current = currentY;
      return;
    }

    if (routeDockedArticleScroll(deltaY)) {
      event.preventDefault();
      event.stopPropagation();
      touchYRef.current = currentY;
      return;
    }
    touchYRef.current = currentY;
  };

  const handleSheetScroll = () => {
    if (scrollerRef.current) {
      scrollerTopRef.current = scrollerRef.current.scrollTop;
    }
  };

  useLayoutEffect(() => {
    measureSheet();
    const frame = window.requestAnimationFrame(measureSheet);
    window.addEventListener("resize", measureSheet);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureSheet);
    };
  }, [isTextLarge, mode]);

  return (
    <div
      className={`container_homeScreen${isSheetDocked ? " is_homeSheetDocked" : ""}`}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
      ref={screenRef}
    >
      <div className="container_home" ref={homeRef}>
        <HomeMainHeader
          isTextLarge={isTextLarge}
          mode={mode}
          onModeChange={onModeChange}
          onOpenBreakingNews={onOpenBreakingNews}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
      </div>

      <div
        className="container_homeSheet"
        onScrollCapture={handleSheetScroll}
        ref={sheetRef}
      >
        {children}
      </div>
    </div>
  );
}

function ReactionControls({
  className = "",
  reaction,
  onReactionChange,
}: {
  className?: string;
  reaction: Reaction;
  onReactionChange: (reaction: Reaction) => void;
}) {
  return (
    <div className={`wrapper_articleReaction ${className}`.trim()} aria-label="기사 평가" role="group">
      {reactionItems.map((item) => (
        <ReactionButton
          aria-pressed={reaction === item.value}
          icon={item.icon}
          key={item.value}
          onClick={() => onReactionChange(reaction === item.value ? null : item.value)}
          tone={item.value}
          variant="article"
        >
          <strong>
            {item.label} {item.count}
          </strong>
        </ReactionButton>
      ))}
    </div>
  );
}

function getVotePercentages(voteCounts: number[]) {
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);

  if (totalVotes === 0) {
    return voteCounts.map(() => 0);
  }

  const rawPercentages = voteCounts.map((count) => (count / totalVotes) * 100);
  const percentages = rawPercentages.map(Math.floor);
  let remainder = 100 - percentages.reduce((sum, percent) => sum + percent, 0);
  const remainderOrder = rawPercentages
    .map((percent, index) => ({ index, remainder: percent - Math.floor(percent) }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let index = 0; index < remainder; index += 1) {
    percentages[remainderOrder[index % remainderOrder.length].index] += 1;
  }

  return percentages;
}

function ArticleGuideSection({ kind }: { kind: GuideKind }) {
  const [selectedGuideOption, setSelectedGuideOption] = useState<number | null>(null);
  const options = kind === "binary" ? binaryGuideOptions : guideOptions;
  const [voteCounts, setVoteCounts] = useState(() => options.map(() => 0));
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);
  const percentages = getVotePercentages(voteCounts);
  const hasVoted = totalVotes > 0;

  function vote(index: number) {
    setSelectedGuideOption(index);
    setVoteCounts((currentCounts) =>
      currentCounts.map((count, countIndex) => (countIndex === index ? count + 1 : count)),
    );
  }

  return (
    <section className={`wrapper_articleGuide wrapper_articleGuide_${kind}`} aria-label="안내 문구">
      <h2 className="text_articleGuide">예시텍스트 어쩌구랑 어쩌구랑 비교했을때 어케하는게 좋을까?</h2>
      <div className="wrapper_articleGuideOptions">
        {options.map((option, index) => {
          const percent = percentages[index];
          const isBinary = kind === "binary";
          const fillStyle = isBinary ? { blockSize: `${percent}%` } : { inlineSize: `${percent}%` };

          return (
            <Button
              aria-pressed={selectedGuideOption === index}
              classNameOnly
              className="btn_articleGuideOption"
              key={option}
              onClick={() => vote(index)}
              size="large"
              variant="filled"
            >
              {hasVoted ? (
                <span
                  className="bar_articleGuideResult"
                  style={fillStyle}
                  aria-hidden="true"
                />
              ) : null}
              {!hasVoted && isBinary ? (
                <img
                  alt=""
                  className="img_articleGuideBinaryIcon"
                  src={index === 0 ? "/icons/icon_yes.svg" : "/icons/icon_no.svg"}
                />
              ) : null}
              {hasVoted && isBinary ? <strong className="text_articleGuidePercent">{percent}%</strong> : null}
              <span className="text_articleGuideOption">{option}</span>
              {hasVoted && !isBinary ? <strong className="text_articleGuidePercent">{percent}%</strong> : null}
            </Button>
          );
        })}
      </div>
      <p className="text_articleGuideTotal">
        <strong>{totalVotes}명</strong>이 참여했어요.
      </p>
    </section>
  );
}

function CommentReactionPanel({ guideKind, id }: { guideKind: GuideKind; id?: string }) {
  const guideChoices = guideKind === "binary" ? binaryGuideOptions : guideOptions;
  const panelId = id ?? "home-comment-panel";
  const composerId = `${panelId}-composer`;
  const commentSortMenuId = `${panelId}-sort-menu`;
  const panelRef = useRef<HTMLElement | null>(null);
  const commentTabs = useMemo(
    () => [{ id: "all", label: "전체" }, ...guideChoices.map((choice) => ({ id: choice, label: choice }))],
    [guideChoices],
  );
  const defaultComments = useMemo(
    () =>
      commentTemplates.map((comment, index) => ({
        ...comment,
        choice: guideChoices[index % guideChoices.length],
      })),
    [guideChoices],
  );
  const [activeChoice, setActiveChoice] = useState(commentTabs[0].id);
  const [composerDraft, setComposerDraft] = useState("");
  const [composerMode, setComposerMode] = useState<"comment" | "reply">("comment");
  const [commentReactions, setCommentReactions] = useState<Record<number, CommentReactionValue | null>>({});
  const [deletedCommentIds, setDeletedCommentIds] = useState<number[]>([]);
  const [deletedReplyIds, setDeletedReplyIds] = useState<string[]>([]);
  const [expandedReplyId, setExpandedReplyId] = useState<number | null>(null);
  const [isComposerVisible, setIsComposerVisible] = useState(false);
  const [myCommentsOnly, setMyCommentsOnly] = useState(false);
  const [isCommentSortOpen, setIsCommentSortOpen] = useState(false);
  const [openCommentActionId, setOpenCommentActionId] = useState<number | null>(null);
  const [openReplyActionId, setOpenReplyActionId] = useState<string | null>(null);
  const [replyTargetCommentId, setReplyTargetCommentId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>("popular");
  const [userComments, setUserComments] = useState<CommentItem[]>([]);
  const [userRepliesByCommentId, setUserRepliesByCommentId] = useState<Record<number, CommentReplyItem[]>>({});
  const [pendingScrollTarget, setPendingScrollTarget] = useState<CommentScrollTarget | null>(null);
  const deletedCommentIdSet = useMemo(() => new Set(deletedCommentIds), [deletedCommentIds]);
  const deletedReplyIdSet = useMemo(() => new Set(deletedReplyIds), [deletedReplyIds]);
  const allComments = useMemo(
    () => [...defaultComments, ...userComments].filter((comment) => !deletedCommentIdSet.has(comment.id)),
    [defaultComments, deletedCommentIdSet, userComments],
  );
  const getCommentReactionCounts = (comment: CommentItem) => {
    const selectedReaction = commentReactions[comment.id] ?? null;

    return {
      dislikes: comment.dislikes + (selectedReaction === "dislike" ? 1 : 0),
      likes: comment.likes + (selectedReaction === "like" ? 1 : 0),
    };
  };
  const getCommentPopularity = (comment: CommentItem) => {
    const { likes } = getCommentReactionCounts(comment);
    const userReplyCount = userRepliesByCommentId[comment.id]?.length ?? 0;

    return likes + comment.replies + userReplyCount;
  };
  const selectedSortLabel = commentSortOptions.find((option) => option.value === sortOrder)?.label;
  const visibleComments = useMemo(
    () =>
      allComments
        .filter((comment) => (myCommentsOnly ? comment.isMine : true))
        .filter((comment) => (activeChoice === "all" ? true : comment.choice === activeChoice))
        .sort((a, b) => {
          if (sortOrder === "latest") {
            return b.id - a.id;
          }

          return getCommentPopularity(b) - getCommentPopularity(a) || b.id - a.id;
        }),
    [activeChoice, allComments, commentReactions, myCommentsOnly, sortOrder, userRepliesByCommentId],
  );

  function scrollArticleTo(articleScroller: HTMLElement, nextScrollTop: number) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    articleScroller.scrollTop = nextScrollTop;

    if (!prefersReducedMotion && typeof articleScroller.scrollTo === "function") {
      articleScroller.scrollTo({
        behavior: "smooth",
        top: nextScrollTop,
      });
    }
  }

  function scrollElementBottomIntoView(targetId: string, bottomGap = 24) {
    const target = document.getElementById(targetId);
    const articleScroller = panelRef.current?.closest(".wrapper_articleCardContent");

    if (!(articleScroller instanceof HTMLElement) || !target) {
      return;
    }

    const scrollerRect = articleScroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const composerRect = document.getElementById(composerId)?.getBoundingClientRect();
    const visibleBottom = composerRect ? Math.min(scrollerRect.bottom, composerRect.top) : scrollerRect.bottom;
    const targetScrollTop = articleScroller.scrollTop + targetRect.bottom - visibleBottom + bottomGap;
    const nextScrollTop = Math.min(
      Math.max(0, articleScroller.scrollHeight - articleScroller.clientHeight),
      Math.max(0, targetScrollTop),
    );

    scrollArticleTo(articleScroller, nextScrollTop);
  }

  function scrollPanelTopToReadingPosition() {
    const panel = panelRef.current;
    const articleScroller = panel?.closest(".wrapper_articleCardContent");

    if (!(articleScroller instanceof HTMLElement) || !panel) {
      return;
    }

    const scrollerRect = articleScroller.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const targetScrollTop = (
      articleScroller.scrollTop + panelRect.top - scrollerRect.top - articleScroller.clientHeight * 0.3
    );
    const nextScrollTop = Math.max(0, targetScrollTop);

    scrollArticleTo(articleScroller, nextScrollTop);
    setIsComposerVisible(true);
  }

  useEffect(() => {
    function closeCommentDropdowns(event: globalThis.PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(".wrapper_commentDropdown, .wrapper_commentAction")) {
        return;
      }

      setIsCommentSortOpen(false);
      setOpenCommentActionId(null);
      setOpenReplyActionId(null);
    }

    function closeCommentDropdownsWithEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setIsCommentSortOpen(false);
      setOpenCommentActionId(null);
      setOpenReplyActionId(null);
    }

    document.addEventListener("pointerdown", closeCommentDropdowns);
    document.addEventListener("keydown", closeCommentDropdownsWithEscape);

    return () => {
      document.removeEventListener("pointerdown", closeCommentDropdowns);
      document.removeEventListener("keydown", closeCommentDropdownsWithEscape);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const scrollRoot = panel.closest(".wrapper_articleCardContent");
    const updateComposerVisibility = () => {
      const panelRect = panel.getBoundingClientRect();
      const rootRect = scrollRoot?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight };
      const visibleHeight = Math.min(panelRect.bottom, rootRect.bottom) - Math.max(panelRect.top, rootRect.top);
      const visibleRatio = panelRect.height > 0 ? visibleHeight / panelRect.height : 0;

      setIsComposerVisible(visibleRatio >= 0.05);
    };

    updateComposerVisibility();
    scrollRoot?.addEventListener("scroll", updateComposerVisibility, { passive: true });
    window.addEventListener("resize", updateComposerVisibility);

    return () => {
      scrollRoot?.removeEventListener("scroll", updateComposerVisibility);
      window.removeEventListener("resize", updateComposerVisibility);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const timeout = window.setTimeout(scrollPanelTopToReadingPosition, commentScrollDelayMs);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isComposerVisible) {
      return;
    }

    setComposerDraft("");
    setComposerMode("comment");
    setReplyTargetCommentId(null);
  }, [isComposerVisible]);

  useEffect(() => {
    if (!pendingScrollTarget) {
      return;
    }

    const timeout = window.setTimeout(() => {
      scrollElementBottomIntoView(pendingScrollTarget.id, pendingScrollTarget.bottomGap);
      setPendingScrollTarget(null);
    }, commentScrollDelayMs);

    return () => window.clearTimeout(timeout);
  }, [pendingScrollTarget]);

  function resetComposer() {
    setComposerDraft("");
    setComposerMode("comment");
    setReplyTargetCommentId(null);
  }

  function startReplyComposer(commentId: number) {
    if (!isComposerVisible) {
      return;
    }

    setReplyTargetCommentId(commentId);
    setExpandedReplyId(commentId);
    setComposerMode("reply");
    setComposerDraft("");
  }

  function toggleReplyList(commentId: number) {
    const isClosing = expandedReplyId === commentId;

    if (!isClosing) {
      setPendingScrollTarget({ id: `${panelId}-reply-list-${commentId}` });
    }

    setExpandedReplyId(isClosing ? null : commentId);

    if (isClosing && replyTargetCommentId === commentId) {
      resetComposer();
    }
  }

  function submitComposer() {
    const body = composerDraft.trim();

    if (!body) {
      return;
    }

    if (composerMode === "reply") {
      const targetComment = allComments.find((comment) => comment.id === replyTargetCommentId);

      if (!targetComment) {
        resetComposer();
        return;
      }

      const reply: CommentReplyItem = {
        author: "나",
        body,
        choice: activeChoice === "all" ? targetComment.choice : activeChoice,
        date: "방금 전",
        dislikes: 0,
        id: `user-${Date.now()}`,
        isMine: true,
        likes: 0,
      };

      setPendingScrollTarget({ bottomGap: 0, id: `${panelId}-reply-${reply.id}` });
      setUserRepliesByCommentId((currentReplies) => ({
        ...currentReplies,
        [targetComment.id]: [...(currentReplies[targetComment.id] ?? []), reply],
      }));
      setExpandedReplyId(targetComment.id);
      resetComposer();
      return;
    }

    const commentId = Date.now();

    setPendingScrollTarget({ bottomGap: 0, id: `${panelId}-comment-${commentId}` });
    setUserComments((currentComments) => [
      ...currentComments,
      {
        author: "나",
        body,
        choice: activeChoice === "all" ? guideChoices[0] : activeChoice,
        date: "방금 전",
        dislikes: 0,
        id: commentId,
        isMine: true,
        likes: 0,
        replies: 0,
      },
    ]);
    resetComposer();
  }

  function toggleCommentReaction(commentId: number, reaction: CommentReactionValue) {
    setCommentReactions((currentReactions) => ({
      ...currentReactions,
      [commentId]: currentReactions[commentId] === reaction ? null : reaction,
    }));
  }

  function handleCommentAction(commentId: number, action: CommentAction) {
    setOpenCommentActionId(null);
    setOpenReplyActionId(null);

    if (action === "delete") {
      setDeletedCommentIds((currentIds) => (currentIds.includes(commentId) ? currentIds : [...currentIds, commentId]));
      setExpandedReplyId((currentId) => (currentId === commentId ? null : currentId));
      if (replyTargetCommentId === commentId) {
        resetComposer();
      }
      setCommentReactions((currentReactions) => {
        const { [commentId]: _deletedReaction, ...nextReactions } = currentReactions;

        return nextReactions;
      });
    }
  }

  function handleReplyAction(replyId: string, action: CommentAction) {
    setOpenReplyActionId(null);

    if (action === "delete") {
      setDeletedReplyIds((currentIds) => (currentIds.includes(replyId) ? currentIds : [...currentIds, replyId]));
    }
  }

  return (
    <>
    <section className="wrapper_commentPanel" id={id} ref={panelRef} aria-label="댓글 반응">
      <div className="wrapper_commentSummary">
        <span className="text_commentTotal">댓글 {allComments.length}</span>
        <Button
          aria-pressed={myCommentsOnly}
          className="btn_commentMineFilter"
          classNameOnly
          onClick={() => setMyCommentsOnly((current) => !current)}
          type="button"
        >
          나의 댓글
        </Button>
      </div>

      <section className="container_commentGuide" aria-label="안내 선택지별 댓글">
        <div className="wrapper_commentGuideTabs">
        <h3>투표 선택지 별</h3>
        <PillTabMenu
          ariaLabel="안내 선택지별 댓글 필터"
          className="wrapper_commentTabs"
          items={commentTabs}
          onChange={setActiveChoice}
          value={activeChoice}
        />
        </div>

        <div className="wrapper_commentGuideComments">
          <div className="wrapper_commentDropdown wrapper_commentSort">
            <button
              aria-controls={isCommentSortOpen ? commentSortMenuId : undefined}
              aria-expanded={isCommentSortOpen}
              aria-haspopup="listbox"
              aria-label="댓글 정렬"
              className="btn_commentDropdown"
              onClick={() => {
                setOpenCommentActionId(null);
                setOpenReplyActionId(null);
                setIsCommentSortOpen((current) => !current);
              }}
              type="button"
            >
              {selectedSortLabel}
              <span aria-hidden="true" />
            </button>
            {isCommentSortOpen ? (
              <div className="listbox_commentDropdown" id={commentSortMenuId} role="listbox">
                {commentSortOptions.map((option) => (
                  <button
                    aria-selected={sortOrder === option.value}
                    key={option.value}
                    onClick={() => {
                      setSortOrder(option.value);
                      setIsCommentSortOpen(false);
                    }}
                    role="option"
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

      <div className="wrapper_commentList">
        {visibleComments.length > 0 ? (
          visibleComments.map((comment, index) => {
            const selectedReaction = commentReactions[comment.id] ?? null;
            const { dislikes: dislikeCount, likes: likeCount } = getCommentReactionCounts(comment);
            const actionMenuId = `${panelId}-comment-action-${comment.id}`;
            const replyToggleId = `${panelId}-reply-toggle-${comment.id}`;
            const replyListId = `${panelId}-reply-list-${comment.id}`;
            const isReplyListOpen = expandedReplyId === comment.id;
            const templateReplies: CommentReplyItem[] = Array.from({ length: Math.min(comment.replies, 3) }, (_, replyIndex) => ({
              ...commentReplyTemplates[replyIndex % commentReplyTemplates.length],
              id: `${comment.id}-${replyIndex}`,
            })).filter((reply) => !deletedReplyIdSet.has(reply.id));
            const userReplies = (userRepliesByCommentId[comment.id] ?? []).filter(
              (reply) => !deletedReplyIdSet.has(reply.id),
            );
            const commentReplies = [...templateReplies, ...userReplies];

            return (
              <Fragment key={comment.id}>
                {index > 0 ? <span aria-hidden="true" className="divider_commentItem" /> : null}
                <article className="wrapper_commentItem" id={`${panelId}-comment-${comment.id}`}>
                  <header>
                    <span className="wrapper_commentMeta">
                      <strong>{comment.author}</strong>
                      <time>{comment.date}</time>
                    </span>
                    <span className="wrapper_commentAction">
                      <IconButton
                        aria-label="댓글 더보기"
                        aria-controls={openCommentActionId === comment.id ? actionMenuId : undefined}
                        aria-expanded={openCommentActionId === comment.id}
                        aria-haspopup="menu"
                        baseClassName="btn_commentAction"
                        icon="detail"
                        label="댓글 더보기"
                        onClick={() => {
                          setIsCommentSortOpen(false);
                          setOpenReplyActionId(null);
                          setOpenCommentActionId((current) => (current === comment.id ? null : comment.id));
                        }}
                      />
                      {openCommentActionId === comment.id ? (
                        <div className="listbox_commentDropdown listbox_commentAction" id={actionMenuId} role="menu">
                          {commentActionOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleCommentAction(comment.id, option.value)}
                              role="menuitem"
                              type="button"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </span>
                  </header>
                  <ChipLabel kind="commentChoice">{comment.choice}</ChipLabel>
                  <p>{comment.body}</p>
                  <footer>
                    <button
                      aria-controls={replyListId}
                      aria-expanded={isReplyListOpen}
                      id={replyToggleId}
                      onClick={() => toggleReplyList(comment.id)}
                      type="button"
                    >
                      대댓글 {commentReplies.length}
                    </button>
                    <span>
                      <ReactionButton
                        aria-label="댓글 좋아요"
                        aria-pressed={selectedReaction === "like"}
                        icon="thumbUp"
                        onClick={() => toggleCommentReaction(comment.id, "like")}
                        tone="like"
                        variant="comment"
                      >
                        {likeCount}
                      </ReactionButton>
                      <ReactionButton
                        aria-label="댓글 싫어요"
                        aria-pressed={selectedReaction === "dislike"}
                        icon="thumbDown"
                        onClick={() => toggleCommentReaction(comment.id, "dislike")}
                        tone="dislike"
                        variant="comment"
                      >
                        {dislikeCount}
                      </ReactionButton>
                    </span>
                  </footer>
                  <div
                    aria-hidden={!isReplyListOpen}
                    aria-labelledby={replyToggleId}
                    className={`wrapper_commentReplies${isReplyListOpen ? " is_open" : ""}`}
                    id={replyListId}
                    role="region"
                  >
                    <div className="wrapper_commentRepliesInner">
                      <Button
                        className="btn_originalArticle"
                        classNameOnly
                        aria-controls={composerId}
                        aria-pressed={composerMode === "reply" && replyTargetCommentId === comment.id}
                        onClick={() => startReplyComposer(comment.id)}
                        type="button"
                      >
                        대댓글 달기
                      </Button>
                      {commentReplies.map((reply, replyIndex) => {
                        const replyActionMenuId = `${panelId}-reply-action-${reply.id}`;

                        return (
                        <Fragment key={reply.id}>
                        <article className="wrapper_commentReplyItem" id={`${panelId}-reply-${reply.id}`}>
                          <header>
                            <span className="wrapper_commentMeta">
                              <strong>{reply.author}</strong>
                              <time>{reply.date}</time>
                            </span>
                            <span className="wrapper_commentAction">
                              <IconButton
                                aria-label="대댓글 더보기"
                                aria-controls={openReplyActionId === reply.id ? replyActionMenuId : undefined}
                                aria-expanded={openReplyActionId === reply.id}
                                aria-haspopup="menu"
                                baseClassName="btn_commentAction"
                                disabled={!isReplyListOpen}
                                icon="detail"
                                label="대댓글 더보기"
                                onClick={() => {
                                  setIsCommentSortOpen(false);
                                  setOpenCommentActionId(null);
                                  setOpenReplyActionId((current) => (current === reply.id ? null : reply.id));
                                }}
                              />
                              {openReplyActionId === reply.id ? (
                                <div className="listbox_commentDropdown listbox_commentAction" id={replyActionMenuId} role="menu">
                                  {commentActionOptions.map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() => handleReplyAction(reply.id, option.value)}
                                      role="menuitem"
                                      type="button"
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </span>
                          </header>
                          <ChipLabel kind="commentChoice">{reply.choice}</ChipLabel>
                          <p>{reply.body}</p>
                          <footer>
                            <span>
                              <ReactionButton
                                aria-label="대댓글 좋아요"
                                disabled={!isReplyListOpen}
                                icon="thumbUp"
                                tone="like"
                                variant="comment"
                              >
                                {reply.likes}
                              </ReactionButton>
                              <ReactionButton
                                aria-label="대댓글 싫어요"
                                disabled={!isReplyListOpen}
                                icon="thumbDown"
                                tone="dislike"
                                variant="comment"
                              >
                                {reply.dislikes}
                              </ReactionButton>
                            </span>
                          </footer>
                        </article>
                        {replyIndex < commentReplies.length - 1 ? (
                          <span aria-hidden="true" className="divider_commentItem" />
                        ) : null}
                        </Fragment>
                        );
                      })}
                    </div>
                  </div>
                </article>
              </Fragment>
            );
          })
        ) : (
          <p className="text_commentEmpty">표시할 댓글이 없습니다.</p>
        )}
          </div>
        </div>
      </section>
    </section>
    {isComposerVisible ? (
      <div
        aria-label={composerMode === "reply" ? "대댓글 작성" : "댓글 작성"}
        className="container_commentComposerFixed"
        id={composerId}
        role="region"
      >
        <form
          className="form_commentComposer"
          onSubmit={(event) => {
            event.preventDefault();
            submitComposer();
          }}
        >
          <CommentComposerInput
            label={composerMode === "reply" ? "대댓글 입력" : "댓글 입력"}
            onChange={(event) => setComposerDraft(event.target.value)}
            placeholder={composerMode === "reply" ? "대댓글을 입력해 주세요." : "홍길동님은 어떻게 생각하시나요?"}
            submitLabel={composerMode === "reply" ? "대댓글 등록" : "댓글 등록"}
            value={composerDraft}
          />
        </form>
      </div>
    ) : null}
    </>
  );
}

function HomeReelCard({
  article,
  headingLevel = "h2",
  index,
}: {
  article: HomeArticle;
  headingLevel?: "h1" | "h2";
  index: number;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [reaction, setReaction] = useState<Reaction>(null);
  const commentPanelId = `home-comment-panel-${index}`;
  const articleContentId = `home-article-content-${index}`;
  const articleTitleId = `home-article-title-${index}`;
  const ArticleTitle = headingLevel;

  function handleCommentPanelToggle() {
    setIsCommentPanelOpen((current) => !current);
  }
  return (
    <article aria-labelledby={articleTitleId} className="container_articleCard">
      <div
        aria-labelledby={articleTitleId}
        className={`wrapper_articleCardContent${
          isCommentPanelOpen ? " is_commentComposerSpaceReserved" : ""
        }`}
        id={articleContentId}
        role="region"
        tabIndex={0}
      >
      <div className="wrapper_articleSummary">
        <ChipLabel kind="articleCategory">{article.category}</ChipLabel>
        <ArticleTitle id={articleTitleId}>{article.title}</ArticleTitle>
        <time dateTime="2026-12-31T08:30:00">{article.date}</time>
      </div>
      <div className="wrapper_articleActions" aria-label="기사 도구" role="group">
        <IconButton
          aria-pressed={isShared}
          baseClassName="btn_articleTool"
          icon="share"
          label="공유"
          onClick={() => setIsShared((current) => !current)}
        />
        <IconButton
          aria-pressed={isBookmarked}
          baseClassName="btn_articleTool"
          icon="bookmark"
          label="북마크"
          onClick={() => setIsBookmarked((current) => !current)}
        />
      </div>
      <img alt={article.imageAlt} src={article.image} />
      <p className="text_articleBody">{articleBody}</p>

      <div className="wrapper_articleSource">
        <div className="wrapper_articleSourcePublisher">
          <img className="img_articlePublisherLogo" src="/icons/icon_user.svg" alt="" width={32} height={32} />
          <span className="text_articlePublisherName">{index % 2 === 0 ? "국민일보" : "중앙일보"}</span>
        </div>
        <span className="text_articleReporter">홍길동 기자</span>
      </div>

      <Button
        className="btn_originalArticle"
        classNameOnly
        href="https://example.com/original-news"
        size="medium"
        variant="filled"
      >
        기사 원문 보기
      </Button>

      <ReactionControls reaction={reaction} onReactionChange={setReaction} />

      <ArticleGuideSection kind={article.guideKind ?? "stacked"} />

      <Button
        aria-controls={commentPanelId}
        aria-expanded={isCommentPanelOpen}
        className="btn_commentPanel"
        classNameOnly
        onClick={handleCommentPanelToggle}
        size="large"
        variant="filled"
      >
        <Icon name="chat" />
        댓글 반응보기
      </Button>
      {isCommentPanelOpen ? (
        <CommentReactionPanel guideKind={article.guideKind ?? "stacked"} id={commentPanelId} />
      ) : null}
      </div>
    </article>
  );
}

function HomeView({
  isTextLarge,
  onOpenBreakingNews,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenBreakingNews: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [homeViewMode, setHomeViewMode] = useState<HomeViewMode>("reels");
  const [detailOpen, setDetailOpen] = useState(false);

  if (detailOpen) {
    return <AllNewsArticleDetail onBack={() => setDetailOpen(false)} onOpenSearch={onOpenSearch} />;
  }

  return (
    <HomeShell
      isTextLarge={isTextLarge}
      mode={homeViewMode}
      onModeChange={setHomeViewMode}
      onOpenBreakingNews={onOpenBreakingNews}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    >
      {homeViewMode === "reels" ? (
        <section
          className="container_newsFeed"
          id="home-news-reels-panel"
          role="tabpanel"
          aria-labelledby="home-news-view-tab-reels"
        >
          {homeReelArticles.map((article, index) => (
            <HomeReelCard article={article} index={index} key={`${article.title}-${index}`} />
          ))}
        </section>
      ) : (
        <section
          className="container_newsGrid container_newsGrid_block"
          id="home-news-block-panel"
          role="tabpanel"
          aria-labelledby="home-news-view-tab-block"
        >
          {Array.from({ length: 12 }, (_, index) => (
            <HomeBlockItem key={index} onClick={() => setDetailOpen(true)} />
          ))}
        </section>
      )}
    </HomeShell>
  );
}

function SearchView({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");

  return (
    <section className="newsroll_search_page" aria-label="검색">
      <div className="newsroll_search_top">
        <button aria-label="검색 닫기" className="newsroll_search_close" onClick={onClose} type="button">
          <span aria-hidden="true" />
        </button>
      </div>

      <label className="newsroll_search_field">
        <span className="sr_only">검색어</span>
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="홍길동님은 어떻게 생각하시나요?"
          type="search"
          value={query}
        />
        <Icon name="search" />
      </label>

      <ol className="newsroll_search_suggestion_list" aria-label="추천 검색어">
        {searchSuggestions.map((suggestion, index) => (
          <li key={`${suggestion}-${index}`}>
            <button onClick={() => setQuery(suggestion)} type="button">
              {index + 1}. {suggestion}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function AllNewsMeta() {
  return (
    <p className="newsroll_all_meta">
      <span>1시간 전</span>
      <span className="newsroll_all_stats" aria-label="조회수와 반응">
        <span>
          <i className="newsroll_all_stat_icon_eye" aria-hidden="true" />
          132
        </span>
        <span>
          <i className="newsroll_all_stat_icon_comment" aria-hidden="true" />
          132
        </span>
      </span>
    </p>
  );
}

function AllNewsMoreButton({
  expanded = false,
  onClick,
  tone = "light",
}: {
  expanded?: boolean;
  onClick?: () => void;
  tone?: "dark" | "light";
}) {
  return (
    <button
      aria-expanded={expanded}
      className={`newsroll_all_more newsroll_all_more_${tone}`}
      onClick={onClick}
      type="button"
    >
      <span>{expanded ? "접기" : "더보기"}</span>
      <span className="newsroll_all_more_chevron" aria-hidden="true" />
    </button>
  );
}

function AllNewsLatestCard({
  item,
  onClick,
  selected,
}: {
  item: (typeof allNewsLatest)[number];
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button aria-pressed={selected} className="newsroll_all_latest_card" onClick={onClick} type="button">
      <span className="newsroll_all_chip">{item.category}</span>
      <img alt="" className="newsroll_all_latest_image" src={item.image} />
      <span className="newsroll_all_latest_body">
        <strong>{item.title}</strong>
        <AllNewsMeta />
      </span>
    </button>
  );
}

function AllNewsHeadlineItem({
  item,
  onClick,
  selected,
}: {
  item: (typeof allNewsHeadlinesByPress)[string][number];
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button aria-pressed={selected} className="newsroll_all_headline_item" onClick={onClick} type="button">
      <span className="newsroll_all_headline_body">
        <strong>{item.title}</strong>
        <AllNewsMeta />
      </span>
      <img alt="" className="newsroll_all_headline_image" src={item.image} />
    </button>
  );
}

function AllNewsRelayItem({
  item,
  featured = false,
  onClick,
  selected,
}: {
  featured?: boolean;
  item: (typeof allNewsRelayByCategory)[string][number];
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button aria-pressed={selected} className="newsroll_all_relay_item" onClick={onClick} type="button">
      <strong className={featured ? "newsroll_all_relay_title_large" : undefined}>{item.title}</strong>
      <AllNewsMeta />
      <img alt="" src={item.image} />
    </button>
  );
}

function AllNewsArticleDetail({
  onBack,
  onOpenSearch,
}: {
  onBack: () => void;
  onOpenSearch: () => void;
}) {
  const [isAlarmOn, setIsAlarmOn] = useState(false);

  return (
    <section className="newsroll_all_detail" aria-label="뉴스 상세">
      <header className="newsroll_all_detail_top">
        <div className="newsroll_all_detail_toolbar">
          <button aria-label="전체뉴스로 돌아가기" className="newsroll_all_detail_back" onClick={onBack} type="button">
            <span aria-hidden="true" />
          </button>
          <NewsToolbar isTextLarge={false} onOpenSearch={onOpenSearch} onToggleTextSize={() => undefined} />
          <button
            aria-label="알림"
            aria-pressed={isAlarmOn}
            className="newsroll_home_alarm"
            onClick={() => setIsAlarmOn((current) => !current)}
            type="button"
          >
            <Icon name="alarm" />
          </button>
        </div>
      </header>
      <div className="newsroll_all_detail_body">
        <HomeReelCard article={homeArticle} headingLevel="h1" index={0} />
      </div>
    </section>
  );
}

function AllNewsView({
  isTextLarge,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activePress, setActivePress] = useState(allNewsPresses[0]);
  const [activeRelayCategory, setActiveRelayCategory] = useState(allNewsRelayCategories[0]);
  const [detailOpen, setDetailOpen] = useState(false);
  const latestScrollerRef = useRef<HTMLDivElement>(null);
  const latestDragActiveRef = useRef(false);
  const latestDidDragRef = useRef(false);
  const latestDragStartRef = useRef({ scrollLeft: 0, x: 0 });
  const [isLatestDragging, setIsLatestDragging] = useState(false);
  const [selectedBreakingIndex, setSelectedBreakingIndex] = useState<number | null>(null);
  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState<number | null>(null);
  const [selectedLatestIndex, setSelectedLatestIndex] = useState<number | null>(null);
  const [selectedRelayIndex, setSelectedRelayIndex] = useState<number | null>(null);
  const [showAllHeadlines, setShowAllHeadlines] = useState(false);
  const [showAllBreaking, setShowAllBreaking] = useState(false);
  const relayItems = allNewsRelayByCategory[activeRelayCategory] ?? [];
  const pressHeadlines = allNewsHeadlinesByPress[activePress] ?? [];
  const headlineItems = showAllHeadlines ? pressHeadlines : pressHeadlines.slice(0, 4);

  function openDetail() {
    setDetailOpen(true);
  }

  function handleLatestPointerDown(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    if (!node) {
      return;
    }

    latestDragActiveRef.current = true;
    latestDidDragRef.current = false;
    setIsLatestDragging(true);
    latestDragStartRef.current = { scrollLeft: node.scrollLeft, x: event.clientX };
    node.setPointerCapture(event.pointerId);
  }

  function handleLatestPointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    if (!node || !latestDragActiveRef.current) {
      return;
    }

    const delta = event.clientX - latestDragStartRef.current.x;

    if (Math.abs(delta) > 8) {
      latestDidDragRef.current = true;
    }

    node.scrollLeft = latestDragStartRef.current.scrollLeft - delta;
  }

  function stopLatestDrag(event: PointerEvent<HTMLDivElement>) {
    const node = latestScrollerRef.current;

    latestDragActiveRef.current = false;
    setIsLatestDragging(false);

    if (node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }

    if (!node || !latestDidDragRef.current) {
      return;
    }

    const firstCard = node.querySelector<HTMLElement>(".newsroll_all_latest_card");
    const cardStep = firstCard
      ? firstCard.offsetWidth + Number.parseFloat(getComputedStyle(node).columnGap || getComputedStyle(node).gap || "0")
      : 1;
    const targetIndex = Math.round(node.scrollLeft / cardStep);

    node.scrollTo({
      behavior: "smooth",
      left: targetIndex * cardStep,
    });
  }

  if (detailOpen) {
    return <AllNewsArticleDetail onBack={() => setDetailOpen(false)} onOpenSearch={onOpenSearch} />;
  }

  return (
    <section className="newsroll_all_news" aria-label="전체뉴스">
      <div className="newsroll_all_top">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />

        <div className="newsroll_all_breaking_label">
          <Icon name="alarm" />
          <span>속보</span>
        </div>

        <div className="newsroll_all_breaking_stack" id="all-breaking-news">
          {(showAllBreaking ? allNewsBreaking : allNewsBreaking.slice(0, 3)).map((item, index) => (
            <button
              aria-pressed={selectedBreakingIndex === index}
              className="newsroll_all_breaking_card"
              key={item}
              onClick={() => {
                setSelectedBreakingIndex((current) => (current === index ? null : index));
                openDetail();
              }}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <AllNewsMoreButton expanded={showAllBreaking} onClick={() => setShowAllBreaking((current) => !current)} tone="dark" />
      </div>

      <div className="newsroll_all_sections">
        <section className="newsroll_all_panel newsroll_all_latest_panel" aria-label="최신 뉴스">
          <h1 className="newsroll_all_section_title">
            최신 뉴스 <strong>10</strong>
          </h1>
          <div
            className={`newsroll_all_latest_scroller${isLatestDragging ? " is_dragging" : ""}`}
            onPointerCancel={stopLatestDrag}
            onPointerDown={handleLatestPointerDown}
            onPointerLeave={stopLatestDrag}
            onPointerMove={handleLatestPointerMove}
            onPointerUp={stopLatestDrag}
            ref={latestScrollerRef}
          >
            {allNewsLatest.map((item, index) => (
              <AllNewsLatestCard
                item={item}
                key={`${item.title}-${index}`}
                onClick={() => {
                  if (latestDidDragRef.current) {
                    return;
                  }

                  setSelectedLatestIndex((current) => (current === index ? null : index));
                  openDetail();
                }}
                selected={selectedLatestIndex === index}
              />
            ))}
          </div>
        </section>

        <section className="newsroll_all_panel newsroll_all_press_panel" aria-label="언론사별 헤드라인">
          <h2 className="newsroll_all_section_title">언론사별 헤드라인</h2>
          <PillTabMenu
            ariaLabel="언론사 선택"
            className="newsroll_all_press_tabs"
            items={allNewsPresses.map((press) => ({ id: press, label: press }))}
            onChange={(press) => {
              setActivePress(press);
              setSelectedHeadlineIndex(null);
            }}
            value={activePress}
          />
          <div className="newsroll_all_headline_list">
            {headlineItems.map((item, index) => (
              <AllNewsHeadlineItem
                item={{ ...item, title: activePress === "중앙일보" ? item.title : "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정" }}
                key={`${item.title}-${index}`}
                onClick={() => {
                  setSelectedHeadlineIndex((current) => (current === index ? null : index));
                  openDetail();
                }}
                selected={selectedHeadlineIndex === index}
              />
            ))}
          </div>
          <AllNewsMoreButton expanded={showAllHeadlines} onClick={() => setShowAllHeadlines((current) => !current)} />
        </section>

        <section className="newsroll_all_panel newsroll_all_relay_panel" aria-label="릴레이 뉴스">
          <h2 className="newsroll_all_section_title">릴레이 뉴스</h2>
          <PillTabMenu
            ariaLabel="릴레이 뉴스 카테고리"
            className="newsroll_all_category_tabs"
            items={allNewsRelayCategories.map((category) => ({ id: category, label: category }))}
            onChange={setActiveRelayCategory}
            value={activeRelayCategory}
          />
          <div className="newsroll_all_relay_list">
            {relayItems.map((item, index) => (
              <AllNewsRelayItem
                featured={index === 0 || index === 5}
                item={item}
                key={`${item.title}-${index}`}
                onClick={() => {
                  setSelectedRelayIndex((current) => (current === index ? null : index));
                  openDetail();
                }}
                selected={selectedRelayIndex === index}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

const policyAgeTabs = ["전체", "미성년", "청년", "중장년", "노년"];
const basePolicyDetails: PolicyDetailItem[] = [
  { label: "지원 대상 연령", value: "19세 ~ 45세" },
  { label: "지원 내용", value: "동아리 활동에 필요한 강사비, 교재비, 재료비 등 운영비 지원 (팀당 약 150만원)." },
  { label: "지원 기관", value: "경상남도 하동군 지역활력추진단" },
  { label: "사업 기간", value: "2026-01 ~ 2026-12" },
  { label: "신청 기간", value: "2025-10-01 ~ 2025-10-10" },
  { label: "신청 방법", value: "양산시 청년 정보 플랫폼 청년카까 온라인 신청." },
  { label: "선발 방식", value: "지원 자격 충족자 대상 선착순 선정 후 개별 통보." },
  { label: "제출 서류", value: "사업자등록 사실 여부 증명서, 시험 응시 확인 서류, 응시료 결제 영수증, 통장 사본 등." },
];
const policyItemsByAge: Record<string, PolicyItem[]> = {
  전체: [
    {
      title: "청년동아리 활동비 지원사업",
      tags: ["복지문화", "문화활동", "바우처"],
      summary: "청년 비율이 50% 이상인 5인 이상의 동아리를 대상으로 활동비를 지원하는 사업.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2026년 12월 31일",
      details: basePolicyDetails,
    },
    {
      title: "양산시 청년 자격증 응시료 지원",
      tags: ["일자리", "취업", "보조금"],
      summary: "취업 준비 청년의 자격증 응시료 부담을 낮추기 위한 지역 지원 정책.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2026년 12월 31일",
      details: basePolicyDetails,
    },
  ],
  미성년: [
    {
      title: "청소년 문화예술 체험 바우처",
      tags: ["복지문화", "청소년", "바우처"],
      summary: "미성년 청소년의 문화예술 관람과 체험 활동 비용을 지원하는 사업.",
      registeredAt: "2026년 12월 20일",
      updatedAt: "2026년 12월 28일",
      details: [
        { label: "지원 대상 연령", value: "13세 ~ 18세" },
        ...basePolicyDetails.slice(1),
      ],
    },
    {
      title: "방과후 학습 돌봄 지원",
      tags: ["교육", "돌봄", "지원금"],
      summary: "방과후 학습과 돌봄이 필요한 청소년 가구에 프로그램 이용료를 지원.",
      registeredAt: "2026년 12월 18일",
      updatedAt: "2026년 12월 29일",
      details: [
        { label: "지원 대상 연령", value: "8세 ~ 18세" },
        ...basePolicyDetails.slice(1),
      ],
    },
  ],
  청년: [
    {
      title: "청년동아리 활동비 지원사업",
      tags: ["복지문화", "문화활동", "바우처"],
      summary: "청년 비율이 50% 이상인 5인 이상의 동아리를 대상으로 활동비를 지원하는 사업.",
      registeredAt: "2026년 12월 31일",
      updatedAt: "2026년 12월 31일",
      details: basePolicyDetails,
    },
    {
      title: "청년 주거 지원 확대 논의",
      tags: ["주거", "청년", "보조금"],
      summary: "청년 주거비 부담을 낮추기 위해 지자체별 신청 조건을 정비하는 정책.",
      registeredAt: "2026년 12월 27일",
      updatedAt: "2026년 12월 30일",
      details: basePolicyDetails,
    },
  ],
  중장년: [
    {
      title: "중장년 재취업 역량 강화 과정",
      tags: ["일자리", "교육", "재취업"],
      summary: "경력 전환을 준비하는 중장년층에게 직무 교육과 상담을 제공.",
      registeredAt: "2026년 12월 24일",
      updatedAt: "2026년 12월 30일",
      details: [
        { label: "지원 대상 연령", value: "40세 ~ 64세" },
        ...basePolicyDetails.slice(1),
      ],
    },
    {
      title: "소상공인 전환 컨설팅 지원",
      tags: ["경제", "창업", "컨설팅"],
      summary: "업종 전환과 매장 운영 개선이 필요한 중장년 소상공인 대상 컨설팅 지원.",
      registeredAt: "2026년 12월 21일",
      updatedAt: "2026년 12월 29일",
      details: [
        { label: "지원 대상 연령", value: "35세 ~ 64세" },
        ...basePolicyDetails.slice(1),
      ],
    },
  ],
  노년: [
    {
      title: "노년층 디지털 생활 교육",
      tags: ["교육", "복지", "디지털"],
      summary: "스마트폰, 공공앱, 금융앱 사용에 어려움을 겪는 노년층을 위한 교육.",
      registeredAt: "2026년 12월 22일",
      updatedAt: "2026년 12월 30일",
      details: [
        { label: "지원 대상 연령", value: "65세 이상" },
        ...basePolicyDetails.slice(1),
      ],
    },
    {
      title: "어르신 건강 돌봄 방문 서비스",
      tags: ["건강", "복지", "방문지원"],
      summary: "거동이 불편한 노년층에게 정기 건강 확인과 생활 상담을 제공.",
      registeredAt: "2026년 12월 19일",
      updatedAt: "2026년 12월 28일",
      details: [
        { label: "지원 대상 연령", value: "70세 이상" },
        ...basePolicyDetails.slice(1),
      ],
    },
  ],
};
const policySortLabels: Record<SortOrder, string> = {
  latest: "최신순",
  popular: "인기순",
};

function PolicyListItem({
  isSelected,
  item,
  onSelect,
}: {
  isSelected: boolean;
  item: PolicyItem;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={isSelected}
      className={`newsroll_policy_list_item${isSelected ? " is_selected" : ""}`}
      onClick={onSelect}
      type="button"
    >
      <div className="newsroll_policy_list_tags">
        {item.tags.map((tag, index) => (
          <span className={index === 2 ? "is_accent" : undefined} key={`${item.title}-${tag}`}>
            {tag}
          </span>
        ))}
      </div>
      <h2>{item.title}</h2>
      <div className="newsroll_policy_dates">
        <span>
          <strong>등록</strong> {item.registeredAt}
        </span>
        <span>
          <strong>수정</strong> {item.updatedAt}
        </span>
      </div>
      <div className="newsroll_policy_stats" aria-label="조회수와 댓글">
        <span>
          <i className="newsroll_all_stat_icon_eye" aria-hidden="true" />
          132
        </span>
        <span>
          <i className="newsroll_all_stat_icon_comment" aria-hidden="true" />
          132
        </span>
      </div>
    </button>
  );
}

function PolicyDetailView({
  isTextLarge,
  item,
  onBack,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  item: PolicyItem;
  onBack: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShared, setIsShared] = useState(false);

  return (
    <section className="newsroll_policy_detail" aria-label="국가정책 상세">
      <header className="newsroll_policy_detail_top">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
        <button aria-label="국가정책 목록으로 돌아가기" className="newsroll_all_detail_back" onClick={onBack} type="button">
          <span aria-hidden="true" />
        </button>
      </header>

      <article className="newsroll_policy_detail_sheet">
        <div className="newsroll_policy_detail_tags">
          {item.tags.map((tag, index) => (
            <span className={index === item.tags.length - 1 ? "is_accent" : undefined} key={`${item.title}-${tag}`}>
              {tag}
            </span>
          ))}
        </div>

        <h1>{item.title}</h1>
        <p className="newsroll_policy_detail_summary">{item.summary}</p>

        <div className="newsroll_policy_detail_dates">
          <span>
            <strong>등록</strong> {item.registeredAt}
          </span>
          <span>
            <strong>수정</strong> {item.updatedAt}
          </span>
        </div>

        <div className="newsroll_policy_detail_actions" aria-label="정책 도구">
          <button
            aria-label="공유"
            aria-pressed={isShared}
            className="newsroll_icon_button"
            onClick={() => setIsShared((current) => !current)}
            type="button"
          >
            <Icon name="share" />
          </button>
          <button
            aria-label="북마크"
            aria-pressed={isBookmarked}
            className="newsroll_icon_button"
            onClick={() => setIsBookmarked((current) => !current)}
            type="button"
          >
            <Icon name="bookmark" />
          </button>
        </div>

        <dl className="newsroll_policy_detail_list">
          {item.details.map((detail) => (
            <div key={`${item.title}-${detail.label}`}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>

        {isExpanded ? (
          <div className="newsroll_policy_detail_more">
            <strong>상세 안내</strong>
            <p>신청 전 모집 공고와 제출 서류를 다시 확인하고, 접수 기간 안에 온라인 신청을 완료해주세요.</p>
          </div>
        ) : null}

        <button
          aria-expanded={isExpanded}
          className="newsroll_policy_detail_more_button"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          <span aria-hidden="true">{isExpanded ? "-" : "+"}</span>
          {isExpanded ? "접기" : "상세보기"}
        </button>
      </article>
    </section>
  );
}

function PolicyView({
  isTextLarge,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activeAge, setActiveAge] = useState(policyAgeTabs[0]);
  const [detailItem, setDetailItem] = useState<PolicyItem | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [selectedPolicyIndex, setSelectedPolicyIndex] = useState(0);
  const policyItems = policyItemsByAge[activeAge] ?? policyItemsByAge.전체;
  const visiblePolicyItems =
    sortOrder === "latest" ? [...policyItems].reverse() : policyItems;

  if (detailItem) {
    return (
      <PolicyDetailView
        isTextLarge={isTextLarge}
        item={detailItem}
        onBack={() => setDetailItem(null)}
        onOpenSearch={onOpenSearch}
        onToggleTextSize={onToggleTextSize}
      />
    );
  }

  return (
    <section className="newsroll_policy_screen" aria-label="국가정책">
      <div className="newsroll_policy_top">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />

        <section className="newsroll_policy_hero" aria-label="맞춤 정책 요약">
          <span>콩콩이님을 위한</span>
          <strong>
            11,343<span>개</span>
          </strong>
          <span>국가정책 정보가 있습니다.</span>
        </section>
      </div>

      <div className="newsroll_policy_sheet">
        <PillTabMenu
          ariaLabel="연령 필터"
          className="newsroll_policy_age_tabs"
          items={policyAgeTabs.map((label) => ({ id: label, label }))}
          onChange={(nextAge) => {
            setActiveAge(nextAge);
            setSelectedPolicyIndex(0);
          }}
          value={activeAge}
        />

        <button
          aria-label={`정렬: ${policySortLabels[sortOrder]}`}
          className="newsroll_policy_sort"
          onClick={() => setSortOrder((current) => (current === "popular" ? "latest" : "popular"))}
          type="button"
        >
          {policySortLabels[sortOrder]} <span aria-hidden="true" />
        </button>

        <div className="newsroll_policy_list">
          {visiblePolicyItems.map((item, index) => (
            <PolicyListItem
              isSelected={selectedPolicyIndex === index}
              item={item}
              key={`${activeAge}-${sortOrder}-${item.title}-${index}`}
              onSelect={() => {
                setSelectedPolicyIndex(index);
                setDetailItem(item);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
const myRecentNews = Array.from({ length: 4 }, (_, index) => ({
  image: articleImage,
  time: "1시간 전",
  title: index % 2 === 0 ? "용인 수지, 강남·분당 가격 동조화로..." : "용인 수지, 강남·분당 가격 동조화로...",
}));

const myCategoryGroups = [
  {
    items: ["정치", "경제", "사회", "문화", "국제", "지역", "스포츠", "IT과학"],
    title: "나의 관심 카테고리 설정",
    active: new Set(["정치", "사회", "지역", "스포츠"]),
  },
  {
    items: ["미성년", "청년", "중장년", "노년"],
    title: "나의 연령대 설정",
    active: new Set(["청년"]),
  },
  {
    items: ["중앙일보", "국민일보", "중앙일보"],
    title: "관심 언론사 설정",
    active: new Set(["국민일보"]),
  },
];

function MyPageView({
  isTextLarge,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activeSummary, setActiveSummary] = useState<"bookmark" | "vote" | "comment" | null>(null);
  const [activeChipGroups, setActiveChipGroups] = useState(() =>
    myCategoryGroups.map((group) => new Set(group.active)),
  );
  const [isRecentExpanded, setIsRecentExpanded] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>({
    "내 댓글에 좋아요, 답글": true,
    공지사항: true,
    속보: true,
  });
  const [preferredNewsType, setPreferredNewsType] = useState<HomeViewMode>("reels");
  const [selectedRecentIndex, setSelectedRecentIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const recentItems = isRecentExpanded ? [...myRecentNews, ...myRecentNews] : myRecentNews;

  function toggleChip(groupIndex: number, item: string) {
    setActiveChipGroups((currentGroups) =>
      currentGroups.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        const next = new Set(group);

        if (next.has(item)) {
          next.delete(item);
        } else {
          next.add(item);
        }

        return next;
      }),
    );
  }

  return (
    <section className="newsroll_my_screen" aria-label="마이페이지">
      <div className="newsroll_my_top">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
        <h1>마이페이지</h1>
      </div>

      <div className="newsroll_my_sheet">
        <section className="newsroll_my_profile" aria-label="프로필">
          <strong>콩콩이님</strong>
          <button
            aria-pressed={isProfileEditing}
            onClick={() => setIsProfileEditing((current) => !current)}
            type="button"
          >
            {isProfileEditing ? "수정 닫기" : "개인정보 수정"}
          </button>
          {isProfileEditing ? <p className="newsroll_my_profile_hint">닉네임과 알림 정보를 수정할 수 있어요.</p> : null}
        </section>

        <div className="newsroll_my_summary" aria-label="활동 통계">
          <button
            aria-pressed={activeSummary === "bookmark"}
            onClick={() => setActiveSummary((current) => (current === "bookmark" ? null : "bookmark"))}
            type="button"
          >
            <span className="newsroll_my_summary_icon newsroll_my_summary_bookmark" aria-hidden="true" />
            <span>북마크</span>
            <strong>56</strong>
          </button>
          <button
            aria-pressed={activeSummary === "vote"}
            onClick={() => setActiveSummary((current) => (current === "vote" ? null : "vote"))}
            type="button"
          >
            <span className="newsroll_my_summary_icon newsroll_my_summary_vote" aria-hidden="true" />
            <span>투표</span>
            <strong>54</strong>
          </button>
          <button
            aria-pressed={activeSummary === "comment"}
            onClick={() => setActiveSummary((current) => (current === "comment" ? null : "comment"))}
            type="button"
          >
            <span className="newsroll_my_summary_icon newsroll_my_summary_comment" aria-hidden="true" />
            <span>댓글</span>
            <strong>15</strong>
          </button>
        </div>

        <section className="newsroll_my_recent" aria-label="최근 본 뉴스">
          <h2>최근 본 뉴스</h2>
          <div className="newsroll_my_recent_scroller">
            {recentItems.map((item, index) => (
              <button
                aria-pressed={selectedRecentIndex === index}
                className="newsroll_my_recent_item"
                key={`${item.title}-${index}`}
                onClick={() => setSelectedRecentIndex((current) => (current === index ? null : index))}
                type="button"
              >
                <img alt="" src={item.image} />
                <strong>{item.title}</strong>
                <span>{item.time}</span>
              </button>
            ))}
          </div>
          <button
            aria-expanded={isRecentExpanded}
            className="newsroll_my_full_button"
            onClick={() => setIsRecentExpanded((current) => !current)}
            type="button"
          >
            {isRecentExpanded ? "접기" : "전체 보기"}
          </button>
        </section>

        {myCategoryGroups.map((group, groupIndex) => (
          <section className="newsroll_my_chip_group" key={group.title} aria-label={group.title}>
            <h2>{group.title}</h2>
            <div>
              {group.items.map((item, index) => (
                <button
                  aria-pressed={activeChipGroups[groupIndex].has(item)}
                  className={activeChipGroups[groupIndex].has(item) ? "is_active" : undefined}
                  key={`${group.title}-${item}-${index}`}
                  onClick={() => toggleChip(groupIndex, item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </section>
        ))}

        <section className="newsroll_my_setting_group" aria-label="알림 설정">
          <h2>알림 설정</h2>
          {["속보", "내 댓글에 좋아요, 답글", "공지사항"].map((label) => (
            <button
              aria-pressed={notificationSettings[label]}
              className="newsroll_my_setting_row"
              key={label}
              onClick={() =>
                setNotificationSettings((current) => ({
                  ...current,
                  [label]: !current[label],
                }))
              }
              type="button"
            >
              <span>{label}</span>
              <span className={`newsroll_my_switch${notificationSettings[label] ? " is_on" : ""}`} aria-hidden="true" />
            </button>
          ))}
          <button
            aria-pressed={preferredNewsType === "block"}
            className="newsroll_my_setting_row"
            onClick={() => setPreferredNewsType((current) => (current === "reels" ? "block" : "reels"))}
            type="button"
          >
            <span>뉴스 보기 타입</span>
            <strong>{preferredNewsType === "reels" ? "릴스형" : "블록형"}</strong>
            <span className="newsroll_my_chevron" aria-hidden="true" />
          </button>
        </section>

        <section className="newsroll_my_setting_group newsroll_my_display_group" aria-label="디스플레이 설정">
          <h2>디스플레이 설정</h2>
          <button
            aria-pressed={isDarkMode}
            className="newsroll_my_setting_row"
            onClick={() => setIsDarkMode((current) => !current)}
            type="button"
          >
            <span>다크모드</span>
            <span className={`newsroll_my_switch${isDarkMode ? " is_on" : ""}`} aria-hidden="true" />
          </button>
        </section>
      </div>
    </section>
  );
}
function InfoNoticePanel() {
  const [activeNoticeIndex, setActiveNoticeIndex] = useState<number | null>(null);

  return (
    <section className="newsroll_info_list" aria-label="공지사항">
      {noticeItems.map((notice, index) => (
        <button
          aria-pressed={activeNoticeIndex === index}
          className="newsroll_info_notice_item"
          key={notice.title}
          onClick={() => setActiveNoticeIndex((current) => (current === index ? null : index))}
          type="button"
        >
          <span>{notice.date}</span>
          <strong>{notice.title}</strong>
          <p>
            {activeNoticeIndex === index
              ? "선택한 공지의 상세 내용을 확인 중입니다."
              : "더 나은 뉴스 경험을 위해 서비스 화면과 알림 기능을 정리했습니다."}
          </p>
        </button>
      ))}
    </section>
  );
}

function InfoFaqPanel() {
  const [openFaqIndexes, setOpenFaqIndexes] = useState(() => new Set([0]));

  return (
    <section className="newsroll_info_list" aria-label="FAQ">
      {faqItems.map((item, index) => (
        <details
          className="newsroll_info_faq_item"
          key={`${item.question}-${index}`}
          onToggle={(event) => {
            const isOpen = event.currentTarget.open;

            setOpenFaqIndexes((current) => {
              const next = new Set(current);

              if (isOpen) {
                next.add(index);
              } else {
                next.delete(index);
              }

              return next;
            });
          }}
          open={openFaqIndexes.has(index)}
        >
          <summary>
            <strong>Q. {item.question}</strong>
            <span className="newsroll_info_faq_chevron" aria-hidden="true" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  );
}

function InfoInquiryPanel() {
  return (
    <form
      className="newsroll_info_inquiry"
      aria-label="1:1 문의"
      onSubmit={(event) => event.preventDefault()}
    >
      <label>
        <span>문의 유형</span>
        <Select
          aria-label="문의 유형"
          defaultValue={inquiryTypes[0]}
          options={inquiryOptions}
          radius="rounded"
          selectSize="large"
        />
      </label>
      <div className="newsroll_info_field">
        <span>제목</span>
        <TextInput
          aria-label="문의 제목"
          inputSize="large"
          placeholder="문의 제목을 입력해주세요."
          radius="rounded"
          type="text"
        />
      </div>
      <div className="newsroll_info_field">
        <span>내용</span>
        <Textarea
          aria-label="문의 내용"
          placeholder="문의 내용을 자세히 작성해주세요."
          radius="rounded"
          rows={7}
          textareaSize="large"
        />
      </div>
      <Button className="newsroll_info_submit" radius="rounded" size="large" type="submit">
        문의하기
      </Button>
    </form>
  );
}

function InfoView({
  isTextLarge,
  onOpenSearch,
  onToggleTextSize,
}: {
  isTextLarge: boolean;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
}) {
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>("faq");
  const activeInfoTabLabel = infoTabs.find((tab) => tab.id === activeInfoTab)?.label ?? "FAQ";

  return (
    <section className="newsroll_info_screen" aria-label="인포메이션">
      <div className="newsroll_info_top">
        <NewsToolbar
          isTextLarge={isTextLarge}
          onOpenSearch={onOpenSearch}
          onToggleTextSize={onToggleTextSize}
        />
        <h1>{activeInfoTabLabel}</h1>
      </div>

      <div className="newsroll_info_sheet">
        <PillTabMenu
          ariaLabel="인포메이션 메뉴"
          className="newsroll_info_tabs"
          getPanelId={(id) => `newsroll_info_panel_${id}`}
          getTabId={(id) => `newsroll_info_tab_${id}`}
          items={infoTabs}
          onChange={setActiveInfoTab}
          value={activeInfoTab}
        />

        <div
          aria-labelledby={`newsroll_info_tab_${activeInfoTab}`}
          id={`newsroll_info_panel_${activeInfoTab}`}
          role="tabpanel"
        >
          {activeInfoTab === "notice" ? <InfoNoticePanel /> : null}
          {activeInfoTab === "faq" ? <InfoFaqPanel /> : null}
          {activeInfoTab === "inquiry" ? <InfoInquiryPanel /> : null}
        </div>
      </div>
    </section>
  );
}

function ActiveView({
  isTextLarge,
  onCloseSearch,
  onOpenAllNews,
  onOpenSearch,
  onToggleTextSize,
  view,
}: {
  isTextLarge: boolean;
  onCloseSearch: () => void;
  onOpenAllNews: () => void;
  onOpenSearch: () => void;
  onToggleTextSize: () => void;
  view: View;
}) {
  if (view === "search") {
    return <SearchView onClose={onCloseSearch} />;
  }

  if (view === "all") {
    return <AllNewsView isTextLarge={isTextLarge} onOpenSearch={onOpenSearch} onToggleTextSize={onToggleTextSize} />;
  }

  if (view === "policy") {
    return <PolicyView isTextLarge={isTextLarge} onOpenSearch={onOpenSearch} onToggleTextSize={onToggleTextSize} />;
  }

  if (view === "my") {
    return <MyPageView isTextLarge={isTextLarge} onOpenSearch={onOpenSearch} onToggleTextSize={onToggleTextSize} />;
  }

  if (view === "info") {
    return <InfoView isTextLarge={isTextLarge} onOpenSearch={onOpenSearch} onToggleTextSize={onToggleTextSize} />;
  }

  return (
    <HomeView
      isTextLarge={isTextLarge}
      onOpenBreakingNews={onOpenAllNews}
      onOpenSearch={onOpenSearch}
      onToggleTextSize={onToggleTextSize}
    />
  );
}

export function NewsHomeScreen() {
  const [activeView, setActiveView] = useState<View>("home");
  const [searchBackView, setSearchBackView] = useState<Tab>("home");
  const [isTextLarge, setIsTextLarge] = useState(false);

  function openSearch() {
    if (activeView !== "search") {
      setSearchBackView(activeView);
    }

    setActiveView("search");
  }

  return (
    <main
      className={`newsroll_screen${activeView === "home" ? " newsroll_screen_home" : ""}${
        activeView === "all" ? " newsroll_screen_all" : ""
      }${
        isTextLarge ? " newsroll_text_large" : ""
      }`}
    >
      <div className="newsroll_phone" aria-label="NewsRoll">
        <ActiveView
          isTextLarge={isTextLarge}
          onCloseSearch={() => setActiveView(searchBackView)}
          onOpenAllNews={() => setActiveView("all")}
          onOpenSearch={openSearch}
          onToggleTextSize={() => setIsTextLarge((current) => !current)}
          view={activeView}
        />
      </div>

      {activeView !== "search" ? (
        <nav className="newsroll_bottom_nav" aria-label="하단 탐색">
          {navItems.map((item) => (
            <IconButton
              aria-current={activeView === item.tab ? "page" : undefined}
              baseClassName="newsroll_nav_item"
              icon={item.icon}
              key={item.label}
              label={item.label}
              onClick={() => setActiveView(item.tab)}
            />
          ))}
        </nav>
      ) : null}
    </main>
  );
}

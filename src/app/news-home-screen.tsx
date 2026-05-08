"use client";

import { useState, type KeyboardEvent } from "react";

import { Button, Select, TextInput, Textarea } from "@/design-system/components";

type IconName =
  | "alarm"
  | "earth"
  | "fourSquare"
  | "home"
  | "list"
  | "loudspeaker"
  | "menu"
  | "question"
  | "search"
  | "user";

type Tab = "home" | "all" | "policy" | "my" | "info";
type View = Tab | "search";
type InfoTab = "notice" | "faq" | "inquiry";

type HomeArticle = {
  image: string;
  imageAlt: string;
  title: string;
};

const articleImage = "/images/news-apartment.png";

const homeArticle: HomeArticle = {
  image: articleImage,
  imageAlt: "아파트 단지 전경",
  title: "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
};

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
];

const allNewsLatest = [
  {
    category: "정치",
    image: allNewsAssets.latest,
    title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'",
  },
  {
    category: "정치",
    image: allNewsAssets.latest,
    title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'",
  },
];

const allNewsPresses = ["중앙일보", "국민일보", "국민일보"];

const allNewsHeadlines = Array.from({ length: 4 }, (_, index) => ({
  image: allNewsAssets.thumbnail,
  title: index === 0 ? "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입" : "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
}));

const allNewsRelayCategories = ["정치", "경제", "사회", "문화", "국제"];

const allNewsRelay = [
  {
    image: allNewsAssets.relayOne,
    title: "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
  },
  {
    image: allNewsAssets.relayTwo,
    title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'",
  },
  {
    image: allNewsAssets.relayThree,
    title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'",
  },
  {
    image: allNewsAssets.relayFour,
    title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'",
  },
  {
    image: allNewsAssets.relayFive,
    title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'",
  },
  {
    image: allNewsAssets.relayOne,
    title: "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
  },
  {
    image: allNewsAssets.relayTwo,
    title: "'APEC, 국익에 도움됐다' 74%… 국힘 지지층도 인정 '50%가 긍정'",
  },
];

function Icon({ name }: { name: IconName }) {
  return <span aria-hidden="true" className={`newsroll_icon newsroll_icon_${name}`} />;
}

function NewsToolbar({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <div className="newsroll_toolbar" aria-label="상단 도구">
      <button className="newsroll_text_size_button" type="button">
        <span>가</span>
        <strong>가</strong>
      </button>
      <button
        aria-label="검색"
        className="newsroll_icon_button newsroll_toolbar_icon"
        onClick={onOpenSearch}
        type="button"
      >
        <Icon name="search" />
      </button>
      <button aria-label="메뉴" className="newsroll_icon_button newsroll_toolbar_icon" type="button">
        <Icon name="menu" />
      </button>
    </div>
  );
}

function HomeBlockItem() {
  return (
    <article className="newsroll_home_block_item">
      <strong>{homeArticle.title}</strong>
      <span>1시간 전</span>
      <img alt={homeArticle.imageAlt} src={homeArticle.image} />
    </article>
  );
}

function HomeView({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <>
      <header className="newsroll_header">
        <PolicyStatusBar />
        <NewsToolbar onOpenSearch={onOpenSearch} />

        <div className="newsroll_home_actions">
          <div className="newsroll_view_toggle" role="tablist" aria-label="뉴스 보기 방식">
            <button
              aria-label="릴스형"
              aria-selected="true"
              className="newsroll_toggle_button newsroll_toggle_active"
              role="tab"
              type="button"
            >
              <Icon name="list" />
            </button>
            <button
              aria-label="블록형"
              aria-selected="false"
              className="newsroll_toggle_button"
              role="tab"
              type="button"
            >
              <Icon name="fourSquare" />
            </button>
          </div>

          <button className="newsroll_home_alarm" type="button" aria-label="알림">
            <Icon name="alarm" />
          </button>
        </div>
      </header>

      <section className="newsroll_home_sheet" aria-label="메인 뉴스">
        {Array.from({ length: 8 }, (_, index) => (
          <HomeBlockItem key={index} />
        ))}
      </section>
    </>
  );
}

function SearchView({ onClose }: { onClose: () => void }) {
  return (
    <section className="newsroll_search_page" aria-label="검색">
      <div className="newsroll_search_top">
        <button aria-label="검색 닫기" className="newsroll_search_close" onClick={onClose} type="button">
          <span aria-hidden="true" />
        </button>
      </div>

      <label className="newsroll_search_field">
        <span className="sr_only">검색어</span>
        <input placeholder="홍길동님은 어떻게 생각하시나요?" type="search" />
        <Icon name="search" />
      </label>

      <ol className="newsroll_search_suggestion_list" aria-label="추천 검색어">
        {searchSuggestions.map((suggestion, index) => (
          <li key={`${suggestion}-${index}`}>
            <button type="button">
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
    <div className="newsroll_all_meta">
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
    </div>
  );
}

function AllNewsMoreButton({ tone = "light" }: { tone?: "dark" | "light" }) {
  return (
    <button className={`newsroll_all_more newsroll_all_more_${tone}`} type="button">
      <span>더보기</span>
      <span className="newsroll_all_more_chevron" aria-hidden="true" />
    </button>
  );
}

function AllNewsLatestCard({ item }: { item: (typeof allNewsLatest)[number] }) {
  return (
    <button className="newsroll_all_latest_card" type="button">
      <span className="newsroll_all_chip">{item.category}</span>
      <img alt="" className="newsroll_all_latest_image" src={item.image} />
      <div className="newsroll_all_latest_body">
        <strong>{item.title}</strong>
        <AllNewsMeta />
      </div>
    </button>
  );
}

function AllNewsHeadlineItem({ item }: { item: (typeof allNewsHeadlines)[number] }) {
  return (
    <button className="newsroll_all_headline_item" type="button">
      <div className="newsroll_all_headline_body">
        <strong>{item.title}</strong>
        <AllNewsMeta />
      </div>
      <img alt="" className="newsroll_all_headline_image" src={item.image} />
    </button>
  );
}

function AllNewsRelayItem({ item, featured = false }: { featured?: boolean; item: (typeof allNewsRelay)[number] }) {
  return (
    <button className="newsroll_all_relay_item" type="button">
      <strong className={featured ? "newsroll_all_relay_title_large" : undefined}>{item.title}</strong>
      <AllNewsMeta />
      <img alt="" src={item.image} />
    </button>
  );
}

function AllNewsView({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <section className="newsroll_all_news" aria-label="전체뉴스">
      <div className="newsroll_all_top">
        <PolicyStatusBar />
        <NewsToolbar onOpenSearch={onOpenSearch} />

        <div className="newsroll_all_breaking_label">
          <Icon name="alarm" />
          <span>속보</span>
        </div>

        <div className="newsroll_all_breaking_stack">
          {allNewsBreaking.map((item) => (
            <button className="newsroll_all_breaking_card" key={item} type="button">
              {item}
            </button>
          ))}
        </div>

        <AllNewsMoreButton tone="dark" />
      </div>

      <div className="newsroll_all_sections">
        <section className="newsroll_all_panel newsroll_all_latest_panel" aria-label="최신 뉴스">
          <h1 className="newsroll_all_section_title">
            최신 뉴스 <strong>10</strong>
          </h1>
          <div className="newsroll_all_latest_scroller">
            {allNewsLatest.map((item, index) => (
              <AllNewsLatestCard item={item} key={`${item.title}-${index}`} />
            ))}
          </div>
        </section>

        <section className="newsroll_all_panel newsroll_all_press_panel" aria-label="언론사별 헤드라인">
          <h2 className="newsroll_all_section_title">언론사별 헤드라인</h2>
          <div className="newsroll_all_press_tabs">
            {allNewsPresses.map((press, index) => (
              <button className={index === 0 ? "is_active" : undefined} key={`${press}-${index}`} type="button">
                <span className="newsroll_all_press_logo" aria-hidden="true">
                  {press.slice(0, 1)}
                </span>
                <span>{press}</span>
              </button>
            ))}
          </div>
          <div className="newsroll_all_headline_list">
            {allNewsHeadlines.map((item, index) => (
              <AllNewsHeadlineItem item={item} key={`${item.title}-${index}`} />
            ))}
          </div>
          <AllNewsMoreButton />
        </section>

        <section className="newsroll_all_panel newsroll_all_relay_panel" aria-label="릴레이 뉴스">
          <h2 className="newsroll_all_section_title">릴레이 뉴스</h2>
          <div className="newsroll_all_category_tabs">
            {allNewsRelayCategories.map((category, index) => (
              <button className={index === 0 ? "is_active" : undefined} key={category} type="button">
                {category}
              </button>
            ))}
          </div>
          <div className="newsroll_all_relay_list">
            {allNewsRelay.map((item, index) => (
              <AllNewsRelayItem featured={index === 0 || index === 5} item={item} key={`${item.title}-${index}`} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

const policyListItems = Array.from({ length: 6 }, (_, index) => ({
  title: index % 2 === 0 ? "양산시 청년 자격증 응시료 지원" : "청년동아리 활동비 지원사업",
  tags: index % 2 === 0 ? ["일자리", "취업", "보조금"] : ["복지문화", "문화활동", "바우처"],
}));

function PolicyStatusBar() {
  return (
    <div className="newsroll_policy_status" aria-hidden="true">
      <span>9:09</span>
      <span className="newsroll_policy_status_icons">
        <span className="newsroll_policy_signal">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="newsroll_policy_wifi" />
        <span className="newsroll_policy_battery" />
      </span>
    </div>
  );
}

function PolicyListItem({ item }: { item: (typeof policyListItems)[number] }) {
  return (
    <article className="newsroll_policy_list_item">
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
          <strong>등록</strong> 2026년 12월 31일
        </span>
        <span>
          <strong>수정</strong> 2026년 12월 31일
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
    </article>
  );
}

function PolicyView({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <section className="newsroll_policy_screen" aria-label="국가정책">
      <div className="newsroll_policy_top">
        <PolicyStatusBar />
        <NewsToolbar onOpenSearch={onOpenSearch} />

        <section className="newsroll_policy_hero" aria-label="맞춤 정책 요약">
          <span>콩콩이님을 위한</span>
          <strong>
            11,343<span>개</span>
          </strong>
          <span>국가정책 정보가 있습니다.</span>
        </section>
      </div>

      <div className="newsroll_policy_sheet">
        <div className="newsroll_policy_age_tabs" aria-label="연령 필터">
          {["전체", "미성년", "청년", "중장년", "노년"].map((label, index) => (
            <button className={index === 0 ? "is_active" : undefined} key={label} type="button">
              {label}
            </button>
          ))}
        </div>

        <button className="newsroll_policy_sort" type="button">
          인기순 <span aria-hidden="true" />
        </button>

        <div className="newsroll_policy_list">
          {policyListItems.map((item, index) => (
            <PolicyListItem item={item} key={`${item.title}-${index}`} />
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

function MyPageView({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <section className="newsroll_my_screen" aria-label="마이페이지">
      <div className="newsroll_my_top">
        <PolicyStatusBar />
        <NewsToolbar onOpenSearch={onOpenSearch} />
        <h1>마이페이지</h1>
      </div>

      <div className="newsroll_my_sheet">
        <section className="newsroll_my_profile" aria-label="프로필">
          <strong>콩콩이님</strong>
          <button type="button">개인정보 수정</button>
        </section>

        <div className="newsroll_my_summary" aria-label="활동 통계">
          <button type="button">
            <span className="newsroll_my_summary_icon newsroll_my_summary_bookmark" aria-hidden="true" />
            <span>북마크</span>
            <strong>56</strong>
          </button>
          <button type="button">
            <span className="newsroll_my_summary_icon newsroll_my_summary_vote" aria-hidden="true" />
            <span>투표</span>
            <strong>54</strong>
          </button>
          <button type="button">
            <span className="newsroll_my_summary_icon newsroll_my_summary_comment" aria-hidden="true" />
            <span>댓글</span>
            <strong>15</strong>
          </button>
        </div>

        <section className="newsroll_my_recent" aria-label="최근 본 뉴스">
          <h2>최근 본 뉴스</h2>
          <div className="newsroll_my_recent_scroller">
            {myRecentNews.map((item, index) => (
              <button className="newsroll_my_recent_item" key={`${item.title}-${index}`} type="button">
                <img alt="" src={item.image} />
                <strong>{item.title}</strong>
                <span>{item.time}</span>
              </button>
            ))}
          </div>
          <button className="newsroll_my_full_button" type="button">전체 보기</button>
        </section>

        {myCategoryGroups.map((group) => (
          <section className="newsroll_my_chip_group" key={group.title} aria-label={group.title}>
            <h2>{group.title}</h2>
            <div>
              {group.items.map((item, index) => (
                <button
                  className={group.active.has(item) ? "is_active" : undefined}
                  key={`${group.title}-${item}-${index}`}
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
            <button className="newsroll_my_setting_row" key={label} type="button">
              <span>{label}</span>
              <span className="newsroll_my_switch is_on" aria-hidden="true" />
            </button>
          ))}
          <button className="newsroll_my_setting_row" type="button">
            <span>뉴스 보기 타입</span>
            <span className="newsroll_my_chevron" aria-hidden="true" />
          </button>
        </section>

        <section className="newsroll_my_setting_group newsroll_my_display_group" aria-label="디스플레이 설정">
          <h2>디스플레이 설정</h2>
          <button className="newsroll_my_setting_row" type="button">
            <span>다크모드</span>
            <span className="newsroll_my_switch" aria-hidden="true" />
          </button>
        </section>
      </div>
    </section>
  );
}
function InfoNoticePanel() {
  return (
    <section className="newsroll_info_list" aria-label="공지사항">
      {noticeItems.map((notice) => (
        <button className="newsroll_info_notice_item" key={notice.title} type="button">
          <span>{notice.date}</span>
          <strong>{notice.title}</strong>
          <p>더 나은 뉴스 경험을 위해 서비스 화면과 알림 기능을 정리했습니다.</p>
        </button>
      ))}
    </section>
  );
}

function InfoFaqPanel() {
  return (
    <section className="newsroll_info_list" aria-label="FAQ">
      {faqItems.map((item, index) => (
        <details className="newsroll_info_faq_item" key={`${item.question}-${index}`} open={index === 0}>
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

function InfoView({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>("faq");
  const activeInfoTabIndex = infoTabs.findIndex((tab) => tab.id === activeInfoTab);
  const activeInfoTabLabel = infoTabs[activeInfoTabIndex]?.label ?? "FAQ";

  function handleInfoTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = infoTabs.length - 1;
    const nextIndexByKey: Record<string, number> = {
      ArrowDown: activeInfoTabIndex === lastIndex ? 0 : activeInfoTabIndex + 1,
      ArrowLeft: activeInfoTabIndex === 0 ? lastIndex : activeInfoTabIndex - 1,
      ArrowRight: activeInfoTabIndex === lastIndex ? 0 : activeInfoTabIndex + 1,
      ArrowUp: activeInfoTabIndex === 0 ? lastIndex : activeInfoTabIndex - 1,
      End: lastIndex,
      Home: 0,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    setActiveInfoTab(infoTabs[nextIndex].id);
  }

  return (
    <section className="newsroll_info_screen" aria-label="인포메이션">
      <div className="newsroll_info_top">
        <PolicyStatusBar />
        <NewsToolbar onOpenSearch={onOpenSearch} />
        <h1>{activeInfoTabLabel}</h1>
      </div>

      <div className="newsroll_info_sheet">
        <div
          className="newsroll_info_tabs"
          role="tablist"
          aria-label="인포메이션 메뉴"
          onKeyDown={handleInfoTabKeyDown}
        >
          {infoTabs.map((tab) => {
            const selected = activeInfoTab === tab.id;

            return (
              <button
                aria-controls={`newsroll_info_panel_${tab.id}`}
                aria-selected={selected}
                className={selected ? "is_active" : undefined}
                id={`newsroll_info_tab_${tab.id}`}
                key={tab.id}
                onClick={() => setActiveInfoTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>

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
  onCloseSearch,
  onOpenSearch,
  view,
}: {
  onCloseSearch: () => void;
  onOpenSearch: () => void;
  view: View;
}) {
  if (view === "search") {
    return <SearchView onClose={onCloseSearch} />;
  }

  if (view === "all") {
    return <AllNewsView onOpenSearch={onOpenSearch} />;
  }

  if (view === "policy") {
    return <PolicyView onOpenSearch={onOpenSearch} />;
  }

  if (view === "my") {
    return <MyPageView onOpenSearch={onOpenSearch} />;
  }

  if (view === "info") {
    return <InfoView onOpenSearch={onOpenSearch} />;
  }

  return <HomeView onOpenSearch={onOpenSearch} />;
}

export function NewsHomeScreen() {
  const [activeView, setActiveView] = useState<View>("home");

  return (
    <main className={`newsroll_screen${activeView === "all" ? " newsroll_screen_all" : ""}`}>
      <div className="newsroll_phone" aria-label="NewsRoll">
        <ActiveView
          onCloseSearch={() => setActiveView("home")}
          onOpenSearch={() => setActiveView("search")}
          view={activeView}
        />
      </div>

      {activeView !== "search" ? (
        <nav className="newsroll_bottom_nav" aria-label="하단 탐색">
          {navItems.map((item) => (
            <button
              aria-current={activeView === item.tab ? "page" : undefined}
              aria-label={item.label}
              className="newsroll_nav_item"
              key={item.label}
              onClick={() => setActiveView(item.tab)}
              type="button"
            >
              <Icon name={item.icon} />
            </button>
          ))}
        </nav>
      ) : null}
    </main>
  );
}

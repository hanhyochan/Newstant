"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/design-system/components";

type IconName =
  | "alarm"
  | "bookmark"
  | "chat"
  | "chevronRight"
  | "dots"
  | "earth"
  | "fourSquare"
  | "home"
  | "list"
  | "loudspeaker"
  | "menu"
  | "question"
  | "search"
  | "share"
  | "thumbDown"
  | "thumbUp"
  | "user";

type Tab = "home" | "all" | "policy" | "my" | "info";
type View = Tab | "search";

type Article = {
  category: string;
  categoryTone: "politics" | "society" | "culture" | "tech";
  date: string;
  image: string;
  imageAlt: string;
  lead: string;
  poll: {
    options: string[];
    prompt: string;
    total: number;
  };
  source: string;
  title: string;
};

const articleImage = "/images/news-apartment.png";

const articles: Article[] = [
  {
    category: "정치",
    categoryTone: "politics",
    date: "2026년 12월 31일 08:30",
    image: articleImage,
    imageAlt: "아파트 단지 전경",
    lead:
      "최근 국내 부동산 시장이 다시 한번 변곡점에 서고 있다. 상반기 동안 이어졌던 거래 회복 흐름이 둔화되며, 시장 전반에 신중한 분위기가 확산되는 모습이다. 특히 수도권과 일부 광역시를 중심으로 매수 심리가 빠르게 식고 있다.\n\n한국부동산연구원이 발표한 자료에 따르면, 기준금리 유지에도 불구하고 주택담보대출 심사 강화와 보유세 부담이 실수요자와 투자자 모두에게 압박으로 작용하고 있다. 이에 따라 신규 분양 시장에서는 청약 경쟁률이 하락하고, 기존 주택 거래량 역시 전년 대비 감소세를 보이고 있다.\n\n전문가들은 당분간 가격 급등이나 급락보다는 지역별 양극화가 심화될 가능성에 주목한다.",
    poll: {
      options: [
        "어쩌구 저쩌구해서 어케 해야한다.",
        "어쩌구 저쩌구해서 어케 해야한다.",
        "어쩌구 저쩌구해서 어케 해야한다.",
      ],
      prompt: "예시텍스트 어쩌구랑 어쩌구랑 비교했을때 어케하는게 좋을까?",
      total: 100,
    },
    source: "국민일보",
    title: "용인 수지, 강남·분당 가격 동조화로 15억 시대 진입",
  },
  {
    category: "사회",
    categoryTone: "society",
    date: "2026년 12월 31일 09:10",
    image: articleImage,
    imageAlt: "아파트 단지 전경",
    lead:
      "출근 시간대 교통 혼잡을 줄이기 위한 인력 배치 실험이 주요 환승 거점에서 확대된다. 지자체는 이동량 데이터를 기반으로 배차 간격을 조정하고, 혼잡도가 높은 노선에는 임시 차량을 추가 투입할 계획이다.",
    poll: {
      options: ["그렇다", "아니다"],
      prompt: "출근길 혼잡 완화에 인력 배치가 효과적일까요?",
      total: 100,
    },
    source: "중앙일보",
    title: "수도권 출근길 혼잡 완화 실험, 주요 환승역으로 확대",
  },
  {
    category: "IT과학",
    categoryTone: "tech",
    date: "2026년 12월 31일 10:20",
    image: articleImage,
    imageAlt: "아파트 단지 전경",
    lead:
      "국내 생성형 AI 서비스들이 기사 요약과 개인 맞춤 알림 기능을 강화하고 있다. 사용자는 관심 키워드와 선호 매체를 설정해 필요한 소식만 빠르게 받아볼 수 있다.",
    poll: {
      options: ["요약이 충분하다", "원문 확인이 중요하다"],
      prompt: "뉴스 서비스에서 AI 요약을 얼마나 신뢰하시나요?",
      total: 100,
    },
    source: "테크뉴스",
    title: "AI 뉴스 요약 경쟁 본격화, 개인 맞춤 알림이 승부처로",
  },
];

const navItems: { icon: IconName; label: string; tab: Tab }[] = [
  { icon: "home", label: "메인화면", tab: "home" },
  { icon: "earth", label: "전체 뉴스", tab: "all" },
  { icon: "loudspeaker", label: "국가정책", tab: "policy" },
  { icon: "user", label: "마이페이지", tab: "my" },
  { icon: "question", label: "인포메이션", tab: "info" },
];

const policyCards = [
  {
    agency: "양산시",
    description: "미취업 청년의 자격증 응시료를 지원해 구직 부담을 낮추는 정책입니다.",
    title: "청년 자격증 응시료 지원",
  },
  {
    agency: "서울시",
    description: "청년 동아리의 프로젝트 운영비와 모임 공간을 함께 지원합니다.",
    title: "청년동아리 활동비 지원사업",
  },
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

function ReactionSummary() {
  return (
    <div aria-label="기사 반응" className="newsroll_reaction_summary">
      <span className="newsroll_reaction_item newsroll_reaction_like">
        <Icon name="thumbUp" />
        <span>16</span>
      </span>
      <span className="newsroll_reaction_item newsroll_reaction_dislike">
        <Icon name="thumbDown" />
        <span>12</span>
      </span>
      <span className="newsroll_reaction_item">
        <Icon name="dots" />
        <span>5</span>
      </span>
    </div>
  );
}

function Poll({ poll }: { poll: Article["poll"] }) {
  return (
    <section className="newsroll_poll" aria-label="기사 투표">
      <div className="newsroll_poll_title">{poll.prompt}</div>
      <div className="newsroll_poll_options">
        {poll.options.map((option, index) => (
          <button className="newsroll_poll_option" key={`${option}-${index}`} type="button">
            <span>{option}</span>
            <span className="newsroll_vote_dot" aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="newsroll_poll_total">
        <strong>{poll.total}명</strong>이 참여했어요.
      </div>
    </section>
  );
}

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <article className="newsroll_article_card">
      <div className="newsroll_article_heading">
        <span className={`newsroll_category_chip newsroll_category_${article.categoryTone}`}>
          {article.category}
        </span>
        <div className="newsroll_article_title" role="heading" aria-level={featured ? 1 : 2}>
          {article.title}
        </div>
        <div className="newsroll_article_date">{article.date}</div>
      </div>

      <div className="newsroll_article_actions" aria-label="기사 도구">
        <button aria-label="공유" className="newsroll_icon_button" type="button">
          <Icon name="share" />
        </button>
        <button aria-label="북마크" className="newsroll_icon_button" type="button">
          <Icon name="bookmark" />
        </button>
      </div>

      <div className="newsroll_article_media">
        <img alt={article.imageAlt} src={article.image} />
        <span>사진출처: 0000언론마케팅</span>
      </div>

      <div className="newsroll_article_body">{article.lead}</div>
      <ReactionSummary />

      <div className="newsroll_source_row">
        <span className="newsroll_source_mark" aria-hidden="true">
          N
        </span>
        <span>{article.source}</span>
        <span className="newsroll_source_divider" aria-hidden="true" />
        <span>홍길동 기자</span>
      </div>

      <Button className="newsroll_original_button" radius="rounded" size="medium" variant="outline">
        기사 원문 보기
      </Button>

      <div className="newsroll_reaction_controls" aria-label="반응 선택">
        <button className="newsroll_reaction_control newsroll_reaction_like" type="button">
          <Icon name="thumbUp" />
          <span>
            좋아요 <strong>16</strong>
          </span>
        </button>
        <button className="newsroll_reaction_control newsroll_reaction_dislike" type="button">
          <Icon name="thumbDown" />
          <span>
            싫어요 <strong>12</strong>
          </span>
        </button>
        <button className="newsroll_reaction_control" type="button">
          <Icon name="dots" />
          <span>
            글쎄요 <strong>5</strong>
          </span>
        </button>
      </div>

      <Poll poll={article.poll} />

      <Button className="newsroll_comment_button" radius="rounded" size="medium" variant="filled">
        <Icon name="chat" />
        댓글 반응보기
      </Button>
    </article>
  );
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

function HomeView({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <>
        <header className="newsroll_header">
          <NewsToolbar onOpenSearch={onOpenSearch} />

          <section className="newsroll_intro" aria-label="새 소식 요약">
            <div className="newsroll_greeting">
              반갑습니다 <strong>콩콩이</strong>님!
            </div>
            <div className="newsroll_metric">
              <div className="newsroll_metric_line">
                <strong>11,343</strong>
                <span>개</span>
              </div>
              <div>새로운 소식이 있습니다.</div>
            </div>
          </section>

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

          <button className="newsroll_breaking_card" type="button">
            <span className="newsroll_breaking_icon">
              <Icon name="alarm" />
            </span>
            <span>정청래, ‘필버 중단’ 국민의 힘에 “대구/경북 통합 찬반 당론 먼저 정하라”</span>
            <Icon name="chevronRight" />
          </button>
        </header>

        <section className="newsroll_feed" aria-label="뉴스 릴스">
          {articles.map((article, index) => (
            <ArticleCard article={article} featured={index === 0} key={article.title} />
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

function NewsPageShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="newsroll_page" aria-label={title}>
      <h1 className="newsroll_page_title">{title}</h1>
      {children}
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

function AllNewsStatusBar() {
  return (
    <div className="newsroll_all_status" aria-hidden="true">
      <span>9:09</span>
      <span className="newsroll_all_status_icons">
        <span className="newsroll_all_signal">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="newsroll_all_wifi" />
        <span className="newsroll_all_battery" />
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
        <AllNewsStatusBar />
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

function PolicyView() {
  return (
    <NewsPageShell title="국가정책">
      <section className="newsroll_policy_hero" aria-label="맞춤 정책 요약">
        <span>콩콩이님을 위한</span>
        <strong>11,343개</strong>
        <span>국가정책 정보가 있습니다.</span>
      </section>

      <div className="newsroll_policy_filters" aria-label="정책 필터">
        <button className="is_active" type="button">전체</button>
        <button type="button">청년</button>
        <button type="button">주거</button>
        <button type="button">일자리</button>
      </div>

      {policyCards.map((policy) => (
        <button className="newsroll_policy_card" key={policy.title} type="button">
          <span>{policy.agency}</span>
          <strong>{policy.title}</strong>
          <p>{policy.description}</p>
          <div className="newsroll_policy_tags">
            <span>신청 가능</span>
            <span>맞춤 추천</span>
          </div>
        </button>
      ))}
    </NewsPageShell>
  );
}

function MyPageView() {
  return (
    <NewsPageShell title="마이페이지">
      <section className="newsroll_profile" aria-label="프로필">
        <span className="newsroll_avatar" aria-hidden="true">콩</span>
        <strong>콩콩이님</strong>
        <button type="button">프로필 수정</button>
      </section>

      <div className="newsroll_my_stats" aria-label="활동 통계">
        <button type="button">
          <span>북마크</span>
          <strong>56</strong>
        </button>
        <button type="button">
          <span>투표</span>
          <strong>54</strong>
        </button>
        <button type="button">
          <span>댓글</span>
          <strong>15</strong>
        </button>
      </div>

      <section className="newsroll_settings_group" aria-label="최근 본 뉴스">
        <h2>최근 본 뉴스</h2>
        <button className="newsroll_recent_card" type="button">
          <img alt={articles[0].imageAlt} src={articles[0].image} />
          <span>{articles[0].title}</span>
          <em>{articles[0].source}</em>
        </button>
      </section>

      <section className="newsroll_settings_group" aria-label="설정">
        <h2>설정</h2>
        <button className="newsroll_setting_row" type="button">
          <span>뉴스 보기 타입</span>
          <span>릴스형</span>
        </button>
        <button className="newsroll_setting_row" type="button">
          <span>알림 설정</span>
          <span className="newsroll_switch is_on" aria-hidden="true" />
        </button>
      </section>
    </NewsPageShell>
  );
}

function InfoView() {
  return (
    <NewsPageShell title="인포메이션">
      <div className="newsroll_info_tabs" role="tablist" aria-label="인포메이션 메뉴">
        <button className="is_active" role="tab" type="button">공지사항</button>
        <button role="tab" type="button">FAQ</button>
        <button role="tab" type="button">1:1 문의</button>
      </div>

      <section className="newsroll_notice_list" aria-label="공지사항">
        {noticeItems.map((notice) => (
          <article key={notice.title}>
            <strong>{notice.title}</strong>
            <span>{notice.date}</span>
            <p>더 나은 뉴스 경험을 위해 서비스 화면과 알림 기능을 정리했습니다.</p>
          </article>
        ))}
      </section>
    </NewsPageShell>
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
    return <PolicyView />;
  }

  if (view === "my") {
    return <MyPageView />;
  }

  if (view === "info") {
    return <InfoView />;
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

export type SignupAgreementKey = "age" | "terms" | "privacy" | "marketing";

export const signupAgreementItems: Array<{
  id: SignupAgreementKey;
  required: boolean;
  title: string;
}> = [
  {
    id: "age",
    required: true,
    title: "만 14세 이상입니다",
  },
  {
    id: "terms",
    required: true,
    title: "서비스 이용약관 동의",
  },
  {
    id: "privacy",
    required: true,
    title: "개인정보 수집·이용 동의",
  },
  {
    id: "marketing",
    required: false,
    title: "광고성 정보 수신 동의",
  },
];

export const signupAgreementDetails: Record<
  SignupAgreementKey,
  {
    source: string;
    title: string;
    sections: Array<{
      body: string[];
      heading: string;
    }>;
  }
> = {
  age: {
    source: "개인정보보호위원회 아동·청소년 개인정보 보호 안내 기준",
    title: "만 14세 이상 확인",
    sections: [
      {
        heading: "확인 사항",
        body: [
          "NewsRoll은 별도의 법정대리인 동의 절차를 제공하기 전까지 만 14세 이상 이용자를 대상으로 회원가입을 진행합니다.",
          "만 14세 미만 아동의 개인정보를 수집·이용하려면 법정대리인에게 필요한 사항을 알리고 동의를 받아야 합니다.",
          "가입자는 본인이 만 14세 이상임을 확인하며, 사실과 다른 정보로 가입한 경우 서비스 이용이 제한될 수 있습니다.",
        ],
      },
    ],
  },
  terms: {
    source: "공정거래위원회 전자상거래 표준약관 구조 참고",
    title: "서비스 이용약관",
    sections: [
      {
        heading: "목적",
        body: [
          "이 약관은 NewsRoll이 제공하는 뉴스 탐색, 맞춤 추천, 댓글, 투표, 알림 등 서비스의 이용 조건과 절차를 정합니다.",
          "회원은 이 약관에 동의한 뒤 서비스를 이용할 수 있으며, 서비스 이용 과정에서 관련 법령과 운영 정책을 준수해야 합니다.",
        ],
      },
      {
        heading: "회원 계정 및 이용 제한",
        body: [
          "회원은 정확한 정보를 바탕으로 계정을 생성해야 하며, 계정과 비밀번호 관리 책임은 회원에게 있습니다.",
          "타인의 권리 침해, 서비스 운영 방해, 허위 정보 입력, 불법적 목적의 이용이 확인되면 서비스 이용이 제한될 수 있습니다.",
        ],
      },
      {
        heading: "서비스 변경",
        body: [
          "NewsRoll은 서비스 안정성, 운영상 필요, 법령 변경 등에 따라 기능의 일부를 변경하거나 중단할 수 있습니다.",
          "중요한 변경 사항은 서비스 화면 또는 공지사항을 통해 안내합니다.",
        ],
      },
    ],
  },
  privacy: {
    source: "개인정보 포털 개인정보 수집·이용 동의 양식 예시 참고",
    title: "개인정보 수집·이용 동의",
    sections: [
      {
        heading: "수집·이용 목적",
        body: [
          "회원 식별, 계정 생성, 로그인, 맞춤형 뉴스 추천, 관심 카테고리 설정, 알림 설정, 문의 응대 및 서비스 품질 개선을 위해 개인정보를 이용합니다.",
        ],
      },
      {
        heading: "수집 항목",
        body: [
          "필수 항목은 이메일, 비밀번호, 만 14세 이상 여부, 서비스 이용 기록입니다.",
          "선택 항목은 연령대, 관심 카테고리, 관심 언론사, 가리고 싶은 키워드, 뉴스 보기 시간, 알림 설정입니다.",
        ],
      },
      {
        heading: "보유·이용 기간 및 거부 권리",
        body: [
          "개인정보는 회원 탈퇴 또는 수집·이용 목적 달성 시까지 보유하며, 관계 법령에 따라 보관이 필요한 정보는 해당 기간 동안 보관합니다.",
          "개인정보 수집·이용 동의를 거부할 수 있으나, 필수 항목에 동의하지 않으면 회원가입과 맞춤형 서비스 이용이 제한될 수 있습니다.",
        ],
      },
    ],
  },
  marketing: {
    source: "KISA 불법스팸 방지를 위한 정보통신망법 안내서 참고",
    title: "광고성 정보 수신 동의",
    sections: [
      {
        heading: "수신 목적 및 내용",
        body: [
          "NewsRoll은 이벤트, 서비스 업데이트, 맞춤 혜택, 프로모션 안내 등 광고성 정보를 이메일 또는 카카오톡 등으로 전송할 수 있습니다.",
          "광고성 정보는 이용자의 명시적 동의가 있는 경우에만 전송하며, 서비스 이용에 필수적인 고지와는 구분됩니다.",
        ],
      },
      {
        heading: "동의 철회 및 확인",
        body: [
          "이용자는 언제든지 광고성 정보 수신 동의를 철회할 수 있으며, 철회 후에는 광고성 정보가 전송되지 않습니다.",
          "광고성 정보 수신 동의 사실은 관련 법령과 안내 기준에 따라 주기적으로 확인될 수 있습니다.",
        ],
      },
      {
        heading: "선택 동의 안내",
        body: [
          "광고성 정보 수신 동의는 선택 사항이며, 동의하지 않아도 회원가입과 기본 서비스 이용에는 제한이 없습니다.",
        ],
      },
    ],
  },
};

export type SignupAgreementDetail = (typeof signupAgreementDetails)[SignupAgreementKey];

export type SignupAgreementSearchTarget = {
  agreementId: SignupAgreementKey;
  query: string;
  targetKey: string;
};

export type SignupAgreementSearchResult = SignupAgreementSearchTarget & {
  agreementTitle: string;
  label: string;
  snippet: string;
};

function normalizeAgreementSearchQuery(query: string) {
  return query.trim().toLocaleLowerCase("ko-KR");
}

export function getAgreementSearchRootId(
  agreementId: SignupAgreementKey,
  targetKey: string,
) {
  return `signup-agreement-${agreementId}-${targetKey}`;
}

function getAgreementSearchSnippet(text: string, query: string) {
  const normalizedText = text.toLocaleLowerCase("ko-KR");
  const normalizedQuery = normalizeAgreementSearchQuery(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return text;
  }

  const start = Math.max(0, matchIndex - 32);
  const end = Math.min(text.length, matchIndex + query.trim().length + 72);

  return `${start > 0 ? "..." : ""}${text.slice(start, end)}${
    end < text.length ? "..." : ""
  }`;
}

export function createSignupAgreementSearchResults(
  query: string,
): SignupAgreementSearchResult[] {
  const normalizedQuery = normalizeAgreementSearchQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  return signupAgreementItems.flatMap((item) => {
    const agreement = signupAgreementDetails[item.id];
    const fields: Array<{ label: string; targetKey: string; text: string }> = [
      {
        label: "제목",
        targetKey: "title",
        text: agreement.title,
      },
      ...agreement.sections.flatMap((section, sectionIndex) => [
        {
          label: section.heading,
          targetKey: `section-${sectionIndex}-heading`,
          text: section.heading,
        },
        ...section.body.map((paragraph, paragraphIndex) => ({
          label: section.heading,
          targetKey: `section-${sectionIndex}-paragraph-${paragraphIndex}`,
          text: paragraph,
        })),
      ]),
      {
        label: "참고 기준",
        targetKey: "source",
        text: agreement.source,
      },
    ];

    return fields
      .filter((field) =>
        field.text.toLocaleLowerCase("ko-KR").includes(normalizedQuery),
      )
      .map((field) => ({
        agreementId: item.id,
        agreementTitle: agreement.title,
        label: field.label,
        query: query.trim(),
        snippet: getAgreementSearchSnippet(field.text, query),
        targetKey: field.targetKey,
      }));
  });
}


export type NewsCategory = {
  id: string;
  label: string;
};

export type Press = {
  id: string;
  name: string;
  logoUrl: string;
};

export type News = {
  id: string;
  categoryId: string;
  pressId: string;
  ageGroupIds?: string[];
  title: string;
  summary: string;
  body: string;
  imageUrl: string;
  reporterName: string;
  publishedAt: string;
};

export type NewsListItem = News & {
  category?: NewsCategory;
  press?: Press;
};

export type NewsPlacement = {
  id: string;
  area: string;
  newsId: string;
  order: number;
  categoryId?: string;
  pressId?: string;
};

export type WelfarePolicy = {
  id: string;
  category: string;
  subcategory: string;
  label: string;
  title: string;
  summary: string;
  ageGroupIds: string[];
  targetAge: string;
  supportContent: string;
  institution: string;
  region: string;
  businessStartDate: string;
  businessEndDate: string;
  applicationStartDate: string;
  applicationEndDate: string;
  applicationMethod: string;
  selectionMethod: string;
  documents: string;
  status: string;
  registeredAt: string;
  updatedAt: string;
  sourceUrl: string;
};

export type UserAgeGroup = {
  id: string;
  label: string;
};

export type User = {
  id: string;
  loginId: string;
  nickname: string;
  email: string;
  password?: string;
  ageGroupId: string;
  agreementIds?: string[];
  marketingAgreed?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type UpdateUserInput = Partial<
  Pick<
    User,
    "ageGroupId" | "email" | "loginId" | "marketingAgreed" | "nickname" | "password"
  >
>;

export type UserPreference = {
  id: string;
  userId: string;
  categoryIds: string[];
  pressIds: string[];
  ageGroupId: string;
  updatedAt: string;
};

export type CreateUserInput = {
  loginId: string;
  nickname: string;
  email: string;
  password: string;
  ageGroupId: string;
  agreementIds: string[];
  categoryIds: string[];
  marketingAgreed: boolean;
};

export type UserNewsViewTime = {
  id: string;
  userId: string;
  optionIds?: string[];
  times?: string[];
  updatedAt: string;
};

export type BlockedKeywordPreference = {
  id: string;
  userId: string;
  keyword: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BookmarkTargetType = "news" | "welfarePolicy" | "notice";

export type Bookmark = {
  id: string;
  userId: string;
  targetType: BookmarkTargetType;
  targetId: string;
  createdAt: string;
};

export type RecentNewsView = {
  id: string;
  userId: string;
  newsId: string;
  viewedAt: string;
};

export type ArticleReactionType = "like" | "dislike" | "neutral";

export type ArticleReaction = {
  id: string;
  newsId: string;
  userId: string;
  type: ArticleReactionType;
  createdAt: string;
};

export type Comment = {
  id: string;
  newsId: string;
  userId: string;
  parentId: string | null;
  pollOptionId: string | null;
  content: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CommentReactionType = "like" | "dislike";

export type CommentReaction = {
  id: string;
  commentId: string;
  userId: string;
  type: CommentReactionType;
  createdAt: string;
};

export type Poll = {
  id: string;
  newsId: string;
  title: string;
  createdAt: string;
};

export type PollOption = {
  id: string;
  pollId: string;
  label: string;
  order: number;
};

export type PollVote = {
  id: string;
  pollId: string;
  pollOptionId: string;
  userId: string;
  createdAt: string;
};

export type PollDetail = Poll & {
  options: PollOption[];
  currentUserVote?: PollVote;
  votes: PollVote[];
};

export type NotificationSettings = {
  id: string;
  userId: string;
  breakingNews: boolean;
  commentReplies: boolean;
  inquiryReplies: boolean;
  newsViewTime: boolean;
  policyUpdates: boolean;
  darkMode: boolean;
  updatedAt: string;
};

export type AppNotification = {
  id: string;
  userId: string;
  type:
    | "breakingNews"
    | "commentReaction"
    | "inquiryReply"
    | "newsViewTime"
    | "policyUpdate";
  title: string;
  body: string;
  targetType: "inquiry" | "news" | "policy" | null;
  targetId: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
};

export type Notice = {
  id: string;
  title: string;
  summary: string;
  content: string;
  registeredAt: string;
  updatedAt: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

export type InquiryType = {
  id: string;
  label: string;
};

export type Inquiry = {
  id: string;
  userId: string;
  typeId: string;
  title: string;
  content: string;
  status: "received" | "answered";
  replyChannel?: "email";
  replyEmail?: string;
  emailSent?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserContentActionType = "block" | "hide" | "report";
export type UserContentActionTargetType = "comment" | "reply" | "user";

export type UserContentAction = {
  id: string;
  userId: string;
  type: UserContentActionType;
  targetType: UserContentActionTargetType;
  targetId: string;
  targetUserId?: string;
  newsId?: string;
  reason?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateUserContentActionInput = Omit<
  UserContentAction,
  "createdAt" | "id" | "updatedAt"
>;

export type CreateCommentInput = {
  newsId: string;
  userId: string;
  content: string;
  parentId?: string | null;
  pollOptionId?: string | null;
};

export type UpdateCommentInput = {
  content: string;
};

export type AddCommentReactionInput = {
  commentId: string;
  userId: string;
  type: CommentReactionType;
};

export type AddBookmarkInput = {
  userId: string;
  targetType: BookmarkTargetType;
  targetId: string;
};

export type AddRecentNewsViewInput = {
  userId: string;
  newsId: string;
};

export type AddArticleReactionInput = {
  newsId: string;
  userId: string;
  type: ArticleReactionType;
};

export type SubmitPollVoteInput = {
  pollId: string;
  pollOptionId: string;
  userId: string;
};

export type CreatePollInput = {
  newsId: string;
  title: string;
  options: string[];
};

export type UpdateNotificationSettingsInput = Partial<
  Pick<
    NotificationSettings,
    | "breakingNews"
    | "commentReplies"
    | "darkMode"
    | "inquiryReplies"
    | "newsViewTime"
    | "policyUpdates"
  >
>;

export type CreateNotificationSettingsInput = Pick<NotificationSettings, "userId"> &
  UpdateNotificationSettingsInput;

export type UpdateUserNewsViewTimeInput = Partial<
  Pick<UserNewsViewTime, "optionIds" | "times">
>;

export type CreateBlockedKeywordPreferenceInput = {
  userId: string;
  keyword: string;
  isActive: boolean;
};

export type UpdateBlockedKeywordPreferenceInput = Partial<
  Pick<BlockedKeywordPreference, "keyword" | "isActive">
>;

export type CreateInquiryInput = {
  userId: string;
  typeId: string;
  title: string;
  content: string;
};

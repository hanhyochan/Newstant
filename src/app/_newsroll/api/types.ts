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
  title: string;
  summary: string;
  body: string;
  imageUrl: string;
  reporterName: string;
  publishedAt: string;
  viewCount: number;
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
  nickname: string;
  email: string;
  ageGroupId: string;
  createdAt: string;
};

export type UserPreference = {
  id: string;
  userId: string;
  categoryIds: string[];
  pressIds: string[];
  ageGroupId: string;
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
};

export type NotificationSettings = {
  id: string;
  userId: string;
  breakingNews: boolean;
  commentReplies: boolean;
  notices: boolean;
  darkMode: boolean;
  updatedAt: string;
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

export type AddBookmarkInput = {
  userId: string;
  targetType: BookmarkTargetType;
  targetId: string;
};

export type AddRecentNewsViewInput = {
  userId: string;
  newsId: string;
};

export type SubmitPollVoteInput = {
  pollId: string;
  pollOptionId: string;
  userId: string;
};

export type UpdateNotificationSettingsInput = Partial<
  Pick<NotificationSettings, "breakingNews" | "commentReplies" | "notices" | "darkMode">
>;

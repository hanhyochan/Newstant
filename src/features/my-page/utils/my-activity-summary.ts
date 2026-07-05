import type {
  Bookmark,
  Comment,
  CommentReaction,
  NewsListItem,
  Poll,
  PollOption,
  PollVote,
  RecentNewsView,
} from "@/shared/newsroll/api";
import {
  emptyCommentReactionCounts,
  type CommentId,
  type CommentItem,
  type CommentReactionValue,
} from "@/features/comments/utils/comment-data";

type ArticleBase = {
  category: string;
  image: string;
  title: string;
};

type BuildMyActivitySummaryInput<Article extends ArticleBase, Headline> = {
  allCommentReactions: CommentReaction[];
  allComments: Comment[];
  binaryGuideOptions: readonly string[];
  bookmarks: Bookmark[];
  comments: Comment[];
  formatNewsDate: (value: string) => string;
  getArticleFromNews: (news: NewsListItem, index: number) => Article;
  getCommentItem: (
    comment: Comment,
    guideChoices: string[],
    pollOptionLabelById: Record<string, string>,
    replyCount: number,
  ) => CommentItem;
  getHeadlineFromArticle: (article: Article) => Headline;
  guideOptions: string[];
  news: NewsListItem[];
  polls: Poll[];
  pollOptions: PollOption[];
  pollVotes: PollVote[];
  recentViews: RecentNewsView[];
  userVotes: PollVote[];
};

export function buildMyActivitySummary<Article extends ArticleBase, Headline>({
  allCommentReactions,
  allComments,
  binaryGuideOptions,
  bookmarks,
  comments,
  formatNewsDate,
  getArticleFromNews,
  getCommentItem,
  getHeadlineFromArticle,
  guideOptions,
  news,
  polls,
  pollOptions,
  pollVotes,
  recentViews,
  userVotes,
}: BuildMyActivitySummaryInput<Article, Headline>) {
  const newsById = new Map(news.map((item) => [item.id, item]));
  const pollById = new Map(polls.map((poll) => [poll.id, poll]));
  const optionById = new Map(pollOptions.map((option) => [option.id, option]));
  const replyCountByParentId = allComments.reduce<Record<string, number>>(
    (counts, comment) => {
      if (!comment.parentId) {
        return counts;
      }

      counts[comment.parentId] = (counts[comment.parentId] ?? 0) + 1;

      return counts;
    },
    {},
  );
  const commentReactionCountById = allCommentReactions.reduce<
    Record<CommentId, Record<CommentReactionValue, number>>
  >((counts, reaction) => {
    const currentCounts = counts[reaction.commentId] ?? {
      ...emptyCommentReactionCounts,
    };

    counts[reaction.commentId] = {
      ...currentCounts,
      [reaction.type]: currentCounts[reaction.type] + 1,
    };

    return counts;
  }, {});
  const commentItems = comments
    .map((comment, index) => {
      const articleNews = newsById.get(comment.newsId);

      if (!articleNews) {
        return null;
      }

      const article = getArticleFromNews(articleNews, index);
      const headline = {
        ...getHeadlineFromArticle(article),
        category: article.category,
      };

      return {
        article,
        category: article.category,
        comment: {
          ...getCommentItem(
            comment,
            guideOptions,
            {},
            replyCountByParentId[comment.id] ?? 0,
          ),
          dislikes:
            commentReactionCountById[comment.id]?.dislike ??
            emptyCommentReactionCounts.dislike,
          likes:
            commentReactionCountById[comment.id]?.like ??
            emptyCommentReactionCounts.like,
        },
        commentKind: comment.parentId ? "reply" as const : "comment" as const,
        headline,
        targetCommentId: comment.parentId ?? comment.id,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const bookmarkItems = bookmarks
    .filter((bookmark) => bookmark.targetType === "news")
    .map((bookmark) => {
      const articleNews = newsById.get(bookmark.targetId);

      if (!articleNews) {
        return null;
      }

      const article = getArticleFromNews(articleNews, 0);

      return {
        ...getHeadlineFromArticle(article),
        category: article.category,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const recentItems = recentViews
    .map((view, index) => {
      const articleNews = newsById.get(view.newsId);

      if (!articleNews) {
        return null;
      }

      const article = getArticleFromNews(articleNews, index);

      return {
        article,
        category: article.category,
        dateTime: view.viewedAt,
        image: article.image,
        time: formatNewsDate(view.viewedAt),
        title: article.title,
        viewId: view.id,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const voteItems = userVotes
    .map((vote, index) => {
      const poll = pollById.get(vote.pollId);
      const option = optionById.get(vote.pollOptionId);
      const articleNews = poll ? newsById.get(poll.newsId) : undefined;

      if (!poll || !option || !articleNews) {
        return null;
      }

      const article = getArticleFromNews(articleNews, index);
      const headline = {
        ...getHeadlineFromArticle(article),
        category: article.category,
      };
      const votesInPoll = pollVotes.filter((item) => item.pollId === poll.id);
      const optionsInPoll = pollOptions.filter((item) => item.pollId === poll.id);
      const selectedVotes = votesInPoll.filter(
        (item) => item.pollOptionId === option.id,
      );
      const isBinaryPoll =
        optionsInPoll.length === 2 &&
        binaryGuideOptions.every((label) =>
          optionsInPoll.some((pollOption) => pollOption.label === label),
        );
      const percent =
        votesInPoll.length > 0
          ? Math.round((selectedVotes.length / votesInPoll.length) * 100)
          : 0;

      return {
        article,
        category: article.category,
        headline,
        isBinary: isBinaryPoll,
        percent,
        pollTitle: poll.title,
        selectedOption: option.label,
        title: article.title,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    bookmarkItems,
    commentItems,
    recentItems,
    voteItems,
  };
}

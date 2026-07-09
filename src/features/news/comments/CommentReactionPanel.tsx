import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  commentApi,
  newsApi,
  userContentActionApi,
  type UserContentAction,
} from "@/shared/newstant/api";
import { currentUserId } from "@/shared/newstant/auth/current-user";
import {
  ActionMenu,
  ChipLabel,
  Divider,
  IconButton,
  IconTextButton,
  PillTabMenu,
  PrimaryButton,
  PrimaryButtonGroup,
  SelectButton,
  TextButton,
  TextInput,
  useActionMenuDismiss,
} from "@/design-system/components";
import {
  articleCardSelector,
  articleContentScrollerSelector,
  commentScrollDelayMs as commentScrollDelayMs,
  commentScrollRootSelectors,
  detailRevealDelayMs as nextArticleRevealDelayMs,
  newsFeedSelector,
  useInlineTextEdit,
} from "@/design-system/templates";
import { useCommentThread } from "@/features/comments/hooks/use-comment-thread";
import {
  emptyCommentReactionCounts,
  formatCommentDate,
  getCommentAuthor,
  getCommentChoice,
  type CommentId,
  type CommentReactionValue,
} from "@/features/comments/utils/comment-data";
import { getVisibleReactionCount } from "@/features/news/article/article-reactions";
import { NewsCreatedTime } from "@/features/news/article/NewsCreatedTime";
import { CommentInlineEditor } from "@/features/news/comments/CommentInlineEditor";
import { BottomFixedActionBar } from "@/features/shared/BottomFixedActionBar";
import { ConfirmDialog } from "@/features/shared/ConfirmDialog";
import { DataUnavailableMessage } from "@/features/shared/DataUnavailableMessage";
import {
  binaryGuideOptions,
  guideOptions,
  type GuideKind,
} from "@/features/news/model";
import type { CommentReplyItem } from "@/features/news/comments/comment-model";
import { ClientPortal } from "@/features/news/comments/ClientPortal";
import { useCommentPanelDerivedComments } from "@/features/news/comments/use-comment-panel-derived-comments";
import {
  commentReportReasons,
  commentSortOptions,
  myCommentActionOptions,
  otherCommentActionOptions,
  type CommentAction,
  type CommentReportTarget,
  type CommentScrollTarget,
  type CommentSortOrder,
} from "@/features/news/comments/comment-panel-model";

type PendingCommentDeleteTarget =
  | { commentId: CommentId; type: "comment" }
  | { reply: CommentReplyItem; type: "reply" };
export function CommentReactionPanel({
  guideKind,
  id,
  initialCommentId,
  initialReplyTargetId,
  newsId,
}: {
  guideKind: GuideKind;
  id?: string;
  initialCommentId?: CommentId;
  initialReplyTargetId?: CommentId;
  newsId?: string;
}) {
  const guideChoices =
    guideKind === "binary" ? binaryGuideOptions : guideOptions;
  const panelId = id ?? "home-comment-panel";
  const composerId = `${panelId}-composer`;
  const commentSortMenuId = `${panelId}-sort-menu`;
  const panelRef = useRef<HTMLElement | null>(null);
  const commentTabs = useMemo(
    () => [
      { id: "all", label: "전체" },
      ...guideChoices.map((choice) => ({ id: choice, label: choice })),
    ],
    [guideChoices],
  );
  const [activeChoice, setActiveChoice] = useState(commentTabs[0].id);
  const [composerDraft, setComposerDraft] = useState("");
  const [composerMode, setComposerMode] = useState<"comment" | "reply">(
    "comment",
  );
  const {
    apiComments,
    commentLoadFailed,
    commentReactionCounts,
    commentReactionRows,
    commentReactions,
    pollOptionLabelById,
    reloadComments,
    setApiComments,
    setCommentReactionCounts,
    setCommentReactions,
  } = useCommentThread(newsId);
  const [deletedCommentIds, setDeletedCommentIds] = useState<CommentId[]>([]);
  const [deletedReplyIds, setDeletedReplyIds] = useState<string[]>([]);
  const [contentActions, setContentActions] = useState<UserContentAction[]>([]);
  const [expandedReplyId, setExpandedReplyId] = useState<CommentId | null>(
    null,
  );
  const [isComposerVisible, setIsComposerVisible] = useState(true);
  const [composerHeight, setComposerHeight] = useState(0);
  const [myCommentsOnly, setMyCommentsOnly] = useState(false);
  const [isCommentSortOpen, setIsCommentSortOpen] = useState(false);
  const [openCommentActionId, setOpenCommentActionId] =
    useState<CommentId | null>(null);
  const [openReplyActionId, setOpenReplyActionId] = useState<string | null>(
    null,
  );
  const [replyTargetCommentId, setReplyTargetCommentId] = useState<
    CommentId | null
  >(null);
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>("popular");
  const [pendingScrollTarget, setPendingScrollTarget] =
    useState<CommentScrollTarget | null>(null);
  const [reportTarget, setReportTarget] = useState<CommentReportTarget | null>(
    null,
  );
  const [reportReason, setReportReason] = useState(commentReportReasons[0]);
  const [isReportReasonOpen, setIsReportReasonOpen] = useState(false);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [moderationConfirmMessage, setModerationConfirmMessage] = useState("");
  const [pendingDeleteTarget, setPendingDeleteTarget] =
    useState<PendingCommentDeleteTarget | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const commentEdit = useInlineTextEdit<CommentId>();
  const replyEdit = useInlineTextEdit<string>();
  const initialCommentScrollKeyRef = useRef<string | null>(null);
  const replyComposerHistoryRef = useRef(false);
  const initialCommentTargetId =
    initialCommentId != null || initialReplyTargetId != null
      ? `${panelId}-comment-${initialCommentId ?? initialReplyTargetId}`
      : null;
  const initialCommentScrollKey =
    initialCommentTargetId != null
      ? `${newsId ?? ""}:${initialCommentTargetId}`
      : null;
  const commentListStyle = {
    "--comment-composer-height": isComposerVisible
      ? `${composerHeight}px`
      : "0px",
  } as CSSProperties;
  const commentListId = `${panelId}-comment-list`;
  const prepareInitialCommentScroll = useCallback(() => {
    const targetCommentId = initialReplyTargetId ?? initialCommentId;

    if (targetCommentId == null) {
      return;
    }

    setIsComposerVisible(true);
  }, [initialCommentId, initialReplyTargetId]);
  const {
    allComments,
    blockedUserIdSet,
    commentsByParentId,
    deletedReplyIdSet,
    getCommentReactionCounts,
    hiddenReplyIdSet,
    visibleComments,
  } = useCommentPanelDerivedComments({
    activeChoice,
    apiComments,
    commentEditedValues: commentEdit.editedValues,
    commentReactionCounts,
    contentActions,
    deletedCommentIds,
    deletedReplyIds,
    guideChoices,
    myCommentsOnly,
    pollOptionLabelById,
    sortOrder,
  });

  function scrollArticleTo(
    articleScroller: HTMLElement,
    nextScrollTop: number,
  ) {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    articleScroller.scrollTop = nextScrollTop;

    if (
      !prefersReducedMotion &&
      typeof articleScroller.scrollTo === "function"
    ) {
      articleScroller.scrollTo({
        behavior: "smooth",
        top: nextScrollTop,
      });
    }
  }

  function getCommentScrollRoot() {
    const panel = panelRef.current;

    if (!panel) {
      return null;
    }

    const candidates = commentScrollRootSelectors.map((selector) =>
      panel.closest(selector),
    );

    return (
      candidates.find(
        (candidate): candidate is HTMLElement =>
          candidate instanceof HTMLElement &&
          candidate.scrollHeight > candidate.clientHeight,
      ) ??
      candidates.find(
        (candidate): candidate is HTMLElement =>
          candidate instanceof HTMLElement,
      ) ??
      null
    );
  }

  function scrollElementBottomIntoView(targetId: string, bottomGap = 24) {
    const target = document.getElementById(targetId);
    const articleScroller = getCommentScrollRoot();

    if (!(articleScroller instanceof HTMLElement) || !target) {
      return false;
    }

    const scrollerRect = articleScroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const composerRect = document
      .getElementById(composerId)
      ?.getBoundingClientRect();
    const visibleBottom = composerRect
      ? Math.min(scrollerRect.bottom, composerRect.top)
      : scrollerRect.bottom;
    const targetScrollTop =
      articleScroller.scrollTop + targetRect.bottom - visibleBottom + bottomGap;
    const nextScrollTop = Math.min(
      Math.max(0, articleScroller.scrollHeight - articleScroller.clientHeight),
      Math.max(0, targetScrollTop),
    );

    scrollArticleTo(articleScroller, nextScrollTop);
    return true;
  }

  const closeCommentActionMenus = useCallback(() => {
    setIsCommentSortOpen(false);
    setOpenCommentActionId(null);
    setOpenReplyActionId(null);
  }, []);

  useActionMenuDismiss({
    enabled:
      isCommentSortOpen ||
      openCommentActionId !== null ||
      openReplyActionId !== null,
    ignoreSelector: ".wrapper_dropdownSelect, .wrapper_commentAction",
    onDismiss: closeCommentActionMenus,
  });

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const scrollRoot = panel.closest(articleContentScrollerSelector);
    const card = scrollRoot?.closest(articleCardSelector);
    const feedScroller = card?.closest(newsFeedSelector);
    const updateComposerVisibility = () => {
      if (!(scrollRoot instanceof HTMLElement)) {
        setIsComposerVisible(false);
        return;
      }

      const panelRect = panel.getBoundingClientRect();
      const rootRect = scrollRoot.getBoundingClientRect();
      const hasVisibleOverlap =
        panelRect.bottom > rootRect.top && panelRect.top < rootRect.bottom;

      setIsComposerVisible(hasVisibleOverlap);
    };

    updateComposerVisibility();
    if (scrollRoot instanceof HTMLElement) {
      scrollRoot.addEventListener("scroll", updateComposerVisibility, {
        passive: true,
      });
    }
    if (feedScroller instanceof HTMLElement && feedScroller !== scrollRoot) {
      feedScroller.addEventListener("scroll", updateComposerVisibility, {
        passive: true,
      });
    }
    window.addEventListener("resize", updateComposerVisibility);

    return () => {
      if (scrollRoot instanceof HTMLElement) {
        scrollRoot.removeEventListener("scroll", updateComposerVisibility);
      }
      if (feedScroller instanceof HTMLElement && feedScroller !== scrollRoot) {
        feedScroller.removeEventListener("scroll", updateComposerVisibility);
      }
      window.removeEventListener("resize", updateComposerVisibility);
    };
  }, []);

  useEffect(() => {
    if (initialCommentTargetId == null || initialCommentScrollKey == null) {
      return;
    }

    if (initialCommentScrollKeyRef.current === initialCommentScrollKey) {
      return;
    }

    prepareInitialCommentScroll();

    if (composerHeight <= 0) {
      return;
    }

    let isCancelled = false;
    let retryTimeout = 0;

    const tryScrollToInitialComment = (attempt = 0) => {
      if (isCancelled) {
        return;
      }

      const didScroll = scrollElementBottomIntoView(
        initialCommentTargetId,
        0,
      );

      if (didScroll) {
        initialCommentScrollKeyRef.current = initialCommentScrollKey;
        return;
      }

      if (attempt >= 12) {
        return;
      }

      retryTimeout = window.setTimeout(() => {
        window.requestAnimationFrame(() => {
          tryScrollToInitialComment(attempt + 1);
        });
      }, 80);
    };

    const timeout = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          tryScrollToInitialComment();
        });
      });
    }, commentScrollDelayMs);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
      window.clearTimeout(retryTimeout);
    };
  }, [
    apiComments.length,
    composerHeight,
    expandedReplyId,
    initialCommentScrollKey,
    initialCommentTargetId,
    prepareInitialCommentScroll,
  ]);

  useEffect(() => {
    if (isComposerVisible) {
      return;
    }

    setComposerHeight(0);
    replyComposerHistoryRef.current = false;
    setComposerDraft("");
    setComposerMode("comment");
    commentEdit.cancelEdit();
    replyEdit.cancelEdit();
    setReplyTargetCommentId(null);
  }, [isComposerVisible]);

  useEffect(() => {
    function handleReplyComposerBack() {
      if (!replyComposerHistoryRef.current) {
        return;
      }

      setExpandedReplyId(null);
      resetComposer();
    }

    window.addEventListener("popstate", handleReplyComposerBack);

    return () => {
      window.removeEventListener("popstate", handleReplyComposerBack);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isComposerVisible) {
      setComposerHeight(0);
      return undefined;
    }

    let animationFrame = 0;

    const measureComposer = () => {
      const composer = document.getElementById(composerId);
      const nextHeight = composer
        ? Math.ceil(composer.getBoundingClientRect().height)
        : 0;

      setComposerHeight((current) =>
        current === nextHeight ? current : nextHeight,
      );
    };

    animationFrame = window.requestAnimationFrame(measureComposer);
    window.addEventListener("resize", measureComposer);

    const composer = document.getElementById(composerId);
    const resizeObserver =
      composer && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measureComposer)
        : null;

    if (composer && resizeObserver) {
      resizeObserver.observe(composer);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", measureComposer);
      resizeObserver?.disconnect();
    };
  }, [composerId, isComposerVisible]);

  useEffect(() => {
    if (!pendingScrollTarget) {
      return;
    }

    const scrollTarget = pendingScrollTarget;
    let isCancelled = false;
    let retryTimeout = 0;

    const scrollToPendingTarget = (attempt = 0) => {
      if (isCancelled) {
        return;
      }

      const didScroll = scrollElementBottomIntoView(
        scrollTarget.id,
        scrollTarget.bottomGap,
      );

      if (didScroll) {
        setPendingScrollTarget(null);
        return;
      }

      if (attempt >= 12) {
        setPendingScrollTarget(null);
        return;
      }

      retryTimeout = window.setTimeout(() => {
        scrollToPendingTarget(attempt + 1);
      }, 80);
    };

    const timeout = window.setTimeout(() => {
      scrollToPendingTarget();
    }, scrollTarget.delayMs ?? commentScrollDelayMs);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
      window.clearTimeout(retryTimeout);
    };
  }, [pendingScrollTarget]);

  function resetComposer() {
    replyComposerHistoryRef.current = false;
    setComposerDraft("");
    setComposerMode("comment");
    commentEdit.cancelEdit();
    replyEdit.cancelEdit();
    setReplyTargetCommentId(null);
  }

  function activateReplyComposer(commentId: CommentId) {
    commentEdit.cancelEdit();
    replyEdit.cancelEdit();
    setReplyTargetCommentId(commentId);
    setComposerMode("reply");
    setComposerDraft("");

    if (!replyComposerHistoryRef.current) {
      window.history.pushState(
        { replyComposer: true },
        "",
        window.location.href,
      );
      replyComposerHistoryRef.current = true;
    }
  }

  function deactivateReplyComposer(shouldRestoreHistory = false) {
    const shouldGoBack = shouldRestoreHistory && replyComposerHistoryRef.current;

    resetComposer();

    if (shouldGoBack) {
      window.history.back();
    }
  }

  function startEditComment(commentId: CommentId) {
    const targetComment = allComments.find(
      (comment) => comment.id === commentId && comment.isMine,
    );

    if (!targetComment) {
      return;
    }

    setReplyTargetCommentId(null);
    replyEdit.cancelEdit();
    commentEdit.beginEdit(commentId, targetComment.body);
    setComposerMode("comment");
    setComposerDraft("");
  }

  function cancelEditComment() {
    commentEdit.cancelEdit();
  }

  async function saveEditedComment() {
    const commentId = commentEdit.editingId;
    const content = commentEdit.draft.trim();

    if (!commentId || !content) {
      return;
    }

    await commentApi.updateComment(commentId, { content });
    commentEdit.saveEdit();
    await reloadComments();
  }

  function startEditReply(reply: CommentReplyItem, value: string) {
    if (!reply.isMine) {
      return;
    }

    commentEdit.cancelEdit();
    replyEdit.beginEdit(reply.id, value);
    setComposerMode("comment");
    setComposerDraft("");
  }

  function cancelEditReply() {
    replyEdit.cancelEdit();
  }

  async function saveEditedReply() {
    const replyId = replyEdit.editingId;
    const content = replyEdit.draft.trim();

    if (!replyId || !content) {
      return;
    }

    await commentApi.updateComment(replyId, { content });
    replyEdit.saveEdit();
    await reloadComments();
  }

  function toggleReplyList(commentId: CommentId, hasReplies: boolean) {
    const isClosing = expandedReplyId === commentId;

    setExpandedReplyId(isClosing ? null : commentId);

    if (isClosing && replyTargetCommentId === commentId) {
      deactivateReplyComposer(true);
      return;
    }

    if (!isClosing) {
      activateReplyComposer(commentId);
      setPendingScrollTarget({
        bottomGap: 0,
        delayMs: nextArticleRevealDelayMs,
        id: hasReplies
          ? `${panelId}-reply-list-${commentId}`
          : `${panelId}-comment-${commentId}`,
      });
    }
  }

  async function recordCommentArticleActivity() {
    if (!newsId) {
      return;
    }

    await newsApi
      .addRecentNewsView({
        newsId,
        userId: currentUserId,
      })
      .catch(() => undefined);
  }

  async function submitComposer() {
    const body = composerDraft.trim();

    if (!body || !newsId) {
      return;
    }

    if (composerMode === "reply") {
      const targetComment = allComments.find(
        (comment) => comment.id === replyTargetCommentId,
      );

      if (!targetComment) {
        resetComposer();
        return;
      }

      const createdReply = await commentApi.createComment({
        content: body,
        newsId,
        parentId: targetComment.id,
        userId: currentUserId,
      });
      await recordCommentArticleActivity();

      setPendingScrollTarget({
        bottomGap: 0,
        id: `${panelId}-reply-${createdReply.id}`,
      });
      setExpandedReplyId(targetComment.id);
      resetComposer();
      await reloadComments();
      return;
    }

    const selectedPollOptionId = Object.entries(pollOptionLabelById).find(
      ([, label]) => label === activeChoice,
    )?.[0];
    const createdComment = await commentApi.createComment({
      content: body,
      newsId,
      pollOptionId: selectedPollOptionId ?? null,
      userId: currentUserId,
    });
    await recordCommentArticleActivity();

    setPendingScrollTarget({
      bottomGap: 0,
      id: `${panelId}-comment-${createdComment.id}`,
    });
    resetComposer();
    await reloadComments();
  }

  function toggleCommentReaction(
    commentId: CommentId,
    reaction: CommentReactionValue,
  ) {
    const targetComment = apiComments.find((comment) => comment.id === commentId);
    const currentReaction = commentReactionRows[commentId] ?? null;

    if (!targetComment) {
      return;
    }

    const nextReaction = currentReaction?.type === reaction ? null : reaction;
    const likeDelta =
      (nextReaction === "like" ? 1 : 0) -
      (currentReaction?.type === "like" ? 1 : 0);
    const dislikeDelta =
      (nextReaction === "dislike" ? 1 : 0) -
      (currentReaction?.type === "dislike" ? 1 : 0);
    const currentReactionCounts = commentReactionCounts[commentId] ?? {
      ...emptyCommentReactionCounts,
    };
    const nextLikeCount = Math.max(
      0,
      currentReactionCounts.like + likeDelta,
    );
    const nextDislikeCount = Math.max(
      0,
      currentReactionCounts.dislike + dislikeDelta,
    );

    setCommentReactions((currentReactions) => ({
      ...currentReactions,
      [commentId]: nextReaction,
    }));
    setCommentReactionCounts((currentCounts) => {
      const currentCommentCounts = currentCounts[commentId] ?? {
        ...emptyCommentReactionCounts,
      };

      return {
        ...currentCounts,
        [commentId]: {
          dislike: Math.max(0, currentCommentCounts.dislike + dislikeDelta),
          like: Math.max(0, currentCommentCounts.like + likeDelta),
        },
      };
    });
    setApiComments((currentComments) =>
      currentComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              dislikeCount: Math.max(0, comment.dislikeCount + dislikeDelta),
              likeCount: Math.max(0, comment.likeCount + likeDelta),
            }
          : comment,
      ),
    );

    void (async () => {
      if (!nextReaction && currentReaction) {
        await commentApi.removeCommentReaction(currentReaction.id);
      } else if (nextReaction && currentReaction) {
        await commentApi.updateCommentReaction(currentReaction.id, nextReaction);
      } else if (nextReaction) {
        await commentApi.addCommentReaction({
          commentId,
          type: nextReaction,
          userId: currentUserId,
        });
      }

      await commentApi.updateCommentReactionCounts(commentId, {
        dislikeCount: nextDislikeCount,
        likeCount: nextLikeCount,
      });
      await reloadComments();
    })();
  }

  function addContentAction(action: UserContentAction) {
    setContentActions((currentActions) =>
      currentActions.some((currentAction) => currentAction.id === action.id)
        ? currentActions
        : [action, ...currentActions],
    );
  }

  function hideTargetContent(targetId: string, targetType: "comment" | "reply") {
    if (targetType === "comment") {
      setDeletedCommentIds((currentIds) =>
        currentIds.includes(targetId) ? currentIds : [...currentIds, targetId],
      );
      setExpandedReplyId((currentId) => (currentId === targetId ? null : currentId));
      if (replyTargetCommentId === targetId) {
        resetComposer();
      }
      return;
    }

    setDeletedReplyIds((currentIds) =>
      currentIds.includes(targetId) ? currentIds : [...currentIds, targetId],
    );
  }

  function blockUserContent(targetUserId: string) {
    const targetCommentIds = apiComments
      .filter(
        (comment) => comment.userId === targetUserId && comment.parentId === null,
      )
      .map((comment) => comment.id);
    const targetReplyIds = apiComments
      .filter(
        (comment) => comment.userId === targetUserId && comment.parentId !== null,
      )
      .map((comment) => comment.id);

    setDeletedCommentIds((currentIds) =>
      Array.from(new Set([...currentIds, ...targetCommentIds])),
    );
    setDeletedReplyIds((currentIds) =>
      Array.from(new Set([...currentIds, ...targetReplyIds])),
    );
    if (replyTargetCommentId) {
      const replyTarget = apiComments.find(
        (comment) => comment.id === replyTargetCommentId,
      );

      if (replyTarget?.userId === targetUserId) {
        resetComposer();
      }
    }
  }

  function saveCommentModerationAction({
    action,
    reason,
    targetId,
    targetType,
    targetUserId,
  }: CommentReportTarget & { action: "block" | "hide" | "report"; reason?: string }) {
    return userContentActionApi
      .createAction({
        newsId,
        reason,
        targetId,
        targetType,
        targetUserId,
        type: action,
        userId: currentUserId,
      })
      .then((createdAction) => {
        addContentAction(createdAction);
        return createdAction;
      });
  }

  function openReportDialog(target: CommentReportTarget) {
    setReportTarget(target);
    setReportReason(commentReportReasons[0]);
    setIsReportReasonOpen(false);
  }

  function submitReport() {
    if (!reportTarget) {
      return;
    }

    setIsReportSubmitting(true);
    saveCommentModerationAction({
      ...reportTarget,
      action: "report",
      reason: reportReason,
    })
      .then(() => {
        setReportTarget(null);
        setModerationConfirmMessage("신고되었습니다.");
      })
      .finally(() => {
        setIsReportSubmitting(false);
      });
  }

  function getDeleteTargetCommentIds(target: PendingCommentDeleteTarget) {
    if (target.type === "reply") {
      return [target.reply.id];
    }

    return [
      ...apiComments
        .filter((comment) => comment.parentId === target.commentId)
        .map((comment) => comment.id),
      target.commentId,
    ];
  }

  async function deleteServerComment(commentId: string) {
    try {
      await commentApi.deleteComment(commentId);
      return;
    } catch (error) {
      const latestComments = newsId
        ? await commentApi.getCommentsByNewsId(newsId)
        : await commentApi.getComments();

      if (latestComments.some((comment) => comment.id === commentId)) {
        throw error;
      }
    }
  }

  async function deleteCommentRecords(commentIds: string[]) {
    const commentIdSet = new Set(commentIds);
    const targetReactions = (await commentApi.getCommentReactions()).filter(
      (reaction) => commentIdSet.has(reaction.commentId),
    );

    await Promise.all(
      targetReactions.map((reaction) =>
        commentApi.removeCommentReaction(reaction.id),
      ),
    );

    for (const commentId of commentIds) {
      await deleteServerComment(commentId);
    }
  }

  function removeLocalCommentRecords(commentIds: string[]) {
    const commentIdSet = new Set(commentIds);

    setApiComments((currentComments) =>
      currentComments.filter((comment) => !commentIdSet.has(comment.id)),
    );
    setCommentReactions((currentReactions) => {
      const nextReactions = { ...currentReactions };

      commentIds.forEach((commentId) => {
        delete nextReactions[commentId];
      });

      return nextReactions;
    });
    setCommentReactionCounts((currentCounts) => {
      const nextCounts = { ...currentCounts };

      commentIds.forEach((commentId) => {
        delete nextCounts[commentId];
      });

      return nextCounts;
    });
  }

  function applyDeletedCommentTarget(
    target: PendingCommentDeleteTarget,
    commentIds: string[],
  ) {
    removeLocalCommentRecords(commentIds);

    if (target.type === "reply") {
      setDeletedReplyIds((currentIds) =>
        currentIds.includes(target.reply.id)
          ? currentIds
          : [...currentIds, target.reply.id],
      );
      replyEdit.clearEdit(target.reply.id);
      return;
    }

    const replyIds = commentIds.filter((commentId) => commentId !== target.commentId);

    setDeletedCommentIds((currentIds) =>
      currentIds.includes(target.commentId)
        ? currentIds
        : [...currentIds, target.commentId],
    );
    setDeletedReplyIds((currentIds) =>
      Array.from(new Set([...currentIds, ...replyIds])),
    );
    setExpandedReplyId((currentId) =>
      currentId === target.commentId ? null : currentId,
    );
    if (replyTargetCommentId === target.commentId) {
      resetComposer();
    }
    commentEdit.clearEdit(target.commentId);
    replyIds.forEach((replyId) => replyEdit.clearEdit(replyId));
  }

  async function confirmDeleteTarget() {
    if (!pendingDeleteTarget || isDeleteSubmitting) {
      return;
    }

    const target = pendingDeleteTarget;
    const commentIds = getDeleteTargetCommentIds(target);

    setIsDeleteSubmitting(true);
    setPendingDeleteTarget(null);
    applyDeletedCommentTarget(target, commentIds);

    try {
      await deleteCommentRecords(commentIds);
      await reloadComments();
    } catch {
      setModerationConfirmMessage("\uB313\uAE00 \uC0AD\uC81C\uB97C \uC11C\uBC84\uC5D0 \uBC18\uC601\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    } finally {
      setIsDeleteSubmitting(false);
    }
  }
  function handleCommentAction(commentId: CommentId, action: CommentAction) {
    setOpenCommentActionId(null);
    setOpenReplyActionId(null);

    if (action === "delete") {
      setPendingDeleteTarget({ commentId, type: "comment" });
      return;
    }


    if (action === "edit") {
      startEditComment(commentId);
      return;
    }

    if (action === "report" || action === "block" || action === "hide") {
      const targetComment = apiComments.find((comment) => comment.id === commentId);

      if (!targetComment || targetComment.userId === currentUserId) {
        return;
      }

      const target = {
        targetId: commentId,
        targetType: "comment",
        targetUserId: targetComment.userId,
      } as const;

      if (action === "report") {
        openReportDialog(target);
        return;
      }

      void saveCommentModerationAction({
        ...target,
        action,
      }).then(() => {
        if (action === "hide") {
          hideTargetContent(commentId, "comment");
          setModerationConfirmMessage("숨김처리되었습니다.");
          return;
        }

        blockUserContent(targetComment.userId);
        setModerationConfirmMessage("차단되었습니다.");
      });
      }
  }

  function handleReplyAction(reply: CommentReplyItem, action: CommentAction) {
    setOpenReplyActionId(null);

    if (action === "delete") {
      setPendingDeleteTarget({ reply, type: "reply" });
      return;
    }


    if (action === "edit") {
      startEditReply(reply, replyEdit.getEditedValue(reply.id) ?? reply.body);
      return;
    }

    if (action === "report" || action === "block" || action === "hide") {
      if (!reply.userId || reply.userId === currentUserId) {
        return;
      }

      const target = {
        targetId: reply.id,
        targetType: "reply",
        targetUserId: reply.userId,
      } as const;

      if (action === "report") {
        openReportDialog(target);
        return;
      }

      void saveCommentModerationAction({
        ...target,
        action,
      }).then(() => {
        if (action === "hide") {
          hideTargetContent(reply.id, "reply");
          setModerationConfirmMessage("숨김처리되었습니다.");
          return;
        }

        blockUserContent(target.targetUserId);
        setModerationConfirmMessage("차단되었습니다.");
      });
    }
  }

  return (
    <>
      <section
        className="wrapper_commentPanel motion_enterUp"
        id={id}
        ref={panelRef}
        aria-label="댓글 반응"
      >
        <div className="wrapper_commentSummary wrapper_betweenRow">
          <span className="text_commentTotal">댓글 {allComments.length}</span>
          <TextButton
            aria-pressed={myCommentsOnly}
            onClick={() => {
              setMyCommentsOnly((current) => !current);
              setActiveChoice(commentTabs[0].id);
            }}
            type="button"
          >
            나의 댓글
          </TextButton>
        </div>

        <section
          className="container_commentGuide"
          aria-label="안내 선택지별 댓글"
        >
          <div className="wrapper_commentGuideTabs">
            <h3>투표 선택지 별</h3>
            <PillTabMenu
              ariaLabel="안내 선택지별 댓글 필터"
              className="wrapper_commentTabs wrapper_tabScroller"
              items={commentTabs}
              onChange={setActiveChoice}
              value={activeChoice}
            />
          </div>

          <div className="wrapper_commentGuideComments">
            <SelectButton
              ariaLabel="댓글 정렬"
              isOpen={isCommentSortOpen}
              listboxId={commentSortMenuId}
              onChange={setSortOrder}
              onOpenChange={(nextOpen) => {
                setOpenCommentActionId(null);
                setOpenReplyActionId(null);
                setIsCommentSortOpen(nextOpen);
              }}
              options={commentSortOptions}
              value={sortOrder}
            />

            <div
              className="wrapper_commentList wrapper_scrollList"
              id={commentListId}
              style={commentListStyle}
            >
              {visibleComments.length > 0 ? (
                visibleComments.map((comment, index) => {
                  const selectedReaction = commentReactions[comment.id] ?? null;
                  const { dislikes: dislikeCount, likes: likeCount } =
                    getCommentReactionCounts(comment);
                  const actionMenuId = `${panelId}-comment-action-${comment.id}`;
                  const commentActions = comment.isMine
                    ? myCommentActionOptions
                    : otherCommentActionOptions;
                  const replyToggleId = `${panelId}-reply-toggle-${comment.id}`;
                  const replyListId = `${panelId}-reply-list-${comment.id}`;
                  const isReplyListOpen = expandedReplyId === comment.id;
                  const isEditingComment =
                    commentEdit.editingId === comment.id;
                  const commentReplies = (commentsByParentId[comment.id] ?? [])
                    .map((reply) => ({
                      author: getCommentAuthor(reply.userId),
                      body: reply.content,
                      choice: getCommentChoice(
                        reply,
                        guideChoices,
                        pollOptionLabelById,
                      ),
                      date: formatCommentDate(reply.createdAt),
                      dislikes: reply.dislikeCount,
                      id: reply.id,
                      isMine: reply.userId === currentUserId,
                      likes: reply.likeCount,
                      userId: reply.userId,
                    }))
                    .filter(
                      (reply) =>
                        !deletedReplyIdSet.has(reply.id) &&
                        !hiddenReplyIdSet.has(reply.id) &&
                        !blockedUserIdSet.has(reply.userId),
                    );
                  const hasCommentReplies = commentReplies.length > 0;

                  return (
                    <Fragment key={comment.id}>
                      {index > 0 ? (
                        <Divider className="divider_commentItem" />
                      ) : null}
                      <article
                        className="wrapper_commentItem"
                        id={`${panelId}-comment-${comment.id}`}
                      >
                        <header>
                          <span className="wrapper_commentMeta">
                            <strong>{comment.author}</strong>
                            <NewsCreatedTime>{comment.date}</NewsCreatedTime>
                          </span>
                          <ActionMenu
                            buttonLabel="댓글 더보기"
                            isOpen={openCommentActionId === comment.id}
                            menuClassName="listbox_commentActionMenu listbox_commentAction"
                            menuId={actionMenuId}
                            onOpenChange={(nextIsOpen) => {
                                setIsCommentSortOpen(false);
                                setOpenReplyActionId(null);
                                setOpenCommentActionId(
                                  nextIsOpen ? comment.id : null,
                                );
                              }}
                            onSelect={(action) =>
                              handleCommentAction(comment.id, action)
                            }
                            options={commentActions}
                          />
                        </header>
                        <ChipLabel>
                          {comment.choice}
                        </ChipLabel>
                        {isEditingComment ? (
                          <CommentInlineEditor
                            ariaLabel="댓글 수정"
                            onCancel={cancelEditComment}
                            onChange={commentEdit.setDraft}
                            onSave={saveEditedComment}
                            value={commentEdit.draft}
                          />
                        ) : (
                          <p>{comment.body}</p>
                        )}
                        <footer>
                          <TextButton
                            aria-controls={
                              hasCommentReplies && isReplyListOpen
                                ? replyListId
                                : undefined
                            }
                            aria-expanded={
                              hasCommentReplies ? isReplyListOpen : undefined
                            }
                            id={replyToggleId}
                            onClick={() =>
                              toggleReplyList(comment.id, hasCommentReplies)
                            }
                            type="button"
                          >
                            대댓글 {commentReplies.length}
                          </TextButton>
                          <span>
                            <IconTextButton
                              aria-label="댓글 좋아요"
                              aria-pressed={selectedReaction === "like"}
                              icon="thumbUp"
                              onClick={() =>
                                toggleCommentReaction(comment.id, "like")
                              }
                              tone="like"
                              size="small"
                            >
                              {getVisibleReactionCount(likeCount)}
                            </IconTextButton>
                            <IconTextButton
                              aria-label="댓글 싫어요"
                              aria-pressed={selectedReaction === "dislike"}
                              icon="thumbDown"
                              onClick={() =>
                                toggleCommentReaction(comment.id, "dislike")
                              }
                              tone="dislike"
                              size="small"
                            >
                              {getVisibleReactionCount(dislikeCount)}
                            </IconTextButton>
                          </span>
                        </footer>
                        {hasCommentReplies && isReplyListOpen ? (
                          <div
                            aria-hidden={false}
                            aria-labelledby={replyToggleId}
                            className="wrapper_commentReplies is_open"
                            id={replyListId}
                            role="region"
                          >
                            <div className="wrapper_commentRepliesInner">
                              {commentReplies.map((reply, replyIndex) => {
                              const replyActionMenuId = `${panelId}-reply-action-${reply.id}`;
                              const replyActions = reply.isMine
                                ? myCommentActionOptions
                                : otherCommentActionOptions;
                              const isEditingReply =
                                replyEdit.editingId === reply.id;
                              const replyBody =
                                replyEdit.getEditedValue(reply.id) ??
                                reply.body;
                              const selectedReplyReaction =
                                commentReactions[reply.id] ?? null;
                              const {
                                dislikes: replyDislikeCount,
                                likes: replyLikeCount,
                              } = getCommentReactionCounts(reply);

                              return (
                                <Fragment key={reply.id}>
                                  <article
                                    className="wrapper_commentReplyItem"
                                    id={`${panelId}-reply-${reply.id}`}
                                  >
                                    <header>
                                      <span className="wrapper_commentMeta">
                                        <strong>{reply.author}</strong>
                                        <NewsCreatedTime>
                                          {reply.date}
                                        </NewsCreatedTime>
                                      </span>
                                      <ActionMenu
                                        buttonLabel="대댓글 더보기"
                                        disabled={!isReplyListOpen}
                                        isOpen={openReplyActionId === reply.id}
                                        menuClassName="listbox_commentActionMenu listbox_commentAction"
                                        menuId={replyActionMenuId}
                                        onOpenChange={(nextIsOpen) => {
                                            setIsCommentSortOpen(false);
                                            setOpenCommentActionId(null);
                                            setOpenReplyActionId(
                                              nextIsOpen ? reply.id : null,
                                            );
                                          }}
                                        onSelect={(action) =>
                                          handleReplyAction(reply, action)
                                        }
                                        options={replyActions}
                                      />
                                    </header>
                                    <ChipLabel>
                                      {reply.choice}
                                    </ChipLabel>
                                    {isEditingReply ? (
                                      <CommentInlineEditor
                                        ariaLabel="대댓글 수정"
                                        onCancel={cancelEditReply}
                                        onChange={replyEdit.setDraft}
                                        onSave={saveEditedReply}
                                        value={replyEdit.draft}
                                      />
                                    ) : (
                                      <p>{replyBody}</p>
                                    )}
                                    <footer>
                                      <span>
                                        <IconTextButton
                                          aria-label="대댓글 좋아요"
                                          aria-pressed={
                                            selectedReplyReaction === "like"
                                          }
                                          icon="thumbUp"
                                          onClick={() =>
                                            toggleCommentReaction(reply.id, "like")
                                          }
                                          tone="like"
                                          size="small"
                                        >
                                          {getVisibleReactionCount(replyLikeCount)}
                                        </IconTextButton>
                                        <IconTextButton
                                          aria-label="대댓글 싫어요"
                                          aria-pressed={
                                            selectedReplyReaction === "dislike"
                                          }
                                          icon="thumbDown"
                                          onClick={() =>
                                            toggleCommentReaction(
                                              reply.id,
                                              "dislike",
                                            )
                                          }
                                          tone="dislike"
                                          size="small"
                                        >
                                          {getVisibleReactionCount(replyDislikeCount)}
                                        </IconTextButton>
                                      </span>
                                    </footer>
                                  </article>
                                  {replyIndex < commentReplies.length - 1 ? (
                                    <Divider className="divider_commentItem" />
                                  ) : null}
                                </Fragment>
                              );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    </Fragment>
                  );
                })
              ) : commentLoadFailed ? (
                <DataUnavailableMessage target="댓글" />
              ) : (
                <p className="text_commentEmpty">표시할 댓글이 없습니다.</p>
              )}
            </div>
          </div>
        </section>
      </section>
      {reportTarget ? (
        <ClientPortal>
          <div
            className="container_dialog"
            onClick={() => setReportTarget(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="wrapper_dialogContent"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text_myDialogTitle">신고 사유 선택</h3>
              <label className="wrapper_contentMeta wrapper_fieldStack u_w100 u_gap8">
                <span className="text_infoFieldLabel">신고 경위</span>
                <SelectButton
                  ariaLabel="신고 경위"
                  isOpen={isReportReasonOpen}
                  listboxId={`${panelId}-report-reason-menu`}
                  onChange={setReportReason}
                  onOpenChange={setIsReportReasonOpen}
                  options={commentReportReasons.map((reason) => ({
                    label: reason,
                    value: reason,
                  }))}
                  size="default"
                  value={reportReason}
                />
              </label>
              <PrimaryButtonGroup columns={2}>
                <PrimaryButton
                  disabled={isReportSubmitting}
                  onClick={() => setReportTarget(null)}
                  tone="neutral"
                  type="button"
                >
                  취소
                </PrimaryButton>
                <PrimaryButton
                  disabled={isReportSubmitting}
                  onClick={submitReport}
                  type="button"
                >
                  {isReportSubmitting ? "신고 중" : "신고하기"}
                </PrimaryButton>
              </PrimaryButtonGroup>
            </div>
          </div>
        </ClientPortal>
      ) : null}
      {pendingDeleteTarget ? (
        <ConfirmDialog
          cancelLabel="취소"
          confirmLabel={isDeleteSubmitting ? "삭제 중" : "확인"}
          message="댓글을 삭제하시겠습니까?"
          onCancel={() => {
            if (!isDeleteSubmitting) {
              setPendingDeleteTarget(null);
            }
          }}
          onConfirm={confirmDeleteTarget}
        />
      ) : null}
      {moderationConfirmMessage ? (
        <ConfirmDialog
          message={moderationConfirmMessage}
          onConfirm={() => setModerationConfirmMessage("")}
        />
      ) : null}
      {isComposerVisible ? (
        <BottomFixedActionBar
          ariaLabel={composerMode === "reply" ? "대댓글 작성" : "댓글 작성"}
          id={composerId}
        >
          <form
            className="form_commentComposer"
            onSubmit={(event) => {
              event.preventDefault();
              submitComposer();
            }}
          >
            <TextInput
              aria-label={composerMode === "reply" ? "대댓글 입력" : "댓글 입력"}
              hasEndAction
              onChange={(event) => setComposerDraft(event.target.value)}
              placeholder={
                composerMode === "reply"
                  ? "대댓글을 입력해 주세요."
                  : "홍길동님은 어떻게 생각하시나요?"
              }
              rightSlot={
                <IconButton
                  className="btn_commentSubmit"
                  icon="submit"
                  label={composerMode === "reply" ? "대댓글 등록" : "댓글 등록"}
                  type="submit"
                />
              }
              type="text"
              value={composerDraft}
            />
          </form>
        </BottomFixedActionBar>
      ) : null}
    </>
  );
}

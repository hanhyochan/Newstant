import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { ArticleVoteOptionButton } from "@/design-system/components";
import { newsApi, pollApi } from "@/shared/newstant/api";
import { currentUserId } from "@/shared/newstant/auth/current-user";
import {
  binaryGuideOptions,
  guideOptions,
  type GuideKind,
} from "@/features/news/model";

const articleGuideQuestion =
  "예시텍스트 어쩌구랑 어쩌구랑 비교했을때 어케하는게 좋을까?";

function getVotePercentages(voteCounts: number[]) {
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);

  if (totalVotes === 0) {
    return voteCounts.map(() => 0);
  }

  const rawPercentages = voteCounts.map((count) => (count / totalVotes) * 100);
  const percentages = rawPercentages.map(Math.floor);
  let remainder = 100 - percentages.reduce((sum, percent) => sum + percent, 0);
  const remainderOrder = rawPercentages
    .map((percent, index) => ({
      index,
      remainder: percent - Math.floor(percent),
    }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let index = 0; index < remainder; index += 1) {
    percentages[remainderOrder[index % remainderOrder.length].index] += 1;
  }

  return percentages;
}

export function ArticleGuideSection({
  id,
  kind,
  newsId,
}: {
  id?: string;
  kind: GuideKind;
  newsId?: string;
}) {
  const [selectedGuideOption, setSelectedGuideOption] = useState<number | null>(
    null,
  );
  const [currentPollVoteId, setCurrentPollVoteId] = useState<string | null>(null);
  const fallbackOptions = useMemo(
    () => (kind === "binary" ? binaryGuideOptions : guideOptions),
    [kind],
  );
  const [pollDetail, setPollDetail] = useState<Awaited<ReturnType<typeof pollApi.getPoll>>>(null);
  const options =
    pollDetail?.options.map((option) => option.label) ?? fallbackOptions;
  const [voteCounts, setVoteCounts] = useState(() => options.map(() => 0));
  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);
  const percentages = getVotePercentages(voteCounts);
  const hasVoted = selectedGuideOption !== null;

  useEffect(() => {
    let ignore = false;

    async function loadPoll() {
      if (!newsId) {
        setPollDetail(null);
        setSelectedGuideOption(null);
        setCurrentPollVoteId(null);
        setVoteCounts(fallbackOptions.map(() => 0));
        return;
      }

      const nextPoll = await pollApi.getPoll(newsId);

      if (ignore) {
        return;
      }

      setPollDetail(nextPoll);
      const nextOptions = nextPoll?.options ?? [];
      const nextCounts =
        nextOptions.length > 0
          ? nextOptions.map(
              (option) =>
                nextPoll?.votes.filter((vote) => vote.pollOptionId === option.id)
                  .length ?? 0,
            )
          : fallbackOptions.map(() => 0);
      const currentVoteIndex = nextPoll?.currentUserVote
        ? nextOptions.findIndex(
            (option) => option.id === nextPoll.currentUserVote?.pollOptionId,
          )
        : -1;

      setVoteCounts(nextCounts);
      setSelectedGuideOption(currentVoteIndex >= 0 ? currentVoteIndex : null);
      setCurrentPollVoteId(nextPoll?.currentUserVote?.id ?? null);
    }

    loadPoll().catch(() => {
      if (!ignore) {
        setPollDetail(null);
        setSelectedGuideOption(null);
        setCurrentPollVoteId(null);
        setVoteCounts(fallbackOptions.map(() => 0));
      }
    });

    return () => {
      ignore = true;
    };
  }, [fallbackOptions, newsId]);

  async function recordPollArticleActivity() {
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

  async function vote(index: number) {
    if (selectedGuideOption === index) {
      setSelectedGuideOption(null);
      setVoteCounts((currentCounts) =>
        currentCounts.map((count, countIndex) =>
          countIndex === index ? Math.max(0, count - 1) : count,
        ),
      );

      if (currentPollVoteId) {
        const voteId = currentPollVoteId;

        setCurrentPollVoteId(null);
        await pollApi.removePollVote(voteId);
      }

      return;
    }

    let nextPollDetail = pollDetail;
    let option = nextPollDetail?.options[index];

    const previousSelectedIndex = selectedGuideOption;

    setSelectedGuideOption(index);
    setVoteCounts((currentCounts) =>
      currentCounts.map((count, countIndex) =>
        countIndex === index
          ? count + 1
          : countIndex === previousSelectedIndex
            ? Math.max(0, count - 1)
            : count,
      ),
    );

    if (!nextPollDetail && newsId) {
      nextPollDetail = await pollApi.createPoll({
        newsId,
        options: fallbackOptions,
        title: articleGuideQuestion,
      });
      option = nextPollDetail.options[index];
      setPollDetail(nextPollDetail);
    }

    if (nextPollDetail && option) {
      if (currentPollVoteId) {
        await pollApi.updatePollVote(currentPollVoteId, option.id);
        await recordPollArticleActivity();
        return;
      }

      const nextVote = await pollApi.submitPollVote({
        pollId: nextPollDetail.id,
        pollOptionId: option.id,
        userId: currentUserId,
      });
      await recordPollArticleActivity();
      setCurrentPollVoteId(nextVote.id);
    }
  }

  return (
    <section
      className={`wrapper_articleGuide wrapper_articleGuide_${kind}`}
      id={id}
      aria-label="안내 문구"
    >
      <h2 className="text_articleGuide">
        {articleGuideQuestion}
      </h2>
      <div className="wrapper_articleGuideOptions">
        {options.map((option, index) => {
          const percent = percentages[index];

          return (
            <ArticleVoteOptionButton
              binaryTone={
                kind === "binary"
                  ? option === binaryGuideOptions[0]
                    ? "yes"
                    : "no"
                  : undefined
              }
              iconSrc={
                kind === "binary"
                  ? option === binaryGuideOptions[0]
                    ? "/icons/icon_yes.svg"
                    : "/icons/icon_no.svg"
                  : undefined
              }
              key={option}
              label={option}
              onClick={() => vote(index)}
              percent={percent}
              showResult={hasVoted}
              state={selectedGuideOption === index ? "active" : "default"}
              variant={kind}
            />
          );
        })}
      </div>
      <p className="text_articleGuideTotal">
        <strong>{totalVotes}명</strong>이 참여했어요.
      </p>
    </section>
  );
}


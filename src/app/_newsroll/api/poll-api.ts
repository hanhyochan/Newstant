import { mockCurrentUserId } from "../mock-current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type { Poll, PollDetail, PollOption, PollVote, SubmitPollVoteInput } from "./types";

export const pollApi = {
  async getPoll(newsId: string, userId = mockCurrentUserId): Promise<PollDetail | null> {
    const polls = await apiClient.get<Poll[]>("/polls", {
      newsId,
    });
    const poll = polls[0];

    if (!poll) {
      return null;
    }

    const [options, votes] = await Promise.all([
      apiClient.get<PollOption[]>("/pollOptions", {
        pollId: poll.id,
        _sort: "order",
        _order: "asc",
      }),
      apiClient.get<PollVote[]>("/pollVotes", {
        pollId: poll.id,
        userId,
      }),
    ]);

    return {
      ...poll,
      options,
      currentUserVote: votes[0],
    };
  },
  submitPollVote(input: SubmitPollVoteInput) {
    return apiClient.post<PollVote, PollVote>("/pollVotes", {
      id: createMockId("poll-vote"),
      pollId: input.pollId,
      pollOptionId: input.pollOptionId,
      userId: input.userId,
      createdAt: createTimestamp(),
    });
  },
};

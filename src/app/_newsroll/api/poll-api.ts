import { mockCurrentUserId } from "../mock-current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { apiClient } from "./http-client";
import type {
  CreatePollInput,
  Poll,
  PollDetail,
  PollOption,
  PollVote,
  SubmitPollVoteInput,
} from "./types";

export const pollApi = {
  getPolls() {
    return apiClient.get<Poll[]>("/polls");
  },
  getPollOptions() {
    return apiClient.get<PollOption[]>("/pollOptions", {
      _sort: "order",
      _order: "asc",
    });
  },
  getPollVotes() {
    return apiClient.get<PollVote[]>("/pollVotes");
  },
  getPollVotesByUserId(userId: string) {
    return apiClient.get<PollVote[]>("/pollVotes", {
      userId,
      _sort: "createdAt",
      _order: "desc",
    });
  },
  async createPoll(input: CreatePollInput): Promise<PollDetail> {
    const poll = await apiClient.post<Poll, Poll>("/polls", {
      id: createMockId("poll"),
      newsId: input.newsId,
      title: input.title,
      createdAt: createTimestamp(),
    });
    const options = await Promise.all(
      input.options.map((label, index) =>
        apiClient.post<PollOption, PollOption>("/pollOptions", {
          id: createMockId("poll-option"),
          pollId: poll.id,
          label,
          order: index + 1,
        }),
      ),
    );

    return {
      ...poll,
      options,
      votes: [],
    };
  },
  async getPoll(newsId: string, userId = mockCurrentUserId): Promise<PollDetail | null> {
    const polls = await apiClient.get<Poll[]>("/polls", {
      newsId,
    });
    const poll = polls[0];

    if (!poll) {
      return null;
    }

    const [options, votes, currentUserVotes] = await Promise.all([
      apiClient.get<PollOption[]>("/pollOptions", {
        pollId: poll.id,
        _sort: "order",
        _order: "asc",
      }),
      apiClient.get<PollVote[]>("/pollVotes", {
        pollId: poll.id,
      }),
      apiClient.get<PollVote[]>("/pollVotes", {
        pollId: poll.id,
        userId,
      }),
    ]);

    return {
      ...poll,
      options,
      currentUserVote: currentUserVotes[0],
      votes,
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
  updatePollVote(voteId: string, pollOptionId: string) {
    return apiClient.patch<PollVote, Pick<PollVote, "pollOptionId" | "createdAt">>(
      `/pollVotes/${voteId}`,
      {
        pollOptionId,
        createdAt: createTimestamp(),
      },
    );
  },
  removePollVote(voteId: string) {
    return apiClient.delete(`/pollVotes/${voteId}`);
  },
};

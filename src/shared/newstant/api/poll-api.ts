import { currentUserId } from "../auth/current-user";
import { createMockId, createTimestamp } from "./api-utils";
import { guestStorageApi } from "../guest-storage";
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
  async getPollVotes() {
    if (guestStorageApi.isGuestUserId(currentUserId)) {
      const [votes, guestVotes] = await Promise.all([
        apiClient.get<PollVote[]>("/pollVotes").catch(() => []),
        guestStorageApi.getPollVotes(),
      ]);

      return [...votes, ...guestVotes];
    }

    return apiClient.get<PollVote[]>("/pollVotes");
  },
  getPollVotesByUserId(userId: string) {
    if (guestStorageApi.isGuestUserId(userId)) {
      return guestStorageApi.getPollVotesByUserId();
    }

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
  async getPoll(newsId: string, userId = currentUserId): Promise<PollDetail | null> {
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
      guestStorageApi.isGuestUserId(userId)
        ? Promise.all([
            apiClient
              .get<PollVote[]>("/pollVotes", {
                pollId: poll.id,
              })
              .catch(() => []),
            guestStorageApi
              .getPollVotes()
              .then((items) => items.filter((item) => item.pollId === poll.id)),
          ]).then(([items, guestItems]) => [...items, ...guestItems])
        : apiClient.get<PollVote[]>("/pollVotes", {
            pollId: poll.id,
          }),
      guestStorageApi.isGuestUserId(userId)
        ? guestStorageApi
            .getPollVotesByUserId()
            .then((items) => items.filter((item) => item.pollId === poll.id))
        : apiClient.get<PollVote[]>("/pollVotes", {
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
    if (guestStorageApi.isGuestUserId(input.userId)) {
      return guestStorageApi.submitPollVote(input);
    }

    return apiClient.post<PollVote, PollVote>("/pollVotes", {
      id: createMockId("poll-vote"),
      pollId: input.pollId,
      pollOptionId: input.pollOptionId,
      userId: input.userId,
      createdAt: createTimestamp(),
    });
  },
  updatePollVote(voteId: string, pollOptionId: string) {
    if (voteId.startsWith("guest-")) {
      return guestStorageApi.updatePollVote(voteId, pollOptionId);
    }

    return apiClient.patch<PollVote, Pick<PollVote, "pollOptionId" | "createdAt">>(
      `/pollVotes/${voteId}`,
      {
        pollOptionId,
        createdAt: createTimestamp(),
      },
    );
  },
  removePollVote(voteId: string) {
    if (voteId.startsWith("guest-")) {
      return guestStorageApi.removePollVote(voteId);
    }

    return apiClient.delete(`/pollVotes/${voteId}`);
  },
};

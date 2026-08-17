"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, MessageSquare, UserPlus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { FriendProfile } from "@/types";

type FriendEntry = {
  friendshipId: string;
  profile: FriendProfile;
};

type FriendsData = {
  friends: FriendEntry[];
  incoming: FriendEntry[];
  outgoing: FriendEntry[];
};

type Tab = "friends" | "pending" | "add";

const EMPTY: FriendsData = { friends: [], incoming: [], outgoing: [] };

export const FriendsClient = ({ myUsername }: { myUsername: string }) => {
  const router = useRouter();
  const [data, setData] = useState<FriendsData>(EMPTY);
  const [tab, setTab] = useState<Tab>("friends");
  const [username, setUsername] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await axios.get("/api/friends");
      setData(response.data);
    } catch {
      setFeedback({ kind: "err", text: "Could not load your friends." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sendRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    setIsBusy(true);

    try {
      const response = await axios.post("/api/friends", { username });
      setUsername("");
      setFeedback({
        kind: "ok",
        text: response.data.accepted
          ? "You are now friends!"
          : "Friend request sent.",
      });
      await load();
    } catch (err) {
      setFeedback({
        kind: "err",
        text: axios.isAxiosError(err)
          ? err.response?.data?.error ?? "Could not send the request."
          : "Could not send the request.",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const accept = async (friendshipId: string) => {
    setIsBusy(true);
    try {
      await axios.patch(`/api/friends/${friendshipId}`);
      await load();
    } finally {
      setIsBusy(false);
    }
  };

  const remove = async (friendshipId: string) => {
    setIsBusy(true);
    try {
      await axios.delete(`/api/friends/${friendshipId}`);
      await load();
    } finally {
      setIsBusy(false);
    }
  };

  const openDm = async (profileId: string) => {
    setIsBusy(true);
    try {
      const response = await axios.post("/api/conversations", { profileId });
      router.push(`/conversations/${response.data.id}`);
    } catch {
      setFeedback({ kind: "err", text: "Could not open the conversation." });
      setIsBusy(false);
    }
  };

  const pendingCount = data.incoming.length + data.outgoing.length;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "friends", label: "Friends", count: data.friends.length },
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "add", label: "Add friend" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-x-2 px-4 h-12 border-b-2 border-neutral-200 dark:border-neutral-800">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "text-sm font-semibold px-3 py-1 rounded-md transition text-zinc-500 dark:text-zinc-400 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50",
              tab === item.id &&
                "bg-zinc-700/10 dark:bg-zinc-700 text-primary dark:text-zinc-200",
              item.id === "add" && "text-emerald-500 dark:text-emerald-400"
            )}
            type="button"
          >
            {item.label}
            {!!item.count && (
              <span className="ml-2 text-xs bg-rose-500 text-white rounded-full px-2 py-[1px]">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        )}

        {!isLoading && tab === "add" && (
          <div className="max-w-xl">
            <h2 className="text-lg font-bold">Add a friend</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              You can add friends with their username. Yours is{" "}
              <span className="font-semibold text-primary dark:text-zinc-200">
                {myUsername}
              </span>
              .
            </p>
            <form onSubmit={sendRequest} className="flex items-center gap-x-2 mt-4">
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value.toLowerCase())}
                placeholder="Type a username"
                disabled={isBusy}
                className="bg-zinc-200/90 dark:bg-zinc-900 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
              <Button variant="primary" disabled={isBusy || !username.trim()}>
                <UserPlus className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
            {feedback && (
              <p
                className={cn(
                  "text-sm mt-3",
                  feedback.kind === "ok" ? "text-emerald-500" : "text-rose-500"
                )}
              >
                {feedback.text}
              </p>
            )}
          </div>
        )}

        {!isLoading && tab === "friends" && (
          <FriendList
            entries={data.friends}
            emptyText="You have no friends yet. Add someone by username."
            renderActions={(entry) => (
              <>
                <ActionTooltip label="Message">
                  <button
                    type="button"
                    onClick={() => openDm(entry.profile.id)}
                    disabled={isBusy}
                    className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </ActionTooltip>
                <ActionTooltip label="Remove friend">
                  <button
                    type="button"
                    onClick={() => remove(entry.friendshipId)}
                    disabled={isBusy}
                    className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </ActionTooltip>
              </>
            )}
          />
        )}

        {!isLoading && tab === "pending" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">
                Incoming — {data.incoming.length}
              </h3>
              <FriendList
                entries={data.incoming}
                emptyText="No incoming requests."
                renderActions={(entry) => (
                  <>
                    <ActionTooltip label="Accept">
                      <button
                        type="button"
                        onClick={() => accept(entry.friendshipId)}
                        disabled={isBusy}
                        className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white transition"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </ActionTooltip>
                    <ActionTooltip label="Decline">
                      <button
                        type="button"
                        onClick={() => remove(entry.friendshipId)}
                        disabled={isBusy}
                        className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </ActionTooltip>
                  </>
                )}
              />
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">
                Sent — {data.outgoing.length}
              </h3>
              <FriendList
                entries={data.outgoing}
                emptyText="No requests sent."
                renderActions={(entry) => (
                  <ActionTooltip label="Cancel request">
                    <button
                      type="button"
                      onClick={() => remove(entry.friendshipId)}
                      disabled={isBusy}
                      className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </ActionTooltip>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FriendList = ({
  entries,
  emptyText,
  renderActions,
}: {
  entries: FriendEntry[];
  emptyText: string;
  renderActions: (entry: FriendEntry) => React.ReactNode;
}) => {
  if (!entries.length) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyText}</p>
    );
  }

  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div
          key={entry.friendshipId}
          className="flex items-center gap-x-3 p-2 rounded-md hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
        >
          <UserAvatar src={entry.profile.imageUrl} className="h-9 w-9 md:h-9 md:w-9" />
          <div className="flex flex-col">
            <p className="text-sm font-semibold">{entry.profile.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {entry.profile.username}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-x-2">
            {renderActions(entry)}
          </div>
        </div>
      ))}
    </div>
  );
};

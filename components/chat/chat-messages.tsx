"use client";

import { format } from "date-fns";
import { Loader2, ServerCrash } from "lucide-react";
import { ElementRef, Fragment, useRef } from "react";
import { MemberRole } from "@prisma/client";

import { ChatWelcome } from "./chat-welcome";
import { ChatItem } from "./chat-item";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { MessageAuthor } from "@/types";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface ChatMessagesProps {
  name: string;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
  /**
   * "member" reads messages authored through a server membership, "profile"
   * reads global direct messages authored straight by a profile.
   */
  source: "member" | "profile";
  /** Member id when source is "member", profile id when source is "profile". */
  currentId: string;
  currentRole?: MemberRole;
  serverId?: string;
}

type RawMessage = {
  id: string;
  content: string;
  fileUrl: string | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: MessageAuthor;
  member?: {
    id: string;
    role: MemberRole;
    profile: MessageAuthor;
  };
};

export const ChatMessages = ({
  name,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
  source,
  currentId,
  currentRole,
  serverId,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const bottomRef = useRef<ElementRef<"div">>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({ queryKey, apiUrl, paramKey, paramValue });

  useChatSocket({
    queryKey,
    addKey: `chat:${chatId}:messages`,
    updateKey: `chat:${chatId}:messages:update`,
  });

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    );
  }

  const renderMessage = (message: RawMessage) => {
    const isMemberSource = source === "member";
    const author = isMemberSource ? message.member?.profile : message.profile;

    if (!author) {
      return null;
    }

    const authorId = isMemberSource ? message.member!.id : author.id;
    const isOwner = authorId === currentId;
    const isPrivileged =
      currentRole === MemberRole.ADMIN || currentRole === MemberRole.MODERATOR;

    return (
      <ChatItem
        key={message.id}
        id={message.id}
        author={author}
        role={isMemberSource ? message.member!.role : undefined}
        content={message.content}
        fileUrl={message.fileUrl}
        deleted={message.deleted}
        canDelete={!message.deleted && (isOwner || isPrivileged)}
        canEdit={!message.deleted && isOwner && !message.fileUrl}
        authorHref={
          isMemberSource && serverId && !isOwner
            ? `/servers/${serverId}/conversations/${authorId}`
            : undefined
        }
        timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
        isUpdated={message.updatedAt !== message.createdAt}
        socketUrl={socketUrl}
        socketQuery={socketQuery}
      />
    );
  };

  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages? Click me
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages.map((group, i) => (
          <Fragment key={i}>{group.items.map(renderMessage)}</Fragment>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

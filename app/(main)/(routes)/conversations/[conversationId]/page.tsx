import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { findDirectConversationForProfile } from "@/lib/direct-conversation";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { UserAvatar } from "@/components/user-avatar";

interface ConversationIdPageProps {
  params: { conversationId: string };
}

const ConversationIdPage = async ({ params }: ConversationIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const conversation = await findDirectConversationForProfile(
    params.conversationId,
    profile.id
  );

  if (!conversation) {
    return redirect("/friends");
  }

  const otherProfile =
    conversation.profileOneId === profile.id
      ? conversation.profileTwo
      : conversation.profileOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <div className="text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2">
        <UserAvatar
          src={otherProfile.imageUrl}
          className="h-8 w-8 md:h-8 md:w-8 mr-2"
        />
        <p className="font-semibold text-md text-black dark:text-white">
          {otherProfile.name}
        </p>
      </div>
      <ChatMessages
        source="profile"
        currentId={profile.id}
        name={otherProfile.name}
        chatId={conversation.id}
        type="conversation"
        apiUrl="/api/private-messages"
        socketUrl="/api/socket/private-messages"
        socketQuery={{ conversationId: conversation.id }}
        paramKey="conversationId"
        paramValue={conversation.id}
      />
      <ChatInput
        name={otherProfile.name}
        type="conversation"
        apiUrl="/api/socket/private-messages"
        query={{ conversationId: conversation.id }}
      />
    </div>
  );
};

export default ConversationIdPage;

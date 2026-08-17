"use client";

import { UserAvatar } from "@/components/user-avatar";
import { useVoiceParticipants } from "@/hooks/use-voice-participants";

interface ChannelParticipantsProps {
  serverId: string;
  channelId: string;
}

export const ChannelParticipants = ({
  serverId,
  channelId,
}: ChannelParticipantsProps) => {
  const channels = useVoiceParticipants(serverId);
  const participants = channels[channelId] ?? [];

  if (!participants.length) {
    return null;
  }

  return (
    <div className="ml-6 mb-1 space-y-[2px]">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-center gap-x-2 px-2 py-1 rounded-md"
        >
          <span className="relative flex">
            <UserAvatar
              src={participant.imageUrl ?? undefined}
              className="h-6 w-6 md:h-6 md:w-6"
            />
            <span className="absolute -bottom-[1px] -right-[1px] h-[9px] w-[9px] rounded-full bg-emerald-500 border-2 border-[#F2F3F5] dark:border-[#2B2D31]" />
          </span>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 line-clamp-1">
            {participant.name}
          </p>
        </div>
      ))}
    </div>
  );
};

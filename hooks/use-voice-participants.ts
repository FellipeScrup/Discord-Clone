import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export type VoiceParticipant = {
  id: string;
  name: string;
  imageUrl: string | null;
};

type ParticipantsResponse = {
  channels: Record<string, VoiceParticipant[]>;
};

export const useVoiceParticipants = (serverId: string) => {
  const { data } = useQuery<ParticipantsResponse>({
    queryKey: ["voice-participants", serverId],
    queryFn: async () =>
      (await axios.get(`/api/livekit/participants?serverId=${serverId}`)).data,
    refetchInterval: 5000,
    enabled: Boolean(serverId),
  });

  return data?.channels ?? {};
};

import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { currentProfile } from "@/lib/current-profile";
import { FriendsClient } from "@/components/friends/friends-client";

const FriendsPage = async () => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <div className="text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2">
        <Users className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
        Friends
      </div>
      <div className="flex-1 overflow-hidden">
        <FriendsClient myUsername={profile.username} />
      </div>
    </div>
  );
};

export default FriendsPage;

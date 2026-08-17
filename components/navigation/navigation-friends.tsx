"use client";

import { Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";

export const NavigationFriends = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { data } = useQuery({
    queryKey: ["friends-summary"],
    queryFn: async () => (await axios.get("/api/friends")).data,
    refetchInterval: 15000,
  });

  const isActive =
    pathname === "/friends" || pathname?.startsWith("/conversations");
  const incoming = data?.incoming?.length ?? 0;

  return (
    <ActionTooltip side="right" align="center" label="Friends">
      <button
        onClick={() => router.push("/friends")}
        className="group relative flex items-center"
        type="button"
      >
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            isActive ? "h-[36px]" : "h-[8px] group-hover:h-[20px]"
          )}
        />
        <div
          className={cn(
            "relative flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-indigo-500",
            isActive && "bg-indigo-500 text-white"
          )}
        >
          <Users
            className={cn(
              "transition text-indigo-500 group-hover:text-white",
              isActive && "text-white"
            )}
            size={25}
          />
        </div>
        {incoming > 0 && (
          <span className="absolute -top-1 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full px-[6px] py-[1px]">
            {incoming}
          </span>
        )}
      </button>
    </ActionTooltip>
  );
};

"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserButtonProps {
  name: string;
  imageUrl: string;
}

export const UserButton = ({ name, imageUrl }: UserButtonProps) => {
  const router = useRouter();

  const onLogout = async () => {
    await axios.post("/api/auth/logout");
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
          <UserAvatar src={imageUrl} className="h-[48px] w-[48px] md:h-[48px] md:w-[48px]" />
          <span className="sr-only">{name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-40">
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-rose-500">
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

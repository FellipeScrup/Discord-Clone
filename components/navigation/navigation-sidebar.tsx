import { currentProfile } from "@/lib/current-profile"
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { NavigationAction } from "./navigation-action";
import { NavigationFriends } from "./navigation-friends";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@/components/user-button";

export const NavigationSidebar = async () => {
    const profile = await currentProfile();

    if(!profile) {
        return redirect("/");
    }

    const servers = await db.server.findMany({
        where:{
            members:{
            some:{
                profileId: profile.id
                }
            }
        }
    });

    return (
        <div
        className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3"
        >
            <NavigationFriends />
            <Separator 
                className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto"
            />
            <NavigationAction />
            <Separator 
                className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto"
            />
            <ScrollArea className="flex-1 w-full">
                {servers.map((server)=>(
                    <div key={server.id} className="mb-4">
                        <NavigationItem 
                          id={server.id}
                          name = {server.name}
                          imageUrl={server.imageUrl}
                        />
                    </div>
                ))}
            </ScrollArea>
            <div className="pd-3 mt-auto flex items-center flex-col gap-y-4">
                <ModeToggle/>
                <UserButton
                    name={profile.name}
                    imageUrl={profile.imageUrl}
                />
            </div>
        </div>
    )
}
import { Avatar , AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string;
    className?: string;
};

export const UserAvatar = ({
    src,
    className
}: UserAvatarProps) => {
    return(
        <Avatar className={cn(
            "h-10 w-10 md:w-10 ",
            className
        )}>
            <AvatarImage src={src} />
        </Avatar>
    )
}
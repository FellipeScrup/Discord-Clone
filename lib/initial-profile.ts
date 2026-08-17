import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";

export const initialProfile = async () => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  return profile;
};

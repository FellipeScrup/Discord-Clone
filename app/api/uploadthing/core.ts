import { auth } from "@clerk/nextjs"
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
const handAuth = () => {
    const {userId} = auth();
    if(!userId) throw new Error ("Unauthorized");
    return{userId: userId};
};
 
export const ourFileRouter = {
  serverImage: f({ image: { maxFileSize : "4MB", maxFileCount: 1} })
    .middleware(()=> handAuth())
    .onUploadComplete(()=> {}),
    messageFile: f(["image","pdf"])
    .middleware(()=> handAuth())
    .onUploadComplete(()=> {})
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
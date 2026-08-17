"use client";

import { FileIcon, Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string;
    endpoint: "messageFile" | "serverImage"; 
}

const ACCEPTED_TYPES = {
    serverImage: {
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/webp": [".webp"],
        "image/gif": [".gif"],
    },
    messageFile: {
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/webp": [".webp"],
        "image/gif": [".gif"],
        "application/pdf": [".pdf"],
    },
};

export const FileUpload = ({
    onChange,
    value,
    endpoint
}: FileUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const fileType = value?.split(".").pop();

    const onDrop = useCallback(async (files: File[]) => {
        const file = files[0];

        if (!file) {
            return;
        }

        setError("");
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("endpoint", endpoint);

            const response = await axios.post("/api/upload", formData);
            onChange(response.data.url);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Upload failed.");
            } else {
                setError("Upload failed.");
            }
        } finally {
            setIsUploading(false);
        }
    }, [endpoint, onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES[endpoint],
        maxFiles: 1,
        disabled: isUploading,
    });

    if(value && fileType !== "pdf"){
        return(
        <div className="relative h-20 w-20">
            <Image
            fill
            src={value}
            alt="Upload"
            className="rounded-full object-cover"
            />
            <button
                onClick={()=> onChange("")}
                className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
                type="button"
            >
                <X className="h-4 w-4"/>
            </button>
        </div>
        );
    }

    if(value && fileType === "pdf"){
        return(
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <FileIcon className="w-10 h-10 fill-indigo-200 stroke-indigo-400"/>
                <a 
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                    {value}
                </a>
                <button
                onClick={()=> onChange("")}
                className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
                type="button"
            >
                <X className="h-4 w-4"/>
            </button>
            </div>
        )
    }

    return(
        <div className="w-full">
            <div
                {...getRootProps()}
                className={cn(
                    "flex flex-col items-center justify-center gap-y-2 w-full rounded-md border-2 border-dashed border-zinc-300 p-6 cursor-pointer transition",
                    isDragActive && "border-indigo-500 bg-indigo-500/10",
                    isUploading && "cursor-not-allowed opacity-70"
                )}
            >
                <input {...getInputProps()} />
                {isUploading ? (
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                ) : (
                    <UploadCloud className="h-8 w-8 text-indigo-500" />
                )}
                <p className="text-sm text-zinc-500 text-center">
                    {isUploading
                        ? "Uploading..."
                        : endpoint === "serverImage"
                        ? "Drag an image here or click to choose"
                        : "Drag an image or PDF here or click to choose"}
                </p>
            </div>
            {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
        </div>
    );

}

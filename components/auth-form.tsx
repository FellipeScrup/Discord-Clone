"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const router = useRouter();
  const isSignUp = mode === "sign-up";
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await axios.post(
        isSignUp ? "/api/auth/register" : "/api/auth/login",
        isSignUp ? { name, username, email, password } : { email, password }
      );
      router.push("/");
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Something went wrong.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] rounded-md bg-[#313338] p-8 text-white shadow-xl">
      <h1 className="text-2xl font-bold text-center">
        {isSignUp ? "Create an account" : "Welcome back"}
      </h1>
      <p className="text-sm text-zinc-400 text-center mt-2">
        {isSignUp
          ? "Join with your email and password."
          : "We're so excited to see you again!"}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {isSignUp && (
          <>
            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold text-zinc-300">
                Display name
              </Label>
              <Input
                disabled={isLoading}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="bg-zinc-900 border-0 focus-visible:ring-0 text-white focus-visible:ring-offset-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold text-zinc-300">
                Username
              </Label>
              <Input
                disabled={isLoading}
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value.toLowerCase())
                }
                pattern="[a-z0-9._]{3,32}"
                className="bg-zinc-900 border-0 focus-visible:ring-0 text-white focus-visible:ring-offset-0"
                required
              />
              <p className="text-xs text-zinc-500">
                This is how friends will find you. Lowercase letters, numbers,
                dots and underscores.
              </p>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label className="uppercase text-xs font-bold text-zinc-300">
            Email
          </Label>
          <Input
            type="email"
            disabled={isLoading}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="bg-zinc-900 border-0 focus-visible:ring-0 text-white focus-visible:ring-offset-0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-xs font-bold text-zinc-300">
            Password
          </Label>
          <Input
            type="password"
            disabled={isLoading}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            className="bg-zinc-900 border-0 focus-visible:ring-0 text-white focus-visible:ring-offset-0"
            required
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button
          disabled={isLoading}
          variant="primary"
          className="w-full"
          type="submit"
        >
          {isLoading ? "Please wait..." : isSignUp ? "Continue" : "Log In"}
        </Button>
      </form>

      <p className="text-sm text-zinc-400 mt-4">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-indigo-400 hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            Need an account?{" "}
            <Link href="/sign-up" className="text-indigo-400 hover:underline">
              Register
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

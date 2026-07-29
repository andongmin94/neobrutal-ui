"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CardDemo() {
  const [message, setMessage] = useState("");

  return (
    <form
      className="w-full max-w-sm"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("Signed in successfully.");
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="ml-auto inline-block cursor-pointer text-sm underline-offset-4 hover:underline"
                  onClick={() => setMessage("Password reset instructions sent.")}
                >
                  Forgot your password?
                </button>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            Login
          </Button>
          <Button
            type="button"
            variant="neutral"
            className="w-full"
            onClick={() => setMessage("Google sign-in selected.")}
          >
            Login with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="cursor-pointer underline underline-offset-4"
              onClick={() => setMessage("Sign-up selected.")}
            >
              Sign up
            </button>
          </div>
          <output className="block min-h-5 text-center text-sm" aria-live="polite">
            {message}
          </output>
        </CardFooter>
      </Card>
    </form>
  );
}

"use client";

import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function SonnerPromiseDemo() {
  const [loading, setLoading] = useState(false);
  const promise = () =>
    new Promise((resolve) => setTimeout(() => resolve({ name: "Sonner" }), 2000));

  return (
    <Button
      disabled={loading}
      aria-busy={loading}
      onClick={() => {
        setLoading(true);
        const request = promise();
        toast.promise(request, {
          loading: "Loading...",
          success: () => {
            return `Sonner toast has been added`;
          },
          error: "Error",
        });
        request.finally(() => setLoading(false));
      }}
    >
      {loading ? "Loading..." : "Promise"}
    </Button>
  );
}

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsDemo() {
  const [message, setMessage] = useState("");

  return (
    <div className="grid gap-3">
      <Tabs defaultValue="account" className="w-full max-w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("Account preview updated locally.");
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Edit this local preview. No account request is sent.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-name">Name</Label>
                  <Input id="tabs-demo-name" defaultValue="John Doe" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-username">Username</Label>
                  <Input id="tabs-demo-username" defaultValue="@johndoe" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Save changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="password">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("Password preview updated locally. No credentials were sent.");
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Try the password form locally. It does not update credentials or sign you out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Save password
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
      <output className="block min-h-5 text-center text-sm" aria-live="polite">
        {message}
      </output>
    </div>
  );
}

"use client";

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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function SignIn() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        username: form.username,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        alert("Either username or password do not match!");
        return;
      }

      const session = await getSession();

      if (!session) {
        alert("Login failed.");
        return;
      }

      const role = session.user.role;

      const isPrivileged = [
        "ADMIN",
        "SYS_ADMIN",
        "ACCOUNTS",
        "ORG_USER",
      ].includes(role);

      window.location.href = isPrivileged ? "/dashboard" : "/fund-request";
    } catch (err) {
      alert("Either email or password do not match!");
    }
  }

  return (
    <div
      className={`${poppins.className} min-h-screen flex items-center justify-center bg-gray-100 px-4`}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card className="shadow-xl rounded-2xl border-0 overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-cyan-800 text-white space-y-2 px-6 py-5">
            <CardTitle className="text-2xl font-semibold">
              Login to your account
            </CardTitle>

            <CardDescription className="text-gray-200">
              Enter your phone number below to login to your account
            </CardDescription>
          </CardHeader>

          {/* Body */}
          <CardContent className="pt-6">
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>

                <Input
                  id="phone"
                  type="text"
                  placeholder="eg. 11111111"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>

                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="pb-6">
            <Button
              type="submit"
              className="w-full h-11 text-base bg-cyan-900 hover:bg-cyan-600 text-white"
            >
              Login
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/app/_components/PageHeader";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const ROLE_OPTIONS = ["ADMIN","ORG_USER", "USER", "MANAGER", "ACCOUNTANT"];
const STATUS_OPTIONS = ["Active", "InActive"];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();

  const [form, setForm] = useState({
    username: "",
    employeeName: "",
    role: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/${params.id}`);
        const data = await res.json();

        setForm({
          username: data.username || "",
          employeeName: data.employeeName || "",
          role: data.role || "",
          status: data.status || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) loadUser();
  }, [params.id]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/user/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          status: form.status,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      router.push("/users");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-4 px-0 md:px-4 lg:px-8">
      <PageHeader title="Update User" />

      <div className="container mx-auto pt-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">User Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Read-only context so the user knows who they're editing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>UserName</Label>
                <div className="text-sm font-medium px-3 py-2 border rounded-xl text-gray-500 bg-gray-50 w-md">
                  {form.username || "-"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>EmpName</Label>
                <div className="text-sm font-medium px-3 py-2 border rounded-xl text-gray-500 bg-gray-50 w-md">
                  {form.employeeName || "-"}
                </div>
              </div>
            </div>

            <Separator />

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger className="w-md">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger className="w-md">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/users")}
                className="bg-orange-700 hover:bg-orange-500 text-white"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-cyan-900 hover:bg-cyan-700"
              >
                {saving ? "Saving..." : "Save User"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
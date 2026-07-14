// app/(dashboard)/clients/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import PageHeader from "@/app/_components/PageHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

export default function CreateClientPage() {
  const router = useRouter();
  const orgId = useSession().data?.user?.orgId || "";

  const [states, setStates] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    client: "",
    website: "",
    emailId: "",
    phone: "",
    gstNo: "",
    state: "",
    orgId: orgId,
  });

  const normalizeList = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) {
      if (Array.isArray(data.data[0])) return data.data[0];
      return data.data;
    }
    return [];
  };

  // Fetch States
  useEffect(() => {
    //const localOrgId = {session?.user?.orgId || ""};

    const fetchStates = async () => {
      const res = await fetch(`/api/system-list?listName=State&orgId=${orgId}`);

      const data = await res.json();

      setStates(normalizeList(data));
    };

    fetchStates();
  }, []);

  const handleSave = async () => {
    console.log("Form Data:", formData);
    try {
      const res = await fetch("/api/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert("Failed to save client");
        return;
      }

      router.push("/clients");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Create Client" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-25">
        <div className="space-y-2">
          <Label>Client</Label>

          <Input
            value={formData.client}
            onChange={(e) =>
              setFormData({
                ...formData,
                client: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>State</Label>

          <select
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            value={formData.state}
            onChange={(e) =>
              setFormData({
                ...formData,
                state: e.target.value,
              })
            }
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state._id} value={state.listItem}>
                {state.listItem}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>

          <Input
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>

          <Input
            value={formData.emailId}
            onChange={(e) =>
              setFormData({
                ...formData,
                emailId: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>

          <Input
            value={formData.website}
            onChange={(e) =>
              setFormData({
                ...formData,
                website: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>GST Number</Label>

          <Input
            value={formData.gstNo}
            onChange={(e) =>
              setFormData({
                ...formData,
                gstNo: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/clients")}>
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          className="px-6 py-2 rounded-xl bg-cyan-900 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}

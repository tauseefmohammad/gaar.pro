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

  const [errors, setErrors] = useState<Record<string, boolean>>({});

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

  // 🔹 Validation
  const validate = () => {
    const newErrors: Record<string, boolean> = {
      client: !formData.client.trim(),
      website: !formData.website.trim(),
      emailId: !formData.emailId.trim(),
      phone: !formData.phone.trim(),
      gstNo: !formData.gstNo.trim(),
      state: !formData.state.trim(),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

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
    <div className="space-y-6 px-0 md:px-4 lg:px-8">
      <PageHeader title="Create Client" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-25">
        <div className="space-y-2">
          <Label className="font-bold">Client</Label>

          <Input
            className={errors.client ? "border-red-500" : ""}
            value={formData.client}
            onChange={(e) => {
              setFormData({
                ...formData,
                client: e.target.value,
              });
              if (errors.client) {
                setErrors({ ...errors, client: false });
              }
            }}
          />
          {errors.client && (
            <p className="text-red-500 text-xs mt-1 font-bold">
              * This is Mandatory
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="font-bold" >State</Label>

          <select
            className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${errors.state ? "border-red-500" : ""}`}
            value={formData.state}
            onChange={(e) => {
              setFormData({
                ...formData,
                state: e.target.value,
              });
              if (errors.state) {
                setErrors({ ...errors, state: false });
              }
            }}
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state._id} value={state.listItem}>
                {state.listItem}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-xs mt-1 font-bold">
              * This is Mandatory
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="font-bold">Phone</Label>

          <Input
            className={errors.phone ? "border-red-500" : ""}
            value={formData.phone}
            onChange={(e) => {
              setFormData({
                ...formData,
                phone: e.target.value,
              });
              if (errors.phone) {
                setErrors({ ...errors, phone: false });
              }
            }}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1 font-bold">
              * This is Mandatory
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="font-bold">Email</Label>

          <Input
            className={errors.emailId ? "border-red-500" : ""}
            value={formData.emailId}
            onChange={(e) => {
              setFormData({
                ...formData,
                emailId: e.target.value,
              });
              if (errors.emailId) {
                setErrors({ ...errors, emailId: false });
              }
            }}
          />
          {errors.emailId && (
            <p className="text-red-500 text-xs mt-1 font-bold">
              * This is Mandatory
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="font-bold">Website</Label>

          <Input
            className={errors.website ? "border-red-500" : ""}
            value={formData.website}
            onChange={(e) => {
              setFormData({
                ...formData,
                website: e.target.value,
              });
              if (errors.website) {
                setErrors({ ...errors, website: false });
              }
            }}
          />
          {errors.website && (
            <p className="text-red-500 text-xs mt-1 font-bold">
              * This is Mandatory
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="font-bold">GST Number</Label>

          <Input
            className={errors.gstNo ? "border-red-500" : ""}
            value={formData.gstNo}
            onChange={(e) => {
              setFormData({
                ...formData,
                gstNo: e.target.value,
              });
              if (errors.gstNo) {
                setErrors({ ...errors, gstNo: false });
              }
            }}
          />
          {errors.gstNo && (
            <p className="text-red-500 text-xs mt-1 font-bold">
              * This is Mandatory
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSave}
          className=" bg-cyan-900 hover:bg-cyan-600 hover:text-black"
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button className=" bg-orange-700 hover:bg-orange-500 hover:text-black" onClick={() => router.push("/clients")}>
          Cancel
        </Button>

        
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();

  const clientId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    client: "",
    clientId: "",
    website: "",
    emailId: "",
    phone: "",
    gstNo: "",
    state: "",
  });

  // Fetch client data
  useEffect(() => {
    if (clientId) {
      fetchClient();
    }

    fetchStates();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/client/${clientId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch client");
      }

      const data = await res.json();

      setFormData({
        client: data.client || "",
        clientId: data.clientId || "",
        website: data.website || "",
        emailId: data.emailId || "",
        phone: data.phone || "",
        gstNo: data.gstNo || "",
        state: data.state || "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch states dropdown list
  const fetchStates = async () => {
    const stateListName = "State";
    try {
      const res = await fetch(
        `/api/system-list?listName=${stateListName}&orgId=${"ORG1"}`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch states");
      }

      const data = await res.json();

      const normalized = Array.isArray(data?.data) // newly added to resolve the issue (from here to)
      ? Array.isArray(data.data[0])
        ? data.data[0]
        : data.data
      : [];// newly added to resolve the issue (until here)

      setStates(normalized);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(`/api/client/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update client");
      }

      router.push("/clients");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-0 md:px-4 lg:px-8">
      
      <div className="rounded-md bg-gradient-to-r from-cyan-300 to-cyan-900 px-2 py-2 text-white shadow-sm text-center">
        <h1 className="text-xl font-semibold">Edit Client</h1>
      </div>
      <div className="p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client Name */}
          <div className="space-y-2">
            
            <Label>Client Name</Label>

            <Input
              name="client"
              value={formData.client}
              onChange={handleChange}
              placeholder="Enter Client Name"
              required
            />
          </div>

          {/* Client ID - Read Only */}
          <div className="space-y-2">
            <Label>Client ID</Label>

            <Input
              name="clientId"
              value={formData.clientId}
              readOnly
              disabled
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label>Website</Label>

            <Input
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Enter Website"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>

            <Input
              type="email"
              name="emailId"
              value={formData.emailId}
              onChange={handleChange}
              placeholder="Enter Email"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone</Label>

            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter Phone Number"
            />
          </div>

          {/* GST */}
          <div className="space-y-2">
            <Label>GST No</Label>

            <Input
              name="gstNo"
              value={formData.gstNo}
              onChange={handleChange}
              placeholder="Enter GST Number"
            />
          </div>

          {/* State Dropdown */}
          <div className="space-y-2">
            <Label>State</Label>

            <Select
              value={formData.state}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  state: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>

              <SelectContent>
                {states.map((item: any) => (
                  <SelectItem key={item._id} value={item.listItem}>
                    {item.listItem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
                  className="bg-cyan-900 hover:bg-cyan-700"
                                   
                >
                  {loading ? "Updating..." : "Update Client"}
                </Button>
              
            

            <Button
              type="button"
              variant="outline"
              className="bg-orange-700 hover:bg-orange-500 text-white"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
        </div>
    </div>
  );
}

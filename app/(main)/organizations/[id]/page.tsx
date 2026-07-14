"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditOrganizationPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  const [industryTypes, setIndustryTypes] = useState<any[]>([]);
  const [modeOfRegistrations, setModeOfRegistrations] = useState<any[]>([]);
  const [orgTypes, setOrgTypes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    orgName: "",
    contactName: "",
    contactDesignation: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    status: "",
    pan: "",
    gstNo: "",
    industryType: "",
    modeOfRegistration: "",
    orgType: "",
    regDate: "",
  });

  useEffect(() => {
    if (id) {
      fetchOrganization();
    }

    fetchCountries();
    fetchLists();
  }, [id]);

  // Fetch states whenever country changes
  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
    }
  }, [formData.country]);

  const fetchOrganization = async () => {
    try {
      const res = await fetch(`/api/organization/${id}`);

      if (!res.ok) {
        throw new Error("Failed to fetch organization");
      }

      const data = await res.json();

      setFormData({
        orgName: data.orgName || "",
        contactName: data.contactName || "",
        contactDesignation: data.contactDesignation || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
        pincode: data.pincode || "",
        status: data.status || "",
        pan: data.pan || "",
        gstNo: data.gstNo || "",
        industryType: data.industryType || "",
        modeOfRegistration: data.modeOfRegistration || "",
        orgType: data.orgType || "",
        regDate: data.regDate
          ? new Date(data.regDate).toISOString().split("T")[0]
          : "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Countries API
  const fetchCountries = async () => {
    try {
      const res = await fetch("/api/country-info/countries");

      const data = await res.json();

      setCountries(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // States API based on country
  const fetchStates = async (country: string) => {
    try {
      const res = await fetch(`/api/country-info/states?country=${country}`);

      const data = await res.json();

      setStates(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch dropdown lists
  const fetchLists = async () => {
    try {
      const [industryRes, modeRes, orgTypeRes] = await Promise.all([
        fetch("/api/lists/industry-type"),
        fetch("/api/lists/mode-of-registration"),
        fetch("/api/lists/org-type"),
      ]);

      const industryData = await industryRes.json();
      const modeData = await modeRes.json();
      const orgTypeData = await orgTypeRes.json();

      setIndustryTypes(industryData || []);
      setModeOfRegistrations(modeData || []);
      setOrgTypes(orgTypeData || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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

      const res = await fetch(`/api/organization/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update organization");
      }

      router.push("/organization");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-6">Edit Organization</h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Organization Name */}
          <div className="space-y-2">
            <Label>Organization Name</Label>

            <Input
              name="orgName"
              value={formData.orgName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Contact Name */}
          <div className="space-y-2">
            <Label>Contact Name</Label>

            <Input
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
            />
          </div>

          {/* Contact Designation */}
          <div className="space-y-2">
            <Label>Contact Designation</Label>

            <Input
              name="contactDesignation"
              value={formData.contactDesignation}
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone</Label>

            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>

            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label>Website</Label>

            <Input
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label>City</Label>

            <Input name="city" value={formData.city} onChange={handleChange} />
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <Label>Pincode</Label>

            <Input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
            />
          </div>

          {/* Country Dropdown */}
          <div className="space-y-2">
            <Label>Country</Label>

            <Select
              value={formData.country}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  country: value,
                  state: "",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>

              <SelectContent>
                {countries.map((item: any) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Industry Type */}
          <div className="space-y-2">
            <Label>Industry Type</Label>

            <Select
              value={formData.industryType}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  industryType: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Industry Type" />
              </SelectTrigger>

              <SelectContent>
                {industryTypes.map((item: any) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode of Registration */}
          <div className="space-y-2">
            <Label>Mode Of Registration</Label>

            <Select
              value={formData.modeOfRegistration}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  modeOfRegistration: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>

              <SelectContent>
                {modeOfRegistrations.map((item: any) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Organization Type */}
          <div className="space-y-2">
            <Label>Organization Type</Label>

            <Select
              value={formData.orgType}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  orgType: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Organization Type" />
              </SelectTrigger>

              <SelectContent>
                {orgTypes.map((item: any) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Registration Date */}
          <div className="space-y-2">
            <Label>Registration Date</Label>

            <Input
              type="date"
              name="regDate"
              value={formData.regDate}
              onChange={handleChange}
            />
          </div>

          {/* PAN */}
          <div className="space-y-2">
            <Label>PAN</Label>

            <Input name="pan" value={formData.pan} onChange={handleChange} />
          </div>

          {/* GST */}
          <div className="space-y-2">
            <Label>GST No</Label>

            <Input
              name="gstNo"
              value={formData.gstNo}
              onChange={handleChange}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>

            <Input
              name="status"
              value={formData.status}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>

            <Textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Organization"}
            </Button>

            <Button
              type="button"
              variant="outline"
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

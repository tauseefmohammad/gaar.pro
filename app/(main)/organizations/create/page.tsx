// app/organization/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/app/_components/PageHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const initialState = {
  orgName: "",
  contactName: "",
  contactDesignation: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  city: "",
  district: "",
  state: "",
  country: "",
  pincode: "",
  status: "ACTIVE",
  pan: "",
  gstNo: "",
  industryType: "",
  modeOfRegistration: "",
  orgType: "",
  password: "",
  confirmPassword: "",
};

export default function CreateOrganization() {
  const router = useRouter();

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  const [industryTypes, setIndustryTypes] = useState<any[]>([]);
  const [orgTypes, setOrgTypes] = useState<any[]>([]);
  const [registrationModes, setRegistrationModes] = useState<any[]>([]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (form.country) {
      fetchStates(form.country);
    }
  }, [form.country]);

  const normalizeList = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    if (Array.isArray(data.data)) {
      if (Array.isArray(data.data[0])) return data.data[0];
      return data.data;
    }

    return [];
  };

  const fetchDropdowns = async () => {
    try {
      const [countriesRes, industryRes, orgTypeRes, regModeRes] =
        await Promise.all([
          fetch("/api/country-info"),
          fetch("/api/system-list?listName=INDUSTRY TYPE"),
          fetch("/api/system-list?listName=ORG TYPE"),
          fetch("/api/system-list?listName=REGISTRATION MODE"),
        ]);

      setCountries(await countriesRes.json());
      setIndustryTypes(normalizeList(await industryRes.json()));
      setOrgTypes(normalizeList(await orgTypeRes.json()));
      setRegistrationModes(normalizeList(await regModeRes.json()));
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStates = async (country: string) => {
    try {
      const response = await fetch(
        `/api/country-info/states?country=${country}`,
      );

      setStates(await response.json());
    } catch (error) {
      console.log(error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {
      orgName: !form.orgName.trim(),
      contactName: !form.contactName.trim(),
      contactDesignation: !form.contactDesignation.trim(),
      phone: !form.phone.trim(),
      email: !form.email.trim(),
      website: !form.website.trim(),
      address: !form.address.trim(),
      city: !form.city.trim(),
      district: !form.district.trim(),
      state: !form.state.trim(),
      country: !form.country.trim(),
      pincode: !form.pincode.trim(),
      pan: !form.pan.trim(),
      gstNo: !form.gstNo.trim(),
      industryType: !form.industryType.trim(),
      modeOfRegistration: !form.modeOfRegistration.trim(),
      orgType: !form.orgType.trim(),
      password: !form.password.trim(),
      confirmPassword: !form.confirmPassword.trim(),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      //alert("Please fill all mandatory fields");
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(form.phone)) {
      //alert("Invalid phone number");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      //alert("Invalid email");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      //alert("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push("/organizations");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Create Organization" />

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Organization Name *"
              value={form.orgName}
              error={errors.orgName}
              onChange={(v: string) => handleChange("orgName", v)}
            />

            <FormInput
              label="Contact Name *"
              value={form.contactName}
              error={errors.contactName}
              onChange={(v: string) => handleChange("contactName", v)}
            />

            <FormInput
              label="Designation *"
              value={form.contactDesignation}
              error={errors.contactDesignation}
              onChange={(v: string) => handleChange("contactDesignation", v)}
            />

            <FormInput
              label="Phone *"
              type="tel"
              value={form.phone}
              error={errors.phone}
              onChange={(v: string) => handleChange("phone", v)}
            />

            <FormInput
              label="Email *"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(v: string) => handleChange("email", v)}
            />

            <FormInput
              label="Website *"
              type="url"
              value={form.website}
              error={errors.website}
              onChange={(v: string) => handleChange("website", v)}
            />

            <FormTextarea
              label="Address *"
              value={form.address}
              error={errors.address}
              onChange={(v: string) => handleChange("address", v)}
              className="md:col-span-2"
            />

            <FormInput
              label="City *"
              value={form.city}
              error={errors.city}
              onChange={(v: string) => handleChange("city", v)}
            />

            <FormInput
              label="District *"
              value={form.district}
              error={errors.district}
              onChange={(v: string) => handleChange("district", v)}
            />

            <div>
              <label className="text-sm font-medium">Country *</label>

              <select
                className={`border rounded-lg p-2 w-full ${errors.country ? "border-red-500" : ""}`}
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
              >
                <option value="">Select</option>

                {countries.map((c: any) => (
                  <option key={c.id} value={c.country}>
                    {c.country}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-red-500 text-xs mt-1 font-bold">
                  * This is Mandatory
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">State *</label>

              <select
                className={`border rounded-lg p-2 w-full ${errors.state ? "border-red-500" : ""}`}
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
              >
                <option value="">Select</option>

                {states.map((s: any) => (
                  <option key={s.id} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-red-500 text-xs mt-1 font-bold">
                  * This is Mandatory
                </p>
              )}
            </div>

            <FormInput
              label="Pincode *"
              type="number"
              value={form.pincode}
              error={errors.pincode}
              onChange={(v: string) => handleChange("pincode", v)}
            />

            <div>
              <label className="text-sm font-medium">Industry Type *</label>

              <select
                className={`border rounded-lg p-2 w-full ${errors.industryType ? "border-red-500" : ""}`}
                value={form.industryType}
                onChange={(e) => handleChange("industryType", e.target.value)}
              >
                <option value="">Select</option>

                {industryTypes.map((it: any) => (
                  <option key={it._id} value={it.listItem}>
                    {it.listItem}
                  </option>
                ))}
              </select>
              {errors.industryType && (
                <p className="text-red-500 text-xs mt-1 font-bold">
                  * This is Mandatory
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Registration Mode *</label>

              <select
                className={`border rounded-lg p-2 w-full ${errors.modeOfRegistration ? "border-red-500" : ""}`}
                value={form.modeOfRegistration}
                onChange={(e) =>
                  handleChange("modeOfRegistration", e.target.value)
                }
              >
                <option value="">Select</option>

                {registrationModes.map((mr: any) => (
                  <option key={mr._id} value={mr.listItem}>
                    {mr.listItem}
                  </option>
                ))}
              </select>
              {errors.modeOfRegistration && (
                <p className="text-red-500 text-xs mt-1 font-bold">
                  * This is Mandatory
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Organization Type *</label>

              <select
                className={`border rounded-lg p-2 w-full ${errors.orgType ? "border-red-500" : ""}`}
                value={form.orgType}
                onChange={(e) => handleChange("orgType", e.target.value)}
              >
                <option value="">Select</option>

                {orgTypes.map((ot: any) => (
                  <option key={ot._id} value={ot.listItem}>
                    {ot.listItem}
                  </option>
                ))}
              </select>
              {errors.orgType && (
                <p className="text-red-500 text-xs mt-1 font-bold">
                  * This is Mandatory
                </p>
              )}
            </div>

            <FormInput
              label="PAN *"
              value={form.pan}
              error={errors.pan}
              onChange={(v: string) => handleChange("pan", v)}
            />

            <FormInput
              label="GST No *"
              value={form.gstNo}
              error={errors.gstNo}
              onChange={(v: string) => handleChange("gstNo", v)}
            />

            <FormInput
              label="Password *"
              type="password"
              value={form.password}
              error={errors.password}
              onChange={(v: string) => handleChange("password", v)}
            />

            <FormInput
              label="Confirm Password *"
              type="password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(v: string) => handleChange("confirmPassword", v)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-orange-700 hover:bg-orange-500 hover:text-black text-white"
            >
              Cancel
            </Button>

            <Button onClick={handleSubmit} className="bg-cyan-900 hover:bg-cyan-600 hover:text-black">
              Save Organization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", error = false }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>

      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 rounded-xl ${error ? "border-red-500" : ""}`}
      />
      {error && (
        <p className="text-red-500 text-xs font-bold">* This is Mandatory</p>
      )}
    </div>
  );
}

function FormTextarea({ label, value, onChange, className = "", error = false }: any) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[100px] rounded-xl ${error ? "border-red-500" : ""}`}
      />
      {error && (
        <p className="text-red-500 text-xs font-bold">* This is Mandatory</p>
      )}
    </div>
  );
}
// app/(main)/tenders/create/page.tsx

"use client";

import { useRouter } from "next/navigation";

import PageHeader from "@/app/_components/PageHeader";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AmountToWords from "@/app/_components/AmountToWords";
import { FileText } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateTenderPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [verticals, setVerticals] = useState<any[]>([]);
  const [subVerticals, setSubVerticals] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    tenderNo: "",
    tenderName: "",
    description: "",
    tenderDate: "",
    preBidMeetingDate: "",
    tenderSubmissionLastDate: "",
    tenderOpeningDate: "",
    tenderValue: "",
    state: "Telangana",
    country: "India",
    emdAmount: "",
    bgAmount: "",
    documentFee: "",
    corpusFund: "",
    transactionFee: "",
    vertical: "",
    subVertical: "",
    tenderingDepartment: "",
    client: "",
    owner: "",
    isMAFRequired: false,
    remarks: "",
    orgId: "",
    tenderManager: "",
    tenderManagerEmail: "",
    tenderManagerPhone: "",
    tenderOwner: "",
    scm: "",
    clientId: "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [departmentSearch, setDepartmentSearch] = useState("");

  const [clientSearch, setClientSearch] = useState("");

  const [departmentResults, setDepartmentResults] = useState([]);

  const [clientResults, setClientResults] = useState([]);
  const orgId = session?.user?.orgId || "";
  const [userResults, setUserResults] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [showUserResults, setShowUserResults] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  }

  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
    }
  }, [formData.country]);

  const fetchStates = async (country: string) => {
    try {
      const response = await fetch(
        `/api/country-info/states?country=${country}`,
      );

      const data = await response.json();
      setStates(data);

      // Keep default "Telangana" selected only if the user hasn't already picked a state
      setFormData((prev) => {
        if (prev.state && prev.state !== "Telangana") return prev; // user already picked something else, don't override

        const match = data.find(
          (s: any) => s.state?.toLowerCase() === "telangana",
        );

        return {
          ...prev,
         state: match ? match.state : prev.state,
        };
      });
      } catch (error) {
      console.log(error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch("/api/country-info");
      const data = await response.json();

      setCountries(data);
    } catch (error) {
      console.log(error);
    }
  };

  const normalizeList = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    if (Array.isArray(data.data)) {
      if (Array.isArray(data.data[0])) return data.data[0];
      return data.data;
    }

    return [];
  };

  // ---------------- FETCH LISTS ----------------
  const fetchList = async (name: string, orgId: string) => {
    const res = await fetch(
      `/api/system-list?listName=${encodeURIComponent(name)}&orgId=${orgId}`,
    );

    const data = await res.json();

    return normalizeList(data);
  };

  useEffect(() => {
    if (!orgId) return;

    const loadVerticals = async () => {
      const verticalsList = await Promise.all([fetchList("VERTICAL", orgId)]);
      setVerticals(verticalsList[0] || []);
    };

    loadVerticals();
    fetchCountries();
  }, []);

  // ---------------- SUB VERTICAL ----------------
  useEffect(() => {
    if (!formData.vertical) return setSubVerticals([]);

    fetchList(formData.vertical, formData.orgId).then(setSubVerticals);
  }, [formData.vertical]);

  // Department Search
  useEffect(() => {
    async function searchDepartment() {
      if (!departmentSearch.trim()) {
        setDepartmentResults([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/client/search?q=${departmentSearch}&orgId=${formData.orgId}`,
        );

        const data = await res.json();

        setDepartmentResults(data.data || []);
      } catch (error) {
        console.log(error);
      }
    }

    const delay = setTimeout(() => {
      searchDepartment();
    }, 300);

    return () => clearTimeout(delay);
  }, [departmentSearch, formData.orgId]);

  // Client Search
  useEffect(() => {
    async function searchClient() {
      if (!clientSearch.trim()) {
        setClientResults([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/client/search?q=${clientSearch}&orgId=${formData.orgId}`,
        );

        const data = await res.json();

        setClientResults(data.data || []);
      } catch (error) {
        console.log(error);
      }
    }

    const delay = setTimeout(() => {
      searchClient();
    }, 300);

    return () => clearTimeout(delay);
  }, [clientSearch, formData.orgId]);

  useEffect(() => {
    const orgId = session?.user?.orgId || "";

    setFormData((prev) => ({
      ...prev,
      orgId,
    }));
  }, []);

  // ---------------- VALIDATION ----------------
  const validate = () => {
    const newErrors: Record<string, boolean> = {
      tenderNo: !formData.tenderNo.trim(),
      owner: !formData.owner.trim(),
      description: !formData.description.trim(),
      tenderDate: !formData.tenderDate,
      preBidMeetingDate: !formData.preBidMeetingDate,
      tenderSubmissionLastDate: !formData.tenderSubmissionLastDate,
      tenderOpeningDate: !formData.tenderOpeningDate,
      vertical: !formData.vertical.trim(),
      subVertical: !formData.subVertical.trim(),
      country: !formData.country.trim(),
      state: !formData.state.trim(),
      emdAmount: !String(formData.emdAmount).trim(),
      bgAmount: !String(formData.bgAmount).trim(),
      documentFee: !String(formData.documentFee).trim(),
      corpusFund: !String(formData.corpusFund).trim(),
      transactionFee: !String(formData.transactionFee).trim(),
      tenderingDepartment: !formData.tenderingDepartment.trim(),
      client: !formData.client.trim(),
      tenderManager: !formData.tenderManager.trim(),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const inputClass = (field: string) =>
    errors[field] ? "border-red-500" : "";

  const selectClass = (field: string) =>
    `border rounded-lg p-2 w-full ${errors[field] ? "border-red-500" : ""}`;

  const ErrorText = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-red-500 text-xs mt-1 font-bold">* This is Mandatory</p>
    ) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const res = await fetch("/api/tender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to create tender");
      }

      router.push("/tenders");
    } catch (error) {
      console.log(error);
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUserResults([]);
      return;
    }
    //console.log("Searching:", query);
    try {
      const res = await fetch(
        `/api/user/search?q=${query}&orgId=${formData.orgId}`,
      );
      const data = await res.json();
      //console.log(data);
      setUserResults(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  //Owner Search
  const renderUserSearch = (field: string, label: string) => (
    <div className="space-y-2 relative z-50">
      <Label className="font-bold">{label} *</Label>

      <Input
        value={userSearch}
        placeholder={`Search ${label}`}
        className={inputClass(field)}
        onFocus={() => setShowUserResults(true)}
        onChange={(e) => {
          const value = e.target.value;

          setUserSearch(value);
          setShowUserResults(true);

          setFormData((prev) => ({
            ...prev,
            owner: value,
          }));

          if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: false }));
          }

          searchUsers(value);
        }}
      />

      {showUserResults && userResults.length > 0 && (
        <div className="absolute top-full left-0 mt-1 z-[9999] bg-white border rounded-md shadow-lg w-full">
          {" "}
          {userResults.map((user: any) => (
            <div
              key={user._id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setUserSearch(user.name);

                setFormData((prev) => ({
                  ...prev,
                  owner: user.name,
                }));
                setShowUserResults(false);
                setUserResults([]);

                if (errors[field]) {
                  setErrors((prev) => ({ ...prev, [field]: false }));
                }
              }}
            >
              {user.name}
            </div>
          ))}
        </div>
      )}

      <ErrorText field={field} />
    </div>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch]);

  return (
    <div className="space-y-4 *:px-0 md:px-4 lg:px-8">
      {/* Title */}
      <div className="bg-linear-to-r from-cyan-300 to-cyan-900 text-white text-center py-2 rounded-md">
        <h1 className="text-xl font-semibold">Create Tender</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GENERAL INFO */}
        <Card className="overflow-visible rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="py-3 px-5 border-b bg-white">
            <CardTitle className="flex items-center gap-2">
              <div className="h-6 w-1.5 rounded-full bg-cyan-500" />

              <span className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                General Information
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
            <div className="space-y-2">
              <Label className="font-bold">Tender No *</Label>
              <Input
                name="tenderNo"
                value={formData.tenderNo}
                onChange={handleChange}
                className={inputClass("tenderNo")}
              />
              <ErrorText field="tenderNo" />
            </div>

            {renderUserSearch("owner", "Owner")}

            <div className="space-y-2">
              <Label className="font-bold text-gray-700">Is MAF Required</Label>
              <Checkbox
                checked={formData.isMAFRequired}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isMAFRequired: checked as boolean,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Tender Value</Label>
              <AmountToWords
                amount={formData.tenderValue}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    tenderValue: val,
                  })
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold">Description *</Label>

              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={inputClass("description")}
              />
              <ErrorText field="description" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Tender Date *</Label>

              <Input
                type="datetime-local"
                name="tenderDate"
                value={formData.tenderDate?.slice(0, 16)}
                onChange={handleChange}
                className={inputClass("tenderDate")}
              />
              <ErrorText field="tenderDate" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Pre-Bid Meeting Date *</Label>

              <Input
                type="datetime-local"
                name="preBidMeetingDate"
                value={formData.preBidMeetingDate?.slice(0, 16)}
                onChange={handleChange}
                className={inputClass("preBidMeetingDate")}
              />
              <ErrorText field="preBidMeetingDate" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Tender Submission Date *</Label>

              <Input
                type="datetime-local"
                name="tenderSubmissionLastDate"
                value={formData.tenderSubmissionLastDate?.slice(0, 16)}
                onChange={handleChange}
                className={inputClass("tenderSubmissionLastDate")}
              />
              <ErrorText field="tenderSubmissionLastDate" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Tender Opening Date *</Label>

              <Input
                type="datetime-local"
                name="tenderOpeningDate"
                value={formData.tenderOpeningDate?.slice(0, 16)}
                onChange={handleChange}
                className={inputClass("tenderOpeningDate")}
              />
              <ErrorText field="tenderOpeningDate" />
            </div>
            <div>
              <label className="font-bold">Vertical *</label>

              <select
                className={selectClass("vertical")}
                value={formData.vertical}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    vertical: e.target.value,
                    subVertical: "",
                  });
                  if (errors.vertical) {
                    setErrors((prev) => ({ ...prev, vertical: false }));
                  }
                }}
              >
                <option value="">Select</option>

                {verticals.map((v: any) => (
                  <option key={v._id} value={v.listItem}>
                    {v.listItem}
                  </option>
                ))}
              </select>
              <ErrorText field="vertical" />
            </div>

            {/* SUB VERTICAL */}
            <div>
              <label className="font-bold">Sub Vertical *</label>

              <select
                className={selectClass("subVertical")}
                value={formData.subVertical}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    subVertical: e.target.value,
                  });
                  if (errors.subVertical) {
                    setErrors((prev) => ({ ...prev, subVertical: false }));
                  }
                }}
              >
                <option value="">Select</option>

                {subVerticals.map((sv: any) => (
                  <option key={sv._id} value={sv.listItem}>
                    {sv.listItem}
                  </option>
                ))}
              </select>
              <ErrorText field="subVertical" />
            </div>
            <div>
              <label className="font-bold">Country *</label>

              <select
                className={selectClass("country")}
                value={formData.country}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    country: e.target.value,
                    state: "", // reset state when country changes manually
                  });
                  if (errors.country) {
                    setErrors((prev) => ({ ...prev, country: false }));
                  }
                }}
              >
                <option value="">Select</option>

                {countries.map((c: any) => (
                  <option key={c.id} value={c.country}>
                    {c.country}
                  </option>
                ))}
              </select>
              <ErrorText field="country" />
            </div>

            <div>
              <label className="font-bold">State *</label>

              <select
                className={selectClass("state")}
                value={formData.state}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    state: e.target.value,
                  });
                  if (errors.state) {
                    setErrors((prev) => ({ ...prev, state: false }));
                  }
                }}
              >
                <option value="">Select</option>

                {states.map((s: any) => (
                  <option key={s.id} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
              <ErrorText field="state" />
            </div>
          </CardContent>
        </Card>

        {/* FEE */}
        <Card className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="py-3 px-5 border-b bg-white">
            <CardTitle className="flex items-center gap-2">
              <div className="h-6 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                Tender Fees
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">EMD Amount *</Label>
              <AmountToWords
                amount={formData.emdAmount}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    emdAmount: val,
                  });
                  if (errors.emdAmount) {
                    setErrors((prev) => ({ ...prev, emdAmount: false }));
                  }
                }}
              />
              <ErrorText field="emdAmount" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">BG Amount *</Label>
              <AmountToWords
                amount={formData.bgAmount}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    bgAmount: val,
                  });
                  if (errors.bgAmount) {
                    setErrors((prev) => ({ ...prev, bgAmount: false }));
                  }
                }}
              />
              <ErrorText field="bgAmount" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Document Fee *</Label>
              <AmountToWords
                amount={formData.documentFee}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    documentFee: val,
                  });
                  if (errors.documentFee) {
                    setErrors((prev) => ({ ...prev, documentFee: false }));
                  }
                }}
              />
              <ErrorText field="documentFee" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Corpus Fund *</Label>
              <AmountToWords
                amount={formData.corpusFund}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    corpusFund: val,
                  });
                  if (errors.corpusFund) {
                    setErrors((prev) => ({ ...prev, corpusFund: false }));
                  }
                }}
              />
              <ErrorText field="corpusFund" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Transaction Fee *</Label>
              <AmountToWords
                amount={formData.transactionFee}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    transactionFee: val,
                  });
                  if (errors.transactionFee) {
                    setErrors((prev) => ({ ...prev, transactionFee: false }));
                  }
                }}
              />
              <ErrorText field="transactionFee" />
            </div>
          </CardContent>
        </Card>

        {/* DEPARTMENT & CLIENT */}
        <Card className="rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow overflow-visible">
          <CardHeader className="py-3 px-5 border-b bg-white">
            <CardTitle className="flex items-center gap-2">
              <div className="h-6 w-1.5 rounded-full bg-violet-500" />

              <span className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                Department & Client
              </span>
            </CardTitle>
          </CardHeader> 

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
            {/* Department */}
            <div className="space-y-2 relative z-50">
              <Label className="font-bold">Tendering Department *</Label>

              <Input
                placeholder="Search by name or id"
                value={departmentSearch || formData.tenderingDepartment}
                className={inputClass("tenderingDepartment")}
                onChange={(e) => {
                  setDepartmentSearch(e.target.value);

                  setFormData((prev) => ({
                    ...prev,
                    tenderingDepartment: e.target.value,
                  }));

                  if (errors.tenderingDepartment) {
                    setErrors((prev) => ({
                      ...prev,
                      tenderingDepartment: false,
                    }));
                  }
                }}
              />

              {!!departmentResults.length && (
                <div className="absolute top-full left-0 mt-1 w-full rounded-md border bg-white shadow-lg z-[9999] max-h-60 overflow-auto">
                  {departmentResults.map((item: any) => (
                    <button
                      type="button"
                      key={item._id}
                      className="w-full text-left px-3 py-2 hover:bg-muted"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          tenderingDepartment: item.client,
                        }));

                        setDepartmentSearch("");

                        setDepartmentResults([]);

                        if (errors.tenderingDepartment) {
                          setErrors((prev) => ({
                            ...prev,
                            tenderingDepartment: false,
                          }));
                        }
                      }}
                    >
                      {item.client}
                    </button>
                  ))}
                </div>
              )}
              <ErrorText field="tenderingDepartment" />
            </div>

            {/* Client */}
            <div className="space-y-2 relative z-50">
              <Label className="font-bold">Client *</Label>

              <Input
                placeholder="Search by name or id"
                value={clientSearch || formData.client}
                className={inputClass("client")}
                onChange={(e) => {
                  setClientSearch(e.target.value);

                  setFormData((prev) => ({
                    ...prev,
                    client: e.target.value,
                  }));

                  if (errors.client) {
                    setErrors((prev) => ({ ...prev, client: false }));
                  }
                }}
              />

              {!!clientResults.length && (
                <div className="absolute top-full left-0 mt-1 w-full rounded-md border bg-white shadow-lg z-[9999] max-h-60 overflow-auto">
                  {clientResults.map((item: any) => (
                    <button
                      type="button"
                      key={item._id}
                      className="w-full text-left px-3 py-2 hover:bg-muted"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          client: item.client,
                        }));

                        setClientSearch("");

                        setClientResults([]);

                        if (errors.client) {
                          setErrors((prev) => ({ ...prev, client: false }));
                        }
                      }}
                    >
                      {item.client}
                    </button>
                  ))}
                </div>
              )}
              <ErrorText field="client" />
            </div>
            {/* Tender Manager */}
            <div className="space-y-2">
              <Label className="font-bold">Tender Manager</Label>
              <Input
                name="tenderManager"
                value={formData.tenderManager}
                onChange={handleChange}
                className={inputClass("tenderManager")}
              />
              <ErrorText field="tenderManager" />
            </div>

            {/* Tender Manager Email */}
            <div className="space-y-2">
              <Label className="font-bold">Tender Manager Email</Label>
              <Input
                type="email"
                name="tenderManagerEmail"
                value={formData.tenderManagerEmail}
                onChange={handleChange}
              />
            </div>

            {/* Tender Manager Phone */}
            <div className="space-y-2">
              <Label className="font-bold">Tender Manager Phone</Label>
              <Input
                type="tel"
                name="tenderManagerPhone"
                value={formData.tenderManagerPhone}
                onChange={handleChange}
              />
            </div>

            {/* Tender Owner */}
            <div className="space-y-2">
              <Label className="font-bold">Tender Owner</Label>
              <Input
                name="tenderOwner"
                value={formData.tenderOwner}
                onChange={handleChange}
              />
            </div>

            {/* SCM */}
            <div className="space-y-2">
              <Label className="font-bold">SCM</Label>
              <Input
                name="scm"
                value={formData.scm}
                onChange={handleChange}
              />
            </div>

            {/* Client Id */}
            <div className="space-y-2">
              <Label className="font-bold">Client Id</Label>
              <Input
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>
        {/* REMARKS */}
        <Card className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="py-3 px-5 border-b bg-white">
            <CardTitle className="flex items-center gap-2">
              <div className="h-6 w-1.5 rounded-full bg-amber-500" />

              <span className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                Remarks
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <Label className="font-bold">Remarks</Label>

              <Textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={5}
                placeholder="Enter remarks..."
              />
            </div>
          </CardContent>
        </Card>
        {/* BUTTONS */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            className="bg-cyan-900 hover:bg-cyan-700 hover:text-black"
          >
            Create Tender
          </Button>

          <Button
            onClick={() => router.push("/tenders")}
            className="bg-orange-700 hover:bg-orange-500 hover:text-black"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
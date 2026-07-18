// app/dashboard/tenders/create/page.tsx

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
    state: "",
    country: "",
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
  });
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

      setStates(await response.json());
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
      <Label>{label}</Label>

      <Input
        value={userSearch}
        placeholder={`Search ${label}`}
        onFocus={() => setShowUserResults(true)}
        onChange={(e) => {
          const value = e.target.value;

          setUserSearch(value);
          setShowUserResults(true);

          setFormData((prev) => ({
            ...prev,
            owner: value,
          }));

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
              }}
            >
              {user.name}
            </div>
          ))}
        </div>
      )}
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
              <Label className="font-bold">Tender No</Label>
              <Input
                name="tenderNo"
                value={formData.tenderNo}
                onChange={handleChange}
                required
              />
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
              <Label className="font-bold">Description</Label>

              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Tender Date</Label>

              <Input
                type="datetime-local"
                name="tenderDate"
                value={formData.tenderDate?.slice(0, 16)}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Pre-Bid Meeting Date</Label>

              <Input
                type="datetime-local"
                name="preBidMeetingDate"
                value={formData.preBidMeetingDate?.slice(0, 16)}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Tender Submission Date</Label>

              <Input
                type="datetime-local"
                name="tenderSubmissionLastDate"
                value={formData.tenderSubmissionLastDate?.slice(0, 16)}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Tender Opening Date</Label>

              <Input
                type="datetime-local"
                name="tenderOpeningDate"
                value={formData.tenderOpeningDate?.slice(0, 16)}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="font-bold">Vertical</label>

              <select
                className="border rounded-lg p-2 w-full"
                value={formData.vertical}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vertical: e.target.value,
                    subVertical: "",
                  })
                }
              >
                <option value="">Select</option>

                {verticals.map((v: any) => (
                  <option key={v._id} value={v.listItem}>
                    {v.listItem}
                  </option>
                ))}
              </select>
            </div>

            {/* SUB VERTICAL */}
            <div>
              <label className="font-bold">Sub Vertical</label>

              <select
                className="border rounded-lg p-2 w-full"
                value={formData.subVertical}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subVertical: e.target.value,
                  })
                }
              >
                <option value="">Select</option>

                {subVerticals.map((sv: any) => (
                  <option key={sv._id} value={sv.listItem}>
                    {sv.listItem}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold">Country *</label>

              <select
                className="border rounded-lg p-2 w-full"
                value={formData.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    country: e.target.value,
                  })
                }
              >
                <option value="">Select</option>

                {countries.map((c: any) => (
                  <option key={c.id} value={c.country}>
                    {c.country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold">State *</label>

              <select
                className="border rounded-lg p-2 w-full"
                value={formData.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    state: e.target.value,
                  })
                }
              >
                <option value="">Select</option>

                {states.map((s: any) => (
                  <option key={s.id} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
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
              <Label className="font-bold">EMD Amount</Label>
              <AmountToWords
                amount={formData.emdAmount}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    emdAmount: val,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">BG Amount</Label>
              <AmountToWords
                amount={formData.bgAmount}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    bgAmount: val,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Document Fee</Label>
              <AmountToWords
                amount={formData.documentFee}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    documentFee: val,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Corpus Fund</Label>
              <AmountToWords
                amount={formData.corpusFund}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    corpusFund: val,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Transaction Fee</Label>
              <AmountToWords
                amount={formData.transactionFee}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    transactionFee: val,
                  })
                }
              />
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
              <Label className="font-bold">Tendering Department</Label>

              <Input
                placeholder="Search by name or id"
                value={departmentSearch || formData.tenderingDepartment}
                onChange={(e) => {
                  setDepartmentSearch(e.target.value);

                  setFormData((prev) => ({
                    ...prev,
                    tenderingDepartment: e.target.value,
                  }));
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
                      }}
                    >
                      {item.client}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Client */}
            <div className="space-y-2 relative z-50">
              <Label className="font-bold">Client</Label>

              <Input
                placeholder="Search by name or id"
                value={clientSearch || formData.client}
                onChange={(e) => {
                  setClientSearch(e.target.value);

                  setFormData((prev) => ({
                    ...prev,
                    client: e.target.value,
                  }));
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
                      }}
                    >
                      {item.client}
                    </button>
                  ))}
                </div>
              )}
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

// CreateReceivableForm.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import AmountToWords from "../AmountToWords";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { FileText, MapPinned, Briefcase } from "lucide-react";

export default function CreateReceivableForm() {
  const router = useRouter();

  const { data: session } = useSession();

  const orgId = session?.user?.orgId || "INTR";

  const [form, setForm] = useState<any>({});

  const [verticals, setVerticals] = useState<any[]>([]);
  const [subVerticals, setSubVerticals] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [paymentTypeList, setPaymentTypeList] = useState<any[]>([]);

  const [userResults, setUserResults] = useState<any[]>([]);
  const [clientResults, setClientResults] = useState<any[]>([]);
  const [workOrderResults, setWorkOrderResults] = useState<any[]>([]);
  const [tenderResults, setTenderResults] = useState<any[]>([]);

  const fetchList = async (listName: string) => {
    const res = await fetch(
      `/api/system-list?listName=${listName}&orgId=${orgId}`,
    );

    const data = await res.json();

    return data?.data?.[0] || [];
  };

  useEffect(() => {
    if (!session?.user?.orgId) return;

    fetchList("VERTICAL").then(setVerticals);
    fetchList("Receivable Status").then(setStatusList);
    fetchList("State").then(setStateList);
    fetchList("Receivable Type").then(setPaymentTypeList);
  }, [session]);

  useEffect(() => {
    if (!form?.vertical) return;

    fetchList(form.vertical).then(setSubVerticals);
  }, [form.vertical]);

  const searchUsers = async (query: string) => {
    if (!query) return setUserResults([]);

    const res = await fetch(`/api/user/search?q=${query}`);

    const data = await res.json();

    setUserResults(data || []);
  };

  const searchClients = async (query: string) => {
    if (!query) return setClientResults([]);

    const res = await fetch(`/api/client/search?q=${query}&orgId=${orgId}`);

    const data = await res.json();

    setClientResults(data?.data || []);
  };

  const searchWorkOrders = async (query: string) => {
    if (!query) return setWorkOrderResults([]);

    const res = await fetch(`/api/work-order/search?q=${query}&orgId=${orgId}`);

    const data = await res.json();

    setWorkOrderResults(data?.data || []);
  };

  const searchTenders = async (query: string) => {
    if (!query) return setTenderResults([]);

    const res = await fetch(`/api/tender/search?q=${query}&orgId=${orgId}`);

    const data = await res.json();

    setTenderResults(data?.data || []);
  };

  const handleSubmit = async () => {
    await fetch("/api/receivable", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        orgId,
      }),
    });

    router.push("/receivables");
  };

  const renderUserSearch = (field: string, label: string) => (
    <div className="relative">
      <Label>{label}</Label>

      <Input
        value={form[field] || ""}
        placeholder={`Search ${label}`}
        onChange={(e) => {
          const value = e.target.value;

          setForm({
            ...form,
            [field]: value,
          });

          searchUsers(value);
        }}
      />

      {userResults.length > 0 && (
        <div className="absolute z-10 bg-white border rounded-md shadow-md w-full max-h-40 overflow-y-auto">
          {userResults.map((user: any) => (
            <div
              key={user._id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setForm({
                  ...form,
                  [field]: user.name,
                });

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

  const renderClientSearch = (field: string, label: string) => (
    <div className="relative">
      <Label>{label}</Label>

      <Input
        value={form[field] || ""}
        placeholder={`Search ${label}`}
        onChange={(e) => {
          const value = e.target.value;

          setForm({
            ...form,
            [field]: value,
          });

          searchClients(value);
        }}
      />

      {clientResults.length > 0 && (
        <div className="absolute z-10 bg-white border rounded-md shadow-md w-full max-h-40 overflow-y-auto">
          {clientResults.map((client: any) => (
            <div
              key={client._id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setForm({
                  ...form,
                  [field]: client.client,
                });

                setClientResults([]);
              }}
            >
              {client.client}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-12">
      <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-300 px-6 py-4 text-white shadow-sm">
        <h1 className="text-xl font-semibold">Create Receivable</h1>
      </div>

      <div className="space-y-6">
        {/* BASIC INFO */}
        <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-cyan-900 to-cyan-700 text-white py-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Type</Label>

                <select
                  className="w-full border rounded-md p-2"
                  value={form.type || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="">Select</option>

                  {paymentTypeList.map((v: any) => (
                    <option key={v._id} value={v.listItem}>
                      {v.listItem}
                    </option>
                  ))}
                </select>
              </div>

              <div>{renderClientSearch("paymentFrom", "Payment From")}</div>

              <div className="md:col-span-2">
                <Label>Description</Label>

                <Textarea
                  rows={4}
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Receivable Amount</Label>

                <AmountToWords
                  amount={String(form.receivableAmount || "")}
                  onChange={(val) =>
                    setForm((prev: any) => ({
                      ...prev,
                      receivableAmount: val,
                    }))
                  }
                />
              </div>

              <div>
                <Label>State</Label>

                <select
                  className="w-full border rounded-md p-2"
                  value={form.state || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      state: e.target.value,
                    })
                  }
                >
                  <option value="">Select</option>

                  {stateList.map((v: any) => (
                    <option key={v._id} value={v.listItem}>
                      {v.listItem}
                    </option>
                  ))}
                </select>
              </div>

              <div>{renderUserSearch("owner", "Owner")}</div>

              <div>
                <Label>Due Date</Label>

                <Input
                  type="date"
                  value={form.dueDate || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dueDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AREA */}
        <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-300 text-white py-4">
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="h-5 w-5" />
              Area & Classification
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Vertical</Label>

                <select
                  className="w-full border rounded-md p-2"
                  value={form.vertical || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      vertical: e.target.value,
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

              <div>
                <Label>Sub Vertical</Label>

                <select
                  className="w-full border rounded-md p-2"
                  value={form.subVertical || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subVertical: e.target.value,
                    })
                  }
                >
                  <option value="">Select</option>

                  {subVerticals.map((v: any) => (
                    <option key={v._id} value={v.listItem}>
                      {v.listItem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Status</Label>

                <select
                  className="w-full border rounded-md p-2"
                  value={form.status || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="">Select</option>

                  {statusList.map((v: any) => (
                    <option key={v._id} value={v.listItem}>
                      {v.listItem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Invoice No</Label>

                <Input
                  value={form.invoiceNo || ""}
                  className="h-11 rounded-xl border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      invoiceNo: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* TENDER / WORK ORDER */}
        <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-violet-500 to-violet-300 text-white py-4">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Tender & Work Order Information
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tender No */}
              <div className="relative">
                <Label>Tender No</Label>

                <Input
                  value={form.tenderNo || ""}
                  className="bg-muted"
                  readOnly
                />
              </div>

              <div>
                <Label>Tender Description</Label>

                <Input
                  readOnly
                  className="bg-slate-100 border-slate-200 rounded-xl"
                  value={form.tenderDesc || ""}
                />
              </div>

              {/* Work Order */}
              <div className="relative">
                <Label>Work Order No</Label>

                <Input
                  value={form.woNo || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    setForm({
                      ...form,
                      woNo: value,
                    });

                    searchWorkOrders(value);
                  }}
                />

                {workOrderResults.length > 0 && (
                  <div className="absolute z-10 bg-white border rounded-md shadow-md w-full max-h-40 overflow-y-auto">
                    {workOrderResults.map((wo: any) => (
                      <div
                        key={wo._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setForm({
                            ...form,
                            woNo: wo.woNo,
                            woTitle: wo.woTitle,
                            tenderNo: wo.tenderNo,
                            tenderName: wo.tenderName,
                          });

                          setWorkOrderResults([]);
                        }}
                      >
                        {wo.woNo}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Work Order Title</Label>

                <Input
                  readOnly
                  className="bg-slate-100 border-slate-200 rounded-xl"
                  value={form.woTitle || ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/receivables")}>
            Cancel
          </Button>

          <Button
            className="bg-cyan-900 hover:bg-cyan-700"
            onClick={handleSubmit}
          >
            Create Receivable
          </Button>
        </div>
      </div>
    </div>
  );
}

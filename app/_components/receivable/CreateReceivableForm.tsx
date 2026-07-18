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

  const [errors, setErrors] = useState<Record<string, boolean>>({});

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

  // 🔹 Validation
  const validate = () => {
    const newErrors: Record<string, boolean> = {
      type: !(form.type || "").trim(),
      paymentFrom: !(form.paymentFrom || "").trim(),
      //description: !(form.description || "").trim(),
      receivableAmount: !String(form.receivableAmount || "").trim(),
      state: !(form.state || "").trim(),
      owner: !(form.owner || "").trim(),
      dueDate: !(form.dueDate || "").trim(),
      vertical: !(form.vertical || "").trim(),
      subVertical: !(form.subVertical || "").trim(),
      status: !(form.status || "").trim(),
      invoiceNo: !(form.invoiceNo || "").trim(),
      woNo: !(form.woNo || "").trim(),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

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
        className={errors[field] ? "border-red-500" : ""}
        value={form[field] || ""}
        placeholder={`Search ${label}`}
        onChange={(e) => {
          const value = e.target.value;

          setForm({
            ...form,
            [field]: value,
          });

          if (errors[field]) {
            setErrors({ ...errors, [field]: false });
          }

          searchUsers(value);
        }}
      />

      {errors[field] && (
        <p className="text-red-500 text-xs mt-1 font-bold">
          * This is Mandatory
        </p>
      )}

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

                if (errors[field]) {
                  setErrors({ ...errors, [field]: false });
                }

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
        className={errors[field] ? "border-red-500" : ""}
        value={form[field] || ""}
        placeholder={`Search ${label}`}
        onChange={(e) => {
          const value = e.target.value;

          setForm({
            ...form,
            [field]: value,
          });

          if (errors[field]) {
            setErrors({ ...errors, [field]: false });
          }

          searchClients(value);
        }}
      />

      {errors[field] && (
        <p className="text-red-500 text-xs mt-1 font-bold">
          * This is Mandatory
        </p>
      )}

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

                if (errors[field]) {
                  setErrors({ ...errors, [field]: false });
                }

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
    <div className="space-y-4 px-0 md:px-4 lg:px-8">
      <div className="text-center rounded-md bg-gradient-to-r from-cyan-300 to-cyan-900 py-2 text-white shadow-sm">
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
                <Label className="font-bold">Type</Label>

                <select
                  className={`w-full border rounded-md p-2 ${errors.type ? "border-red-500" : ""}`}
                  value={form.type || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      type: e.target.value,
                    });
                    if (errors.type) {
                      setErrors({ ...errors, type: false });
                    }
                  }}
                >
                  <option value="">Select</option>

                  {paymentTypeList.map((v: any) => (
                    <option key={v._id} value={v.listItem}>
                      {v.listItem}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    * This is Mandatory
                  </p>
                )}
              </div>

              <div>{renderClientSearch("paymentFrom", "Payment From")}</div>

              <div className="md:col-span-2">
                <Label className="font-bold">Description</Label>

                <Textarea
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                  value={form.description || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      description: e.target.value,
                    });
                    if (errors.description) {
                      setErrors({ ...errors, description: false });
                    }
                  }}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    * This is Mandatory
                  </p>
                )}
              </div>

              <div>
                <Label className="font-bold">Receivable Amount</Label>

                <div
                  className={
                    errors.receivableAmount
                      ? "border border-red-500 rounded-xl"
                      : ""
                  }
                >
                  <AmountToWords
                    amount={String(form.receivableAmount || "")}
                    onChange={(val) => {
                      setForm((prev: any) => ({
                        ...prev,
                        receivableAmount: val,
                      }));
                      if (errors.receivableAmount) {
                        setErrors({ ...errors, receivableAmount: false });
                      }
                    }}
                  />
                </div>
                {errors.receivableAmount && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    * This is Mandatory
                  </p>
                )}
              </div>

              <div>
                <Label className="font-bold">State</Label>

                <select
                  className={`w-full border rounded-md p-2 ${errors.state ? "border-red-500" : ""}`}
                  value={form.state || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      state: e.target.value,
                    });
                    if (errors.state) {
                      setErrors({ ...errors, state: false });
                    }
                  }}
                >
                  <option value="">Select</option>

                  {stateList.map((v: any) => (
                    <option key={v._id} value={v.listItem}>
                      {v.listItem}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    * This is Mandatory
                  </p>
                )}
              </div>

              <div>{renderUserSearch("owner", "Owner")}</div>

              <div>
                <Label className="font-bold">Due Date</Label>

                <Input
                  type="date"
                  className={errors.dueDate ? "border-red-500" : ""}
                  value={form.dueDate || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      dueDate: e.target.value,
                    });
                    if (errors.dueDate) {
                      setErrors({ ...errors, dueDate: false });
                    }
                  }}
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    * This is Mandatory
                  </p>
                )}
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
                <Label className="font-bold">Vertical</Label>

                <select
                  className={`w-full border rounded-md p-2 ${errors.vertical ? "border-red-500" : ""}`}
                  value={form.vertical || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      vertical: e.target.value,
                    });
                    if (errors.vertical) {
                      setErrors({ ...errors, vertical: false });
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
                {errors.vertical && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    * This is Mandatory
                  </p>
                )}
              </div>

              <div>
                <Label className="font-bold">Sub Vertical</Label>

                <select
                  className={`w-full border rounded-md p-2 ${errors.subVertical ? "border-red-500" : ""}`}
                  value={form.subVertical || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      subVertical: e.target.value,
                    });
                    if (errors.subVertical) {
                      setErrors({ ...errors, subVertical: false });
                    }
                  }}
                >
                  <option value="">Select</option>

                  {subVerticals.map((v: any) => (
                    <option key={v._id} value={v.listItem}>
                      {v.listItem}
                    </option>
                  ))}
                </select>
                {errors.subVertical && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    * This is Mandatory
                  </p>
                )}
              </div>

              <div>
                <Label className="font-bold">Status</Label>

                <select
                  className={`w-full border rounded-md p-2 ${errors.status ? "border-red-500" : ""}`}
                  value={form.status || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      status: e.target.value,
                    });
                    if (errors.status) {
                      setErrors({ ...errors, status: false });
                    }
                  }}
                >
                  <option value="">Select</option>

                  {statusList.map((v: any) => (
                    <option key={v._id} value={v.listItem}>
                      {v.listItem}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    * This is Mandatory
                  </p>
                )}
              </div>

              <div>
                <Label className="font-bold">Invoice No</Label>

                <Input
                  value={form.invoiceNo || ""}
                  className={`h-11 rounded-xl border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 ${errors.invoiceNo ? "border-red-500" : ""}`}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      invoiceNo: e.target.value,
                    });
                    if (errors.invoiceNo) {
                      setErrors({ ...errors, invoiceNo: false });
                    }
                  }}
                />
                {errors.invoiceNo && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    * This is Mandatory
                  </p>
                )}
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
                <Label className="font-bold">Tender No</Label>

                <Input
                  value={form.tenderNo || ""}
                  className="bg-muted"
                  readOnly
                />
              </div>

              <div>
                <Label className="font-bold">Tender Description</Label>

                <Input
                  readOnly
                  className="bg-slate-100 border-slate-200 rounded-xl"
                  value={form.tenderDesc || ""}
                />
              </div>

              {/* Work Order */}
              <div className="relative">
                <Label className="font-bold">Work Order No</Label>

                <Input
                  className={errors.woNo ? "border-red-500" : ""}
                  value={form.woNo || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    setForm({
                      ...form,
                      woNo: value,
                    });

                    if (errors.woNo) {
                      setErrors({ ...errors, woNo: false });
                    }

                    searchWorkOrders(value);
                  }}
                />
                {errors.woNo && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    * This is Mandatory
                  </p>
                )}

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

                          if (errors.woNo) {
                            setErrors({ ...errors, woNo: false });
                          }

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
                <Label className="font-bold">Work Order Title</Label>

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
          <Button
            className="bg-cyan-900 hover:bg-cyan-600 hover:text-black"
            onClick={handleSubmit}
          >
            Create Receivable
          </Button>
          <Button className="bg-orange-700 hover:bg-orange-500 hover:text-black" 
          onClick={() => router.push("/receivables")}>
            Cancel
          </Button>

          
        </div>
      </div>
    </div>
  );
}

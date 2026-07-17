"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import PageHeader from "@/app/_components/PageHeader";
import Notes from "@/app/_components/Notes";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import TenderSearchCB from "@/app/_components/searches/TenderSearchCB";
import { Textarea } from "@/components/ui/textarea";
import ClientSearch from "@/app/_components/searches/ClientSearch";
import AmountToWords from "@/app/_components/AmountToWords";

export default function EditWorkOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [workOrder, setWorkOrder] = useState<any>({});

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const [woTypes, setWoTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [bgRefundStatuses, setBGRefundStatuses] = useState([]);

  const [verticals, setVerticals] = useState([]);
  const [subVerticals, setSubVerticals] = useState([]);
  const [saving, setSaving] = useState(false);

  const normalizeList = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    if (Array.isArray(data.data)) {
      if (Array.isArray(data.data[0])) return data.data[0];
      return data.data;
    }

    return [];
  };

  const loadSystemList = async (name: string) => {
    try {
      const res = await fetch(
        `/api/system-list?listName=${encodeURIComponent(
          name,
        )}&orgId=${session?.user?.orgId}`,
      );
      const retListData = await res.json();
      //console.log("Response List Data: ", retListData);

      return normalizeList(retListData);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    if (workOrder.country) {
      fetchStates(workOrder.country);
    }
  }, [workOrder.country]);

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

  useEffect(() => {
    if (!session?.user?.orgId) return;

    const fetchWorkOrder = async () => {
      try {
        const res = await fetch(`/api/work-order/${params.id}`);
        const data = await res.json();
        setWorkOrder(data);
        console.log("Fetched Work Order", data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWorkOrder();

    const loadData = async () => {
      setWoTypes(await loadSystemList("WO TYPE"));
      setStatuses(await loadSystemList("WO Status"));
      setVerticals(await loadSystemList("VERTICAL"));
      setBGRefundStatuses(await loadSystemList("BG Status"));
    };
    fetchCountries();
    loadData();
  }, [session, params.id]);

  useEffect(() => {
    if (!workOrder.vertical) return;

    const loadSubVerticals = async () => {
      const data = await fetch(
        `/api/system-list?listName=${workOrder.vertical}&orgId=${session?.user?.orgId}`,
      );

      const result = await data.json();

      setSubVerticals(normalizeList(result));
    };

    loadSubVerticals();
  }, [workOrder.vertical]);

  const handleChange = (e: any) => {
    setWorkOrder({
      ...workOrder,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
    <div className="space-y-4 px-0 md:px-4 lg:px-8">
      <PageHeader title="Edit Work Order" />

      <div className="grid gap-6 lg:grid-cols-10">
        {/* 70% */}
        <div className="lg:col-span-7">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Work Order Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Work Order Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Order Information</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>WO No</Label>
                    <Input
                      name="woNo"
                      value={workOrder.woNo ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WO Title</Label>
                    <Input
                      name="woTitle"
                      value={workOrder.woTitle ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WO Date</Label>
                    <Input
                      type="date"
                      name="woDate"
                      value={workOrder.woDate?.substring(0, 10) || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label>WO Type</Label>
                    <select
                      className="border rounded-lg p-2 w-full"
                      name="woType"
                      value={workOrder.woType ?? ""}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {woTypes.map((type: any) => (
                        <option key={type._id} value={type.listItem}>
                          {type.listItem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      className="border rounded-lg p-2 w-full"
                      name="status"
                      value={workOrder.status ?? ""}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {statuses.map((status: any) => (
                        <option key={status._id} value={status.listItem}>
                          {status.listItem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Client</Label>
                    <ClientSearch
                      orgId={session?.user?.orgId ?? ""}
                      value={workOrder.client}
                      onSelect={(client) =>
                        setWorkOrder({
                          ...workOrder,

                          clientId: client._id,
                          client: client.client,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tender Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Tender Information</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-4">
                  {/* Tender Fields */}
                  <div className="relative">
                    <Label>Tender No</Label>

                    <TenderSearchCB
                      orgId={session?.user?.orgId ?? ""}
                      value={workOrder.tenderNo ?? ""}
                      onSelect={(tender) =>
                        setWorkOrder({
                          ...workOrder,

                          tenderNo: tender.tenderNo,
                          tenderDesc: tender.description,

                          woValue: tender.tenderValue ?? 0,
                          country: tender.country || "",
                          state: tender.state || "",
                          vertical: tender.vertical || "",
                          subVertical: tender.subVertical || "",
                          bgAmount: tender.bgAmount ?? 0,

                          client: tender.client || "",
                          clientId: tender.clientId || "",
                        })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Tender Description</Label>
                    <Textarea
                      name="tenderDesc"
                      value={workOrder.tenderDesc ?? ""}
                      readOnly
                    />
                  </div>
                  <div>
                    <label>Vertical</label>

                    <select
                      className="border rounded-lg p-2 w-full"
                      value={workOrder.vertical ?? ""}
                      onChange={(e) =>
                        setWorkOrder({
                          ...workOrder,
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
                    <label>Sub Vertical</label>

                    <select
                      className="border rounded-lg p-2 w-full"
                      value={workOrder.subVertical ?? ""}
                      onChange={(e) =>
                        setWorkOrder({
                          ...workOrder,
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
                </CardContent>
              </Card>

              {/* Project Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Completion Date</Label>
                    <Input
                      type="date"
                      value={workOrder.projectCompletionDate || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Actual Start Date</Label>
                    <Input
                      type="date"
                      value={workOrder.actualStartDate || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Actual End Date</Label>
                    <Input
                      type="date"
                      value={workOrder.actualEndDate || ""}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financial Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Information</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>WO Value</Label>
                    <AmountToWords
                      amount={String(workOrder.woValue)}
                      onChange={(val) =>
                        setWorkOrder({
                          ...workOrder,
                          bgAmount: val,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>BG Amount</Label>
                    <AmountToWords
                      amount={String(workOrder.bgAmount)}
                      onChange={(val) =>
                        setWorkOrder({
                          ...workOrder,
                          bgAmount: val,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>BG Maturity Date</Label>
                    <Input
                      type="date"
                      value={workOrder.bgMaturityDate || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label>Refund Status</Label>
                    <select
                      className="border rounded-lg p-2 w-full"
                      value={workOrder.bgReceivedStatus ?? ""}
                      onChange={(e) =>
                        setWorkOrder({
                          ...workOrder,
                          bgReceivedStatus: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>

                      {bgRefundStatuses.map((bgRef: any) => (
                        <option key={bgRef._id} value={bgRef.listItem}>
                          {bgRef.listItem}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Location Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Information</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <select
                      className="border rounded-lg p-2 w-full"
                      value={workOrder.country}
                      onChange={(e) =>
                        setWorkOrder({
                          ...workOrder,
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
                    <label>State *</label>

                    <select
                      className="border rounded-lg p-2 w-full"
                      value={workOrder.state}
                      onChange={(e) =>
                        setWorkOrder({
                          ...workOrder,
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
              <Card>
                <CardContent className="flex justify-end gap-3 p-6">
                  <Button variant="outline" onClick={() => router.back()} className="bg-orange-700 hover:bg-orange-500 text-white">
                    Cancel
                  </Button>

                  <Button onClick={handleChange} disabled={saving} className="bg-cyan-900 hover:bg-cyan-700">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* 30% */}
        <div className="lg:col-span-3">
          <div className="sticky top-6">
            <Notes entityType="WORK ORDER" entityId={params.id} />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

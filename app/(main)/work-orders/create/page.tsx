"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import PageHeader from "@/app/_components/PageHeader";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import TenderSearchCB from "@/app/_components/searches/TenderSearchCB";
import { Textarea } from "@/components/ui/textarea";
import AmountToWords from "@/app/_components/AmountToWords";
import ClientSearch from "@/app/_components/searches/ClientSearch";

export default function CreateWorkOrderPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  const [loading, setLoading] = useState(false);
  const [subVerticals, setSubVerticals] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [woTypes, setWoTypes] = useState<any[]>([]);

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    woNo: "",
    woTitle: "",

    tenderNo: "",
    tenderDesc: "",

    woDate: "",
    woType: "",
    vertical: "",
    subVertical: "",
    country: "",
    state: "",

    projectCompletionDate: "",
    actualStartDate: "",
    actualEndDate: "",

    status: "",

    client: "",
    clientId: "",

    bgAmount: 0,
    bgMaturityDate: "",
    bgReceivedStatus: "",
    woValue: 0,
    orgId: session?.user?.orgId || "",
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

  // ---------------- FETCH LISTS ----------------
  const fetchList = async (name: string, orgId: string) => {
    const res = await fetch(
      `/api/system-list?listName=${encodeURIComponent(name)}&orgId=${orgId}`,
    );

    const data = await res.json();

    return normalizeList(data);
  };

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

  useEffect(() => {
    if (!orgId) return;

    const loadVerticals = async () => {
      const verticalsList = await Promise.all([fetchList("VERTICAL", orgId)]);
      setVerticals(verticalsList[0] || []);
    };

    const loadWoTypes = async () => {
      const woTypesList = await Promise.all([fetchList("WO TYPE", orgId)]);
      setWoTypes(woTypesList[0] || []);
    };

    fetchCountries();
    loadVerticals();
    loadWoTypes();
  }, [orgId]);

  // ---------------- SUB VERTICAL ----------------
  useEffect(() => {
    if (!formData.vertical) return setSubVerticals([]);

    fetchList(formData.vertical, formData.orgId).then(setSubVerticals);
  }, [formData.vertical]);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveWorkOrder = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/work-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...formData,
          orgId: session?.user?.orgId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      router.push("/work-orders");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-0 md:px-4 lg:px-8">
      <PageHeader title="Create Work Order" />

      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WO No */}
          <div>
            <Label className="font-bold">Work Order No</Label>
            <Input name="woNo" value={formData.woNo} onChange={handleChange} />
          </div>

          {/* WO Title */}
          <div>
            <Label className="font-bold">Work Order Title</Label>
            <Input
              name="woTitle"
              value={formData.woTitle}
              onChange={handleChange}
            />
          </div>

          {/* WO Date */}
          <div>
            <Label className="font-bold">WO Date</Label>
            <Input
              type="date"
              name="woDate"
              value={formData.woDate}
              onChange={handleChange}
            />
          </div>

          {/* WO Type */}
          <div>
            <Label className="font-bold">WO Type</Label>
            <select
              className="border rounded-lg p-2 w-full"
              name="woType"
              value={formData.woType}
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

          {/* Tender Search */}
          <div className="relative">
            <Label className="font-bold">Tender No</Label>

            <TenderSearchCB
              orgId={session?.user?.orgId ?? ""}
              value={formData.tenderNo}
              onSelect={(tender) =>
                setFormData({
                  ...formData,

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

          {/* WO Value */}
          <div>
            <Label className="font-bold">WO Value</Label>
            <AmountToWords
              amount={String(formData.woValue)}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  woValue: Number(val),
                })
              }
            />
          </div>

          {/* Tender Name */}
          <div className="col-span-2">
            <Label className="font-bold">Tender Description</Label>
            <Textarea name="tenderDesc" value={formData.tenderDesc} readOnly />
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
          {/* Project Completion Date */}
          <div>
            <Label className="font-bold">Project Completion Date</Label>
            <Input
              type="date"
              name="projectCompletionDate"
              value={formData.projectCompletionDate}
              onChange={handleChange}
            />
          </div>

          {/* Client */}
          <div>
            <Label className="font-bold">Client</Label>
            <ClientSearch
              orgId={session?.user?.orgId ?? ""}
              value={formData.client}
              onSelect={(client) =>
                setFormData({
                  ...formData,

                  clientId: client._id,
                  client: client.client,
                })
              }
            />
          </div>

          {/* BG Amount */}
          <div>
            <Label className="font-bold">BG Amount</Label>
            <AmountToWords
              amount={String(formData.bgAmount)}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  bgAmount: Number(val),
                })
              }
            />
          </div>

          {/* BG Maturity Date */}
          <div>
            <Label className="font-bold">BG Maturity Date</Label>
            <Input
              type="date"
              name="bgMaturityDate"
              value={formData.bgMaturityDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button
            onClick={saveWorkOrder}
            disabled={loading}
            className="bg-cyan-900 hover:bg-cyan-600 hover:text-black"
          >
            {loading ? "Saving..." : "Create Work Order"}
          </Button>
          <Button className="bg-orange-700 hover:bg-orange-500 hover:text-black" 
          onClick={() => router.push("/work-orders")}>
            Cancel
          </Button>
          
        </div>
      </div>
    </div>
  );
}

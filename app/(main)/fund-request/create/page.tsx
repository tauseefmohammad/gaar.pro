"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PageHeader from "@/app/_components/PageHeader";
import AmountToWords from "@/app/_components/AmountToWords";
import { useSession } from "next-auth/react";

export default function CreateFR() {
  const router = useRouter();
  const { data: session } = useSession();

  const orgId = session?.user?.orgId;
  const employeeName = session?.user?.employeeName;
  const phone = session?.user?.username;

  const [form, setForm] = useState<any>({
    description: "",
    amount: "",
    state: "",
    frType: "",
    paymentType: "",
    vertical: "",
    subVertical: "",
    paymentTo: "",
    paymentToId: "",
    paymentToType: "",
    paymentPriority: "",
    dueDate: "",
    tenderNo: "",
    tenderDescription: "",
    woNo: "",
    woTitle: "",
    requestedBy: "",
    requestedById: null,
    orgId: "",
  });

  const [lists, setLists] = useState<any>({
    vertical: [],
    priority: [],
    state: [],
    paymentType: [],
    frType: [],
  });

  const [subVerticals, setSubVerticals] = useState<any[]>([]);

  // WORK ORDER SEARCH
  const [woResults, setWoResults] = useState<any[]>([]);
  const [woSearchType, setWoSearchType] = useState<"woNo" | "woTitle" | null>(
    null,
  );

  // TENDER SEARCH
  const [tenderResults, setTenderResults] = useState<any[]>([]);

  // PAYMENT TO SEARCH
  const [paymentToResults, setPaymentToResults] = useState<any[]>([]);

  const woNoRef = useRef<HTMLDivElement>(null);
  const woTitleRef = useRef<HTMLDivElement>(null);
  const paymentToRef = useRef<HTMLDivElement>(null);
  const tenderRef = useRef<HTMLDivElement>(null);

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

    const init = async () => {
      let employee: any = null;

      if (phone) {
        const res = await fetch(
          `/api/employee/by-phone?phone=${phone}&orgId=${orgId}`,
        );

        if (res.ok) employee = await res.json();
      }

      const [v, p, s, pt, ft] = await Promise.all([
        fetchList("VERTICAL", orgId),
        fetchList("Priority", orgId),
        fetchList("State", orgId),
        fetchList("Payment Type", orgId),
        fetchList("FR Type", orgId),
      ]);

      setLists({
        vertical: v,
        priority: p,
        state: s,
        paymentType: pt,
        frType: ft,
      });

      setForm((f: any) => ({
        ...f,
        orgId,
        requestedBy: employee?.data?.name || employeeName,
        requestedById: employee?.data?._id || null,
      }));
    };

    init();
  }, [orgId]);

  // ---------------- SUB VERTICAL ----------------
  useEffect(() => {
    if (!form.vertical) return setSubVerticals([]);

    fetchList(form.vertical, form.orgId).then(setSubVerticals);
  }, [form.vertical]);

  // ---------------- WORK ORDER SEARCH ----------------
  const searchWO = async (q: string, field: "woNo" | "woTitle") => {
    if (!q) {
      setWoResults([]);
      return;
    }

    setWoSearchType(field);

    const res = await fetch(
      `/api/work-order/search?q=${encodeURIComponent(q)}&orgId=${form.orgId}`,
    );

    const data = await res.json();

    setWoResults(data.data || []);
  };

  const selectWO = (wo: any) => {
    setForm((prev: any) => ({
      ...prev,
      woNo: wo.woNo || "",
      woTitle: wo.woTitle || "",
      tenderNo: wo.tenderNo || prev.tenderNo || "",
      tenderName: wo.tenderName || prev.tenderName || "",
    }));

    setWoResults([]);
  };

  // ---------------- PAYMENT TO SEARCH ----------------
  const searchPaymentTo = async (q: string) => {
    if (!q) {
      setPaymentToResults([]);
      return;
    }

    const res = await fetch(
      `/api/payment-to/search?q=${encodeURIComponent(q)}&orgId=${form.orgId}`,
    );

    const data = await res.json();

    setPaymentToResults(data.data || []);
  };

  const selectPaymentTo = (item: any) => {
    setForm((prev: any) => ({
      ...prev,
      paymentTo: item.name,
      paymentToId: item._id,
      paymentToType: item.type,
    }));

    setPaymentToResults([]);
  };

  // ---------------- TENDER SEARCH ----------------
  const searchTender = async (q: string) => {
    if (!q) {
      setTenderResults([]);
      return;
    }
    const res = await fetch(
      `/api/tender/search?q=${encodeURIComponent(q)}&orgId=${form.orgId}`,
    );
    const data = await res.json();
    setTenderResults(data.data || []);
  };

  const selectTender = (tender: any) => {
    const amountFieldMap: Record<string, string> = {
      EMD: "emdAmount",
      BG: "bgAmount",
      "Document Fee": "documentFee",
      "Transaction Fee": "transactionFee",
      "Corpus Fund": "corpusFund",
    };

    // 🔹 Due date mapping
    const dueDateFieldMap: Record<string, string> = {
      EMD: "emdPaymentDate",
      BG: "bgPaymentDate",
      "Document Fee": "documentFeePaymentDate",
      "Transaction Fee": "transactionFeePaymentDate",
      "Corpus Fund": "corpusFundPaymentDate",
    };

    const amountField = amountFieldMap[form.paymentType];
    const dueDateField = dueDateFieldMap[form.paymentType];

    const autoAmount = amountField ? String(tender?.[amountField] || "") : "";

    const autoDueDate = dueDateField ? tender?.[dueDateField] || "" : "";

    setForm((prev: any) => ({
      ...prev,
      tenderNo: tender.tenderNo || "",
      tenderDescription: tender.description || "",
      amount: autoAmount || prev.amount || "",
      dueDate: autoDueDate || prev.dueDate || "",
    }));

    setTenderResults([]);
  };
  // ---------------- CLOSE DROPDOWNS ----------------
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        woNoRef.current &&
        !woNoRef.current.contains(event.target) &&
        woTitleRef.current &&
        !woTitleRef.current.contains(event.target)
      ) {
        setWoResults([]);
      }

      if (
        paymentToRef.current &&
        !paymentToRef.current.contains(event.target)
      ) {
        setPaymentToResults([]);
      }

      if (tenderRef.current && !tenderRef.current.contains(event.target)) {
        setTenderResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (
      (form.paymentType === "EMD" || form.paymentType === "BG") &&
      (!form.tenderNo || !form.tenderDescription)
    ) {
      alert("Tender No and Tender Description are mandatory");
      return;
    }
    await fetch("/api/fund-request", {
      method: "POST",
      body: JSON.stringify(form),
    });

    router.push("/fund-request");
  };

  // ---------------- UI ----------------
  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Create Fund Request" />

      <div className="grid grid-cols-2 gap-4 p-4">
        {/* DESCRIPTION */}
        <div className="col-span-2">
          <label className="font-bold">Description</label>

          <Textarea
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

        {/* FR TYPE */}
        <div>
          <label className="font-bold">FR Type</label>

          <select
            className="border rounded-lg p-2 w-full"
            value={form.frType}
            onChange={(e) =>
              setForm({
                ...form,
                frType: e.target.value,
              })
            }
          >
            <option value="">Select</option>

            {lists.frType.map((f: any) => (
              <option key={f._id} value={f.listItem}>
                {f.listItem}
              </option>
            ))}
          </select>
        </div>

        {/* PAYMENT TYPE */}
        <div>
          <label className="font-bold">Payment Type</label>

          <select
            className="border rounded-lg p-2 w-full"
            value={form.paymentType}
            onChange={(e) =>
              setForm({
                ...form,
                paymentType: e.target.value,
              })
            }
          >
            <option value="">Select</option>

            {lists.paymentType.map((p: any) => (
              <option key={p._id} value={p.listItem}>
                {p.listItem}
              </option>
            ))}
          </select>
        </div>

        {/* TENDER DETAILS */}
        {(form.paymentType === "EMD" ||
          form.paymentType === "BG" ||
          form.paymentType === "Document Fee" ||
          form.paymentType === "Transaction Fee" ||
          form.paymentType === "Corpus Fund") && (
          <>
            {/* TENDER NO SEARCH */}
            <div className="relative" ref={tenderRef}>
              <label className="font-bold">
                Tender No <span className="text-red-500">*</span>
              </label>

              <Input
                required
                value={form.tenderNo}
                onChange={(e) => {
                  setForm({
                    ...form,
                    tenderNo: e.target.value,
                    tenderName: "",
                  });

                  searchTender(e.target.value);
                }}
              />

              {tenderResults.length > 0 && (
                <div className="absolute z-20 w-full bg-white border rounded-md shadow-md max-h-56 overflow-auto">
                  {tenderResults.map((t: any) => (
                    <div
                      key={t._id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => selectTender(t)}
                    >
                      <div className="font-medium">{t.tenderNo}</div>

                      <div className="text-gray-500">{t.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TENDER TITLE */}
            <div>
              <label className="font-bold">
                Tender Description <span className="text-red-500">*</span>
              </label>

              <Input required readOnly value={form.tenderDescription} />
            </div>
          </>
        )}

        {/* WORK ORDER */}
        {form.frType === "Project" && (
          <>
            {/* WORK ORDER NO */}
            <div className="relative" ref={woNoRef}>
              <label className="font-bold">Work Order No</label>

              <Input
                value={form.woNo}
                onChange={(e) => {
                  setForm({
                    ...form,
                    woNo: e.target.value,
                  });

                  searchWO(e.target.value, "woNo");
                }}
              />

              {woSearchType === "woNo" && woResults.length > 0 && (
                <div className="absolute z-20 w-full bg-white border rounded-md shadow-md max-h-56 overflow-auto">
                  {woResults.map((w: any) => (
                    <div
                      key={w._id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => selectWO(w)}
                    >
                      <div className="font-medium">{w.woNo}</div>

                      <div className="text-gray-500">{w.woTitle}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WORK ORDER TITLE */}
            <div className="relative" ref={woTitleRef}>
              <label className="font-bold">Work Order Title</label>

              <Input
                value={form.woTitle}
                onChange={(e) => {
                  setForm({
                    ...form,
                    woTitle: e.target.value,
                  });

                  searchWO(e.target.value, "woTitle");
                }}
              />

              {woSearchType === "woTitle" && woResults.length > 0 && (
                <div className="absolute z-20 w-full bg-white border rounded-md shadow-md max-h-56 overflow-auto">
                  {woResults.map((w: any) => (
                    <div
                      key={w._id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => selectWO(w)}
                    >
                      <div className="font-medium">{w.woTitle}</div>

                      <div className="text-gray-500">{w.woNo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        {/* AMOUNT */}
        <div>
          <label className="font-bold">Request Amount</label>

          <AmountToWords
            amount={form.amount}
            onChange={(val) =>
              setForm({
                ...form,
                amount: val,
              })
            }
          />
        </div>

        {/* STATE */}
        <div>
          <label className="font-bold">State</label>

          <select
            className="border rounded-lg p-2 w-full"
            value={form.state}
            onChange={(e) =>
              setForm({
                ...form,
                state: e.target.value,
              })
            }
          >
            <option value="">Select</option>

            {lists.state.map((s: any) => (
              <option key={s._id} value={s.listItem}>
                {s.listItem}
              </option>
            ))}
          </select>
        </div>
        {/* VERTICAL */}
        <div>
          <label className="font-bold">Vertical</label>

          <select
            className="border rounded-lg p-2 w-full"
            value={form.vertical}
            onChange={(e) =>
              setForm({
                ...form,
                vertical: e.target.value,
                subVertical: "",
              })
            }
          >
            <option value="">Select</option>

            {lists.vertical.map((v: any) => (
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
            value={form.subVertical}
            onChange={(e) =>
              setForm({
                ...form,
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

        {/* PAYMENT TO */}
        <div className="relative" ref={paymentToRef}>
          <label className="font-bold">Payment To</label>

          <Input
            value={form.paymentTo}
            onChange={(e) => {
              setForm({
                ...form,
                paymentTo: e.target.value,
              });

              searchPaymentTo(e.target.value);
            }}
          />

          {paymentToResults.length > 0 && (
            <div className="absolute z-20 w-full bg-white border rounded-md shadow-md max-h-56 overflow-auto">
              {paymentToResults.map((item: any) => (
                <div
                  key={item._id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => selectPaymentTo(item)}
                >
                  <div className="font-medium">{item.name}</div>

                  <div className="text-xs text-gray-500">{item.type}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PRIORITY */}
        <div>
          <label className="font-bold">Priority</label>

          <select
            className="border rounded-lg p-2 w-full"
            value={form.paymentPriority}
            onChange={(e) =>
              setForm({
                ...form,
                paymentPriority: e.target.value,
              })
            }
          >
            <option value="">Select</option>

            {lists.priority.map((p: any) => (
              <option key={p._id} value={p.listItem}>
                {p.listItem}
              </option>
            ))}
          </select>
        </div>

        {/* DUE DATE */}
        <div>
          <label className="font-bold">Due Date</label>

          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm({
                ...form,
                dueDate: e.target.value,
              })
            }
          />
        </div>

        {/* SUBMIT */}
        <div className="col-span-2 flex justify-end gap-4">
          <Button
            onClick={handleSubmit}
            className="bg-cyan-900 hover:bg-cyan-600 hover:text-black"
          >
            Request
          </Button>
          <Button className="bg-orange-700 hover:bg-orange-500 hover:text-black" 
            onClick={() => router.push("/fund-request")}>
            Cancel
          </Button>

          
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AmountToWords from "../AmountToWords";
import Notes from "@/app/_components/Notes";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import {
  Plus,
  Save,
  IndianRupee,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function PaymentForm({ id }: { id?: string }) {
  const router = useRouter();

  const { data: session } = useSession();
  const orgId = session?.user?.orgId || "INTR";

  const [form, setForm] = useState<any>({});
  const [verticals, setVerticals] = useState<any[]>([]);
  const [subVerticals, setSubVerticals] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [priorityList, setPriorityList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [paymentTypeList, setPaymentTypeList] = useState<any[]>([]);
  const [txnTypeList, setTxnTypeList] = useState<any[]>([]);

  const [userResults, setUserResults] = useState<any[]>([]);
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [payToResults, setPayToResults] = useState<any[]>([]);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [txnForm, setTxnForm] = useState<any>({
    amount: "",
    txnDate: "",
    txnType: "",
    paidTo: "",
    entityType: "PAYMENT",
    entityId: id,
    transactionNote: "",
    orgId: "",
  });
  const isAuthorized = form?.isAuthorized;
  const isPaid = form?.status === "Paid";
  const isBalanceZero = Number(form?.balanceAmount) <= 0;

  // Lock entire payment editing if status is Paid
  const isPaymentLocked = isPaid;

  // Lock FR related fields once authorized
  const isFRLocked = isAuthorized;

  const fetchList = async (listName: string) => {
    const res = await fetch(
      `/api/system-list?listName=${listName}&orgId=${orgId}`,
    );

    const data = await res.json();
    return data?.data?.[0] || [];
  };

  const searchUsers = async (query: string) => {
    if (!query) return setUserResults([]);

    const res = await fetch(`/api/user/search?q=${query}&orgId=${orgId}`);
    const data = await res.json();

    setUserResults(data || []);
  };
  /** Search for Client or Employee to make a payment */
  const searchPayTo = async (query: string) => {
    if (!query) return setPayToResults([]);

    const res = await fetch(`/api/payment-to/search?q=${query}&orgId=${orgId}`);
    const data = await res.json();

    setPayToResults(data.data || []);
  };

  const fetchTransactions = async () => {
    if (!id) return;

    const res = await fetch(
      `/api/transaction?entityType=PAYMENT&entityId=${id}`,
    );

    const data = await res.json();

    setTransactions(data?.data || []);
  };

  useEffect(() => {
    if (!session?.user?.orgId) return;

    fetchList("VERTICAL").then(setVerticals);
    fetchList("Payment Status").then(setStatusList);
    fetchList("Priority").then(setPriorityList);
    fetchList("State").then(setStateList);
    fetchList("Payment Type").then(setPaymentTypeList);
    fetchList("Transaction Type").then(setTxnTypeList);
  }, [session]);

  useEffect(() => {
    if (!form?.vertical) return;

    fetchList(form.vertical).then(setSubVerticals);
  }, [form?.vertical]);

  const fetchPayment = async () => {
    if (!id) return;

    try {
      const res = await fetch(`/api/payment/${id}`);
      const data = await res.json();

      setForm(data?.data || data || {});
    } catch (err) {
      console.error("Failed to load payment", err);
    }
  };

  useEffect(() => {
    if (!id) return;

    fetchPayment();
    fetchTransactions();
  }, [id]);

  const handleSubmit = async () => {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/payment/${id}` : `/api/payment`;

    await fetch(url, {
      method,
      body: JSON.stringify({
        ...form,
        orgId,
      }),
    });

    router.push("/payments");
  };
  const closeTxnForm = () => {
    setShowTxnForm(false);
  };

  const handleRecordTransaction = async () => {
    await fetch("/api/transaction", {
      method: "POST",
      body: JSON.stringify({
        ...txnForm,
        orgId,
        entityType: "PAYMENT",
        entityId: id,
      }),
    });

    setTxnForm({
      amount: "",
      txnDate: "",
      txnType: "",
      paidTo: "",
      entityType: "PAYMENT",
      entityId: id,
      txnNote: "",
    });

    setShowTxnForm(false);
    fetchPayment();
    fetchTransactions();
  };

  const renderUserSearch = (field: string, label: string, readOnly = false) => (
    <div className="relative">
      <Label>{label}</Label>

      <Input
        readOnly={readOnly}
        className={readOnly ? "bg-gray-100 mt-2" : "mt-2"}
        value={form[field] || ""}
        onChange={(e) => {
          const value = e.target.value;

          setForm({
            ...form,
            [field]: value,
          });

          searchUsers(value);
        }}
      />

      {!readOnly && userResults.length > 0 && (
        <div className="absolute z-50 bg-white border rounded-md shadow-md max-h-48 overflow-y-auto w-full">
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

  const renderPayToSearch = () => (
    <div className="relative">
      <Label>Paid To</Label>

      <Input
        value={txnForm.paidTo || ""}
        onChange={(e) => {
          const value = e.target.value;

          setTxnForm({
            ...txnForm,
            paidTo: value,
          });

          searchPayTo(value);
        }}
      />

      {payToResults.length > 0 && (
        <div className="absolute z-50 bg-white border rounded-md shadow-md max-h-48 overflow-y-auto w-full">
          {payToResults.map((payTo: any) => (
            <div
              key={payTo._id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setTxnForm({
                  ...txnForm,
                  paidTo: payTo.name,
                });

                setPayToResults([]);
              }}
            >
              {payTo.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const balanceAmount = useMemo(() => {
    const requestAmount = Number(form.requestAmount || 0);

    const totalPaid = transactions.reduce(
      (sum: number, item: any) => sum + Number(item.amount || 0),
      0,
    );

    return requestAmount - totalPaid;
  }, [transactions, form.requestAmount]);

  const totalPaidAmount = useMemo(() => {
    return transactions.reduce(
      (sum: number, item: any) => sum + Number(item.amount || 0),
      0,
    );
  }, [transactions]);

  const ReadOnlyField = ({ label, value }: { label: string; value?: any }) => (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-500">{label}</div>

      <div className="min-h-[40px] rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-800 flex items-center">
        {value || "-"}
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-900 text-white text-center py-3 rounded-xl text-lg font-semibold shadow">
        {id ? "Edit Payment" : "Create Payment"}
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-[7fr_3fr] gap-8 mt-6">
        {/* LEFT SIDE */}
        <div className="grid grid-cols-[30%_70%] gap-6">
          {/* GENERIC SECTION */}
          <div className="border rounded-2xl p-5 shadow-sm space-y-5 h-fit">
            <h2 className="font-semibold text-gray-700 text-lg">
              Generic Info
            </h2>

            <div>
              <Label>FR Type</Label>

              <Input
                readOnly={isFRLocked || isPaymentLocked}
                className={isFRLocked || isPaymentLocked ? "bg-gray-100" : ""}
                value={form.frType || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    frType: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Payment Type</Label>

              <select
                disabled={isFRLocked || isPaymentLocked}
                className={`w-full border rounded-md p-2 mt-2 ${
                  isFRLocked || isPaymentLocked
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                value={form.paymentType || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentType: e.target.value,
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

            <div>
              <Label>Payment To</Label>

              {renderUserSearch("paymentTo", "")}
            </div>

            <div>
              <Label>State</Label>

              <select
                className="w-full border rounded-md p-2 mt-2"
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

            <div>
              <Label>Vertical</Label>

              <select
                className="w-full border rounded-md p-2 mt-2"
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
                className="w-full border rounded-md p-2 mt-2"
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
                disabled={isFRLocked || isPaymentLocked}
                className={`w-full border rounded-md p-2 mt-2 ${
                  isFRLocked || isPaymentLocked
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
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
              <Label>Priority</Label>

              <select
                className="w-full border rounded-md p-2 mt-2"
                value={form.paymentPriority || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentPriority: e.target.value,
                  })
                }
              >
                <option value="">Select</option>

                {priorityList.map((v: any) => (
                  <option key={v._id} value={v.listItem}>
                    {v.listItem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="space-y-6">
            {/* PAYMENT DETAILS */}
            <div className="border rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-gray-700">
                Payment Details
              </h2>

              {/* DESCRIPTION */}
              <div>
                <Label>Description</Label>

                <Textarea
                  rows={4}
                  className="mt-2"
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* AMOUNTS */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Request Amount</Label>

                  <div className="mt-2">
                    <AmountToWords
                      readOnly={isFRLocked || isPaymentLocked}
                      amount={String(form.requestAmount || "")}
                      onChange={(val) =>
                        setForm((prev: any) => ({
                          ...prev,
                          requestAmount: val,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Request No</Label>

                  <Input
                    readOnly={isFRLocked || isPaymentLocked}
                    className={`mt-2 ${
                      isFRLocked || isPaymentLocked ? "bg-gray-100" : ""
                    }`}
                    value={form.requestNo || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        requestNo: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Paid Amount</Label>

                  <div className="border rounded-md h-10 px-3 flex items-center bg-gray-100 mt-2 font-medium">
                    ₹ {totalPaidAmount}
                  </div>
                </div>

                <div>
                  <Label>Balance Amount</Label>

                  <div className="border rounded-md h-10 px-3 flex items-center bg-gray-100 mt-2 font-medium">
                    ₹ {balanceAmount}
                  </div>
                </div>
              </div>
            </div>

            {/* TRACKING */}
            <div className="border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-700" />

                <h2 className="text-lg font-semibold text-gray-700">
                  Tracking & Approval
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  {renderUserSearch("requestedBy", "Requested By", true)}
                </div>

                <div>
                  <Label>Request Date</Label>

                  <Input
                    readOnly
                    className="bg-gray-100 mt-2"
                    type="date"
                    value={form.requestedDate?.substring(0, 10) || ""}
                  />
                </div>

                <div>
                  <Label>Due Date</Label>

                  <Input
                    readOnly
                    className="bg-gray-100 mt-2"
                    type="date"
                    value={form.dueDate?.substring(0, 10) || ""}
                  />
                </div>

                <div className="flex items-center gap-3 pt-8">
                  <label className="text-sm font-medium">Approved</label>

                  <div>
                    {form.isApproved ? (
                      <span className="text-green-600">✔</span>
                    ) : (
                      <span className="text-red-600">✖</span>
                    )}
                  </div>
                </div>

                <div>{renderUserSearch("approvedBy", "Approved By", true)}</div>

                <div>
                  <Label>Approved Date</Label>

                  <Input
                    readOnly
                    className="bg-gray-100 mt-2"
                    type="date"
                    value={form.approvedDate?.substring(0, 10) || ""}
                  />
                </div>

                <div className="flex items-center gap-3 pt-8">
                  <label className="text-sm font-medium">Authorized</label>

                  <div>
                    {form.isAuthorized ? (
                      <span className="text-green-600">✔</span>
                    ) : (
                      <span className="text-red-600">✖</span>
                    )}
                  </div>
                </div>

                <div>
                  {renderUserSearch("authorizedBy", "Authorized By", true)}
                </div>

                <div>
                  <Label>Authorized Date</Label>

                  <Input
                    readOnly
                    className="bg-gray-100 mt-2"
                    type="date"
                    value={form.authorizationDate?.substring(0, 10) || ""}
                  />
                </div>
              </div>
            </div>

            {/* TENDER & WO */}
            <div className="border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-700" />

                <h2 className="text-lg font-semibold text-gray-700">
                  Tender & Work Order Info
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Tender No</Label>

                  <Input
                    className="mt-2"
                    value={form.tenderNo || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tenderNo: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Tender Name</Label>

                  <Input
                    className="mt-2"
                    value={form.tenderName || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tenderName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Work Order No</Label>

                  <Input
                    className="mt-2"
                    value={form.woNo || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        woNo: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Work Order Title</Label>

                  <Input
                    className="mt-2"
                    value={form.woTitle || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        woTitle: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* TRANSACTIONS */}
            <div className="border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">
                  Transactions
                </h2>

                <Button
                  disabled={!isAuthorized || isBalanceZero || isPaymentLocked}
                  onClick={() => setShowTxnForm(!showTxnForm)}
                  className="bg-cyan-900 hover:bg-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Pay
                </Button>
              </div>
              {isBalanceZero && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
                  Full payment already completed. No more transactions allowed.
                </div>
              )}
              {!isAuthorized && (
                <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-4 py-3 text-sm">
                  Transactions can be recorded only after authorization.
                </div>
              )}

              {/* TXN FORM */}
              {showTxnForm && (
                <div className="border rounded-xl p-5 bg-gray-50 space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label>Amount</Label>
                      <AmountToWords
                        amount={txnForm.amount}
                        onChange={(val) =>
                          setTxnForm({
                            ...txnForm,
                            amount: val,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Transaction Date</Label>

                      <Input
                        type="date"
                        value={txnForm.txnDate || ""}
                        onChange={(e) =>
                          setTxnForm({
                            ...txnForm,
                            txnDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Transaction Type</Label>

                      <select
                        className="w-full border rounded-md p-2"
                        value={txnForm.txnType || ""}
                        onChange={(e) =>
                          setTxnForm({
                            ...txnForm,
                            txnType: e.target.value,
                          })
                        }
                      >
                        <option value="">Select</option>

                        {txnTypeList.map((v: any) => (
                          <option key={v._id} value={v.listItem}>
                            {v.listItem}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>{renderPayToSearch()}</div>

                    <div className="col-span-2">
                      <Label>Transaction Note</Label>

                      <Textarea
                        rows={3}
                        value={txnForm.txnNote || ""}
                        onChange={(e) =>
                          setTxnForm({
                            ...txnForm,
                            txnNote: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={closeTxnForm}
                      className="bg-amber-600 hover:bg-amber-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRecordTransaction}
                      className="bg-cyan-900 hover:bg-cyan-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Record
                    </Button>
                  </div>
                </div>
              )}

              {/* TABLE */}
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Transaction Date</TableHead>
                      <TableHead>Transaction Type</TableHead>
                      <TableHead>Paid To</TableHead>
                      <TableHead>Transaction Note</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-gray-500 py-8"
                        >
                          No Transactions Found
                        </TableCell>
                      </TableRow>
                    )}

                    {transactions.map((txn: any) => (
                      <TableRow key={txn._id}>
                        <TableCell className="font-medium">
                          ₹ {txn.amount}
                        </TableCell>

                        <TableCell>{txn.txnDate?.substring(0, 10)}</TableCell>

                        <TableCell>{txn.txnType}</TableCell>

                        <TableCell>{txn.paidTo}</TableCell>

                        <TableCell>{txn.txnNote}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/payments")}
              >
                Cancel
              </Button>

              <Button
                disabled={isPaymentLocked}
                onClick={handleSubmit}
                className="bg-cyan-900 hover:bg-cyan-700"
              >
                {id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE NOTES */}
        <div className="border rounded-2xl shadow-sm overflow-hidden bg-white">
          <div className="p-4">
            <Notes entityType="PAYMENT" entityId={id || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}

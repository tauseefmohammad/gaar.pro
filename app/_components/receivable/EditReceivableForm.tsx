// EditReceivableForm.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import AmountToWords from "../AmountToWords";
import Notes from "../Notes";

export default function EditReceivableForm({ id }: { id: string }) {
  const router = useRouter();

  const { data: session } = useSession();

  const orgId = session?.user?.orgId || "INTR";

  const [form, setForm] = useState<any>({});
  const [transactions, setTransactions] = useState<any[]>([]);

  const [verticals, setVerticals] = useState<any[]>([]);
  const [subVerticals, setSubVerticals] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [paymentTypeList, setPaymentTypeList] = useState<any[]>([]);

  const [showReceiveForm, setShowReceiveForm] = useState(false);

  const [transactionForm, setTransactionForm] = useState({
    amount: "",
    txnDate: "",
    txnType: "",
    txnNote: "",
  });

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

  useEffect(() => {
    if (!id) return;

    fetch(`/api/receivable/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm(data || {});
      });

    fetch(`/api/transaction?entityType=RECEIVABLE&entityId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data?.data || []);
      });
  }, [id]);

  const handleUpdate = async () => {
    await fetch(`/api/receivable/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...form,
        orgId,
      }),
    });

    router.push("/receivables");
  };

  const saveTransaction = async () => {
    const txnAmount = Number(transactionForm.amount || 0);
    const balanceAmount = Number(form.balanceReceivableAmount || 0);
    const receivedAmount = Number(form.receivedAmount || 0);

    // Prevent receiving more than balance
    if (txnAmount > balanceAmount) {
      alert("Transaction amount cannot exceed Balance Amount");
      return;
    }

    // Save transaction
    await fetch("/api/transaction", {
      method: "POST",
      body: JSON.stringify({
        ...transactionForm,
        amount: txnAmount,
        entityId: id,
        entityType: "RECEIVABLE",
      }),
    });

    // Refresh transactions
    const res = await fetch(
      `/api/transaction?entityType=RECEIVABLE&entityId=${id}`,
    );

    const data = await res.json();

    setTransactions(data?.data || []);

    setShowReceiveForm(false);

    setTransactionForm({
      amount: "",
      txnDate: "",
      txnType: "",
      txnNote: "",
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-cyan-700 to-cyan-900 px-6 py-4 text-white shadow-sm">
        <h1 className="text-xl font-semibold">Edit Receivable</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
            {/* GENERAL INFO */}
            <div className="xl:col-span-3">
              <div className="border rounded-xl p-5 shadow-sm space-y-5 sticky top-4">
                <h2 className="text-base font-semibold tracking-tight">
                  General Info
                </h2>

                <div className="space-y-4">
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

                  <div>
                    <Label>Payment From</Label>

                    <Input
                      value={form.paymentFrom || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          paymentFrom: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Due Date</Label>

                    <Input
                      type="date"
                      value={form.dueDate?.substring(0, 10) || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dueDate: e.target.value,
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
                    <Label>Balance Amount</Label>

                    <AmountToWords
                      amount={String(form.balanceReceivableAmount || "")}
                      readOnly
                      onChange={(val) =>
                        setForm((prev: any) => ({
                          ...prev,
                          balanceReceivableAmount: val,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Received Amount</Label>

                    <AmountToWords
                      amount={String(form.receivedAmount || "")}
                      readOnly
                      onChange={(val) =>
                        setForm((prev: any) => ({
                          ...prev,
                          receivedAmount: val,
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
                    <Label>Owner</Label>

                    <Input
                      value={form.owner || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          owner: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* DETAILS */}
            <div className="xl:col-span-7 space-y-6">
              {/* DESCRIPTION */}
              <div className="border rounded-xl p-6 shadow-sm space-y-6">
                <h2 className="text-base font-semibold tracking-tight">
                  Description
                </h2>

                <Textarea
                  rows={5}
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* VERTICAL */}
              <div className="border rounded-xl p-6 shadow-sm">
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
                </div>
              </div>

              {/* TENDER */}
              <div className="border rounded-xl p-6 shadow-sm space-y-6">
                <h2 className="text-base font-semibold tracking-tight">
                  Tender & Work Order Info
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Tender No</Label>

                    <Input
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
                    <Label>Tender Description</Label>

                    <Input
                      value={form.tenderDesc || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tenderDesc: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Work Order No</Label>

                    <Input
                      value={form.workOrderNo || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          workOrderNo: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Work Order Title</Label>

                    <Input
                      value={form.workOrderTitle || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          workOrderTitle: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* TRANSACTIONS */}
              <div className="border rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold tracking-tight">
                    Transactions
                  </h2>

                  <Button
                    size="sm"
                    className="bg-cyan-900 hover:bg-cyan-700"
                    onClick={() => setShowReceiveForm(true)}
                  >
                    + Receive
                  </Button>
                </div>

                {showReceiveForm && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Amount</Label>

                        <Input
                          value={transactionForm.amount}
                          onChange={(e) =>
                            setTransactionForm({
                              ...transactionForm,
                              amount: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Transaction Date</Label>

                        <Input
                          type="date"
                          value={transactionForm.txnDate}
                          onChange={(e) =>
                            setTransactionForm({
                              ...transactionForm,
                              txnDate: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Transaction Type</Label>

                        <select
                          className="w-full border rounded-md p-2"
                          value={transactionForm.txnType}
                          onChange={(e) =>
                            setTransactionForm({
                              ...transactionForm,
                              txnType: e.target.value,
                            })
                          }
                        >
                          <option value="">Select</option>

                          <option value="RECEIVED">Received</option>

                          <option value="PARTIAL">Partial</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <Label>Transaction Note</Label>

                        <Textarea
                          rows={3}
                          value={transactionForm.txnNote}
                          onChange={(e) =>
                            setTransactionForm({
                              ...transactionForm,
                              txnNote: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowReceiveForm(false)}
                      >
                        Cancel
                      </Button>

                      <Button onClick={saveTransaction}>
                        Save Transaction
                      </Button>
                    </div>
                  </div>
                )}

                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left">Amount</th>

                        <th className="p-3 text-left">Transaction Date</th>

                        <th className="p-3 text-left">Transaction Type</th>

                        <th className="p-3 text-left">Transaction Note</th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-4 text-center text-muted-foreground"
                          >
                            No Transactions Found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((txn: any) => (
                          <tr
                            key={txn._id}
                            className="border-t hover:bg-muted/30"
                          >
                            <td className="p-3">{txn.amount}</td>

                            <td className="p-3">
                              {txn.txnDate?.substring(0, 10)}
                            </td>

                            <td className="p-3">{txn.txnType}</td>

                            <td className="p-3">{txn.txnNote}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/payments")}
                >
                  Cancel
                </Button>

                <Button
                  className="bg-cyan-900 hover:bg-cyan-700"
                  onClick={handleUpdate}
                >
                  Update Receivable
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div className="lg:col-span-3">
          <div className="border rounded-xl p-6 shadow-sm sticky top-4">
            <Notes user={session?.user} entityType="RECEIVABLE" entityId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

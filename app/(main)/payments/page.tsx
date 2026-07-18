"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Pencil, Check, X, ArrowUpDown, FileSpreadsheet } from "lucide-react";
import PageHeader from "@/app/_components/PageHeader";
import { useSession } from "next-auth/react";

export default function PaymentList() {
  const { data: session } = useSession();
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch data
  const fetchData = async () => {
    try {
      const orgId = session?.user?.orgId;
      if (!orgId) return;

      const res = await fetch(
        `/api/payment?search=${search}&page=${page}&limit=${limit}&orgId=${orgId}&sortField=${sortField}&sortOrder=${sortOrder}`,
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error(err);
      setData([]);
    }
  };

  // Debounced + initial fetch
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.length === 0 || search.length >= 3) {
        fetchData();
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [search, page, limit, sortField, sortOrder]);

  // Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Excel Export
  const exportExcel = async () => {
    try {
      const orgId = session?.user?.orgId;
      if (!orgId) return;

      const res = await fetch(
        `/api/payment/export?search=${search}&orgId=${orgId}`,
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "payments.xlsx";
      a.click();

      window.URL.revokeObjectURL(url); // cleanup
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <div className="space-y-4 px-0 md:px-4 lg:px-8">
      {/* Title */}
      <div className="bg-linear-to-r from-cyan-300 to-cyan-900 text-white text-center py-2 rounded-md">
        <h1 className="text-xl font-semibold">Payments</h1>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-4">
        {/* Search */}
        <Input
          placeholder="Search (min 3 chars)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        <div className="flex gap-2 items-center">
          {/* Limit */}
          <select
            className="border rounded px-2 py-1 h-7 w-15"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>

          {/* Buttons */}
          <Button
            onClick={exportExcel}
            variant="ghost"
            size="icon"
            title="Export to Excel"
          >
            <FileSpreadsheet className="h-5 w-5 text-green-700" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-auto max-h-[70vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-cyan-200 z-20 shadow-sm">
            <TableRow>
              <TableHead className="font-bold w-16">Edit</TableHead>
              <TableHead
                onClick={() => handleSort("requestNo")}
                className="cursor-pointer font-bold"
              >
                Request No <ArrowUpDown size={14} />
              </TableHead>
              <TableHead
                onClick={() => handleSort("description")}
                className="cursor-pointer font-bold"
              >
                Description <ArrowUpDown size={14} />
              </TableHead>
              <TableHead
                onClick={() => handleSort("requestAmount")}
                className="cursor-pointer font-bold"
              >
                Amount <ArrowUpDown size={14} />
              </TableHead>
              <TableHead className="font-bold">Due Date</TableHead>
              <TableHead className="font-bold">Priority</TableHead>
              <TableHead className="font-bold">Vertical</TableHead>
              <TableHead className="font-bold">State</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Approved</TableHead>
              <TableHead className="font-bold">Authorized</TableHead>
              <TableHead className="font-bold">Requested By</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-6">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item._id} className="hover:bg-muted/50">
                  <TableCell>
                    <Pencil
                      size={16}
                      className="text-orange-500 cursor-pointer hover:text-orange-700"
                      onClick={() => router.push(`/payments/edit/${item._id}`)}
                    />
                  </TableCell>
                  <TableCell>{item.requestNo}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    ₹ {item.requestAmount?.toLocaleString("en-IN")}
                  </TableCell>

                  <TableCell>
                    {item.dueDate
                      ? new Date(item.dueDate).toLocaleDateString("en-IN")
                      : "-"}
                  </TableCell>

                  <TableCell>{item.priority || "-"}</TableCell>
                  <TableCell>{item.vertical || "-"}</TableCell>
                  <TableCell>{item.state || "-"}</TableCell>
                  <TableCell>{item.status}</TableCell>

                  <TableCell>
                    {item.isApproved ? (
                      <Check className="text-green-600" />
                    ) : (
                      <X className="text-red-600" />
                    )}
                  </TableCell>

                  <TableCell>
                    {item.isAuthorized ? (
                      <Check className="text-green-600" />
                    ) : (
                      <X className="text-red-600" />
                    )}
                  </TableCell>

                  <TableCell>{item.requestedBy}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
      <div className="text-sm text-muted-foreground">
        Total Records: {totalRecords}
      </div>
      <div className="flex justify-end gap-2 items-center">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>

        <span className="text-sm">Page {page}</span>

        <Button
          variant="outline"
          size="sm"
          disabled={page * limit >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
      </div>
    </div>
  );
}

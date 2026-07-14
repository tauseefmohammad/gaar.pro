"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageHeader from "@/app/_components/PageHeader";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Pencil, ArrowUpDown, FileSpreadsheet, Plus } from "lucide-react";
import { formatDate } from "@/lib/dateUtil";
import { useSession } from "next-auth/react";

export default function FundRequestList() {
  const { data: session } = useSession();
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const orgId = session?.user?.orgId;

  // ---------------- FETCH ----------------
  const fetchData = async () => {
    // const orgId = localStorage.getItem("orgId") || "";

    const res = await fetch(
      `/api/fund-request?orgId=${orgId}&page=${page}&limit=${limit}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`,
    );

    const json = await res.json();

    setData(json.data || []);
    setTotalPages(json.totalPages || 1);
  };

  useEffect(() => {
    if (!orgId) return;
    fetchData();
  }, [orgId, page, limit, sortField, sortOrder]);

  // 🔍 debounce search
  useEffect(() => {
    if (!orgId) return;

    const delay = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);

    return () => clearTimeout(delay);
  }, [search, orgId]);

  // ---------------- SORT ----------------
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ---------------- BADGE ----------------
  const badge = (val: boolean) =>
    val ? (
      <span className="text-green-600 font-bold text-lg">✔</span>
    ) : (
      <span className="text-red-600 font-bold text-lg">✖</span>
    );

  // ---------------- EXPORT ----------------
  const handleExport = async () => {
    const orgId = localStorage.getItem("orgId") || "";

    const res = await fetch(
      `/api/fund-request/export?orgId=${orgId}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`,
    );

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FundRequests.xlsx";
    a.click();
  };

  // ---------------- UI ----------------
  return (
    <div className="p-4 space-y-6">
      <PageHeader title="Fund Requests" />

      {/* 🔹 Toolbar */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search..."
          className="w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <select
            className="border rounded px-2 py-1 h-7 w-15"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>

          <Button
            onClick={handleExport}
            variant="ghost"
            size="icon"
            title="Export to Excel"
          >
            <FileSpreadsheet className="h-5 w-5 text-green-700" />
          </Button>

          <Button
            onClick={() => router.push("/fund-request/create")}
            variant="ghost"
            size="icon"
            title="Add Fund Request"
            className="bg-cyan-900 hover:bg-cyan-600 font-bold text-white text-sm h-7 w-15 align-middle"
          >
            <Plus className="h-4 w-4 mr-2" />
            FR
          </Button>
        </div>
      </div>

      {/* 🔹 Table */}
      <div className="border rounded-xl overflow-auto max-h-[70vh]">
        <Table>
          {/* ✅ STICKY HEADER FIX */}
          <TableHeader className="sticky top-0 bg-cyan-200 z-20 shadow-sm">
            <TableRow>
              <TableHead></TableHead>

              <TableHead
                onClick={() => handleSort("frNo")}
                className="cursor-pointer"
              >
                FR No <ArrowUpDown size={14} className="inline ml-1" />
              </TableHead>

              <TableHead
                onClick={() => handleSort("state")}
                className="cursor-pointer"
              >
                State <ArrowUpDown size={14} className="inline ml-1" />
              </TableHead>

              <TableHead>Vertical</TableHead>
              <TableHead>Req. Date</TableHead>

              <TableHead>Description</TableHead>

              <TableHead
                onClick={() => handleSort("amount")}
                className="cursor-pointer"
              >
                Amount <ArrowUpDown size={14} className="inline ml-1" />
              </TableHead>

              <TableHead>Status</TableHead>
              <TableHead>Requested By</TableHead>

              <TableHead className="text-center">Approved</TableHead>
              <TableHead className="text-center">Authorized</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((row: any) => (
                <TableRow key={row._id}>
                  <TableCell>
                    <button
                      onClick={() => router.push(`/fund-request/${row._id}`)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <Pencil size={16} />
                    </button>
                  </TableCell>

                  <TableCell>{row.frNo}</TableCell>
                  <TableCell>{row.state}</TableCell>
                  <TableCell>{row.vertical}</TableCell>
                  <TableCell>{formatDate(row.requestedDate)}</TableCell>

                  <TableCell className="truncate max-w-[200px]">
                    {row.description}
                  </TableCell>

                  <TableCell>₹ {row.amount}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.requestedBy}</TableCell>

                  <TableCell className="text-center">
                    {badge(row.isApproved)}
                  </TableCell>

                  <TableCell className="text-center">
                    {badge(row.isAuthorized)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-6">
                  No Data Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔻 Pagination */}
      <div className="flex justify-end gap-2 items-center">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

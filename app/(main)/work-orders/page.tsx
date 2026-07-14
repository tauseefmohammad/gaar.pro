// app/dashboard/work-orders/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import PageHeader from "@/app/_components/PageHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pencil,
  FileSpreadsheet,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function WorkOrdersPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/work-order?page=${page}&limit=${limit}&search=${search}&orgId=${session?.user?.orgId}`,
      );

      const data = await res.json();

      setWorkOrders(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalRecords(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching work orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.orgId) {
      fetchWorkOrders();
    }
  }, [page, limit, search, session]);

  const exportToExcel = async () => {
    window.open(
      `/api/work-order/export?orgId=${session?.user?.orgId}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-4 px-0 md:px-4 lg:px-8">
      <PageHeader title="Work Orders" />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="w-full md:max-w-sm">
          <Input
            placeholder="Search work orders..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Page Size" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="10">10 Rows</SelectItem>
              <SelectItem value="25">25 Rows</SelectItem>
              <SelectItem value="50">50 Rows</SelectItem>
              <SelectItem value="100">100 Rows</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={exportToExcel}
            variant="ghost"
            size="icon"
            title="Export to Excel"
          >
            <FileSpreadsheet className="h-8 w-5 text-green-700" />
          </Button>

          <Button
            onClick={() => router.push("/work-orders/create")}
            variant="ghost"
            size="icon"
            className="bg-cyan-900 hover:bg-cyan-600 text-white w-auto px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="mr-2 h-6 w-6" />WO
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-auto max-h-[70vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-cyan-200 z-20 shadow-sm">
            <TableRow>
              <TableHead className="text-black font-bold w-16">Edit</TableHead>

              <TableHead className="text-black font-bold">WO No</TableHead>

              <TableHead className="text-black font-bold">Title</TableHead>

              <TableHead className="text-black font-bold">Client</TableHead>

              <TableHead className="text-black font-bold">Tender No</TableHead>

              <TableHead className="text-black font-bold">Start Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : workOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No Work Orders Found
                </TableCell>
              </TableRow>
            ) : (
              workOrders.map((row: any) => (
                <TableRow key={row._id}>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-orange-500 hover:text-orange-700"
                      onClick={() => router.push(`/work-orders/${row._id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>

                  <TableCell>{row.woNo}</TableCell>
                  <TableCell>{row.woTitle}</TableCell>
                  <TableCell>{row.client}</TableCell>
                  <TableCell>{row.woValue}</TableCell>
                  <TableCell>
                    {row.woDate
                      ? new Date(row.woDate).toLocaleDateString()
                      : ""}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total Records: {totalRecords}
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="font-medium">
            Page {page} of {totalPages}
          </span>

          <Button
            size="icon"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

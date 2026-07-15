"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FileSpreadsheet, Pencil, Plus } from "lucide-react";
import { formatDate } from "@/lib/dateUtil";
import { useSession } from "next-auth/react";

export default function ReceivablesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [sortField, setSortField] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalRecords, setTotalRecords] = useState(0);

  const [limit, setLimit] = useState<number>(10);

  const fetchData = async () => {
    const orgId = session?.user?.orgId;

    const res = await fetch(
      `/api/receivable?page=${page}&limit=${limit}&search=${search}&orgId=${orgId}&sortField=${sortField}&sortOrder=${sortOrder}`,
    );

    const result = await res.json();

    setData(result.data);
    setTotal(result.total);
  };

  useEffect(() => {
    fetchData();
  }, [page, search, limit]);

  function handleExport(event: any): void {
    event.preventDefault();

    if (!data.length) {
      return;
    }

    const headers = ["Description", "Amount", "Vertical", "Status", "Due Date"];
    const rows = data.map((item) => [
      item.description ?? "",
      item.amount ?? "",
      item.vertical ?? "",
      item.status ?? "",
      item.dueDate ? item.dueDate.substring(0, 10) : "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receivables-export-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 px-0 md:px-4 lg:px-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-300 to-cyan-900 text-white text-center py-2 rounded-md">
        <h1 className="text-lg font-semibold">Receivables</h1>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mt-4 gap-4">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-1/3"
        />

        <div className="flex gap-2 items-center">
          <select
            className="border rounded-md px-2 py-2 text-sm  h-8 w-15"
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

          <Button
            onClick={handleExport}
            variant="ghost"
            size="icon"
            title="Export to Excel"
          >
            <FileSpreadsheet className="h-8 w-5 text-green-700" />
          </Button>

          <Button
            onClick={() => router.push("/receivables/create")}
            variant="ghost"
            size="icon"
            title="Add Receivable"
            className="bg-cyan-900 hover:bg-cyan-600 font-bold text-white text-sm h-8 w-25 align-middle"
          >
            <Plus className="h-4 w-4 mr-2" />
            Receivable
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border mt-4 overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-cyan-200 z-20 shadow-sm">
            <TableRow>
              <TableHead className="text-black font-bold w-16">Edit</TableHead>
              <TableHead className="font-bold">Description</TableHead>
              <TableHead className="font-bold">Amount</TableHead>
              <TableHead className="font-bold">Balance Amount</TableHead>
              <TableHead className="font-bold">Vertical</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Due Date</TableHead>
              <TableHead className="font-bold">State</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((item: any) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-orange-500 hover:text-orange-700"
                      onClick={() =>
                        router.push(`/receivables/edit/${item._id}`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>

                  <TableCell>{item.description}</TableCell>

                  <TableCell>₹{item.receivableAmount || 0}</TableCell>
                  <TableCell>₹{item.balanceReceivableAmount || 0}</TableCell>
                  <TableCell>{item.vertical}</TableCell>

                  <TableCell>{item.status}</TableCell>

                  <TableCell>{formatDate(item.dueDate)}</TableCell>
                  <TableCell>{item.state}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-gray-500"
                >
                  No receivables found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
      <div className="text-sm text-muted-foreground">
        Total Records: {totalRecords}
      </div>
      <div className="flex justify-end gap-2 items-center mt-4">
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

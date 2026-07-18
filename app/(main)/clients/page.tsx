// app/(dashboard)/clients/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import PageHeader from "@/app/_components/PageHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Pencil,
  Plus,
  Search,
} from "lucide-react";

import * as XLSX from "xlsx";
import { useSession } from "next-auth/react";

type Client = {
  _id: string;
  client: string;
  clientId: string;
  website: string;
  phone: string;
  emailId: string;
  state: string;
};

type SortField =
  | "client"
  | "clientId"
  | "website"
  | "phone"
  | "emailId"
  | "state";

export default function ClientsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("client");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ---------------- QUERY ----------------
  const {
    data: queryResult,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "clients",
      session?.user?.orgId,
      pageIndex,
      search,
      sortField,
      sortOrder,
    ],

    queryFn: async () => {
      const res = await fetch(
        `/api/client?orgId=${session?.user?.orgId}&page=${
          pageIndex + 1
        }&limit=${pageSize}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`,
      );

      if (!res.ok) throw new Error("Failed to fetch clients");

      return res.json();
    },

    // Only fetch when orgId is available — replaces your useEffect guard
    enabled: !!session?.user?.orgId,

    // Keeps previous page data visible while next page loads (No blank flash!)
    placeholderData: keepPreviousData,
  });

  // Unwrap API response — no more separate useState for these
  const clients: Client[] = queryResult?.data || [];
  const totalPages: number = queryResult?.totalPages || 1;

  // ---------------- SORT ----------------
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ---------------- EXPORT ----------------
  // ✅ Uses `clients` directly — API already filtered/sorted the data
  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(clients);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Clients");

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Clients.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ---------------- SORT HEADER ----------------
  const SortableHeader = ({
    label,
    field,
  }: {
    label: string;
    field: SortField;
  }) => (
    <Button
      variant="ghost"
      className="px-0 hover:bg-transparent font-bold"
      onClick={() => handleSort(field)}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="space-y-6 px-0 md:px-4 lg:px-8">
      {/* Title */}
      <div className="bg-linear-to-r from-cyan-300 to-cyan-900 text-white text-center py-2 rounded-md">
        <h1 className="text-xl font-semibold">Client Listing</h1>
      </div>

      {/* Subtle background refresh indicator */}
      {isFetching && !isLoading && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Refreshing...
        </p>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        {/* Search */}
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Universal Search..."
            value={search}
            onChange={(e) => {
              setPageIndex(0); // Reset to first page on new search
              setSearch(e.target.value);
            }}
            className="pl-9"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={exportExcel}
            variant="ghost"
            size="icon"
            title="Export to Excel"
          >
            <FileSpreadsheet className="h-5 w-5 text-green-700" />
          </Button>

          <Button
            onClick={() => router.push("/clients/create")}
            variant="ghost"
            size="icon"
            title="Add Client"
            className="bg-cyan-900 hover:bg-cyan-600 font-bold text-white text-sm h-7 w-20 align-middle"
          >
            <Plus className="h-4 w-4 mr-2" />
            Client
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-cyan-200 z-20 shadow-sm">
            <TableRow>
              <TableHead className="w-[60px] font-bold">Edit</TableHead>
              <TableHead>
                <SortableHeader label="Client" field="client" />
              </TableHead>
              <TableHead>
                <SortableHeader label="Client ID" field="clientId" />
              </TableHead>
              <TableHead>
                <SortableHeader label="Website" field="website" />
              </TableHead>
              <TableHead>
                <SortableHeader label="Phone" field="phone" />
              </TableHead>
              <TableHead>
                <SortableHeader label="Email" field="emailId" />
              </TableHead>
              <TableHead>
                <SortableHeader label="State" field="state" />
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Loading...
                </TableCell>
              </TableRow>
            ) : clients.length > 0 ? (
              clients.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-orange-500 hover:text-orange-700"
                      onClick={() => router.push(`/clients/${row._id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>{row.client}</TableCell>
                  <TableCell>{row.clientId}</TableCell>
                  <TableCell>{row.website}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.emailId}</TableCell>
                  <TableCell>{row.state}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No Clients Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center">
         <div className="text-sm text-muted-foreground">
          Total Records: {totalRecords}
        </div>
        <div className="flex gap-2 items-center justify-end w-half ml-auto">
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((prev) => prev - 1)}
          >
            Prev
          </Button>
          <div className="text-sm text-muted-foreground font-bold">
          Page {pageIndex + 1} of {totalPages}
        </div>
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex + 1 >= totalPages}
            onClick={() => setPageIndex((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

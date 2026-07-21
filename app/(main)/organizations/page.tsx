// app/organization/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Pencil,
  Plus,
} from "lucide-react";

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
import { formatDate } from "@/lib/dateUtil";

interface Organization {
  _id: string;
  orgName: string;
  orgId: string;
  contactName: string;
  contactDesignation: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  status: string;
  pan: string;
  gstNo: string;
  industryType: string;
  modeOfRegistration: string;
  orgType: string;
  regDate: string;
}

export default function OrganizationPage() {
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const totalPages = Math.ceil(totalRecords / limit);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/organization?page=${page}&limit=${limit}&search=${globalFilter}`,
      );

      const result = await response.json();

      setData(result.data || []);
      setTotalRecords(result.total || 0);
    } catch (error) {
      console.log("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [page, limit, globalFilter]);

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Organizations" />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Universal Search..."
            value={globalFilter ?? ""}
            onChange={(e) => {
              setPage(1);
              setGlobalFilter(e.target.value);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
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

          <Button variant="outline" size="icon">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
          </Button>

          <Button onClick={() => router.push("/organizations/create")}
            variant="ghost"
            className="bg-cyan-900 hover:bg-cyan-600 font-bold text-white text-sm align-middle"
            title="Add Fund Request"
            >
            
            <Plus className="mr-2 h-4 w-4" />
            Organization
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="sticky top-0 bg-cyan-200 z-20 shadow-sm">
            <TableRow>
              <TableHead className="font-bold">Edit</TableHead>
              <TableHead className="font-bold">Org Name</TableHead>
              <TableHead className="font-bold">Contact Name</TableHead>
              <TableHead className="font-bold">Contact Designation</TableHead>
              <TableHead className="font-bold">Phone</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Reg. Date</TableHead>
              <TableHead className="font-bold">City</TableHead>
              <TableHead className="font-bold">State</TableHead>
              <TableHead className="font-bold">Country</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((row: any) => (
                <TableRow key={row._id}>
                  <TableCell>
                    <button
                      onClick={() => router.push(`/organization/${row._id}`)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <Pencil size={16} />
                    </button>
                  </TableCell>
                  <TableCell>{row.orgName}</TableCell>
                  <TableCell>{row.contactName}</TableCell>
                  <TableCell>{row.contactDesignation}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{formatDate(row.regDate) || "-"}</TableCell>
                  <TableCell>{row.city}</TableCell>
                  <TableCell>{row.state}</TableCell>
                  <TableCell>{row.country}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No organizations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>

        <div className="text-sm font-medium">
          {page} / {totalPages || 1}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

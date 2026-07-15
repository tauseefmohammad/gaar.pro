// app/dashboard/tenders/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Pencil, Plus, Download } from "lucide-react";

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
import router from "next/router";
import { useSession } from "next-auth/react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { TenderPreview } from "@/app/_components/TenderPreview";

interface Tender {
  _id: string;
  tenderNo: string;
  description: string;
  tenderDate: string;
  tenderType: string;
  status: string;
  position: string;
  tenderingDepartment: string;
  client: string;
  tenderValue: number;
  emdAmount: number;
  bgAmount: number;
}

export default function TenderListingPage() {
  const { data: session } = useSession(); // Replace with actual session retrieval logic
  const router = useRouter();
  const [data, setData] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(false);

  // server side pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [hoveredTender, setHoveredTender] = useState<Tender | null>(null);

  // client side search
  const [search, setSearch] = useState("");

  async function fetchTenders() {
    try {
      const orgId = session?.user?.orgId;
      setLoading(true);

      const res = await fetch(
        `/api/tender?page=${page}&limit=${limit}&orgId=${orgId}`,
      );

      const json = await res.json();

      setData(json.data || []);
      setTotalPages(json.totalPages || 1);
    } catch (error) {
      console.log("Fetch Tender Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTenders();
  }, [page, limit]);

  // client side search filter
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const value = search.toLowerCase();

      return (
        item.tenderNo?.toLowerCase().includes(value) ||
        item.description?.toLowerCase().includes(value) ||
        item.client?.toLowerCase().includes(value) ||
        item.status?.toLowerCase().includes(value) ||
        item.position?.toLowerCase().includes(value)
      );
    });
  }, [data, search]);

  return (
    <div className="space-y-6 *:px-0 md:px-4 lg:px-8">
      {/* Header */}
      <PageHeader title="Tenders" />

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="w-full md:max-w-sm">
          <Input
            placeholder="Search tenders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rows */}
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="10">10 Rows</SelectItem>

              <SelectItem value="25">25 Rows</SelectItem>

              <SelectItem value="50">50 Rows</SelectItem>

              <SelectItem value="100">100 Rows</SelectItem>
            </SelectContent>
          </Select>

          {/* Export */}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>

          {/* Add Tender */}
          <Button
            onClick={() => router.push("/tenders/create")}
            variant="ghost"
            size="icon"
            title="Add Receivable"
            className="bg-cyan-900 hover:bg-cyan-600 font-bold text-white text-sm h-8 w-25 align-middle"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tender
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-cyan-200 z-20 shadow-sm">
            <TableRow>
              <TableHead>Edit</TableHead>
              <TableHead>Tender No</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Tender Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>EMD</TableHead>
              <TableHead>BG</TableHead>
              <TableHead>Tender Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredData.length ? (
              filteredData.map((item) => (
                <TableRow
                  key={item._id}
                  onMouseEnter={() => setHoveredTender(item)}
                  onMouseLeave={() => setHoveredTender(null)}
                  className="hover:bg-cyan-50"
                >
                  <HoverCard openDelay={200}>
                    {/* Edit */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="text-orange-500 hover:text-orange-700"
                      >
                        <Link href={`/tenders/${item._id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                    <HoverCardTrigger asChild>
                      {/* Tender No */}
                      <TableCell>{item.tenderNo}</TableCell>
                    </HoverCardTrigger>

                    {/* Description */}
                    <TableCell>
                      <div className="max-w-md line-clamp-3">
                        {item.description}
                      </div>
                    </TableCell>

                    {/* Department */}
                    <TableCell>{item.tenderingDepartment}</TableCell>

                    {/* Client */}
                    <TableCell>{item.client}</TableCell>

                    {/* Tender Value */}
                    <TableCell>
                      ₹{Number(item.tenderValue || 0).toLocaleString("en-IN")}
                    </TableCell>

                    {/* Status */}
                    <TableCell>{item.status}</TableCell>

                    {/* Position */}
                    <TableCell>{item.position}</TableCell>

                    {/* EMD */}
                    <TableCell>
                      ₹{Number(item.emdAmount || 0).toLocaleString("en-IN")}
                    </TableCell>

                    {/* BG */}
                    <TableCell>
                      ₹{Number(item.bgAmount || 0).toLocaleString("en-IN")}
                    </TableCell>

                    {/* Tender Date */}
                    <TableCell>
                      {item.tenderDate
                        ? new Date(item.tenderDate).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    <HoverCardContent
                      side="right"
                      align="start"
                      className="w-[500px] rounded-xl border shadow-2xl bg-white"
                    >
                      <TenderPreview tender={item} />
                    </HoverCardContent>
                  </HoverCard>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  No Tenders Found
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
        <div className="flex justify-end items-center gap-3">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Prev
          </Button>
             <div className="text-sm text-muted-foreground font-bold">
          Page {page} of {totalPages}
        </div>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      </div>
    
    
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Pencil } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

export default function UserList() {
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const router = useRouter();
  const orgId = session?.user?.orgId;

  const fetchData = async () => {
    const res = await fetch(
      `/api/user/search?search=${search}&page=${page}&limit=${limit}&orgId=${orgId}`,
    );

    const json = await res.json();
    setData(json.data || []);
    setTotal(json.total || 0);
  };

  useEffect(() => {
    fetchData();
  }, [search, page, limit]);

  // Export functionality
  const handleExport = async () => {
    const res = await fetch(
      `/api/user/export?orgId=${orgId}&search=${search}`,
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Users.xlsx";
    a.click();
  };

  return (
    <div className="space-y-4 px-0 md:px-4 lg:px-8">
      {/* Title */}
      <div className="bg-linear-to-r from-cyan-300 to-cyan-900 text-white text-center py-2 rounded-md">
        <h1 className="text-lg font-semibold">Users</h1>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-4 gap-4">
        <Input
          placeholder="Search users..."
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          value={search}
          className="max-w-sm bg-white"
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
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-xl shadow border overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-cyan-200 z-20 shadow-sm">
            <TableRow>
              <TableHead className="w-20 text-center font-bold">Edit</TableHead>
              <TableHead className="text-center font-bold">EmpName</TableHead>
              <TableHead className="text-center font-bold">UserName</TableHead>
              <TableHead className="text-center font-bold">Role</TableHead>
              <TableHead className="text-center font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((user) => (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  {/* Edit */}
                  <TableCell className="text-center">
                    <button
                      onClick={() => router.push(`/users/${user._id}`)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <Pencil size={16} />
                    </button>
                  </TableCell>

                  {/* Name */}
                  <TableCell className="text-center font-medium">
                    {user.employeeName}
                  </TableCell>

                  {/* Employee ID */}
                  <TableCell className="text-center">
                    {user.username|| "-"}
                  </TableCell>

                  {/* Role */}
                  <TableCell className="text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {user.role || "-"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' || user.status === 'Active'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || '-'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end items-center gap-3">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </Button>

        <span className="text-sm font-medium">Page {page}</span>

        <Button
          variant="outline"
          disabled={page * limit >= total}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
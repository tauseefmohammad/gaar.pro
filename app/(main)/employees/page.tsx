"use client";

import { useEffect, useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Pencil, PencilLine, Plus } from "lucide-react";

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

export default function EmployeeList() {
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const router = useRouter();
  const orgId = session?.user?.orgId;

  const fetchData = async () => {
    //const orgId = session?.user?.orgId;

    const res = await fetch(
      `/api/employee/search?search=${search}&page=${page}&limit=10&orgId=${orgId}`,
    );

    const json = await res.json();

    setData(json.data || []);
    setTotal(json.total || 0);
  };

  useEffect(() => {
    fetchData();
  }, [search, page]);

  // ---------------- EXPORT ----------------
  const handleExport = async () => {
    const orgId = localStorage.getItem("orgId");

    const res = await fetch(
      `/api/employee/export?orgId=${orgId}&search=${search}`,
    );

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Employees.xlsx";
    a.click();
  };

  return (
    <div className="space-y-4 px-0 md:px-4 lg:px-8">
      {/* Title */}
      <div className="bg-gradient-to-r from-cyan-300 to-cyan-900 text-white text-center py-2 rounded-md">
        <h1 className="text-xl font-semibold">Employees</h1>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-4 gap-4">
        <Input
          placeholder="Search employees..."
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

          <Button
            onClick={() => router.push("/employees/create")}
            variant="ghost"
            size="icon"
            title="Create Employee"
            className="bg-cyan-900 hover:bg-cyan-600 font-bold text-white text-sm h-7 w-25 align-middle"
          >
            <Plus className="h-4 w-4 mr-2" />
            Employee
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-xl shadow border overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-cyan-200 z-20 shadow-sm">
            <TableRow>
              <TableHead className="w-[70px] font-bold">Edit</TableHead>
              <TableHead className="w-[90px] font-bold">Photo</TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Emp ID</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Phone</TableHead>
              <TableHead className="font-bold">Designation</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((emp) => (
                <TableRow key={emp._id} className="hover:bg-gray-50">
                  {/* Edit */}
                  <TableCell>
                    <button
                      onClick={() => router.push(`/employees/${emp._id}`)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <Pencil size={16} />
                    </button>
                  </TableCell>

                  {/* Photo */}
                  <TableCell>
                    <img
                      src={
                        emp.photo
                          ? `/api/files/employees/${emp.photo}`
                          : "/default-avatar.jpg"
                      }
                      onError={(e) => {
                        e.currentTarget.src = "/default-avatar.jpg";
                      }}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  </TableCell>

                  {/* Data */}
                  <TableCell className="font-medium">{emp.name}</TableCell>

                  <TableCell>{emp.empId}</TableCell>

                  <TableCell className="max-w-[220px] truncate">
                    {emp.email}
                  </TableCell>

                  <TableCell>{emp.phone}</TableCell>

                  <TableCell>{emp.designation}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-gray-500"
                >
                  No employees found
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
          disabled={page * 10 >= total}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
      </div>
    </div>
  );
}

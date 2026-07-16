import { connectDB } from "@/lib/mongoose";
import Employee from "@/models/Employee";
import User from "@/models/User";
import * as XLSX from "xlsx";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const orgId = searchParams.get("orgId");

  let query = { orgId };

  if (search && search.length >= 3) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
    ];
  }

  const data = await Employee.find(query).lean();

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new Response(buffer, {
    headers: {
      "Content-Disposition": "attachment; filename=employees.xlsx",
    },
  });
}

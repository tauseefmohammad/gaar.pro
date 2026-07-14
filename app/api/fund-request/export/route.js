import * as XLSX from "xlsx";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const orgId = searchParams.get("orgId");
  const search = searchParams.get("search") || "";

  let filter = { orgId };

  if (search) {
    filter.$or = [
      { frNo: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const data = await FundRequest.find(filter);

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "FR");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Disposition": "attachment; filename=FundRequests.xlsx",
    },
  });
}

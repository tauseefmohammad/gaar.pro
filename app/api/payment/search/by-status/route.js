import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import PaymentInfo from "@/models/PaymentInfo";
import ReceivableIno from "@/models/ReceivableInfo";

/**
 * Get all Payments Info of an organization
 */
export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const orgId = searchParams.get("orgId");
  const status = searchParams.get("status") || "";

  const sortField = searchParams.get("sortField") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  const skip = (page - 1) * limit;

  let query = { orgId };

  if (status) {
    query.status = status;
  }

  const data = await PaymentInfo.find(query)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await PaymentInfo.countDocuments(query);

  return NextResponse.json({ data, total });
}

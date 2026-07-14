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

  const sortField = searchParams.get("sortField") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  const skip = (page - 1) * limit;

  let query = { orgId };

  //  Universal search
  if (search && search.length >= 3) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
      { requestedBy: { $regex: search, $options: "i" } },
      { priority: { $regex: search, $options: "i" } },
      { vertical: { $regex: search, $options: "i" } },
      { state: { $regex: search, $options: "i" } },
    ];
  }

  const data = await PaymentInfo.find(query)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await PaymentInfo.countDocuments(query);

  return NextResponse.json({ data, total });
}

export async function POST(req) {
  try {
    await connectDB();
    const {
      paymentType,
      description,
      amount,
      vertical,
      subVertical,
      paymentTo,
      requestedBy,
      approvedBy,
      authorizedBy,
      status,
      requestedDate,
      paymentPriority,
      dueDate,
      paidDate,
      requestNo,
      state,
      orgId,
      tenderNo,
      tenderDesc,
      maturityDate,
    } = await req.json();

    console.log("Payment Info: ", { paymentType, description, amount, orgId });
    const paymentRecordToCreate = new PaymentInfo({
      paymentType,
      description,
      amount,
      vertical,
      subVertical,
      paymentTo,
      requestedBy,
      approvedBy,
      authorizedBy,
      status,
      requestedDate,
      paymentPriority,
      dueDate,
      paidDate,
      requestNo,
      state,
      orgId,
      tenderDesc,
      tenderNo,
      maturityDate,
    });
    const payment = await PaymentInfo.create(paymentRecordToCreate);
    console.log("Created Payment Info: " + payment);

    return NextResponse.json(
      { message: "Payment Info created successfully!" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

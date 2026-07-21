import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import ReceivableInfo from "@/models/ReceivableInfo";

/**
 * Get all Receivables Info of an organization
 */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;
    const orgId = searchParams.get("orgId");
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("sortField") || "dueDate";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const query = {
      ...(orgId ? { orgId } : {}),
      ...(search
        ? {
            $or: [
              { description: { $regex: search, $options: "i" } },
              { type: { $regex: search, $options: "i" } },
              { paymentFrom: { $regex: search, $options: "i" } },
              { vertical: { $regex: search, $options: "i" } },
              { subVertical: { $regex: search, $options: "i" } },
              { status: { $regex: search, $options: "i" } },
              { state: { $regex: search, $options: "i" } },
              { owner: { $regex: search, $options: "i" } },
              { invoiceNo: { $regex: search, $options: "i" } },
              { woNo: { $regex: search, $options: "i" } },
              { woTitle: { $regex: search, $options: "i" } },
              { tenderNo: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const [receivables, total] = await Promise.all([
      ReceivableInfo.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      ReceivableInfo.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        data: receivables,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    console.log("Receivable Info: ", body);
    const receivableData = {
      ...body,
      balanceReceivableAmount: body.receivableAmount,
      receivedAmount: 0,
    };

    const receivable = await ReceivableInfo.create(receivableData);
    console.log("Created Receivable Info: " + receivable);

    return NextResponse.json(
      { message: "Receivable Info created successfully!" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  await dbConnect();
  try {
    const { id, ...rest } = req.body;

    const updated = await ReceivableInfo.findByIdAndUpdate(id, rest, {
      new: true,
    });

    return NextResponse.json(
      { message: "Receivable Info updated successfully!" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

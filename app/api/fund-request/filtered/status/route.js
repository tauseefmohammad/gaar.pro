import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import FundRequest from "@/models/FundRequest";

export async function GET(req, res) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;
    const filter = { orgId: orgId };
    if (status) {
      filter.status = status;
    }
    const [fundRequests, total] = await Promise.all([
      FundRequest.find(filter).skip(skip).limit(limit),
      FundRequest.countDocuments(filter),
    ]);
    return NextResponse.json(
      {
        data: fundRequests,
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

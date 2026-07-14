import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import FundRequest from "@/models/FundRequest";

export async function GET(req, res) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    let filter = { orgId };
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // fetch where isApproved and isAuthorized are false
    filter.isApproved = false;
    filter.isAuthorized = false;

    const data = await FundRequest.find(filter).skip(skip).limit(limit);
    const total = await FundRequest.countDocuments(filter);

    return NextResponse.json({ data, page, limit, total }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

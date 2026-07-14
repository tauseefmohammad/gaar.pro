import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TenderInfo from "@/models/TenderInfo";

export async function POST(req) {
  const body = await req.json();
  console.log("After passing data to constants");
  try {
    await connectDB();
    console.log("After connecting to db");

    const tenderToCreate = new TenderInfo({
      ...body,
      status: "Draft",
      position: "Draft",
      emdPaymentStatus: "Pending",
      documentFeePaymentStatus: "Pending",
      corpusFundPaymentStatus: "Pending",
      bgPaymentStatus: "Pending",
      transactionFeePaymentStatus: "Pending",
      emdPaymentDate: null,
      documentFeePaymentDate: null,
      corpusFundPaymentDate: null,
      bgPaymentDate: null,
      transactionFeePaymentDate: null,
      bgRefundDate: null,
      emdRefundDate: null,
      bgRefundStatus: "Pending",
      emdRefundStatus: "Pending",
    });
    const createdTender = await TenderInfo.create(tenderToCreate);
    console.log(createdTender);
    return new NextResponse({ message: "Success!" }, { status: 200 });
  } catch (err) {
    return new NextResponse(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    console.log("Org Id: " + orgId);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const [tenders, total] = await Promise.all([
      TenderInfo.find({ orgId }).skip(skip).limit(limit),
      TenderInfo.countDocuments({ orgId }),
    ]);
    console.log("Tenders: ", tenders);
    return NextResponse.json(
      {
        data: tenders,
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

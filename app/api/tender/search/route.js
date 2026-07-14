import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TenderInfo from "@/models/TenderInfo";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const orgId = searchParams.get("orgId");
    const searchName = searchParams.get("q") || "";

    console.log("Before search:", searchName);

    const tenders = await TenderInfo.find({
      orgId,
      $or: [
        {
          tenderName: {
            $regex: searchName,
            $options: "i",
          },
        },
        {
          tenderNo: {
            $regex: searchName,
            $options: "i",
          },
        },
        {
          client: {
            $regex: searchName,
            $options: "i",
          },
        },
        {
          tenderingDepartment: {
            $regex: searchName,
            $options: "i",
          },
        },
      ],
    }).limit(20);

    console.log("Tender Infos:", tenders);

    return NextResponse.json(
      {
        data: tenders,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

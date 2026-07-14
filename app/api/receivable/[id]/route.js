import connectDB from "@/lib/mongoose";
import ReceivableInfo from "@/models/ReceivableInfo";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;

  //console.log("Fetching receivable info with ID:", id); // Debug log
  const data = await ReceivableInfo.findById(id);
  return NextResponse.json(data);
}

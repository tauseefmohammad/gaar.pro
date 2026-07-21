import connectDB from "@/lib/mongoose";
import ReceivableInfo from "@/models/ReceivableInfo";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;

  const data = await ReceivableInfo.findById(id);
  return NextResponse.json(data);
}

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = await params;

  try {
    const body = await req.json();

    const updated = await ReceivableInfo.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Receivable not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Receivable updated!", data: updated },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}
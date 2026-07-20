import connectDB from "@/lib/mongoose";
import PaymentInfo from "@/models/PaymentInfo";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  const data = await PaymentInfo.findById(id);
  return NextResponse.json(data);
}

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();

  try {
    const existingPayment = await PaymentInfo.findById(id);
    if (!existingPayment) {
      return NextResponse.json(
        { error: "Payment info not found" },
        { status: 404 },
      );
    }

    if (existingPayment.requestAmount !== body.requestAmount) {
      body.balanceAmount =
        Number(body.requestAmount || 0) - Number(existingPayment.paidAmount || 0);
    }

    const updated = await PaymentInfo.findByIdAndUpdate(id, body, {
      new: true,
    });

    return NextResponse.json(
      { message: "Payment updated!", data: updated },
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
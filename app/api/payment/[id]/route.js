import connectDB from "@/lib/mongoose";
import PaymentInfo from "@/models/PaymentInfo";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  //console.log("Fetching payment info with ID:", id); // Debug log
  const data = await PaymentInfo.findById(id);
  return NextResponse.json(data);
}

export async function PUT(req, { params }) {
  await connectDB();
  const body = await req.json();
  const existingPayment = await PaymentInfo.findById(params.id);
  if (!existingPayment) {
    return NextResponse.json(
      { error: "Payment info not found" },
      { status: 404 },
    );
  }

  if (existingPayment.requestedAmount !== body.requestedAmount) {
    body.balanceAmount = body.requestedAmount - existingPayment.paidAmount;
  }

  const updated = await PaymentInfo.findByIdAndUpdate(params.id, body, {
    new: true,
  });

  return NextResponse.json(updated);
}

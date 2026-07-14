import connectDB from "@/lib/mongoose";
import TenderInfo from "@/models/TenderInfo";
import { NextResponse } from "next/server";
import ReceivableInfo from "@/models/ReceivableInfo";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  //console.log("Fetching tender info with ID:", id); // Debug log
  const data = await TenderInfo.findById(id);
  return NextResponse.json(data);
}

export async function PUT(req, { params }) {
  await connectDB();
  const body = await req.json();
  const { id } = await params;
  console.log("Updating tender info with ID:", id); // Debug log
  console.log("Update data:", body); // Debug log
  /**
   * If the tender is being cancelled and the document fee has already been paid, create a receivable record for
   * the refund of the document fee. This ensures that the financial implications of cancelling a tender are
   * properly tracked and managed in the system.
   * The document fee refund is a common scenario when a tender is cancelled after the document fee has been paid.
   * By creating a receivable record for the refund, the system can keep track of the amount that needs to be
   * refunded to the bidder and ensure that it is processed in a timely manner.
   * This also helps maintain accurate financial records and provides transparency in the tendering process.
   */
  if (body.status === "Cancelled") {
    if (body.documentFeePaymentStatus === "Paid") {
      const existingTender = await TenderInfo.findById(id);
      if (existingTender.status !== body.status) {
        const receivableRecordToCreate = new ReceivableIno({
          type: "Document Fee Refund",
          description: "Refund of the cancelled tender's document fee",
          amount: body.documentFee,
          vertical: body.vertical,
          subVertical: body.subVertical,
          paymentFrom: body.paymentTo,
          tenderNo: body.tenderNo,
          tenderDesc: body.tenderDesc,
          woNo: "",
          woTitle: "",
          owner: "System",
          status: "Pending",
          receivedDate: null,
          invoiceNo: null,
          dueDate: null,
          state: body.state,
          orgId: body.orgId,
        });
        const receivable = await ReceivableIno.create(receivableRecordToCreate);
      }
    }
  }
  const updated = await TenderInfo.findByIdAndUpdate(id, body, {
    new: true,
  });

  return NextResponse.json(updated);
}

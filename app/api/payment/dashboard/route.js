import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import PaymentInfo from "@/models/PaymentInfo";

export async function GET(req, res) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const totalPaymentAmount = await PaymentInfo.aggregate([
      { $match: { orgId: orgId } },
      { $group: { _id: null, total: { $sum: "$requestAmount" } } },
    ]);
    const totalPaidAmount = await PaymentInfo.aggregate([
      { $match: { orgId: orgId } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);
    const totalBalancePaymentAmount = await PaymentInfo.aggregate([
      { $match: { orgId: orgId } },
      { $group: { _id: null, total: { $sum: "$balanceAmount" } } },
    ]);
    const totalPastDueDatePayments = await PaymentInfo.countDocuments({
      orgId: orgId,
      dueDate: { $lt: new Date() },
      balanceAmount: { $gt: 0 },
    });
    return NextResponse.json(
      {
        totalPaymentAmount: totalPaymentAmount[0]?.total || 0,
        totalPaidAmount: totalPaidAmount[0]?.total || 0,
        totalBalancePaymentAmount: totalBalancePaymentAmount[0]?.total || 0,
        totalPastDueDatePayments: totalPastDueDatePayments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

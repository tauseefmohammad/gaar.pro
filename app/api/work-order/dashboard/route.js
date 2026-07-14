import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import WorkOrder from "@/models/WorkOrder";

export async function GET(req, res) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const totalWorkOrders = await WorkOrder.countDocuments({ orgId: orgId });
    const totalCompletedWorkOrders = await WorkOrder.countDocuments({
      orgId: orgId,
      status: "Completed",
    });
    const totalPendingWorkOrders = await WorkOrder.countDocuments({
      orgId: orgId,
      status: "Pending",
    });
    const totalOverdueWorkOrders = await WorkOrder.countDocuments({
      orgId: orgId,
      dueDate: { $lt: new Date() },
      status: { $ne: "Completed" },
    });
    return NextResponse.json(
      {
        totalWorkOrders,
        totalCompletedWorkOrders,
        totalPendingWorkOrders,
        totalOverdueWorkOrders,
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

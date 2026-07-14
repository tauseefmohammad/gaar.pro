import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import WorkOrder from "@/models/WorkOrder";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const searchWorkOrder = searchParams.get("q");
    const regex = new RegExp(searchWorkOrder, "i");
    console.log("Before search: ", searchWorkOrder);
    const [workOrders, total] = await Promise.all([
      WorkOrder.find({
        orgId,
        $or: [
          { woNo: regex },
          { woTitle: regex },
          { tenderNo: regex },
          { tenderName: regex },
        ],
      }),
      WorkOrder.countDocuments({ orgId }),
    ]);
    console.log("Work Orders: ", workOrders);
    return NextResponse.json(
      {
        data: workOrders,
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

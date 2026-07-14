import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import WorkOrder from "@/models/WorkOrder";

export async function POST(req) {
  const body = await req.json();
  console.log("After passing data to constants");
  try {
    await connectDB();
    console.log("After connecting to db");

    const woToCreate = new WorkOrder({
      ...body,
      status: "Live",
      bgReceivedStatus: "Pending to Pay",
    });
    const createdWorkOrder = await WorkOrder.create(woToCreate);
    console.log(createdWorkOrder);
    return NextResponse.json({ message: "Success!" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
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

    const [workOrders, total] = await Promise.all([
      WorkOrder.find({ orgId }).skip(skip).limit(limit),
      WorkOrder.countDocuments({ orgId }),
    ]);
    console.log("Work Orders: ", workOrders);
    return NextResponse.json(
      {
        data: workOrders,
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

/**
 * Method to Update a work order
 * @returns M
 */
export async function PATCH(req) {
  const body = await req.json();
  try {
    await connectDB();
    const updatedWorkOrder = await WorkOrder.findOneAndUpdate(
      { woNo, orgId },
      { ...body },
      { new: true },
    );

    return NextResponse.json(
      { message: "Successfully saved Work Order !" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

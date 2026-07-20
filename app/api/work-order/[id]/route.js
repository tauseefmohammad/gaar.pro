import WorkOrder from "@/models/WorkOrder";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return NextResponse.json(
        { message: "Work order not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(workOrder);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching work order" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const updatedWorkOrder = await WorkOrder.findByIdAndUpdate(
      id,
      { ...body },
      { new: true },
    );
    if (!updatedWorkOrder) {
      return NextResponse.json(
        { message: "Work order not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Work Order updated!", data: updatedWorkOrder },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating work order" },
      { status: 500 },
    );
  }
}

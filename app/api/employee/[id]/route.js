import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Employee from "@/models/Employee";

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const { id } = await params;
  console.log("URL: ", searchParams.getAll);

  await connectDB();
  try {
    const employee = await Employee.findById(id);
    return NextResponse.json(employee, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Employee from "@/models/Employee";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const phone = searchParams.get("phone");

    const orgId = searchParams.get("orgId");

    const query = { orgId };

    if (phone) {
      query.phone = phone;
    }

    const employees = await Employee.findOne(query);
    console.log("Employees: ", employees);
    return NextResponse.json(
      {
        data: employees,
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

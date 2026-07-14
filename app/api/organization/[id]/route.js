import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Organization from "@/models/Organization";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  const org = await Organization.findById(id);
  if (!org) {
    return NextResponse.json(
      { message: "Organization not found" },
      { status: 404 },
    );
  }
  return NextResponse.json(org);
}

export async function PUT(req, { params }) {
  await connectDB();
  const body = await req.json();
  const { id } = await params;

  const existingOrg = await Organization.findById(id);
  console.log("existingOrg:", existingOrg);

  console.log("Update body:", body);
  const org = await Organization.findOneAndUpdate({ _id: id }, body, {
    new: true,
  });
  console.log("Updated Org:", org);
  return NextResponse.json({ message: "Updated Successfully" });
}

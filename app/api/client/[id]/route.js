import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Client from "@/models/Client";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  const client = await Client.findById(id);
  if (!client) {
    return NextResponse.json(
      { message: "Fund Request not found" },
      { status: 404 },
    );
  }
  return NextResponse.json(client);
}

export async function PUT(req, { params }) {
  await connectDB();
  const body = await req.json();
  const { id } = await params;

  
  console.log("Update body:", body);
  const client = await Client.findOneAndUpdate({ _id: id }, body, {
    new: true,
  });
  console.log("Updated Client:", client);
  
  return NextResponse.json({ message: "Updated Successfully!" });
}

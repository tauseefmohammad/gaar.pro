import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = await params;

  try {
    const body = await req.json();

    const updated = await User.findByIdAndUpdate(
      id,
      {
        role: body.role,
        status: body.status,
      },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "User updated successfully!", data: updated },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}
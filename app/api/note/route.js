import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import PaymentInfo from "@/models/PaymentInfo";
import ReceivableIno from "@/models/ReceivableInfo";
import FundRequest from "@/models/FundRequest";
import Config from "@/models/Config";
//import { getServerSession } from "next-auth";
//import { authOptions } from "@/lib/auth";
import Employee from "@/models/Employee";
import Note from "@/models/Note";
import { auth } from "@/lib/auth";

/**
 * Get all Payments Info of an organization
 */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get("entityId");
    const entityType = searchParams.get("entityType");
    const orgId = searchParams.get("orgId");

    const session = await auth();

    if (!session?.user) {
      console.log("No session found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const noteList = await Note.find({ orgId, entityType, entityId }).sort({
      createdAt: -1,
    });
    console.log("Fetched Notes: ", noteList);

    return NextResponse.json({ data: noteList }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const addedNote = await Note.create(body);

  console.log("Added Note: ", addedNote);

  return NextResponse.json("Note added successfully!", {
    status: 200,
  });
}

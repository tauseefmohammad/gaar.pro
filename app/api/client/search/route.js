import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Client from "@/models/Client";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const searchName = searchParams.get("q");

    console.log("Before search: ", searchName);
    const [clients, total] = await Promise.all([
      Client.find({
        client: { $regex: searchName, $options: "i" },
        orgId: orgId,
      }),
      Client.countDocuments({ orgId }),
    ]);
    console.log("Clients: ", clients);
    return NextResponse.json(
      {
        data: clients,
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

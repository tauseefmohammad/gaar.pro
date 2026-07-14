import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Client from "@/models/Client";

export async function POST(req) {
  const { client, website, emailId, phone, gstNo, state, orgId } =
    await req.json();
  console.log("After passing data to constants");
  if (client === "") {
    return NextResponse.json("Client can't be empty");
  }
  const clientShort = client?.slice(0, 4).toUpperCase() || "CLNT";
  try {
    await connectDB();
    //console.log("After connecting to db");
    //const clientNameWithNoSpaces = client.replace(/\s/g,'');
    const recordCount = await Client.countDocuments({ orgId });
    //console.log("Record Count: ", recordCount);
    const clientToCreate = new Client({
      client,
      clientId: clientShort + recordCount,
      website,
      emailId,
      phone,
      gstNo,
      state,
      orgId,
    });
    const createdClient = await Client.create(clientToCreate);
    console.log(createdClient);
    return NextResponse.json({ message: "Success!" }, { status: 200 });
  } catch (err) {
    console.error("Error creating client: ", err);
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

    const [clients, total] = await Promise.all([
      Client.find({ orgId }).skip(skip).limit(limit),
      Client.countDocuments({ orgId }),
    ]);
    console.log("Clients: ", clients);
    return NextResponse.json(
      {
        data: clients,
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
 * Method to Update a client
 * @returns M
 */
export async function PATCH(req) {
  const { client, website, emailId, phone, gstNo, orgId } = await req.json();
  try {
    return NextResponse.json(
      { message: "Successfully saved Client!" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import SystemList from "@/models/SystemList";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const listName = searchParams.get("listName");
    //For future use when we want to fetch lists for different orgs. Currently, it will fetch the same list as orgId is not being used in backend.
    // const orgId = searchParams.get('orgId');
    const orgId = "INTR"; // Placeholder - replace with actual orgId logic
    console.log("List Name: ", listName);
    console.log("Org Id: ", orgId);

    const systemLists = await Promise.all([
      SystemList.find({ listName: listName, orgId: orgId }),
    ]);
    return NextResponse.json(
      {
        data: systemLists,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log("Server Error: ", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const orgId = body.orgId;
    const listName = body.listName;
    const listItem = body.listItem;
    console.log("Body: ", body);
    const list = await SystemList.findOne({
      listName: listName,
      listItem: listItem,
      orgId: orgId,
    });
    if (list) {
      return NextResponse.json(
        { message: "System List already exists!" },
        { status: 400 },
      );
    }
    const systemList = await SystemList.create(body);
    return NextResponse.json(
      { message: "System List created successfully!" },
      { status: 200 },
    );
  } catch (err) {
    console.log("Server Error: ", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

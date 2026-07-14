// /api/payment-to/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Employee from "@/models/Employee";
import Client from "@/models/Client";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const orgId = searchParams.get("orgId");

    if (!q) {
      return NextResponse.json({ data: [] });
    }

    const regex = new RegExp(q, "i");

    const [employees, clients] = await Promise.all([
      Employee.find({
        orgId,
        name: regex,
      })
        .limit(10)
        .lean(),

      Client.find({
        orgId,
        client: regex,
      })
        .limit(10)
        .lean(),
    ]);

    const results = [
      ...employees.map((e) => ({
        _id: e._id,
        name: e.name,
        type: "Employee",
      })),

      ...clients.map((c) => ({
        _id: c._id,
        name: c.client,
        type: "Client",
      })),
    ];

    return NextResponse.json({
      data: results,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message,
      },
      { status: 500 },
    );
  }
}

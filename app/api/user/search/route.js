import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import Employee from "@/models/Employee"

export async function GET(req) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""

  const users = await Employee.find({
    name: { $regex: search, $options: "i" }
  }).limit(10)

  return NextResponse.json(users)
}
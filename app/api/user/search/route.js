import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import Employee from "@/models/Employee"

export async function GET(req) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const orgId = searchParams.get("orgId")
  const page = parseInt(searchParams.get("page")) || 1
  const limit = parseInt(searchParams.get("limit")) || 10
  const skip = (page - 1) * limit

  const query = {
  name: { $regex: search, $options: "i" },
  ...(orgId ? { orgId } : {}),
  }

  const [users, total] = await Promise.all([
    Employee.find(query).skip(skip).limit(limit),
    Employee.countDocuments(query),
  ])

  return NextResponse.json({ data: users, total })
}
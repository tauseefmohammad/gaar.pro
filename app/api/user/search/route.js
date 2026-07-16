import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import Employee from "@/models/Employee"
import User from "@/models/User"

export async function GET(req) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const orgId = searchParams.get("orgId")
  const page = parseInt(searchParams.get("page")) || 1
  const limit = parseInt(searchParams.get("limit")) || 10
  const skip = (page - 1) * limit

  const query = {
    ...(orgId ? { orgId } : {}),
    ...(search
      ? {
          $or: [
            { employeeName: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
          ],
        }
      : {}),
  }

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit),
    User.countDocuments(query),
  ])

  return NextResponse.json({ data: users, total })
}
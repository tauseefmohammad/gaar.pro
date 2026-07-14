import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { username, password } = await req.json();
  // console.log("Username: ", username);
  // console.log("password: ", password);
  try {
    await connectDB();
    //console.log("After DB Connect");
    const user = await User.findOne({ username });
    //console.log("After User fetch", user);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }
    //console.log("Before comparing password");
    const isValid = await bcrypt.compare(password, user.password);
    //console.log("After validating password");
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      {
        message: "Login Successful",
        username: user.username,
        orgId: user.orgId,
        role: user.role,
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

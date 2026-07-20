import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Employee from "@/models/Employee";
import fs from "fs";
import path from "path";
import { EMPLOYEE_UPLOAD_DIR } from "@/lib/uploadConfig";

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const { id } = await params;
  console.log("URL: ", searchParams.getAll);

  await connectDB();
  try {
    const employee = await Employee.findById(id);
    return NextResponse.json(employee, { status: 200 });
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
    const formData = await req.formData();

    const updateData = {
      name: formData.get("name"),
      empId: formData.get("empId"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      designation: formData.get("designation"),
      isManager: formData.get("isManager") === "true",
      managerName: formData.get("managerName"),
    };

    const file = formData.get("photo");
    if (file && typeof file !== "string" && file.size > 0) {
      if (!fs.existsSync(EMPLOYEE_UPLOAD_DIR)) {
        fs.mkdirSync(EMPLOYEE_UPLOAD_DIR, { recursive: true });
      }
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(EMPLOYEE_UPLOAD_DIR, fileName);
      const bytes = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(bytes));
      updateData.photo = fileName;
    }

    const updated = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Employee updated!", data: updated },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}
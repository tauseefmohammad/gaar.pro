import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Employee from "@/models/Employee";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { EMPLOYEE_UPLOAD_DIR } from "@/lib/uploadConfig";

/**
 * Get all employees of an organization
 */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;
    const orgId = searchParams.get("orgId");

    const [employees, total] = await Promise.all([
      Employee.find({ orgId: orgId }).skip(skip).limit(limit),
      Employee.countDocuments(),
    ]);

    return NextResponse.json(
      {
        data: employees,
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

export async function POST(req) {
  await connectDB();
  try {
    const formData = await req.formData();
    //console.log("Form Data: ", formData);
    const file = formData.get("photo");

    //console.log("File Data: ", file);
    //let fileName = ""
    let fileName = "default-avatar.jpg"; // ✅ fallback default
    if (file && typeof file !== "string") {
      if (!fs.existsSync(EMPLOYEE_UPLOAD_DIR)) {
        fs.mkdirSync(EMPLOYEE_UPLOAD_DIR, { recursive: true });
      }
      //console.log("File path: ", EMPLOYEE_UPLOAD_DIR);
      const originalName = file.name || "upload.jpg";
      fileName = `${Date.now()}-${originalName}`;
      const filePath = path.join(EMPLOYEE_UPLOAD_DIR, fileName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      fs.writeFileSync(filePath, buffer);

      //console.log("File uploaded:", fileName);
    } else {
      //console.log("No file uploaded → using default avatar");
    }
    //console.log("File saved successfully: ", fileName);
    //console.log("Creating employee with data: ");
    const emp = await Employee.create({
      name: formData.get("name"),
      empId: formData.get("employeeId"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      designation: formData.get("designation"),
      isManager: formData.get("isManager") === "true",
      managerName: formData.get("managerName"),
      orgId: formData.get("orgId"),
      photo: fileName, // store only filename
    });
    if (emp) {
      //console.log("Inside if employee data exist : ");
      const hashedPws = await bcrypt.hash("emp@1", 10);
      let roleName = "USER";
      if (emp.isManager) {
        roleName = "MANAGER";
      }
      if (emp.designation === "Director") {
        roleName = "ADMIN";
      }
      if (emp.designation === "ACCOUNTANT") {
        roleName = "ACCOUNTANT";
      }
      //console.log("Before creating new user....Role Name: ", roleName);
      const newUser = new User({
        username: emp.phone,
        password: hashedPws,
        employeeName: emp.name,
        status: "Active",
        role: roleName,
        isFirstLogin: true,
        empId: emp.empId,
        orgId: emp.orgId,
      });
      //console.log("After creating new user Data............ ");
      const createdUser = await User.create(newUser);
      //console.log("Created User: " + createdUser);
    }

    return NextResponse.json("Employee created successfully", { status: 200 });
  } catch (err) {
    console.error("Error in employee creation: ", err);
    return NextResponse.json(
      { message: "Failed to create employee" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  await connectDB();

  const { id } = params;
  const formData = await req.formData();

  const updateData = {
    name: formData.get("name"),
    employeeId: formData.get("employeeId"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    designation: formData.get("designation"),
    isManager: formData.get("isManager") === "true",
    managerName: formData.get("managerName"),
  };

  const file = formData.get("photo");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/uploads/employees");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const fullPath = path.join(uploadDir, fileName);

    fs.writeFileSync(fullPath, buffer);

    updateData.photo = `/uploads/employees/${fileName}`;
  }

  const updated = await Employee.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  return NextResponse.json(updated);
}

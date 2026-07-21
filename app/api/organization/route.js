import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import User from "@/models/User";
import Organization from "@/models/Organization";
import connectDB from "@/lib/mongoose";

export async function POST(req) {
  //const body = await req.json();
  // await connectDB();
  const {
    orgName,
    contactName,
    contactDesignation,
    phone,
    email,
    website,
    address,
    city,
    state,
    country,
    pincode,
    pan,
    gstNo,
    industryType,
    modeOfRegistration,
    orgType,
    password,
    confirmPassword,
  } = await req.json();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (
    !orgName ||
    !phone ||
    !email ||
    !address ||
    !city ||
    !state ||
    !country ||
    !password ||
    !confirmPassword
  ) {
    return NextResponse.json(
      { message: "Some required fields are missing" },
      { status: 400 },
    );
  }
  if (!isValidEmail) {
    return NextResponse.json(
      { message: "Email is not valied" },
      { status: 400 },
    );
  }
  if (confirmPassword !== password) {
    return NextResponse.json(
      { message: "Password and Confirm Password do not match." },
      { status: 400 },
    );
  }

  try {
    console.log("Inside try block....");
    await connectDB();
    console.log("After establishing the connection");
    /**
     * check if the an organization is created with the same phone number, email or name.
     * If exists do now allow the registration
     */
    const existingOrganizationEmail = await Organization.findOne({ email });
    const existingOrganizationPhone = await Organization.findOne({ phone });
    const existingOrganization = await Organization.findOne({ orgName });
    if (
      existingOrganization ||
      existingOrganizationPhone ||
      existingOrganization
    ) {
      return NextResponse.json(
        {
          message:
            "Organization with given phone or email or Organization Name exists!",
        },
        { status: 400 },
      );
    }

    const hashedPws = await bcrypt.hash(password, 10);
    const docCount = (await Organization.countDocuments()) + 1;
    const orgId = "ORG" + docCount;
    const status = "Active";
    const regDate = new Date();
    console.log("Before creating new organization ");
    const newOrganization = new Organization({
      orgName,
      orgId,
      contactName,
      contactDesignation,
      phone,
      email,
      website,
      address,
      city,
      state,
      country,
      pincode,
      status,
      pan,
      gstNo,
      industryType,
      modeOfRegistration,
      orgType,
      regDate,
    });

    console.log("Before saving the new organization: ", newOrganization);
    const createdOrg = await Organization.create(newOrganization);
    //const newOrgCreated =
    console.log("After saving the new organization");

    if (createdOrg) {
      const newOrgUser = new User({
        username: phone,
        password: hashedPws,
        employeeName: contactName,
        status: "Active",
        role: "ORG_USER",
        isFirstLogin: true,
        orgId: createdOrg.orgId,
      });
      const newOrgUserCretaed = await User.create(newOrgUser);
      if (newOrgUserCretaed) {
        return NextResponse.json(
          { message: "Organization registered succussfully!" },
          { status: 201 },
        );
      } else {
        await createdOrg.delete();
        return NextResponse.json(
          { message: "Failed to Register Organization" },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { message: "Failed to Register Organization" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { orgName: { $regex: search, $options: "i" } },
            { orgId: { $regex: search, $options: "i" } },
            { contactName: { $regex: search, $options: "i" } },
            { contactDesignation: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { website: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } },
            { district: { $regex: search, $options: "i" } },
            { state: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
            { pincode: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
            { pan: { $regex: search, $options: "i" } },
            { gstNo: { $regex: search, $options: "i" } },
            { industryType: { $regex: search, $options: "i" } },
            { modeOfRegistration: { $regex: search, $options: "i" } },
            { orgType: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [orgs, total] = await Promise.all([
      Organization.find(query).skip(skip).limit(limit),
      Organization.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        data: orgs,
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
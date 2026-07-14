import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";

const OrganizationSchema = new mongoose.Schema(
  {
    orgName: {
      type: String,
      require: true,
      unique: true,
    },
    orgId: {
      type: String,
      require: true,
      unique: true,
    },
    contactName: {
      type: String,
      require: true,
    },
    contactDesignation: {
      type: String,
      require: true,
    },
    phone: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    website: {
      type: String,
      require: true,
      unique: true,
    },
    address: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    pincode: {
      type: String,
    },
    status: {
      type: String,
    },
    pan: {
      type: String,
    },
    gstNo: {
      type: String,
    },
    industryType: {
      type: String,
    },
    modeOfRegistration: {
      type: String,
    },
    orgType: {
      type: String,
    },
    regDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Organization ||
  mongoose.model("Organization", OrganizationSchema);

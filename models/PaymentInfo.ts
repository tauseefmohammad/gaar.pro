import mongoose from "mongoose";

const PaymentInfoSchema = new mongoose.Schema(
  {
    paymentType: {
      type: String,
      require: true,
    },
    frType: {
      type: String,
      require: true,
    },
    woNo: {
      type: String,
    },
    woTitle: {
      type: String,
    },
    tenderNo: {
      type: String,
    },
    tenderDesc: {
      type: String,
    },
    description: {
      type: String,
      require: true,
    },
    requestAmount: {
      type: Number,
      require: true,
    },
    paidAmount: {
      type: Number,
      require: true,
    },
    balanceAmount: {
      type: Number,
      require: true,
    },
    vertical: {
      type: String,
    },
    subVertical: {
      type: String,
      require: true,
    },
    paymentTo: {
      type: String,
      require: true,
    },
    requestedBy: {
      type: String,
      require: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: String,
      require: true,
    },
    approvedDate: {
      type: Date,
    },
    isAuthorized: {
      type: Boolean,
      default: false,
    },
    authorizedBy: {
      type: String,
    },
    authorizationDate: {
      type: Date,
    },
    status: {
      type: String,
      require: true,
    },
    requestedDate: {
      type: Date,
    },
    paymentPriority: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
    paidDate: {
      type: Date,
    },
    requestNo: {
      type: String,
    },
    state: {
      type: String,
    },
    requestedById: {
      type: String,
    },
    approvedById: {
      type: String,
    },
    authorizedById: {
      type: String,
    },
    orgId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.PaymentInfo ||
  mongoose.model("PaymentInfo", PaymentInfoSchema);

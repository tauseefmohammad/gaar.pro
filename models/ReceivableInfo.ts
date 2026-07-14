import mongoose from "mongoose";

const ReceivableInfoSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    receivableAmount: {
      type: Number,
      require: true,
    },
    balanceReceivableAmount: {
      type: Number,
      require: true,
    },
    receivedAmount: {
      type: Number,
      require: true,
    },
    woNo: {
      type: String,
    },
    woTitle: {
      type: String,
    },
    vertical: {
      type: String,
    },
    subVertical: {
      type: String,
      require: true,
    },
    paymentFrom: {
      type: String,
      require: true,
    },
    owner: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      require: true,
    },
    receivedDate: {
      type: Date,
    },
    invoiceNo: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
    tenderNo: {
      type: String,
    },
    tenderDesc: {
      type: String,
    },
    state: {
      type: String,
    },
    orgId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.ReceivableInfo ||
  mongoose.model("ReceivableInfo", ReceivableInfoSchema);

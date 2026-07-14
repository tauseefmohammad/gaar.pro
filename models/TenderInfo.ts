import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";

const TenderInfoSchema = new mongoose.Schema(
  {
    tenderNo: {
      type: String,
      require: true,
      unique: true,
    },
    description: {
      type: String,
    },
    tenderDate: {
      type: Date,
    },
    tenderType: {
      type: String,
    },
    preBidMeetingDate: {
      type: Date,
    },
    /** This is important date as this is the date on or before we should submit the tender */
    tenderSubmissionLastDate: {
      type: Date,
    },
    tenderOpeningDate: {
      type: Date,
    },
    /**
     * status field is used to determine the status of our tender. Whether we Won, Disqualified,
     * Waiting for Bid to Open, Cancelled, Lost.
     */
    status: {
      type: String,
    },
    /*  position field is used to determine the position of our standing in tender bidding. L1, L2, L3 etc. 
        It is used to know our position. Where did we end up? 
    */
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    vertical: {
      type: String,
    },
    subVertical: {
      type: String,
    },
    position: {
      type: String,
    },
    emdAmount: {
      type: Number,
    },
    documentFee: {
      type: Number,
    },
    transactionFee: {
      type: Number,
    },
    corpusFund: {
      type: Number,
    },
    bgAmount: {
      type: Number,
    },
    emdPaymentDate: {
      type: Date,
    },
    documentFeePaymentDate: {
      type: Date,
    },
    transactionFeePaymentDate: {
      type: Date,
    },
    corpusFundPaymentDate: {
      type: Date,
    },
    bgPaymentDate: {
      type: Date,
    },
    emdPaymentStatus: {
      type: String,
    },
    documentFeePaymentStatus: {
      type: String,
    },
    transactionFeePaymentStatus: {
      type: String,
    },
    corpusFundPaymentStatus: {
      type: String,
    },
    bgPaymentStatus: {
      type: String,
    },
    bgRefundDate: {
      type: Date,
    },
    emdRefundDate: {
      type: Date,
    },
    emdRefundStatus: {
      type: String,
    },
    bgRefundStatus: {
      type: String,
    },
    tenderingDepartment: {
      type: String,
    },
    client: {
      type: String,
    },
    tenderValue: {
      type: Number,
    },
    owner: {
      type: String,
    },
    remarks: {
      type: String,
    },
    isMAFRequired: {
      type: Boolean,
    },
    clientId: {
      type: String,
    },
    orgId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

TenderInfoSchema.index({
  orgId: 1,
  tenderNo: 1,
});
TenderInfoSchema.index({
  orgId: 1,
  description: 1,
});
TenderInfoSchema.index({
  orgId: 1,
  client: 1,
});
TenderInfoSchema.index({
  orgId: 1,
  owner: 1,
});
TenderInfoSchema.index({
  orgId: 1,
  tenderingDepartment: 1,
});

export default mongoose.models.TenderInfo ||
  mongoose.model("TenderInfo", TenderInfoSchema);

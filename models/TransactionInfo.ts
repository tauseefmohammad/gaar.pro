import mongoose from "mongoose";

const TransactionInfoSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      require: true,
    },
    txnDate: {
      type: Date,
      require: true,
    },
    txnType: {
      type: String,
    },
    paidTo: {
      type: String,
      require: true,
    },
    entityType: {
      type: String,
    },
    entityId: {
      type: String,
    },
    txnNote: {
      type: String,
    },
    orgId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.TransactionInfo ||
  mongoose.model("TransactionInfo", TransactionInfoSchema);

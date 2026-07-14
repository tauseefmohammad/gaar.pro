import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      require: true,
    },
    notes: {
      type: String,
      require: true,
    },
    loggedBy: {
      type: String,
    },
    username: {
      type: String,
    },
    entityType: {
      type: String,
      require: true,
    },
    entityId: {
      type: String,
      require: true,
    },
    orgId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);

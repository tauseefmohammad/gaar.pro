import mongoose from "mongoose";

const SystemListSchema = new mongoose.Schema(
    {
        listName: {
            type: String,
            required: true
        },
        listItem: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        orgId:{
            type: String
        }
    },
    {timestamps: true}
);
SystemListSchema.index({ listName: 1, listItem: 1,orgId: 1 }, { unique: true });
export default mongoose.models.SystemList || mongoose.model("SystemList", SystemListSchema);
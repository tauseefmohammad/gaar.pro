import mongoose from "mongoose"

const ActivityInfoSchema = new mongoose.Schema(
    {
        date:{
            type: Date,
            require: true
        },
        activity:{
            type: String,
            require: true
        },
        loggedBy:{
            type: String,
        },
        username:{
            type: String
        },
        orgId:{
            type: String,
            require: true
        },        

    },
    {timestamps: true}
)

export default mongoose.models.ActivityInfo || mongoose.model("ActivityInfo", ActivityInfoSchema)
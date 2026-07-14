import mongoose from "mongoose"

const ConfigSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            require: true,
            unique: true
        },
        value:{
            type: String,
            require: true,
        },
        orgId:{
            type: String,
            require: true
        }
    },
    {timestamps: true}
)

export default mongoose.models.Config || mongoose.model("Config", ConfigSchema)
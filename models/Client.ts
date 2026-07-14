import mongoose from "mongoose"
import { StringDecoder } from "string_decoder"

const ClientSchema = new mongoose.Schema(
    {
        client:{
            type: String,
            require: true
        },
        clientId:{
            type:String,
            require: true
        },
        website:{
            type: String
        },
        emailId:{
            type: String
        },
        phone:{
            type: String
        },
        gstNo:{
            type: String
        },
        state:{
            type: String,
            require: true
        },
        orgId:{
            type: String,
            require: true
        }
    },
    {timestamps: true}
)

export default mongoose.models.Client || mongoose.model("Client", ClientSchema)
import mongoose from "mongoose";

const CountryInfoSchema = new mongoose.Schema(
    {
        mandal: {
            type: String
        },
        district: {
            type: String
        },
        state: {
            type: String
        },
        shortName:{
            type: String
        },
        country: {
            type: String
        },
    },
    { timestamps: true }

);

export default mongoose.models.CountryInfo || mongoose.model("CountryInfo", CountryInfoSchema);
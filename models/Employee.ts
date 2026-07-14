import mongoose from "mongoose"

const EmployeeSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            require: true
        },
        empId:{
            type: String,
            require: true
        },
        photo:{
            type: String,
        },
        phone:{
            type: String,
            require: true
        },
        email:{
            type: String,
        },
        
        designation:{
            type: String,
            require: true
        },
        isManager:{
           type: Boolean
        },
        status:{
            type: String,
            default: "Active"
        },
        managerName: {
            type: String,
        },
        managerObjId: {
            type: String
        },
        orgId:{
            type: String,
            require: true
        },        

    },
    {timestamps: true}
)

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema)
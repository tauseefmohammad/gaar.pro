import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import SystemList from "@/models/SystemList";
import User from "@/models/User";
import Organization from "@/models/Organization";
import bcrypt from "bcryptjs";

export async function POST(req){
    try{
        await connectDB();

        const existingOrg = await Organization.findOne({orgId: "INTR"});
        if(existingOrg){
            return NextResponse.json({message: "System already initialized!"}, {status:400})
        }
       
        const intOrg = new Organization({
            orgName: "INTR",
            orgId: "INTR",
            contactName: "Internal",
            contactDesignation: null,
            phone: null,
            email: null,
            website: null,
            address: null,
            city: null,
            mandal: null, 
            district:null,
            state: null,
            country: null,
            pincode: null,
            pan: null,    
            gstNo: null,
            industryType: "INTR",
            modeOfRegistration: null,
            orgType: "INTR",
        });
        const createdIntOrg = await Organization.create(intOrg);
         const hashedPws = await bcrypt.hash("sysadmin@gaar", 10);

        const initUser = new User({
            username: "sysadmin",
            password: hashedPws,
            empName: "System Admin",
            status: "Active",           
            role: "SYS_ADMIN",
            isFirstLogin: false,
            orgId: "INTR",
        });
        const createdInitUser = await User.create(initUser);

        return NextResponse.json({message: "System initialized successfully!"}, {status:200})
    }catch(err){
        console.error("Initialization Error: ", err);
        return NextResponse.json({message: "Something went wrong during initialization!"},{status:500})
    }
}
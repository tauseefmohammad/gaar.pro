import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Employee from '@/models/Employee';

export async function GET(req){
    const {searchParams} = new URL(req.url);
    console.log("URL: ", searchParams.getAll);
    const empId = searchParams.get("empId")
    const orgId = searchParams.get("orgId")

    await connectDB()
    try{
        const employee = await Employee.findOne({
            empId,
            orgId,
        })
        return NextResponse.json(employee,{status: 200})
    }catch(err){
        return NextResponse.json({message: "Something went wrong!"},{status: 500})
    }
}
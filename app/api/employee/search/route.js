import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Employee from "@/models/Employee";


export async function GET(req){
    try{
        await connectDB();
        const {searchParams} = new URL(req.url);
        
        const page = Number(searchParams.get("page") || 1)
        const limit = Number(searchParams.get("limit") || 10)
        const search = searchParams.get("search") || ""
        const orgId = searchParams.get('orgId');
        
        const query = { orgId }

        if (search) {
            query.$or = [
            { name: { $regex: search, $options: "i" } },
            { employeeId: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
            ]
        }
        const total = await Employee.countDocuments(query);
        const employees = await Employee.find(query);
    
        console.log("Employees: ", employees);
        return NextResponse.json({
            data: employees,
            page,
            limit, 
            total,
            totalPages: Math.ceil(total/limit)
        }, {status:200});
    }catch(err){
        return NextResponse.json({message: "Something went wrong!"},{status:500});
    }
}
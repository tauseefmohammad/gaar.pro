import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from '@/models/User';
import bcrypt from "bcryptjs";

/**
 * Get all employees of an organization
 */
export async function GET(req){
    try{
        await connectDB();
        
        const {searchParams} = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page-1) * limit;
        const orgId = searchParams.get('orgId');
                
        const [employees, total] = await Promise.all([
            Employee.find({orgId: orgId}).skip(skip).limit(limit),
            Employee.countDocuments()
        ]);

        return NextResponse.json({
            data: employees,
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit)

        },{status:200})

    }catch(err){
        return NextResponse.json({message:"Something went wrong!"},{status:500} )
    }

}

export async function POST(req){
    try{
        await connectDB();
        const body = await req.json();
        console.log("User Create Data: ", body);
        const orgId = body.orgId;
        const hashedPws = await bcrypt.hash("emp@1", 10);
        
        const newUser = new User({
                             username: body.phone,
                             password: hashedPws,
                             status: "Active",
                             role: body.role,                            
                             isFirstLogin: true,
                             orgId: orgId,
                        })
        const createdUser = await User.create(newUser);
        console.log("Created User: " + createdUser);
        
        return NextResponse.json({message: "User created successfully!"}, {status:200})
    }catch(err){
        return NextResponse.json({message: "Something went wrong!"},{status:500})
    } 
}
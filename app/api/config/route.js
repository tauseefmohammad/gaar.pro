import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Config from '@/models/Config';


export async function GET(req){
    try{
        await connectDB();
        const {searchParams} = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page-1) * limit;
        const orgId = searchParams.get('orgId');
                
        const [configs, total] = await Promise.all([
            Config.find({orgId: orgId}).skip(skip).limit(limit),
            Config.countDocuments()
        ]);
        return NextResponse.json({ 
            data: employees,
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit)},
            {"status": 200})
    }catch(err){
        return NextResponse.json({"message": "Something went wrong!"},{"status": 500})
    }

}

export async function POST(req){
    try{
        await connectDB();
        const body = await req.json();
        const config = await Config.create(body);
        return NextResponse.json({"message": "Configuration item successfully saved"},{"status": 200})
    }catch(err){
        return NextResponse.json({"message": "Something went wrong!"},{"status": 200})
    }
}
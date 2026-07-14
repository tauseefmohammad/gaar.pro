import { NextResponse } from "next/server";
import {connectDB} from '@/lib/mongoose';
import CountryInfo from '@/models/CountryInfo';

export async function GET(req){
    try{
        await connectDB();

        const {searchParams} = new URL(req.url);
        const country = searchParams.get('country');
        let filter = {};
        filter.country = country;
        
        const countryStates = await CountryInfo.distinct("state",{country});

        const states = countryStates.map((state,index)=>{
            return {
                id: index+1,
                state
            };
        })

 /*       const states = countryStates.map((state)=>{
            return {
                state
            };
        })
*/
        return NextResponse.json(states);

    }catch(err){
        console.log("API Pagination error: ", err);
        return NextResponse.json({error: "Server error"},{status: 500});
    }
}
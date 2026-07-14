import { NextResponse } from "next/server";
import {connectDB} from '@/lib/mongoose';
import CountryInfo from '@/models/CountryInfo';

export async function GET(req){
    try{
        await connectDB();

        const {searchParams} = new URL(req.url);
        const country = searchParams.get('country');
        const state = searchParams.get('state');
        let filter = {};
        filter.country = country;
        
        const countryStateDistrict = await CountryInfo.distinct("district",{country,state});

        const districts = countryStateDistrict.map((district,index)=>{
            return {
                id: index+1,
                district
            };
        })

 /*       const districts = countryStateDistrict.map((district)=>{
            return {
               district
            };
        })
*/
        return NextResponse.json(districts);

    }catch(err){
        console.log("API Pagination error: ", err);
        return NextResponse.json({error: "Server error"},{status: 500});
    }
}
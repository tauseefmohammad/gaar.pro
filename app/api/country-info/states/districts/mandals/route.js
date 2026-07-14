import { NextResponse } from "next/server";
import {connectDB} from '@/lib/mongoose';
import CountryInfo from '@/models/CountryInfo';

export async function GET(req){
    try{
        await connectDB();

        const {searchParams} = new URL(req.url);
        const country = searchParams.get('country');
        const state = searchParams.get('state');
        const district = searchParams.get('district');
        let filter = {};
        filter.country = country;
        
        const countryStateDistrictMandals = await CountryInfo.distinct("mandal",{country,state,district});

       const mandals = countryStateDistrictMandals.map((mandal,index)=>{
            return {
                id: index+1,
                mandal
            };
        })
      /*     const mandals = countryStateDistrictMandals.map((mandal)=>{
            return {
                mandal
            };
        })
    */
        return NextResponse.json(mandals);

    }catch(err){
        console.log("API Pagination error: ", err);
        return NextResponse.json({error: "Server error"},{status: 500});
    }
}
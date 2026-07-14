import { NextResponse } from "next/server";
import {connectDB} from '@/lib/mongoose';
import CountryInfo from '@/models/CountryInfo';

export async function GET(){
    try{
        await connectDB();
        console.log("Country Info API: After Connecting to DB ");
        const countryNames = await CountryInfo.distinct('country');
       // const countryNames = await CountryInfo.find();
        console.log("Country Names: ", countryNames);
     const countries = countryNames.map((country, index) =>{
             console.log("Country Name: ", country);
             console.log("Index: ", index);
            return{
                id: index + 1,
                country,                
            };
        });
        
    /*      const countries = countryNames.map((country) =>{
             console.log("Country Name: ", country);
            return{
                country               
            };
        });
*/
        return NextResponse.json(countries);

    }catch(err){
        console.log("API Pagination error: ", err);
        return NextResponse.json({error: "Server error"},{status: 500});
    }
}


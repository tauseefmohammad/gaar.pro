import React from 'react'
import SideNav from '../_components/SideNav';
import NavBar from '../_components/NavBar';


const layout = ({children} : {children: React.ReactNode}) => {
  return (
    
       <div className="h-screen flex">
        <div className="w-[16%] md:w-[8%] lg:w-[16%] xl:w-[14%] bg-cyan-900"> 
          <SideNav/>
          
        </div>
        <div className="w-[84%] md:w-[92%] lg:w-[84%] xl:w-[86%] overflow-scroll">
          <NavBar/>
          {children}
        </div>
      </div>   

  );
}

export default layout
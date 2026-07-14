"use client";
import { Bell, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const NavBar = () => {
  const { data: session } = useSession();

  const username = session?.user?.username;
  let [employeeData, setEmployeeData] = useState<any>(null);

  useEffect(() => {
    if (!session?.user?.orgId) return;
    console.log(
      "Fetching employee data for orgId:",
      session.user.orgId,
      "and username:",
      username,
    );
    fetch(
      `/api/employee/by-phone?orgId=${session.user.orgId}&phone=${username}`,
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Employee API response:", data);
        if (data) {
          setEmployeeData(data);

          console.log("Employee data:", data);
        }
      });
  }, [session?.user?.orgId, username]);

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* Leftside */}
      <div className="flex justify-between items-center gap-5"></div>
      {/*Right side*/}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9">
              {employeeData?.photo ? (
                <img
                  src={`/api/files/employees/${employeeData.photo}`}
                  alt="User"
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm">
                  {employeeData?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;

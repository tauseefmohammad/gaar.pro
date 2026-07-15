"use client";
import { Bell, Menu, LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";


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
  const router = useRouter();

const handleLogout = async () => {
  await signOut({ redirect: false });
  router.push("/");
};

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* Leftside */}
      <div className="flex justify-between items-center gap-5"></div>
      {/*Right side*/}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 rounded-full h-9 w-9">
                <div className="w-9 h-9 cursor-pointer">
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
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {employeeData?.name || username || "Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              

              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-md font-semibold text-cyan-900 focus:text-red-600 ">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default NavBar;

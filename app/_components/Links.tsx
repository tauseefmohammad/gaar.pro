"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  IndianRupee,
  FileText,
  Users,
  User,
  Briefcase,
  Building2,
  Settings,
} from "lucide-react";

export const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/dashboard" },
  { icon: ReceiptText, label: "Fund Requests", route: "/fund-request" },
  { icon: IndianRupee, label: "Payments", route: "/payments" },
  { icon: FileText, label: "Receivables", route: "/receivables" },
  { icon: Users, label: "Employees", route: "/employees" },
  { icon: User, label: "Clients", route: "/clients" },
  { icon: Briefcase, label: "Work Orders", route: "/work-orders" },
  { icon: FileText, label: "Tenders", route: "/tenders" },
  { icon: Building2, label: "Organizations", route: "/organizations" },
  { icon: Users, label: "Users", route: "/users" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

const Links = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;

  const filteredMenu = menuItems.filter((item) => {
    if (!role) return false;

    // Non privileged roles → only Fund Request
    const isPrivileged = [
      "ADMIN",
      "SYS_ADMIN",
      "ACCOUNTS",
      "ORG_USER",
    ].includes(role);

    if (!isPrivileged) {
      return ["/dashboard", "/fund-request"].includes(item.route);
    }

    // Organizations only for SYS_ADMIN
    if (item.route === "/organizations" && role !== "SYS_ADMIN") {
      return false;
    }

    // Users & Settings only for ORG_USER
    if (["/users", "/settings"].includes(item.route) && role !== "ORG_USER") {
      return false;
    }

    return true;
  });

  return (
    <div>
      {filteredMenu.map((item) => {
        const isActive =
          pathname === item.route || pathname.startsWith(`${item.route}/`);
        return (
          <div key={item.label} className="flex flex-col gap-4 ml-1">
            <Link
              href={item.route}
              className={`cursor-pointer flex items-center justify-center lg:justify-start gap-4 py-4 px-3 transition-colors ${
                isActive
                  ? "bg-cyan-100 text-black font-semibold rounded-md"
                  : "text-white hover:bg-cyan-100 hover:text-black rounded-md"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Links;

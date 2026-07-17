"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import EmployeeSearch from "@/app/_components/EmployeeSearch";

export default function CreateEmployee() {
  const router = useRouter();
  const orgId = useSession().data?.user?.orgId || "";

  const [form, setForm] = useState<any>(() => ({
    name: "",
    employeeId: "",
    phone: "",
    email: "",
    designation: "",
    isManager: false,
    managerId: "",
    managerName: "",
  }));

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [designations, setDesignations] = useState<any[]>([]);
  const [managerSearch, setManagerSearch] = useState("");
  const [managerList, setManagerList] = useState<any[]>([]);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch Designations
  useEffect(() => {
    //if (!orgId) return
    const fetchDesignation = async () => {
      const orgId = localStorage.getItem("orgId");
      

      const res = await fetch(
        `/api/system-list?listName=Designation&orgId=${orgId}`,
      );
      const data = await res.json();
      console.log("Fetched Designations: ", data);

      setDesignations(
        Array.isArray(data?.data?.[0]) ? data.data[0] : []);
    };

    fetchDesignation();
  }, [orgId]);

  // 🔹 Photo Preview
  useEffect(() => {
    if (!photo) {
      setPhotoPreview("");
      return;
    }

    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  useEffect(() => {

    const delay = setTimeout(() => {
      if (managerSearch.length >= 3) {
        searchManager(managerSearch);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [managerSearch]);

  // 🔹 Manager Search
  const searchManager = async (val: string) => {
    //const tempOrgId = localStorage.getItem("orgId");
    
    if (selectedManager) {
      setSelectedManager(null);
    }
    setManagerSearch(val);

    if (val.length < 3) {
      setManagerList([]);
      return;
    }

    const res = await fetch(`/api/user/search?search=${val}&orgId=${orgId}`,);
    const data = await res.json();

    setManagerList(Array.isArray(data?.data) ? data.data : []);
  };

  // 🔹 Submit
  const handleSubmit = async () => {
    /*if (!orgId) {
      console.error("No orgId found in session — aborting submit")
      return
    }*/
    setLoading(true);

    try {
      //const orgId = localStorage.getItem("orgId");

      const formData = new FormData();

      Object.entries(form || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });

      formData.append("orgId", orgId);
      if (photo) formData.append("photo", photo);

      await fetch("/api/employee", {
        method: "POST",
        body: formData,
      });

      router.push("/employees");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!form) return null;

  return (
    <div className="space-y-4 px-0 md:px-4 lg:px-8">

      {/* 🔷 Title Bar */}
      <div className="bg-gradient-to-r from-cyan-300 to-cyan-900 text-white text-center py-2 rounded-md">
        <h1 className="text-sm font-semibold tracking-wide">
          Create New Employee
        </h1>
      </div>

      <div className="pt-5 shadow-lg border-1 rounded-md">
        <div className="bg-white p-6 rounded-2xl shadow space-y-6">

          {/* 🔹 Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-600">
                Employee Name
              </label>
              <input
                className="border p-2 rounded-xl w-full mt-1"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600">
                Employee ID
              </label>
              <input
                className="border p-2 rounded-xl w-full mt-1"
                value={form.employeeId}
                onChange={(e) =>
                  setForm({ ...form, employeeId: e.target.value })
                }
              />
            </div>
          </div>

          {/* 🔹 Row 2 */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-sm font-bold text-gray-600">
                Upload Photo
              </label>
              <input
                type="file"
                className="border p-2 rounded-xl w-full mt-1"
                onChange={(e) =>
                  setPhoto(e.target.files?.[0] || null)
                }
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600">
                Photo Preview
              </label>
              <div className="h-24 border rounded-xl flex items-center justify-center bg-gray-50 mt-1 w-full">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-full object-contain rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">
                    No Image
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 🔹 Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-600">
                Phone
              </label>
              <input
                className="border p-2 rounded-xl w-full mt-1"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600">
                Email
              </label>
              <input
                className="border p-2 rounded-xl w-full mt-1"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* 🔹 Row 4 */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-sm font-bold text-gray-600">
                Designation
              </label>
              <select
                className="border p-2 rounded-xl w-full mt-1"
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
              >
                <option value="">Select Designation</option>
                {(designations || []).map((d: any) => (
                  <option key={d._id} value={d.listItem}>
                    {d.listItem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600">
                Is Manager
              </label>
              <div className="mt-2">
                <input
                  type="checkbox"
                  checked={form.isManager}
                  onChange={(e) =>
                    setForm({ ...form, isManager: e.target.checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* 🔹 Row 5 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-600">
                Search Manager
              </label>
              <EmployeeSearch
                placeholder="Search manager..."
                fetchUrl={(query) => {
                  const orgId = localStorage.getItem("orgId");
                  return `/api/user/search?search=${query}&orgId=${orgId}`;
                }}
                onSelect={(m) => {
                  setForm({
                    ...form,
                    managerId: m._id,
                    managerName: m.name,
                  });
                }}
              />
            </div>
          </div>

          {/* 🔹 Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className=" bg-cyan-900 hover:bg-cyan-600 hover:text-black"
            >
              {loading ? "Saving..." : "Save Employee"}
            </Button>
            <Button
              onClick={() => router.push("/employees")}
              className="bg-orange-700 hover:bg-orange-500 hover:text-black"
            >
              Cancel
            </Button>

            
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/app/_components/PageHeader";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Separator } from "@/components/ui/separator";

import { Search } from "lucide-react";

export default function CreateEmployee() {
  const router = useRouter();

  const params = useParams();

  const [form, setForm] = useState({
    _id: "",
    name: "",
    empId: "",
    phone: "",
    email: "",
    designation: "",
    managerName: "",
    isManager: false,
    orgId: "",
    photo: "",
    status: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [designations, setDesignations] = useState<string[]>([]);
  const [managerSearch, setManagerSearch] = useState("");
  const [managerList, setManagerList] = useState<any[]>([]);

  useEffect(() => {
    const loadEmployee = async () => {
      const res = await fetch(`/api/employee/${params.id}`);
      const data = await res.json();
      console.log("Employee Data: ", data);

      setForm(data);
      setManagerSearch(data.managerName || "");
    };
    loadEmployee();
  }, []);
  
  useEffect(() => {
    const fetchDesignation = async () => {
      const orgId = localStorage.getItem("orgId");

      const res = await fetch(
        `/api/system-list?listName=Designation&orgId=${orgId}`,
      );
      const data = await res.json();
      setDesignations(Array.isArray(data?.data?.[0]) ? data.data[0] : []);
    };

    fetchDesignation();
  }, []);

  const searchManager = async (val: string) => {
    setManagerSearch(val);

    const res = await fetch(`/api/user/search?search=${val}`);
    const data = await res.json();
    setManagerList(data);
  };

  const handleSubmit = async () => {
    const orgId = localStorage.getItem("orgId");

    const formData = new FormData();

    //Object.keys(form).forEach((key) =>formData.append(key, form[key]));

    formData.append("orgId", orgId || "");
    if (photo) formData.append("photo", photo);

    await fetch("/api/employee", {
      method: "PUT",
      body: formData,
    })

    router.push("/employees");
  };

  return (
     <>
      <div className="space-y-4 px-0 md:px-4 lg:px-8">
      <PageHeader title="Update Employee" />

      <div className="container mx-auto max-w-7xl ">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Employee Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Photo */}
            <div className="flex items-center gap-6">
              <Avatar className="h-28 w-28">
                <AvatarImage src={`/api/files/employees/${form.photo}`} />
                <AvatarFallback>{form.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <Label>Employee Photo</Label>

                <Input
                  type="file"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* GRID STARTS HERE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Employee ID */}
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input
                  value={form.empId}
                  onChange={(e) => setForm({ ...form, empId: e.target.value })}
                />
              </div>

              {/* Designation */}
              <div className="space-y-2">
                <Label>Designation</Label>

                <Select
                  value={form.designation}
                  onValueChange={(v) => setForm({ ...form, designation: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {designations.map((d: any) => (
                      <SelectItem key={d._id} value={d.listItem}>
                        {d.listItem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label>Phone</Label>

                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>

                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>

                <Input value={form.status} disabled />
              </div>
            </div>

            {/* Full Width Section */}

            <div className="space-y-2">
              <Label>Reporting Manager</Label>

              <Input
                value={managerSearch}
                onChange={(e) => searchManager(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={form.isManager}
                onCheckedChange={(checked) =>
                  setForm({
                    ...form,
                    isManager: checked === true,
                  })
                }
              />

              <Label>Is Manager</Label>
            </div>

            <Separator />

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/employees")}
              >
                Cancel
              </Button>

              <Button onClick={handleSubmit}>Save Employee</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}
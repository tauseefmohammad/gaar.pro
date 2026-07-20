"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import PageHeader from "@/app/_components/PageHeader";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import TenderSearchCB from "@/app/_components/searches/TenderSearchCB";
import { Textarea } from "@/components/ui/textarea";
import AmountToWords from "@/app/_components/AmountToWords";
import ClientSearch from "@/app/_components/searches/ClientSearch";

export default function CreateWorkOrderPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  const [loading, setLoading] = useState(false);
  const [subVerticals, setSubVerticals] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [woTypes, setWoTypes] = useState<any[]>([]);

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  // 🔹 Project Manager search
  const [pmSearch, setPmSearch] = useState("");
  const [pmResults, setPmResults] = useState<any[]>([]);
  const [showPmResults, setShowPmResults] = useState(false);

  // 🔹 SCM search
  const [scmSearch, setScmSearch] = useState("");
  const [scmResults, setScmResults] = useState<any[]>([]);
  const [showScmResults, setShowScmResults] = useState(false);

  const [formData, setFormData] = useState({
    woNo: "",
    woTitle: "",

    tenderNo: "",
    tenderDesc: "",

    woDate: "",
    woType: "",
    vertical: "",
    subVertical: "",
    country: "",
    state: "",

    projectCompletionDate: "",
    actualStartDate: "",
    actualEndDate: "",

    status: "",

    client: "",
    clientId: "",

    projectManager: "",
    projectManagerId: "",
    scm: "",
    scmId: "",

    bgAmount: 0,
    bgMaturityDate: "",
    bgReceivedStatus: "",
    woValue: 0,
    orgId: session?.user?.orgId || "",
  });

  // 🔹 Validation
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, boolean> = {
      woNo: !formData.woNo.trim(),
      woTitle: !formData.woTitle.trim(),
      woDate: !formData.woDate.trim(),
      woType: !formData.woType.trim(),
      //tenderNo: !formData.tenderNo.trim(),
      woValue: !formData.woValue || formData.woValue <= 0,
      vertical: !formData.vertical.trim(),
      subVertical: !formData.subVertical.trim(),
      country: !formData.country.trim(),
      state: !formData.state.trim(),
      projectCompletionDate: !formData.projectCompletionDate.trim(),
      client: !formData.client.trim(),
      projectManager: !formData.projectManager.trim(),
      bgAmount: !formData.bgAmount || formData.bgAmount <= 0,
      bgMaturityDate: !formData.bgMaturityDate.trim(),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const normalizeList = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    if (Array.isArray(data.data)) {
      if (Array.isArray(data.data[0])) return data.data[0];
      return data.data;
    }

    return [];
  };

  // ---------------- FETCH LISTS ----------------
  const fetchList = async (name: string, orgId: string) => {
    const res = await fetch(
      `/api/system-list?listName=${encodeURIComponent(name)}&orgId=${orgId}`,
    );

    const data = await res.json();

    return normalizeList(data);
  };

  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
    }
  }, [formData.country]);

  const fetchStates = async (country: string) => {
    try {
      const response = await fetch(
        `/api/country-info/states?country=${country}`,
      );

      setStates(await response.json());
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch("/api/country-info");
      const data = await response.json();

      setCountries(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!orgId) return;

    const loadVerticals = async () => {
      const verticalsList = await Promise.all([fetchList("VERTICAL", orgId)]);
      setVerticals(verticalsList[0] || []);
    };

    const loadWoTypes = async () => {
      const woTypesList = await Promise.all([fetchList("WO TYPE", orgId)]);
      setWoTypes(woTypesList[0] || []);
    };

    fetchCountries();
    loadVerticals();
    loadWoTypes();
  }, [orgId]);

  // ---------------- SUB VERTICAL ----------------
  useEffect(() => {
    if (!formData.vertical) return setSubVerticals([]);

    fetchList(formData.vertical, formData.orgId).then(setSubVerticals);
  }, [formData.vertical]);

  // ---------------- PROJECT MANAGER SEARCH ----------------
  useEffect(() => {
    const delay = setTimeout(() => {
      if (pmSearch.length >= 3) {
        searchPm(pmSearch);
      } else {
        setPmResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [pmSearch]);

  const searchPm = async (val: string) => {
    try {
      const res = await fetch(
        `/api/user/search?search=${val}&orgId=${orgId}`,
      );
      const data = await res.json();
      setPmResults(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- SCM SEARCH ----------------
  useEffect(() => {
    const delay = setTimeout(() => {
      if (scmSearch.length >= 3) {
        searchScm(scmSearch);
      } else {
        setScmResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [scmSearch]);

  const searchScm = async (val: string) => {
    try {
      const res = await fetch(
        `/api/user/search?search=${val}&orgId=${orgId}`,
      );
      const data = await res.json();
      setScmResults(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
  };

  const saveWorkOrder = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/work-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...formData,
          orgId: session?.user?.orgId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      router.push("/work-orders");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-0 md:px-4 lg:px-8">
      {/* Title */}
      <div className="bg-linear-to-r from-cyan-300 to-cyan-900 text-white text-center py-2 rounded-md">
        <h1 className="text-xl font-semibold">Create Work Order</h1>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WO No */}
          <div>
            <Label className="font-bold">Work Order No</Label>
            <Input
              name="woNo"
              className={errors.woNo ? "border-red-500" : ""}
              value={formData.woNo}
              onChange={handleChange}
            />
            {errors.woNo && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* WO Title */}
          <div>
            <Label className="font-bold">Work Order Title</Label>
            <Input
              name="woTitle"
              className={errors.woTitle ? "border-red-500" : ""}
              value={formData.woTitle}
              onChange={handleChange}
            />
            {errors.woTitle && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* WO Date */}
          <div>
            <Label className="font-bold">WO Date</Label>
            <Input
              type="date"
              name="woDate"
              className={errors.woDate ? "border-red-500" : ""}
              value={formData.woDate}
              onChange={handleChange}
            />
            {errors.woDate && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* WO Type */}
          <div>
            <Label className="font-bold">WO Type</Label>
            <select
              className={`border rounded-lg p-2 w-full ${errors.woType ? "border-red-500" : ""}`}
              name="woType"
              value={formData.woType}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {woTypes.map((type: any) => (
                <option key={type._id} value={type.listItem}>
                  {type.listItem}
                </option>
              ))}
            </select>
            {errors.woType && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* Tender Search */}
          <div className="relative">
            <Label className="font-bold">Tender No</Label>

            <div className={errors.tenderNo ? "border border-red-500 rounded-md" : ""}>
              <TenderSearchCB
                orgId={session?.user?.orgId ?? ""}
                value={formData.tenderNo}
                onSelect={(tender) => {
                  setFormData({
                    ...formData,

                    tenderNo: tender.tenderNo,
                    tenderDesc: tender.description,

                    woValue: tender.tenderValue ?? 0,
                    country: tender.country || "",
                    state: tender.state || "",
                    vertical: tender.vertical || "",
                    subVertical: tender.subVertical || "",
                    bgAmount: tender.bgAmount ?? 0,

                    client: tender.client || "",
                    clientId: tender.clientId || "",
                  });
                  if (errors.tenderNo) {
                    setErrors({ ...errors, tenderNo: false });
                  }
                }}
              />
            </div>
            {errors.tenderNo && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* WO Value */}
          <div>
            <Label className="font-bold">WO Value</Label>
            <div className={errors.woValue ? "border border-red-500 rounded-md" : ""}>
              <AmountToWords
                amount={String(formData.woValue)}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    woValue: Number(val),
                  });
                  if (errors.woValue) {
                    setErrors({ ...errors, woValue: false });
                  }
                }}
              />
            </div>
            {errors.woValue && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* Tender Name */}
          <div className="col-span-2">
            <Label className="font-bold">Tender Description</Label>
            <Textarea name="tenderDesc" value={formData.tenderDesc} readOnly />
          </div>

          <div>
            <label className="font-bold">Vertical</label>

            <select
              className={`border rounded-lg p-2 w-full ${errors.vertical ? "border-red-500" : ""}`}
              value={formData.vertical}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  vertical: e.target.value,
                  subVertical: "",
                });
                if (errors.vertical) {
                  setErrors({ ...errors, vertical: false });
                }
              }}
            >
              <option value="">Select</option>

              {verticals.map((v: any) => (
                <option key={v._id} value={v.listItem}>
                  {v.listItem}
                </option>
              ))}
            </select>
            {errors.vertical && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* SUB VERTICAL */}
          <div>
            <label className="font-bold">Sub Vertical</label>

            <select
              className={`border rounded-lg p-2 w-full ${errors.subVertical ? "border-red-500" : ""}`}
              value={formData.subVertical}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  subVertical: e.target.value,
                });
                if (errors.subVertical) {
                  setErrors({ ...errors, subVertical: false });
                }
              }}
            >
              <option value="">Select</option>

              {subVerticals.map((sv: any) => (
                <option key={sv._id} value={sv.listItem}>
                  {sv.listItem}
                </option>
              ))}
            </select>
            {errors.subVertical && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>
          <div>
            <label className="font-bold">Country *</label>

            <select
              className={`border rounded-lg p-2 w-full ${errors.country ? "border-red-500" : ""}`}
              value={formData.country}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  country: e.target.value,
                });
                if (errors.country) {
                  setErrors({ ...errors, country: false });
                }
              }}
            >
              <option value="">Select</option>

              {countries.map((c: any) => (
                <option key={c.id} value={c.country}>
                  {c.country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          <div>
            <label className="font-bold">State *</label>

            <select
              className={`border rounded-lg p-2 w-full ${errors.state ? "border-red-500" : ""}`}
              value={formData.state}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  state: e.target.value,
                });
                if (errors.state) {
                  setErrors({ ...errors, state: false });
                }
              }}
            >
              <option value="">Select</option>

              {states.map((s: any) => (
                <option key={s.id} value={s.state}>
                  {s.state}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>
          {/* Project Completion Date */}
          <div>
            <Label className="font-bold">Project Completion Date</Label>
            <Input
              type="date"
              name="projectCompletionDate"
              className={errors.projectCompletionDate ? "border-red-500" : ""}
              value={formData.projectCompletionDate}
              onChange={handleChange}
            />
            {errors.projectCompletionDate && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* Client */}
          <div>
            <Label className="font-bold">Client</Label>
            <div className={errors.client ? "border border-red-500 rounded-md" : ""}>
              <ClientSearch
                orgId={session?.user?.orgId ?? ""}
                value={formData.client}
                onSelect={(client) => {
                  setFormData({
                    ...formData,

                    clientId: client._id,
                    client: client.client,
                  });
                  if (errors.client) {
                    setErrors({ ...errors, client: false });
                  }
                }}
              />
            </div>
            {errors.client && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* Project Manager */}
          <div className="relative">
            <Label className="font-bold">Project Manager</Label>

            <div className={errors.projectManager ? "border border-red-500 rounded-md" : ""}>
              <Input
                value={pmSearch}
                placeholder="Search project manager..."
                onFocus={() => setShowPmResults(true)}
                onChange={(e) => {
                  const value = e.target.value;
                  setPmSearch(value);
                  setShowPmResults(true);

                  setFormData((prev) => ({
                    ...prev,
                    projectManager: value,
                    projectManagerId: "",
                  }));

                  if (errors.projectManager) {
                    setErrors({ ...errors, projectManager: false });
                  }
                }}
              />

              {showPmResults && pmResults.length > 0 && (
                <div className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg w-full max-h-48 overflow-y-auto">
                  {pmResults.map((user: any) => (
                    <div
                      key={user._id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setPmSearch(user.employeeName || user.name);
                        setFormData((prev) => ({
                          ...prev,
                          projectManager: user.employeeName || user.name,
                          projectManagerId: user._id,
                        }));
                        setShowPmResults(false);
                        setPmResults([]);

                        if (errors.projectManager) {
                          setErrors({ ...errors, projectManager: false });
                        }
                      }}
                    >
                      {user.employeeName || user.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errors.projectManager && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* SCM */}
          <div className="relative">
            <Label className="font-bold">SCM</Label>

            <Input
              value={scmSearch}
              placeholder="Search SCM..."
              onFocus={() => setShowScmResults(true)}
              onChange={(e) => {
                const value = e.target.value;
                setScmSearch(value);
                setShowScmResults(true);

                setFormData((prev) => ({
                  ...prev,
                  scm: value,
                  scmId: "",
                }));
              }}
            />

            {showScmResults && scmResults.length > 0 && (
              <div className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg w-full max-h-48 overflow-y-auto">
                {scmResults.map((user: any) => (
                  <div
                    key={user._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setScmSearch(user.employeeName || user.name);
                      setFormData((prev) => ({
                        ...prev,
                        scm: user.employeeName || user.name,
                        scmId: user._id,
                      }));
                      setShowScmResults(false);
                      setScmResults([]);
                    }}
                  >
                    {user.employeeName || user.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BG Amount */}
          <div>
            <Label className="font-bold">BG Amount</Label>
            <div className={errors.bgAmount ? "border border-red-500 rounded-md" : ""}>
              <AmountToWords
                amount={String(formData.bgAmount)}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    bgAmount: Number(val),
                  });
                  if (errors.bgAmount) {
                    setErrors({ ...errors, bgAmount: false });
                  }
                }}
              />
            </div>
            {errors.bgAmount && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>

          {/* BG Maturity Date */}
          <div>
            <Label className="font-bold">BG Maturity Date</Label>
            <Input
              type="date"
              name="bgMaturityDate"
              className={errors.bgMaturityDate ? "border-red-500" : ""}
              value={formData.bgMaturityDate}
              onChange={handleChange}
            />
            {errors.bgMaturityDate && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                * This is Mandatory
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button
            onClick={saveWorkOrder}
            disabled={loading}
            className="bg-cyan-900 hover:bg-cyan-600 hover:text-black"
          >
            {loading ? "Saving..." : "Create Work Order"}
          </Button>
          <Button className="bg-orange-700 hover:bg-orange-500 hover:text-black" 
          onClick={() => router.push("/work-orders")}>
            Cancel
          </Button>
          
        </div>
      </div>
    </div>
  );
}
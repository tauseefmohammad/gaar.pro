"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateEmployee() {
  const router = useRouter()

  const [form, setForm] = useState<any>({})
  const [photo, setPhoto] = useState<File | null>(null)
  const [designations, setDesignations] = useState<string[]>([])
  const [managerSearch, setManagerSearch] = useState("")
  const [managerList, setManagerList] = useState<any[]>([])

  useEffect(() => {
    const fetchDesignation = async () => {
      const orgId = localStorage.getItem("orgId")

      const res = await fetch(
        `/api/system-list?listName=Designation&orgId=${orgId}`
      )
      const data = await res.json()
      setDesignations(data)
    }

    fetchDesignation()
  }, [])

  const searchManager = async (val: string) => {
    setManagerSearch(val)

    const res = await fetch(`/api/user/search?search=${val}`)
    const data = await res.json()
    setManagerList(data)
  }

  const handleSubmit = async () => {
    const orgId = localStorage.getItem("orgId")

    const formData = new FormData()

    Object.keys(form).forEach((key) =>
      formData.append(key, form[key])
    )

    formData.append("orgId", orgId || "")
    if (photo) formData.append("photo", photo)

    await fetch("/api/employee", {
      method: "PUT",
      body: formData
    })

    router.push("/employees")
  }

  return (
    <div className="p-6">
      <h1>Update Employee</h1>

      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Employee ID" onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />

      <input type="file" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />

      <input placeholder="Phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />

      <select onChange={(e) => setForm({ ...form, designation: e.target.value })}>
        <option>Select Designation</option>
        {designations.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>

      <label>
        Is Manager
        <input
          type="checkbox"
          onChange={(e) => setForm({ ...form, isManager: e.target.checked })}
        />
      </label>

      {/* Manager Search */}
      <input
        placeholder="Search Manager"
        value={managerSearch}
        onChange={(e) => searchManager(e.target.value)}
      />

      {managerList.map((m) => (
        <div key={m._id} onClick={() => setForm({ ...form, managerName: m.name })}>
          {m.name}
        </div>
      ))}

      <button onClick={handleSubmit}>Save</button>
    </div>
  )
}
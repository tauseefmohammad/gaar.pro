"use client"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

type Props = {
  placeholder?: string
  fetchUrl: (query: string) => string
  onSelect: (item: any) => void
  displayField?: string
}

export default function EmployeeSearch({
  placeholder = "Search...",
  fetchUrl,
  onSelect,
  displayField = "name"
}: Props) {
  const [query, setQuery] = useState("")
  const [list, setList] = useState<any[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [show, setShow] = useState(false)

  //  Debounce Search
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.length < 3) {
        console.log
        setList([])
        return
      }
      console.log("Fetching:", fetchUrl(query)) 
      const res = await fetch(fetchUrl(query))
      
      const data = await res.json()
      console.log("API Response:", data)
      const result = Array.isArray(data) 
                          ? data 
                          : Array.isArray(data?.data)
                          ? data.data
                          : []

      setList(result)
      setShow(true)
    }, 300)

    return () => clearTimeout(delay)
  }, [query])

  // Keyboard Navigation
  const handleKeyDown = (e: any) => {
    if (!show) return

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev < list.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      handleSelect(list[activeIndex])
    }
  }

  const handleSelect = (item: any) => {
    onSelect(item)
    setQuery(item[displayField])
    setShow(false)
  }

  //Highlight Match
  const highlightText = (text: string) => {
    if (!query) return text

    const parts = text.split(new RegExp(`(${query})`, "gi"))

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <div className="relative">
      <input
        className="border p-2 rounded-xl w-full"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          console.log("Typing:", e.target.value)
          setQuery(e.target.value)
          setActiveIndex(-1)
        }}
        onKeyDown={handleKeyDown}
      />

      {show && list.length > 0 && (
        <div className="absolute bg-white border w-full mt-1 rounded-xl shadow max-h-48 overflow-y-auto z-10">
          {list.map((item, index) => (
            <div
              key={item._id}
              className={`p-2 cursor-pointer ${
                index === activeIndex
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleSelect(item)}
            >
              {highlightText(item[displayField])}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
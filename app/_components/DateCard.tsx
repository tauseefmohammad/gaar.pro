import { Calendar } from "lucide-react";
import { useRef } from "react";

export function DateCard({ title, value, name, color, onChange }: any) {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDateTime = (date?: string) => {
    if (!date) return "Not Set";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`relative rounded-xl border p-5 shadow-sm ${color}`}>
      <div className="flex justify-between items-start">
        <p className="text-xs uppercase tracking-wider font-medium opacity-70">
          {title}
        </p>

        <button type="button" onClick={() => inputRef.current?.showPicker?.()}>
          <Calendar className="h-5 w-5 cursor-pointer" />
        </button>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold">
          {value
            ? new Date(value).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "--"}
        </div>

        <div className="text-lg font-medium mt-1 opacity-80">
          {value
            ? new Date(value).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </div>
      </div>

      <input
        ref={inputRef}
        type="datetime-local"
        className="hidden"
        name={name}
        value={value?.slice(0, 16) || ""}
        onChange={onChange}
      />
    </div>
  );
}

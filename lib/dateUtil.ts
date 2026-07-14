// /lib/date.ts

export const formatDate = (
  date?: string | Date | null,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));
};

export const formatDateTime = (date?: string | Date | null) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formatDateForInput = (date?: string | Date | null) => {
  if (!date) return "";

  return new Date(date).toISOString().split("T")[0];
};

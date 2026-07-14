import { toWords } from "number-to-words";

export function convertToWords(amount) {
  if (!amount) return "";
  return (
    toWords(amount).replace(/\b\w/g, (c) => c.toUpperCase()) + " Rupees Only"
  );
}

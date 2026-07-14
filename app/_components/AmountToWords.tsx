"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import converter from "num-words";

export default function AmountToWords({
  amount,
  readOnly = false,
  onChange,
  onBlur,
}: {
  amount: string;
  readOnly?: boolean;
  onChange: (val: string) => void;
  onBlur?: () => void;
}) {
  const convertToWords = (value: string) => {
    if (!value) return "";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertBelowThousand = (num: number): string => {
      let str = "";

      if (num >= 100) {
        str += ones[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }

      if (num >= 20) {
        str += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      }

      if (num > 0) {
        str += ones[num] + " ";
      }

      return str.trim();
    };

    const numberToWordsIndian = (num: number): string => {
      if (num === 0) return "Zero";

      let result = "";

      const crore = Math.floor(num / 10000000);
      num %= 10000000;

      const lakh = Math.floor(num / 100000);
      num %= 100000;

      const thousand = Math.floor(num / 1000);
      num %= 1000;

      const hundred = num;

      if (crore) result += convertBelowThousand(crore) + " Crore ";
      if (lakh) result += convertBelowThousand(lakh) + " Lakh ";
      if (thousand) result += convertBelowThousand(thousand) + " Thousand ";
      if (hundred) result += convertBelowThousand(hundred);

      return result.trim();
    };

    const [rupeesPart, paisePart] = value.split(".");

    const rupees = Number(rupeesPart || 0);
    let words = numberToWordsIndian(rupees);

    if (paisePart && Number(paisePart) > 0) {
      words += " And " + numberToWordsIndian(Number(paisePart)) + " Paise";
    }

    return words + " Only";
  };

  return (
    <div className="space-y-2">
      <Input
        className="text-2xl font-bold text-slate-800"
        type="text"
        step="0.01"
        value={amount || ""}
        placeholder="Enter amount"
        readOnly={readOnly}
        onBlur={onBlur}
        onChange={(e) => {
          const val = e.target.value;

          // Allow only numbers + decimal
          if (/^\d*\.?\d{0,2}$/.test(val)) {
            onChange(val);
          }
        }}
      />
      {amount && (
        <p className="text-sm text-blue-600 italic">{convertToWords(amount)}</p>
      )}
    </div>
  );
}

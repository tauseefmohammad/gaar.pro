"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Tender {
  _id: string;
  tenderNo: string;
  description: string;
  tenderValue: number;
  client?: string;
  clientId?: string;
  country?: string;
  state?: string;
  vertical?: string;
  subVertical?: string;
  bgAmount?: number;
}

interface Props {
  orgId: string;
  value?: string;
  onSelect: (tender: Tender) => void;
}

export default function TenderSearchCBx({ orgId, value, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/tender/search?q=${encodeURIComponent(search)}&orgId=${orgId}`,
        );

        const data = await res.json();

        if (res.ok) {
          setTenders(data.data || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search, open, orgId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {value || "Search Tender..."}

          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[600px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search Tender No, Description, Client..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {loading && <div className="p-4 text-sm">Searching...</div>}

            <CommandEmpty>No Tender Found</CommandEmpty>

            <CommandGroup>
              {tenders.map((tender) => (
                <CommandItem
                  key={tender._id}
                  value={tender._id}
                  onSelect={() => {
                    onSelect(tender);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === tender.tenderNo ? "opacity-100" : "opacity-0",
                    )}
                  />

                  <div className="flex flex-col">
                    <span className="font-medium">{tender.tenderNo}</span>

                    <span className="text-xs text-muted-foreground">
                      {tender.description}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      ₹ {tender.tenderValue?.toLocaleString()}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

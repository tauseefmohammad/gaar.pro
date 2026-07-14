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

interface Client {
  _id: string;
  client: string;
}

interface Props {
  orgId: string;
  value?: string;
  onSelect: (client: Client) => void;
}

export default function ClientSearch({ orgId, value, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        console.log(
          "Searching for clients with query:",
          search,
          "and orgId:",
          orgId,
        );
        const res = await fetch(
          `/api/client/search?q=${encodeURIComponent(search)}&orgId=${orgId}`,
        );

        const data = await res.json();

        if (res.ok) {
          setClients(data.data || []);
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
          {value || "Search Client..."}

          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[600px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search Client Name..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {loading && <div className="p-4 text-sm">Searching...</div>}

            <CommandEmpty>No Client Found</CommandEmpty>

            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client._id}
                  value={client.client}
                  onSelect={() => {
                    onSelect(client);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === client.client ? "opacity-100" : "opacity-0",
                    )}
                  />

                  <div className="flex flex-col">
                    <span className="font-medium">{client.client}</span>
                    <span className="text-sm text-muted-foreground">
                      {client._id}
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

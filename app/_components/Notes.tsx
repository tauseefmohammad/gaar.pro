"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

export default function Notes({ user, entityType, entityId }: any) {
  const router = useRouter();
  const { data: session } = useSession();
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<any[]>([]);

  const orgId = session?.user?.orgId;

  const addNote = async () => {
    if (!note.trim()) return;
    console.log("Adding note:", note, orgId, entityType, entityId, user);
    await fetch("/api/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: note,
        orgId,
        entityType,
        entityId,
        username: session?.user?.username,
        loggedBy: session?.user?.employeeName,
        date: new Date(),
      }),
    });

    const newNote = {
      notes: note,
      loggedBy: session?.user?.employeeName || "User",
      createdAt: new Date().toLocaleString(),
    };

    setNotes([newNote, ...notes]);
    setNote("");
  };
  const fetchNotes = async () => {
    const res = await fetch(
      `/api/note?orgId=${orgId}&entityType=${entityType}&entityId=${entityId}`,
    );
    const data = await res.json();
    setNotes(data.data || []);
  };

  useEffect(() => {
    fetchNotes();
  }, [orgId, entityType, entityId]);

  return (
    <div className="h-full flex flex-col space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2">Notes</h2>

      <div className="space-y-2">
        <Textarea
          placeholder="Write a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          onClick={addNote}
          className="bg-cyan-900 hover:bg-cyan-600 w-full"
        >
          Add Note
        </Button>
      </div>

      <div className="space-y-3 overflow-y-auto">
        {notes.map((n, i) => (
          <div key={i} className="border rounded-lg shadow-sm">
            <div className="bg-gray-100 px-3 py-1 text-xs flex justify-between">
              <span>{n.loggedBy}</span>
              <span>
                {new Date(n.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="p-3 text-sm">{n.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

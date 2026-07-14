"use client";

import { useParams } from "next/navigation";
import EditReceivableForm from "@/app/_components/receivable/EditReceivableForm";

export default function EditPage() {
  const { id } = useParams();

  return <EditReceivableForm id={id as string} />;
}

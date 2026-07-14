"use client"

import { useParams } from "next/navigation"
import PaymentForm from "@/app/_components/payment/PaymentForm"

export default function EditPage() {
  const { id } = useParams()
  return <PaymentForm id={id as string} />
}
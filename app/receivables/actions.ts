"use server";

import { redirect } from "next/navigation";
import { recordCustomerPayment } from "@/src/services/receivables";
import { queryString } from "@/src/utils/query";

export async function recordPayment(form: FormData) {
  const invoice = Number(form.get("invoice"));
  const { status, error } = await recordCustomerPayment({
    invoice,
    amount: Number(form.get("amount")),
    date: String(form.get("date")),
    method: String(form.get("method")),
  });
  if (error || !status) {
    const message =
      error?.code === "22023" || error?.code === "42501"
        ? error.message
        : "The payment could not be saved.";
    redirect(
      `/receivables/invoices/${invoice}${queryString({ error: message })}`,
    );
  }
  redirect(`/receivables/invoices/${invoice}?result=recorded`);
}

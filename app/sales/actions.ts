"use server";

import { redirect } from "next/navigation";
import { createSalesOrder } from "@/src/services/sales";
import type { SalesOrderLineInput } from "@/src/types/sales";

export async function placeSalesOrder(
  _previous: { error: string } | null,
  form: FormData,
) {
  let lines: SalesOrderLineInput[];
  try {
    lines = JSON.parse(String(form.get("lines")));
  } catch {
    return { error: "Add at least one order line." };
  }
  const { orderId, error } = await createSalesOrder(
    Number(form.get("customer")),
    String(form.get("requested")),
    lines,
  );
  if (error || !orderId) {
    return {
      error:
        error?.code === "22023" || error?.code === "42501"
          ? error.message
          : "The order could not be saved.",
    };
  }
  redirect(`/sales/orders/${orderId}?result=created`);
}

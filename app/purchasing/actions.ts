"use server";

import { redirect } from "next/navigation";
import {
  createRequisition,
  decideRequisition,
} from "@/src/services/procurement";
import { queryString } from "@/src/utils/query";

function failure(
  error: { code: string; message: string },
  fallback: string,
): never {
  const message =
    error.code === "22023" || error.code === "42501" ? error.message : fallback;
  redirect(`/purchasing${queryString({ error: message })}`);
}

export async function requestPurchase(form: FormData) {
  const { data, error } = await createRequisition(
    Number(form.get("product")),
    Number(form.get("warehouse")),
    Number(form.get("quantity")),
  );
  if (error || !data) {
    failure(
      error ?? { code: "", message: "" },
      "The requisition could not be created.",
    );
  }
  if (data.order_id) {
    redirect(`/purchasing/orders/${data.order_id}?result=created`);
  }
  redirect(
    `/purchasing${queryString({ result: "requested", number: data.number })}`,
  );
}

export async function reviewRequisition(form: FormData) {
  const approve = form.get("decision") === "approve";
  const { orderId, error } = await decideRequisition(
    Number(form.get("id")),
    approve,
    String(form.get("reason") ?? ""),
  );
  if (error) {
    failure(error, "The decision could not be saved.");
  }
  if (orderId) {
    redirect(`/purchasing/orders/${orderId}?result=approved`);
  }
  redirect("/purchasing?result=rejected");
}

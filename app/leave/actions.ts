"use server";

import { redirect } from "next/navigation";
import { decideLeave, submitLeave } from "@/src/services/leave";

function finish(error: { code: string; message: string } | null) {
  if (!error) {
    redirect("/leave?status=saved");
  }
  const message =
    error.code === "22023" || error.code === "42501"
      ? error.message
      : "The request could not be saved.";
  redirect(`/leave?error=${encodeURIComponent(message)}`);
}

export async function requestLeave(form: FormData) {
  finish(
    await submitLeave({
      type: String(form.get("type")),
      start: String(form.get("start")),
      end: String(form.get("end")),
      half: form.get("half") === "on",
      reason: String(form.get("reason") ?? ""),
    }),
  );
}

export async function reviewLeave(form: FormData) {
  finish(
    await decideLeave(
      String(form.get("id")),
      String(form.get("decision")),
      String(form.get("comment") ?? ""),
    ),
  );
}

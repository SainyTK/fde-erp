import "server-only";
import { createSupabaseServerClient } from "@/src/lib/supabase";
import type { LeaveWorkspace } from "@/src/types/leave";

export async function getLeaveWorkspace() {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("leave_workspace");
  return { workspace: data as LeaveWorkspace | null, error };
}

export async function submitLeave(input: {
  type: string;
  start: string;
  end: string;
  half: boolean;
  reason: string;
}) {
  const client = await createSupabaseServerClient();
  const { error } = await client.rpc("submit_leave", {
    p_type: input.type,
    p_start: input.start,
    p_end: input.end,
    p_half: input.half,
    p_reason: input.reason,
  });
  return error;
}

export async function decideLeave(
  id: string,
  decision: string,
  comment: string,
) {
  const client = await createSupabaseServerClient();
  const { error } = await client.rpc("decide_leave", {
    p_id: id,
    p_decision: decision,
    p_comment: comment,
  });
  return error;
}

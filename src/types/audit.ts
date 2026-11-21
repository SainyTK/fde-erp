import type { PageData } from "@/src/types/stock";

export type AuditEntries = PageData<{
  id: number;
  changed_at: string;
  actor: string;
  table: string;
  record: string;
  action: string;
  changes: Record<string, unknown>;
}> & { tables: string[] };

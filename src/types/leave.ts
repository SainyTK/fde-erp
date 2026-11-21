export type LeaveBalance = { code: string; name: string; remaining: number };

export type LeaveRequest = {
  id: number;
  employee: string;
  type: string;
  start: string;
  end: string;
  days: number;
  reason: string;
  status: string;
  comment: string | null;
  own: boolean;
  can_review: boolean;
};

export type LeaveWorkspace = {
  balances: LeaveBalance[];
  today: string;
  requests: LeaveRequest[];
};

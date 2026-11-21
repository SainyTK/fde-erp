export const ageingBuckets: Record<string, string> = {
  NOT_DUE: "Not due",
  DAYS_1_30: "1 to 30 days",
  DAYS_31_60: "31 to 60 days",
  DAYS_61_90: "61 to 90 days",
  DAYS_OVER_90: "Over 90 days",
};

export const paymentMethods = ["TRANSFER", "CHEQUE", "CASH"] as const;

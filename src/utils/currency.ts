export const formatINRCompact = (amount: number): string => {
  if (amount >= 1_000 && amount < 1_00_000) {
    return `₹${(amount / 1_000).toFixed(1)}K`;
  }
  if (amount >= 1_00_00_000) {
    return `₹${(amount / 1_00_00_000).toFixed(2)}Cr`;
  }
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
};

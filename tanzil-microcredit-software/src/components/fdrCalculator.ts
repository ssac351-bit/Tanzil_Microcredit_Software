/**
 * FDR Interest and Penalty Calculator
 */

export function calculateFdrInterest(
  principal: number,
  rate: number, // Annual percentage
  months: number, // Duration of deposit
  isPremature: boolean,
  generalSavingsRate: number // Annual percentage
): { interestEarned: number; penalty: number; finalAmount: number } {
  // Monthly rate
  const monthlyRate = rate / 100 / 12;
  const interestEarned = principal * monthlyRate * months;

  if (!isPremature) {
    return {
      interestEarned,
      penalty: 0,
      finalAmount: principal + interestEarned
    };
  }

  // Premature withdrawal penalty calculation:
  // Switch to GS rate for the period
  const gsMonthlyRate = generalSavingsRate / 100 / 12;
  const correctInterest = principal * gsMonthlyRate * months;
  const penalty = interestEarned - correctInterest;

  return {
    interestEarned: correctInterest,
    penalty: penalty > 0 ? penalty : 0,
    finalAmount: principal + correctInterest
  };
}

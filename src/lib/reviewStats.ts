export type RatingBreakdown = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type ReviewSummary = {
  average: number;
  count: number;
  breakdown: RatingBreakdown;
};

export function emptyBreakdown(): RatingBreakdown {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

export function summarizeRatings(ratings: number[]): ReviewSummary {
  const breakdown = emptyBreakdown();
  for (const value of ratings) {
    const star = Math.round(Number(value));
    if (star >= 1 && star <= 5) breakdown[star as 1 | 2 | 3 | 4 | 5] += 1;
  }
  const count = breakdown[1] + breakdown[2] + breakdown[3] + breakdown[4] + breakdown[5];
  const total =
    breakdown[1] * 1 + breakdown[2] * 2 + breakdown[3] * 3 + breakdown[4] * 4 + breakdown[5] * 5;
  const average = count ? Math.round((total / count) * 10) / 10 : 0;
  return { average, count, breakdown };
}

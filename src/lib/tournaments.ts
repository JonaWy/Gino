import type { Tournament } from "@/types/database";

function parseRating(rating: string | null): number {
  if (!rating) return 0;
  const parsed = Number(rating.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getBestTournament(
  tournaments: Tournament[]
): Tournament | null {
  if (tournaments.length === 0) return null;

  return [...tournaments].sort((a, b) => {
    const placementA = a.placement ?? Number.MAX_SAFE_INTEGER;
    const placementB = b.placement ?? Number.MAX_SAFE_INTEGER;
    if (placementA !== placementB) return placementA - placementB;

    const prizeA = Number(a.prize_money || 0);
    const prizeB = Number(b.prize_money || 0);
    if (prizeB !== prizeA) return prizeB - prizeA;

    return parseRating(b.rating) - parseRating(a.rating);
  })[0];
}

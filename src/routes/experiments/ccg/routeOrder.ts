export const routeOrder = [
  "welcome",
  "screening",
  "comprehension-intro",
  "game-intro",
  "game-ready",
  "game-play",
  "game-end",
  "exit-survey",
];

export function getNextSlug(currentSlug: string): string | null {
  const currentIndex = routeOrder.indexOf(currentSlug);
  if (currentIndex === -1 || currentIndex === routeOrder.length - 1) {
    return null; // No next slug
  }
  return routeOrder[currentIndex + 1];
}
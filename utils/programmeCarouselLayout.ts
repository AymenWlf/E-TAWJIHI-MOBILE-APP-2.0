/** Nombre de cartes filière visibles par « page » selon la largeur viewport. */
export function programmeCarouselCardsPerView(viewportWidth: number): number {
  if (viewportWidth >= 1280) return 3;
  if (viewportWidth >= 768) return 2;
  return 1;
}

export function chunkProgrammes<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

export const chunkCarouselPages = chunkProgrammes;
export const carouselCardsPerView = programmeCarouselCardsPerView;

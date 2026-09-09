// Maps a course slug to the product ids (see app/data/products.ts) used in
// that class, so the course page can point students at the exact tools.
// Curated by hand — not auto-generated, safe to edit directly.
export const courseProducts: Record<string, string[]> = {
  "bakso-sapi-premium": ["measuring-spoon", "golden-square-pan", "food-processor-dcopper", "food-processor-pro"],
  "otak-otak": ["golden-square-pan", "measuring-spoon", "food-processor-dcopper", "food-processor-pro"],
};

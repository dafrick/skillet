export const TAGLINES: string[] = [
  'Mise en place for your agents.',
  'Cast iron. No flaking.',
  'Skills so hot they need an oven mitt.',
  'Season your agents. Properly.',
  'From raw to production heat.',
  'Hot skills. Zero compromise.',
  'Your skills, served fresh.',
  'Low and slow wins the deploy.',
  "Don't ship cold skills.",
  'Heat-treated. Battle-hardened.',
  'Sharp knife. Sharper agents.',
  'Your agent stack, properly seasoned.',
  'Well done. (Not the steak.)',
  'No raw skills in production.',
  "Skills that don't stick.",
  'The secret ingredient is version control.',
  'Rendered fat-free, feature-rich.',
  'Fresh install, every time.',
  'Properly plated. Ready to serve.',
  'First rule: mise en place.',
];

export function randomTagline(): string {
  return TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
}

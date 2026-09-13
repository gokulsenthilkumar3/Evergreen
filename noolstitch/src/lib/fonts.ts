// @polsia:user-owned — Tamil-capable font loaded via next/font/google (self-hosted at build time).
// Apply `.variable` to a container element; reference the CSS var in tailwind classes.
import { Noto_Sans_Tamil } from 'next/font/google';

export const notoSansTamil = Noto_Sans_Tamil({
  subsets: ['latin', 'tamil'],
  variable: '--font-noto-tamil',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

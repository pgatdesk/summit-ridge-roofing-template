import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import type { CSSProperties } from 'react'

import appCss from '../styles.css?url'
import { site } from '../site.config'
import { TrackDebug } from '../components/TrackDebug'

const FONT_FACES = [400, 500, 600, 700]
  .map(
    (weight) =>
      `@font-face{font-family:'Inter Display';font-weight:${weight};font-display:swap;src:url(https://content.whop.com/fonts/inter-display-${({ 400: 'regular', 500: 'medium', 600: 'semi-bold', 700: 'bold' } as Record<number, string>)[weight]}.ttf) format('truetype')}`,
  )
  .join('')

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `${site.company.name} — Roof repair, replacement & inspection` },
      {
        name: 'description',
        content: `${site.company.name}: ${site.hero.sub} Request a free estimate, book an inspection online, or reserve your project with a deposit.`,
      },
      { property: 'og:title', content: site.company.name },
      { property: 'og:description', content: site.company.tagline },
      { name: 'theme-color', content: site.theme.primary },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
})

function RootLayout() {
  return <Outlet />
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const vars = {
    '--color-brand': site.theme.primary,
    '--color-brand-dark': site.theme.primaryDark,
    '--color-ink': site.theme.ink,
    '--color-soft': site.theme.soft,
  } as CSSProperties
  return (
    <html lang="en" style={vars}>
      <head>
        <style>{FONT_FACES}</style>
        <HeadContent />
      </head>
      <body>
        {children}
        <TrackDebug />
        <Scripts />
      </body>
    </html>
  )
}

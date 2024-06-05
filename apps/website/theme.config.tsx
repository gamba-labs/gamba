import { DocsThemeConfig, useConfig } from 'nextra-theme-docs'

import { useRouter } from 'next/router'

const config: DocsThemeConfig = {
  logo: (<><img src="/logo.svg" alt="Gamba Logo" /></>),
  project: { link: 'https://github.com/gamba-labs' },
  chat: { link: 'https://discord.gg/xjBsW3e8fK' },
  docsRepositoryBase: 'https://github.com/gamba-labs/gamba/tree/docs/apps/website',
  nextThemes: {
    defaultTheme: 'dark',
    forcedTheme: 'dark',
  },
  themeSwitch: { component: () => null },
  footer: { text: 'Gamba ©©©©©©©©' },
  head: () => {
    const { asPath, pathname } = useRouter()
    const { frontMatter } = useConfig()
    const ogConfig = {
      title: 'Gamba',
      description: 'Build your own web3 games with Gamba, a decentralized betting platform on Solana',
      author: { twitter: 'gambalabs' },
      favicon: '/gamba.svg',
    }
    const favicon = String(ogConfig.favicon)
    const title = String(frontMatter.title || ogConfig.title)
    const description = String(frontMatter.description || ogConfig.description)
    const canonical = new URL(asPath, 'https://gamba.so').toString()
    const image = 'https://www.gamba.so/og.png'

    return (
      <>
        <meta property="og:url" content={canonical} />
        <link rel="canonical" href={canonical} />

        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta name="twitter:site" content={`@${ogConfig.author.twitter}`} />
        <meta name="twitter:creator" content={`@${ogConfig.author.twitter}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content={image} />
        <meta property="og:image" content={image} />
        <link rel="shortcut icon" href={favicon} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={favicon} type="image/svg+xml" />
        <meta name="apple-mobile-web-app-title" content={title} />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </>
    )
  },
  sidebar: { toggleButton: true, defaultMenuCollapseLevel: 1 },
  useNextSeoProps() {
    const { asPath } = useRouter()

    if (['/', '/docs'].includes(asPath)) {
      return { titleTemplate: 'Gamba' }
    }

    return { titleTemplate: '%s | Gamba' }
  },
  primaryHue: {
    light: 270,
    dark: 204,
  },
}

export default config

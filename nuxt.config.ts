// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  extends: ['nuxt-mongodb'],
  modules: ['nuxt-simple-css', '@nuxtjs/plausible'],
  nuxtSimpleCSS: {
    accent: '#000',
  },
  plausible: {
    domain: '301redirect.to',
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        {
          name: 'description',
          content: 'Create free 301 redirects for your websites. No login required & open source.',
        },
        { property: 'title', content: '301 Redirect Tool' },
        {
          property: 'description',
          content: 'Create free 301 redirects for your websites. No login required & open source.',
        },
        { property: 'og:title', content: '301 Redirect Tool' },
        { property: 'og:image', content: 'https://301redirect.to/images/og.jpg' },
        { property: 'og:image:alt', content: '301 Redirect Tool' },
        {
          property: 'og:description',
          content: 'Create free 301 redirects for your websites. No login required & open source.',
        },
        { property: 'og:url', content: 'https://301redirect.to/images/og.jpg' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:title', content: '301 Redirect Tool' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:creator', content: '@timb03' },
        { name: 'twitter:image', content: 'https://301redirect.to/images/og.jpg' },
        {
          name: 'twitter:description',
          content: 'Create free 301 redirects for your websites. No login required & open source.',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%2210 0 100 100%22><text y=%22.90em%22 font-size=%2290%22>🔁</text></svg>',
        },
      ],
    },
  },
})

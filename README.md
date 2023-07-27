# 301 Redirect Tool

Create free 301 redirects for your websites using [nuxt-mongodb](https://github.com/timb-103/nuxt-mongodb) to store them in a free mongodb collection.

## Why?

- ✅ **100% free**, no login required
- 💸 No need to host a server
- 🤖 Great for **SEO**

Over the years I've acquired many websites and [301 redirected](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301) them to another website. Each time this requires setting up a server to host a simple redirect server to point the traffic somewhere else.

This means for each website I want to redirect, I need to host a server, which costs money.

**This tool will do the redirect for you.**

All you do is add a [CNAME](https://en.wikipedia.org/wiki/CNAME_record) record in your domain registrar pointing to the subdomain you choose, and we'll automatically 301 redirect it for you.

No need to host anything, and it's completely free!

## Usage

Clone the repo to your local:

```sh
git clone https://github.com/timb-103/301-redirect.git
```

Add your mongo connection string and main database name in your `.env` file:

```
MONGO_CONNECTION_STRING=
MONGO_DB=
```

Start your project

```sh
npm run dev
```

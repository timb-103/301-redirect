<template>
  <div class="container">
    <div class="title">
      <h1>301 Redirect Tool</h1>
      <!-- prettier-ignore -->
      <p>Create free 301 redirects for your websites. No login required & <a href="https://github.com/timb-103/301-redirect" target="_blank">open source</a>.</p>
    </div>

    <div class="form-container">
      <!-- Create Form -->
      <form @submit.prevent="create()" v-if="!showSearch && !redirect">
        <div>
          <label>1. Enter a name</label>
          <input type="text" v-model="subdomain" placeholder="Enter a subdomain (aka name), eg: acme" />
        </div>
        <div>
          <label>2. Redirect to URL</label>
          <input type="text" v-model="url" placeholder="Enter a URL to redirect to, eg: https://acme.com" />
        </div>
        <p class="errors" v-if="errors">{{ errors }}</p>
        <button type="submit" :disabled="loading" class="button">Create Redirect</button>
        <div style="text-align: center">
          <a href="" @click.prevent="showSearch = !showSearch">Looking for your redirect?</a>
        </div>
      </form>

      <!-- Search -->
      <div class="search-container" v-if="showSearch && !redirect">
        <div class="search">
          <input type="text" v-model="searchQuery" placeholder="Enter your redirect subdomain/name, eg. acme" />
          <p class="errors" v-if="searchErrors">{{ searchErrors }}</p>
          <button class="button" @click="search()" :disabled="loading">Search</button>
          <div class="back-button">
            <a href="" @click.prevent="showSearch = false">Go Back</a>
          </div>
        </div>
      </div>

      <!-- Success -->
      <div v-if="redirect">
        <div class="success">
          <p class="success-title">Your redirect is now live:</p>
          <div>
            <!-- prettier-ignore -->
            <code class="code-clickable" @click="openURL(`https://${redirect.subdomain}.301redirect.to`)">https://{{ redirect.subdomain }}.301redirect.to</code>
            301 redirects to <code>{{ redirect.url }}</code>
          </div>
          <div class="how">
            <p class="success-title">How does it work?</p>
            <ol>
              <li>
                Add a <code>CNAME</code> record pointing to
                <code>https://{{ redirect.subdomain }}.301redirect.to</code> in your DNS settings via your domain
                registrar.
              </li>
              <li>Wait for it to propogate, it can take up to 24 hours but usually much faster.</li>
            </ol>
          </div>
        </div>
        <div class="back-button">
          <a href="" @click.prevent="clear()">Go Back</a>
        </div>
      </div>
    </div>

    <!-- How it works -->
    <div class="info">
      <div>
        <p><strong>Why use this 301 redirect tool?</strong></p>
        <ul>
          <li>✅ <strong>100% free</strong>, no login required</li>
          <li>💸 No need to host a server</li>
          <li>🤖 Great for <strong>SEO</strong></li>
        </ul>
        <p>
          Over the years I've acquired many websites and
          <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301" target="_blank">
            <strong>301 redirected</strong>
          </a>
          them to another website. Each time this requires setting up a server to host a simple redirect server to point
          the traffic somewhere else.
        </p>
        <p>This means for each website I want to redirect, I need to host a server, which costs money.</p>
      </div>
      <div>
        <p><strong>This tool will do the redirect for you.</strong></p>
        <p>
          All you do is add a
          <a href="https://en.wikipedia.org/wiki/CNAME_record" target="_blank">
            <strong>CNAME</strong>
          </a>
          record in your domain registrar pointing to the subdomain you choose, and we'll automatically 301 redirect it
          for you.
        </p>
        <p>No need to host anything, and it's completely free!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Redirect } from 'types/redirect'

// add page meta
useSeoMeta({ title: '301 Redirect Tool' })

/**
 * Server side function to check the subdomain and if there's one search for it and do a
 * redirect otherwise return a 404 error
 */

const subdomainHost = useSubdomain()

if (subdomainHost) {
  // find the redirect
  const { data } = await useAsyncData('subdomain', async () => {
    const response = await $fetch('/api/redirects/redirect', {
      method: 'POST',
      body: {
        subdomain: subdomainHost,
      },
    })
    return response?.url || null
  })

  // redirect if redirect found
  if (data.value) {
    navigateTo(data.value, { external: true, redirectCode: 301 })
  }

  // throw 404 error otherwise
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

const loading = ref(false)
const subdomain = ref('')
const url = ref('')
const errors = ref('')
const searchErrors = ref('')
const redirect = ref<Redirect | null>()
const showSearch = ref(false)
const searchQuery = ref('')

async function create() {
  errors.value = ''
  redirect.value = null
  navigateTo('/')

  if (!url.value || !subdomain.value) {
    errors.value = 'Please enter a subdomain & URL.'
    return
  }

  if (!isValidSubdomain(subdomain.value)) {
    errors.value = 'Only characters, numbers, and hyphens are allowed in your subdomain.'
    return
  }

  if (!isValidURL(url.value)) {
    errors.value = 'URL must start with https://'
    return
  }

  loading.value = true

  try {
    const response = await $fetch<Redirect>('/api/redirects/create', {
      method: 'POST',
      body: {
        subdomain: subdomain.value.toLowerCase(),
        url: url.value.toLowerCase(),
      },
    })

    redirect.value = response
  } catch (error: any) {
    errors.value = error.statusMessage
  }

  loading.value = false
}

async function get(name: string) {
  loading.value = true
  errors.value = ''

  try {
    const response = await $fetch<Redirect>('/api/redirects/get', {
      method: 'POST',
      body: {
        subdomain: name,
      },
    })

    redirect.value = response
  } catch (error: any) {
    errors.value = error.statusMessage
  }

  loading.value = false
}

async function search() {
  loading.value = true
  searchErrors.value = ''

  try {
    const response = await $fetch<Redirect>('/api/redirects/get', {
      method: 'POST',
      body: {
        subdomain: searchQuery.value,
      },
    })

    redirect.value = response
    navigateTo(`/?redirect=${response.subdomain}`)
  } catch (error: any) {
    searchErrors.value = error.statusMessage
    redirect.value = null
    navigateTo('/')
  }

  loading.value = false
}

// Regular expression to match only characters, numbers, and hyphens
function isValidSubdomain(input: string): boolean {
  const regex = /^[a-zA-Z0-9-]*$/

  return regex.test(input)
}

function isValidURL(input: string): boolean {
  return input.includes('https://')
}

function openURL(value: string) {
  window.open(value, '_blank')
}

function clear() {
  redirect.value = null
  showSearch.value = false
}

onMounted(() => {
  if (useRoute().query?.redirect) {
    get(String(useRoute().query?.redirect))
  }
})
</script>

<style>
body {
  font-size: 16px;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
    Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  line-height: 1.7em;
}
</style>

<style scoped>
/** Containers */
.container {
  max-width: 600px;
  margin: 60px auto;
  border: 1px solid var(--grey);
}

/** Anchor Links */
a {
  color: #000;
  border-bottom: 1px dashed #000;
  padding-bottom: 2px;
  text-decoration: none;
  transition: border 0.3s;
}
a:hover {
  border-bottom: 1px solid #000;
}

/** Text */

p {
  margin: 0;
}
.title {
  text-align: center;
}

/** Forms & Inputs */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px -2px #091e4240, 0 0 0 1px #091e4214;
  margin-top: 40px;
  padding: 20px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form > button {
  width: 100%;
}
label {
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
}
input {
  display: block;
  width: 100%;
  background: #fff;
  border: 1px solid #cecece;
  border-radius: 4px;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
    Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  padding: 1.1em;
  box-sizing: border-box;
}

/** Buttons */
.button {
  background: #000;
  color: #fff;
  padding: 15px;
  font-weight: 600;
  border: 0;
  letter-spacing: 1px;
  font-size: 15px;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid #000;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
    Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
}
.button:hover:not(:disabled) {
  background: #fff;
  color: #000;
}
button:disabled {
  opacity: 0.4;
}
.back-button {
  text-align: center;
}

/** Code Blocks */
code {
  background: #fff;
  border-radius: 3px;
  padding: 0.2rem 0.375rem 0.2rem 0.375rem;
  font-size: 14.5px;
  white-space: pre-line;
  border: 1px solid #ededed;
}
.code-clickable {
  border: 1px dashed #000;
  cursor: pointer;
  transition: border 0.3s;
}
code > a {
  border-bottom: 0;
  padding-bottom: 0;
}
code > a:hover {
  border-bottom: 0;
}
.code-clickable:hover {
  border: 1px solid #000;
}

/** Success Container */
.success {
  background: #e2ffe8;
  padding: 10px 10px 15px 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.success-title {
  font-weight: 600;
}
.success > p {
  margin: 0;
}
li + li {
  margin-top: 10px;
}

/** Search */
.search-container {
  text-align: center;
}
.search > a {
  font-size: 15px;
  text-align: center;
}
.search {
}
.search {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/** Info */
.info {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.info > div {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.info > div > ol {
  margin-top: 0;
}
.info-title {
  font-weight: 700;
}

/** Errors */
.errors {
  background: #ffe8de;
  border-radius: 4px;
  color: red;
  text-align: center;
  padding: 2px 8px;
}
</style>

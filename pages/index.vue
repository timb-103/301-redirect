<template>
  <div class="container">
    <div class="title">
      <h1>301 Redirect Tool</h1>
      <p>Create free 301 redirects for your websites. 100% free & open source.</p>
    </div>

    <div class="form-container">
      <!-- Create Form -->
      <form @submit.prevent="create()">
        <div>
          <label>1. Enter a name</label>
          <input type="text" v-model="subdomain" placeholder="Enter a subdomain (aka name), eg: acme" />
        </div>
        <div>
          <label>2. Redirect to URL</label>
          <input type="text" v-model="url" placeholder="Enter a URL to redirect to, eg: https://acme.com" />
        </div>
        <p v-if="errors">{{ errors }}</p>
        <button type="submit" :disabled="loading" class="button">Create Redirect</button>
      </form>

      <!-- Success -->
      <div class="success" v-if="redirect">
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

      <!-- Search -->
      <div class="search-container">
        <a href="" @click.prevent="showSearch = !showSearch">Looking for your redirect?</a>
        <div class="search" v-if="showSearch">
          <input type="text" v-model="searchQuery" placeholder="Enter your redirect subdomain/name, eg. acme" />
          <p v-if="searchErrors">{{ searchErrors }}</p>
          <button class="button" @click="search()" :disabled="loading">Search</button>
        </div>
      </div>
    </div>

    <!-- How it works -->
    <div class="info">
      <div>
        <p class="info-title">Why use this 301 redirect tool?</p>
        <p>
          Creating a 301 redirect requires having a server running, that points your website to another URL. This
          requires you to host a server online somewhere. Using this tool, there's no need to host anything, just create
          a redirect and add a CNAME to your domain registrar.
        </p>
      </div>
      <!-- <div>
        <p class="info-title">How does it work?</p>
        <ol>
          <li>Create a redirect in the form above</li>
          <li>Add the CNAME record pointing to your website (it will show after you create a redirect)</li>
          <li>Wait for it to propogate, it can take up to 24 hours but usually much faster.</li>
        </ol>
        <p>Now, all the traffic to your website will get 301 redirected to your URL.</p>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { Redirect } from 'types/redirect'

/**
 * Server side function to check the subdomain and if there's one search for it and do a
 * redirect otherwise return a 404 error
 */

const subdomainHost = useSubdomain()

if (subdomainHost) {
  // find the redirect
  const { data } = await useAsyncData('subdomain', async () => {
    console.log('useasyncdata request:', subdomainHost)
    const response = await $fetch('/api/redirects/redirect', {
      method: 'POST',
      body: {
        subdomain: subdomainHost,
      },
    })
    console.log('response:', response)
    return response?.url || null
  })

  // redirect if redirect found
  if (data.value) {
    console.log('navigating to:', data.value)
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
  console.log(value)
  window.open(value, '_blank')
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
p {
  margin: 0;
}
</style>

<style scoped>
.container {
  max-width: 600px;
  margin: 60px auto;
  border: 1px solid var(--grey);
}

.title {
  text-align: center;
}

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
.search-container > a {
  font-size: 15px;
  text-align: center;
}
.search {
  margin-top: 20px;
}
.search {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/** Info */
.info {
  /* background: #fafafa; */
  /* border-radius: 8px; */
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* padding: 10px; */
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
  font-weight: 600;
}
</style>

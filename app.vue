<template>
  <h1>301 Redirect Tool</h1>
  <!-- prettier-ignore -->
  <p>Create free 301 redirects for your websites. <mark>100% free</mark>, <em>no login required</em> & <a href="https://github.com/timb-103/301-redirect" target="_blank">open source</a>.</p>

  <!-- Create Form -->
  <form @submit.prevent="create()" v-if="!showSearch && !redirect" class="notice">
    <div>
      <label>1. Enter a name</label>
      <input
        type="text"
        v-model="subdomain"
        placeholder="Enter a subdomain (aka name), eg: acme"
        style="width: 400px"
      />
    </div>
    <div>
      <label>2. Redirect to URL</label>
      <input
        type="text"
        v-model="url"
        placeholder="Enter a URL to redirect to, eg: https://acme.com"
        style="width: 450px"
      />
    </div>

    <!-- Errors -->
    <div v-if="errors">
      <code>{{ errors }}</code>
    </div>

    <!-- Submit Button -->
    <button type="submit" :disabled="loading">Create Redirect</button>

    <!-- Open Search Link -->
    <div>
      <a href="" @click.prevent="showSearch = true">Looking for your redirect?</a>
    </div>
  </form>

  <!-- Search -->
  <div v-if="showSearch && !redirect" class="notice">
    <form @submit.prevent="search()">
      <!-- Search Input -->
      <div>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Enter your redirect subdomain/name, eg. acme"
          style="width: 450px"
        />
      </div>

      <!-- Search Errors -->
      <div v-if="searchErrors">
        <code>{{ searchErrors }}</code>
      </div>

      <!-- Search Button -->
      <button type="submit" :disabled="loading">Search</button>
    </form>
    <!-- Back Button -->
    <div>
      <a href="" @click.prevent="clear()">Go Back</a>
    </div>
  </div>

  <!-- Success -->
  <div v-if="redirect" class="notice">
    <p><strong>Your redirect:</strong></p>
    <p>
      <!-- prettier-ignore -->
      <code><strong>https://{{ redirect.subdomain }}.301redirect.to</strong> -> <strong>{{ redirect.url }}</strong></code>
    </p>

    <p><strong>How does it work?</strong></p>
    <ol>
      <li>
        Add a <strong>CNAME</strong> record, with a <strong>host</strong> of <code>@</code> and
        <strong>value</strong> of <code>{{ redirect.subdomain }}.301redirect.to</code> in your DNS settings via your
        domain registrar.
      </li>
      <li>Wait for it to propogate, it can take up to 24 hours but usually much faster.</li>
    </ol>

    <button @click="clear()">Go Back</button>
  </div>

  <!-- How it works -->

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
    them to another website. Each time this requires setting up a server to host a simple redirect server to point the
    traffic somewhere else.
  </p>
  <p>This means for each website I want to redirect, I need to host a server, which costs money.</p>

  <p><strong>This tool will do the redirect for you.</strong></p>
  <p>
    All you do is add a
    <a href="https://en.wikipedia.org/wiki/CNAME_record" target="_blank">
      <strong>CNAME</strong>
    </a>
    record in your domain registrar pointing to the subdomain you choose, and we'll automatically 301 redirect it for
    you.
  </p>
  <p>No need to host anything, and it's completely free!</p>
</template>

<script setup lang="ts">
import { Redirect } from 'types/redirect'

// add page meta
useSeoMeta({ title: '301 Redirect Tool' })

const loading = ref(false)
const verified = ref(false)
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

  // add plausible event
  useTrackEvent('createRedirect')

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
    errors.value = error.statusMessage || error.message
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
    errors.value = error.statusMessage || error.message
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
    searchErrors.value = error.statusMessage || error.message
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

function clear() {
  redirect.value = null
  showSearch.value = false
  verified.value = false
  navigateTo('/')
}

onMounted(() => {
  if (useRoute().query?.redirect) {
    get(String(useRoute().query?.redirect))
  }
})
</script>

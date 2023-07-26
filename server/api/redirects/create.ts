import type { Redirect } from '@/types/redirect'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const db = mongo.db()
  const { subdomain, url } = await readBody(event)

  console.log(`Attempting to create a redirect for ${subdomain} -> ${url}`)

  // make sure details are there
  if (!subdomain || !url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Error creating redirect. Please enter a subdomain & url.',
    })
  }

  try {
    // check if it exists already
    const exists = await db.collection('Redirects').findOne({ subdomain })
    if (exists) {
      return createError({
        statusCode: 400,
        statusMessage: 'Redirect already exists. Pick another subdomain name.',
      })
    }

    // create the redirect
    const redirect: Redirect = {
      _id: new ObjectId(),
      subdomain: subdomain.toLowerCase(),
      url: url.toLowerCase(),
      hits: 0,
      created: new Date(),
    }

    // insert the redirect to db
    await db.collection('Redirects').insertOne(redirect)

    // return the redirect
    return redirect
  } catch (error) {
    console.log('Error creating redirect:', error)
  }

  // return an error
  throw createError({
    statusCode: 400,
    statusMessage: 'Error creating redirect.',
  })
})

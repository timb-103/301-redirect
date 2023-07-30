import type { Redirect } from '@/types/redirect'

export default defineEventHandler(async (event) => {
  const db = mongo.db()
  const { subdomain } = await readBody(event)

  // make sure details are there
  if (!subdomain) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Error getting redirect. It may not exist.',
    })
  }

  try {
    // insert the redirect to db
    const redirect = await db.collection<Redirect>('Redirects').findOne({ subdomain })

    // return the redirect
    if (redirect) {
      return redirect
    }
  } catch (error) {
    console.log('Error getting redirect:', error)
  }

  // return an error
  throw createError({
    statusCode: 400,
    statusMessage: 'Error getting redirect.',
  })
})

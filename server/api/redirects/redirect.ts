import type { Redirect } from '@/types/redirect'

export default defineEventHandler(async (event) => {
  const db = mongo.db()
  const { subdomain } = await readBody(event)

  // dns.resolveTxt(domain, callback)

  console.log('Redirecting:', subdomain)

  try {
    // get the redirect
    const redirect = await db.collection<Redirect>('Redirects').findOne({ subdomain })

    if (redirect) {
      // increment hit counter
      db.collection('Redirects').updateOne(
        { subdomain },
        {
          $inc: {
            hits: 1,
          },
        }
      )

      // return success
      return redirect
    }
  } catch (error) {
    console.log('Error getting redirect:', error)
  }

  // return an error
  throw createError({
    statusCode: 400,
    statusMessage: 'Error creating redirect.',
  })
})

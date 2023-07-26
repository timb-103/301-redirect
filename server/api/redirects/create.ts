import type { Redirect } from "@/types/redirect"
import { ObjectId } from "mongodb"

export default defineEventHandler(async (event) => {
  const db = mongo.db()
  const { subdomain, url } = await readBody(event)

  // make sure details are there
  if (!subdomain || !url) {
    throw createError({
      statusCode: 400,
      statusMessage: "Error creating redirect. Please enter a subdomain & url.",
    })
  }

  try {
    // create the redirect
    const redirect: Redirect = {
      _id: new ObjectId(),
      subdomain,
      url,
      hits: 0,
      created: new Date(),
    }

    // insert the redirect to db
    await db.collection("Redirects").insertOne(redirect)

    // return the redirect
    return redirect
  } catch (error) {
    console.log("Error creating redirect:", error)
  }

  // return an error
  throw createError({
    statusCode: 400,
    statusMessage: "Error creating redirect.",
  })
})
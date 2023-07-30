import http from 'node:http'
import { ofetch } from 'ofetch'
import { MongoClient } from 'mongodb'
import 'dotenv/config'

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
let db = false

// connect mongo
async function connectToMongo() {
  try {
    const client = new MongoClient(process.env.DB_CONNECTION)
    client.on('serverClosed', () => process.exit())
    client.on('topologyClosed', () => process.exit())

    await client.connect()

    db = client.db('Primary')
  } catch (error) {
    console.log('Error connecting to mongoDB', error)
  }
}
connectToMongo()

// create a server
const server = http.createServer(async (req, res) => {
  try {
    // ping googles dns api for CNAME records
    const domain = req.headers.host
    const response = await ofetch(`https://dns.google/resolve?type=CNAME&name=twillyy.com`)

    // return if no response
    if (!response?.Answer?.length) {
      res.writeHead(404)
      res.end()
      return
    }

    // check all CNAME records, and get the subdomain if there's one for 301redirect.to
    let subdomain = ''

    for (let i = 0; i < response.Answer.length; i += 1) {
      const data = response.Answer[i].data
      if (data.includes('301redirect.to')) {
        subdomain = data.split('.')[0]?.toLowerCase()
      }
    }

    // return if no domain found
    if (!subdomain) {
      res.writeHead(404)
      res.end()
      return
    }

    console.log(`Searching for the redirect with subdomain: ${subdomain}`)

    // get subdomain redirect from our db
    const redirect = await db.collection('Redirects').findOne({ subdomain })

    if (redirect) {
      // increment hits counter
      db.collection('Redirects').updateOne({ subdomain }, { $inc: { hits: 1 } })

      // send a 301 redirect
      console.log(`Redirecting ${domain} -> ${redirect.url}`)
      res.writeHead(301, { Location: redirect.url })
      res.end()
      return
    }
  } catch (error) {
    console.log('Error getting redirect:', error)
  }

  res.writeHead(404)
  res.end()
})

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})

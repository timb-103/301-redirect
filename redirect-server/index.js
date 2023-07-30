import http from "node:http"
import { ofetch } from "ofetch"
import { MongoClient } from "mongodb"
import "dotenv/config"

const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || 3000
const dnsOverHttpsUrl = "https://dns.google/resolve?type=CNAME"
let db = false

// connect mongo
async function connectToMongo() {
  try {
    const client = new MongoClient(process.env.DB_CONNECTION)
    await client.connect()
    db = client.db("Primary")
  } catch (error) {
    console.log("Error connecting to mongoDB", error)
  }
}
connectToMongo()

// create a server
const server = http.createServer(async (req, res) => {
  // ping googles dns api for CNAME records
  const response = await ofetch(`${dnsOverHttpsUrl}&name=${req?.headers?.host}`)

  console.log("response:", response)

  // check all CNAME records, and get the subdomain if there's one for 301redirect.to
  let subdomain = ""
  if (response?.Answer) {
    for (let i = 0; i < response.Answer.length; i += 1) {
      const data = response.Answer[i].data
      if (data.includes("301redirect.to")) {
        subdomain = data.split(".")[0]?.toLowerCase()
      }
    }
  }
  console.log("subdomain:", subdomain)

  // return if no domain found
  if (!subdomain) {
    res.writeHead(200)
    res.end()
  }

  // get subdomain redirect from our db
  const redirect = await db.collection("Redirects").findOne({ subdomain })
  console.log("redirectFound:", redirect)

  if (redirect) {
    res.writeHead(301, { Location: redirect.url })
    res.end()
  }

  res.writeHead(200)
  res.end()
})

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})

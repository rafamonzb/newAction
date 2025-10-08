const https = require("https")
const { URL } = require("url")

function postJson(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl)
    const data = Buffer.from(JSON.stringify(payload))

    const options = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    }

    const req = https.request(options, res => {
      let body = ""
      res.on("data", chunk => (body += chunk))
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body || 'ok')
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`))
        }
      })
    })

    req.on("error", reject)
    req.write(data)
    req.end()
  })
}

(async () => {
  try {
    const webhookUrl = process.env.INPUT_WEBHOOK_URL
    const title = process.env.INPUT_TITLE
    const message = process.env.INPUT_MESSAGE

    if(!webhookUrl) throw new Error("Missing input: webhook_url")
    if(!message) throw new Error("Missing input: message")

    const payload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "summary": title,
      "title": title,
      "text": message
    }

    console.log("payload:", JSON.stringify(payload))
    console.log("hasURL:", !!webhookUrl)

    const result = await postJson(webhookUrl, payload)
    console.log(`Sent to Teams: ${result}`)
  } catch(err) {
    console.error(`Action failed: ${err.message}`)
    process.exit(1)
  }
})()
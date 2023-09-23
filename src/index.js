import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

// make that json pretty!!
app.use('*', prettyJSON())

app.get('/', (c) => {
    return c.body("Hello! Use the /get endpoint to query comments. The other routes are reserved for the frontend.")
})

// get all comments for a specific page.
app.get('/get/:pageId', async (c) => {
    // get the page ID from the request path
    const pageId = c.req.param('pageId')
    
    // call me a db admin with my amazingly complex queries
    const comments = await c.env.DB.prepare(
        `SELECT
            Author,
            Body,
            Timestamp
        FROM
            Comments
        WHERE
            PageId = ?`
    ).bind(pageId).all()

    return c.json(comments.results)
})

app.get('/getKey', async (c) => {
    // generate a unique identifier for this request
    const newKey = await crypto.randomUUID()
    const requestIP = c.req.header('CF-Connecting-Ip')

    const data = {
        source: requestIP,
        status: "created"
    }

    await c.env.KEYS.put(newKey, JSON.stringify(data), {expirationTtl: 90})

    return c.json({
        key: newKey,
        ttl: 90
    })
})

export default app

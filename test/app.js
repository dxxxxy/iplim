const express = require("express")
const app = express()
const iplim = require("iplim")

app.use(iplim({ cooldown: 10000, limit: 5 }))

app.get("/", (req, res) => res.send("Hello World!"))

app.listen(3000)
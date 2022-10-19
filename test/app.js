const express = require("express")
const app = express()
const iplim = require("iplim")

app.use(iplim({ cooldown: 10000, limit: 5, exclude: ["/hey"] }))

app.get("/", (req, res) => res.send("Hello World!"))

app.get("/hey", (req, res) => res.send("Hello World!2"))

app.listen(3000)
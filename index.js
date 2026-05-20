module.exports = ({
    timeout = 1000 * 60, //milliseconds of timeout when limit is exceeded
    limit = 15,//number of requests allowed within the window
    window = 1000 * 60, //milliseconds of the window for counting requests
    exclude = [], //array of paths to exclude from rate limiting
    statusCode = 429, //HTTP status code to send when rate limit is exceeded
    message = "Too many requests", //message to send when rate limit is exceeded
    verbose = false, //whether to log detailed information about requests and rate limiting decisions
} = {}) => {
    const store = new Map()

    const log = (msg) => {
        if (verbose) console.log(msg)
    }

    return (req, res, next) => {
        const ip = req.ip

        if (verbose) console.log(`\n---------<${ip}>---------`)

        //if path is excluded, skip rate limiting
        if (req.path.startsWith(exclude)) {
            log(`${req.path} is excluded. Skipping.`)
            return next()
        }

        //get record or initialize
        let record = store.get(ip)
        if (!record) {
            record = { count: 0, timer: null, isTimeout: false }
            store.set(ip, record)
        }

        //if ip is in timeout, reject request
        if (record.isTimeout) {
            log(`In timeout. Sending ${statusCode} - ${message}.`)
            return res.status(statusCode).send(message)
        }

        record.count++
        log(`Count: ${record.count}, Limit: ${limit}`)

        //if count exceeds limit, trigger timeout
        if (record.count > limit) {
            log(`Setting timeout to ${timeout}ms. Sending ${statusCode} - ${message}.`)
            record.isTimeout = true

            //clear existing window timer
            if (record.timer) clearTimeout(record.timer)

            //start timeout cooldown
            record.timer = setTimeout(() => {
                store.delete(ip)
                log(`---[${ip}] Timeout has been cleared [${ip}]---`)
            }, timeout)

            return res.status(statusCode).send(message)
        }

        //start window cooldown timer on first request
        if (record.count === 1) {
            log(`First request in window. Count will reset in ${window}ms.`)
            record.timer = setTimeout(() => {
                store.delete(ip)
                log(`---[${ip}] Window has been cleared. [${ip}]---`)
            }, window)
        }

        log("Continuing request.")
        next()
    }
}

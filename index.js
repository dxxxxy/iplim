module.exports = ({
    timeout = 1000 * 60 * 15, //milliseconds the user has to wait after breaching the rules set
    limit = 15, //number of requests allowed in the window
    window = 1000 * 60, //milliseconds the limit has to reach (ex: 15 requests in 1 minute)
    exclude = [], //exclude paths in this array from the limit (ex: "/hey")
    verbose = false, //print every process step to the console
}) => {
    //map initialization
    const store = new Map()
    const toReset = []
    const onTimeout = []

    return (req, res, next) => {
        const delimit = () => {
            if (verbose) console.log(`\n---------<${req.ip}>---------`)
        }

        const log = (msg) => {
            if (verbose) console.log(msg)
        }

        //start
        delimit()

        //check if path is in exclude
        if (exclude.includes(req.path)) {
            log(`${req.path} is excluded. Skipping.`)
            return next() //continue the request
        }

        //increment ip count
        store.set(req.ip, (store.get(req.ip) || 0) + 1)
        log(`Count: ${store.get(req.ip)}, Limit: ${limit}`)

        //check if ip count is greater than limit
        if (store.get(req.ip) > limit) {
            log("Over Limit.")

            //check if ip is already on timeout
            if (!onTimeout.includes(req.ip)) {
                onTimeout.push(req.ip)

                //clear ip count after timeout (long wait)
                setTimeout(() => {
                    store.delete(req.ip)
                    onTimeout.splice(onTimeout.indexOf(req.ip), 1)
                    log(`---[${req.ip}] Timeout has been cleared [${req.ip}]---`)
                }, timeout)

                log(`└──Set timeout to ${timeout}ms. Sending 429.`)

                //remove from to be reset
                toReset.splice(toReset.indexOf(req.ip), 1)
            } else {
                log(`└──Already on timeout. Sending 429.`)
            }

            res.status(429).send("Too many requests")
        } else {
            log(`Under limit.`)

            //set to reset ip count after cooldown (so it doenst keep counting till limit)
            if (!toReset.includes(req.ip)) {
                toReset.push(req.ip)

                setTimeout(() => {
                    if (onTimeout.includes(req.ip)) return
                    store.set(req.ip, 0)
                    toReset.splice(toReset.indexOf(req.ip), 1)
                    log(`---[${req.ip}] Window has been cleared. [${req.ip}]---`)
                }, window)

                log(`└──First request in window. Count will reset in ${window}ms.`)
            }

            //continue request
            log("└──Continuing request.")
            next()
        }
    }
}
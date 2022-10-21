module.exports = options => { //options: {limit: ?, timeout: ?, exclude: ["?"], ?cooldown: ?}
    //map initialization
    const ips = new Map()
    const toReset = []
    const onTimeout = []

    const log = (msg) => {
        if (options.log) console.log(msg)
    }

    return (req, res, next) => {
        //check if path is in exclude
        log(`---------<>---------`)
        if (options.exclude.includes(req.path)) {
            log(`[${req.ip}] ${req.path} is excluded. Skipping.`)
            log(`---------<>---------`)
            return next()
        }

        //increment ip count
        ips.set(req.ip, (ips.get(req.ip) || 0) + 1)
        log(`[${req.ip}] Incremented to ${ips.get(req.ip)}.`)

        //check if ip count is greater than limit
        if (ips.get(req.ip) >= options.limit) {
            log(`[${req.ip}] Is over limit.`)
            if (!onTimeout.includes(req.ip)) {
                log(`[${req.ip}] Not in the timeout list.`)

                onTimeout.push(req.ip)
                log(`[${req.ip}] Added to the timeout list.`)

                //clear ip count after timeout (long wait)
                setTimeout(() => {
                    ips.delete(req.ip)
                    onTimeout.splice(onTimeout.indexOf(req.ip), 1)
                    log(`[${req.ip}] [TIMEOUT CLEARED]`)
                }, options.timeout)
                log(`[${req.ip}] Set timeout to ${options.timeout}ms.`)

                //remove from to be reset
                toReset.splice(toReset.indexOf(req.ip), 1)
                log(`[${req.ip}] Removed from reset list.`)
            }

            log(`[${req.ip}] Is in the timeout list. Sending 429.`)
            log(`---------<>---------`)
            return res.status(429).send("Too many requests")
        } else {
            log(`[${req.ip}] Is under limit. Letting through.`)
            next() //continue the request
        }

        //set to reset ip count after cooldown (so it doenst keep counting till limit)
        if (!toReset.includes(req.ip)) {
            log(`[${req.ip}] Not in the reset list.`)
            toReset.push(req.ip)
            log(`[${req.ip}] Added to the reset list.`)

            setTimeout(() => {
                if (onTimeout.includes(req.ip)) return

                ips.delete(req.ip)
                toReset.splice(toReset.indexOf(req.ip), 1) //remove from to be reset
                log(`[${req.ip}] [COOLDOWN RESET]`)
            }, options.cooldown || 60 * 1000)
            log(`[${req.ip}] Set cooldown to ${options.cooldown || 60 * 1000}ms.`)
        }

        log(`---------<>---------`)
    }
}
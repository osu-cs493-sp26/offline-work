import express from 'express'
import morgan from 'morgan'
import { PrismaClientValidationError } from "@prisma/client/runtime/client"

import api from './api/index.js'
import prisma from './lib/prisma.js'

const app = express()
const port = process.env.PORT || 8000

/*
 * Use the popular logger Morgan: https://github.com/expressjs/morgan.
 */
app.use(morgan('dev'))

app.use(express.json())

/*
 * API endpoints are factored into the api/ directory.
 */
app.use('/', api)

app.get("/media/images/:filename", async (req, res, next) => {
    const filename = req.params.filename
    const image = await prisma.image.findUnique({
        where: { filename: filename }
    })
    if (image) {
        res.status(200).sendFile(image.path)
    } else {
        next()
    }
})

app.use((err, req, res, next) => {
    if (err instanceof PrismaClientValidationError) {
        res.status(400).send({ err: err.message })
    } else {
        console.error(err)
        res.status(500).send({ err: `Unhandled internal error: ${err.message}`})
    }
})

app.use('*splat', (req, res, next) => {
    res.status(404).send({
        err: `This URL was not recognized: ${req.originalUrl}`
    })
})

app.listen(port, () => {
    console.log("== Server is listening on port:", port)
})

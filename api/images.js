import { Router } from 'express'
import multer from 'multer'
import crypto from 'crypto'
import mime from 'mime-types'

import prisma from '../lib/prisma.js'

const router = Router()

const imageRegex = /image\/.+/
const upload = multer({
    storage: multer.diskStorage({
        destination: `${import.meta.dirname}/../images`,
        filename: (req, file, callback) => {
            const filename = crypto.pseudoRandomBytes(16).toString("hex")
            const extension = mime.extension(file.mimetype)
            callback(null, `${filename}.${extension}`)
        }
    }),
    fileFilter: (req, file, callback) => {
        callback(null, imageRegex.test(file.mimetype))
    }
})

router.post('/', upload.single("image"), async (req, res, next) => {
    if (req.file) {
        const data = {
            type: req.file.mimetype,
            filename: req.file.filename,
            path: req.file.path,
            caption: req.body?.caption
        }
        const image = await prisma.image.create({ data: data })
        res.status(201).send({ id: image.id })
    } else {
        res.status(400).send({
            err: "Request body needs an 'image' file."
        })
    }
})

router.get('/:id', async (req, res, next) => {
    const id = parseInt(req.params.id)
    const image = await prisma.image.findUnique({
        where: { id: id },
        omit: { path: true }
    })
    if (image) {
        res.status(200).send({
            ...image,
            url: `/media/images/${image.filename}`
        })
    } else {
        next()
    }
})

export default router

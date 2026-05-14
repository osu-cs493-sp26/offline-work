import { Router } from 'express'

import imagesRouter from './images.js'

const apiRouter = Router()

apiRouter.use('/images', imagesRouter)

export default apiRouter

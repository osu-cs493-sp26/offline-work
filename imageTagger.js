import tf from '@tensorflow/tfjs'
import mobilenet from '@tensorflow-models/mobilenet'
import sharp from 'sharp'

import { getChannel } from './lib/rabbitmq.js'
import prisma from './lib/prisma.js'

await tf.ready()
const classifier = await mobilenet.load()

const channel = await getChannel()
channel.consume("imageTags", async (msg) => {
    if (msg) {
        const id = parseInt(msg.content.toString())
        const image = await prisma.image.findUnique({ where: { id: id } })

        const { data, info } = await sharp(image.path)
            .raw()
            .toBuffer({ resolveWithObject: true })

        const tensor = tf.tensor3d(
            new Uint8Array(data),
            [ info.height, info.width, info.channels ],
            "int32"
        )

        const classifications = await classifier.classify(tensor)
        tensor.dispose()

        console.log("== classifications:", classifications)
        const tags = classifications.filter(c => c.probability > 0.5)
            .map(c => c.className)
        const result = await prisma.image.update({
            where: { id: id },
            data: { tags: tags }
        })

        channel.ack(msg)
    }
})

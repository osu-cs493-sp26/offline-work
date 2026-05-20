import amqp from 'amqplib'
import dotenv from 'dotenv'

dotenv.config({ path: ".env.local" })

const connection = await amqp.connect(process.env.RABBITMQ_URL)
const channel = await connection.createChannel()

await channel.assertQueue("echo")

channel.consume("echo", msg => {
    if (msg) {
        console.log(msg.content.toString())
    }
    channel.ack(msg)
})

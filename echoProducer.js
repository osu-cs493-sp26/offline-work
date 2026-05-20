import amqp from 'amqplib'
import dotenv from 'dotenv'

dotenv.config({ path: ".env.local" })

const connection = await amqp.connect(process.env.RABBITMQ_URL)
const channel = await connection.createChannel()

await channel.assertQueue("echo")

const text = "The quick brown fox jumped over the lazy dog"
text.split(" ").forEach(word => {
    channel.sendToQueue("echo", Buffer.from(word))
})

await channel.close()
await connection.close()

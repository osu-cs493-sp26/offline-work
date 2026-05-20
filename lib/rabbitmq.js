import amqp from 'amqplib'
import dotenv from 'dotenv'

dotenv.config({ path: ".env.local" })

let _connection = null
let _channel = null

async function getConnection() {
    if (!_connection) {
        _connection = await amqp.connect(process.env.RABBITMQ_URL)
        _connection.on("error", err => {
            console.error("Error creating RabbitMQ connection:", err)
            _connection = null
            _channel = null
        })
        _connection.on("close", () => {
            console.warn("RabbitMQ connection closed")
            _connection = null
            _channel = null
        })
    }
    return _connection
}

export async function getChannel() {
    if (!_channel) {
        const connection = await getConnection()
        _channel = await connection.createChannel()
    }
    return _channel
}

export async function sendMsgToQueue(queue, msgBuffer) {
    const channel = await getChannel()
    await channel.assertQueue(queue, { durable: true })
    channel.sendToQueue(queue, msgBuffer, { persistent: true })
}

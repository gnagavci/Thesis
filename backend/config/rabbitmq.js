import amqp from "amqplib";

let connection = null;
let channel = null;

export const connectRabbitMQ = async () => {
  try {
    if (connection && channel) {
      return channel;
    }

    const rabbitmqUrl =
      process.env.RABBITMQ_URL || "amqp://admin:admin@localhost:5672";

    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();

    // Ensure queue exists
    await channel.assertQueue("simulation_jobs", {
      durable: true,
    });

    console.log("✅ Connected to RabbitMQ");

    // Handle connection errors
    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
      connection = null;
      channel = null;
    });

    connection.on("close", () => {
      console.log("RabbitMQ connection closed");
      connection = null;
      channel = null;
    });

    return channel;
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    throw error;
  }
};

export const publishToQueue = async (queueName, data) => {
  try {
    const channel = await connectRabbitMQ();
    const message = JSON.stringify(data);

    return channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    });
  } catch (error) {
    console.error("Failed to publish to queue:", error);
    throw error;
  }
};

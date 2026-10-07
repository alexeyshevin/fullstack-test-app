import {
  Kafka,
} from 'kafkajs';

export const COMMANDS_TOPIC = 'selection-commands';

export const kafka = new Kafka({
  clientId: 'fullstack-test-app',
  brokers: [
    process.env.KAFKA_BROKER ?? 'localhost:9092',
  ],
});
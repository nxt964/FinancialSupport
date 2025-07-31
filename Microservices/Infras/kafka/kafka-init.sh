#!/bin/bash

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
while ! nc -z kafka 9092; do
  sleep 1
done

echo "Kafka is ready! Creating topics..."

# Create topics
kafka-topics --create --if-not-exists --topic user-registered --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --topic password-reset --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1

echo "Topics created successfully!"
echo "Available topics:"
kafka-topics --list --bootstrap-server kafka:29092 
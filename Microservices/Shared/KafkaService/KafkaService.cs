using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace KafkaService;

public class KafkaService : IKafkaService, IDisposable
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<KafkaService> _logger;
    private readonly ConsumerConfig _consumerConfig;

    public KafkaService(IConfiguration configuration, ILogger<KafkaService> logger)
    {
        _logger = logger;
        
        var bootstrapServers = configuration["Kafka:BootstrapServers"] ?? "localhost:9092";
        
        var producerConfig = new ProducerConfig
        {
            BootstrapServers = bootstrapServers,
            Acks = Acks.All,
            EnableIdempotence = true,
            MessageSendMaxRetries = 3,
            RetryBackoffMs = 1000
        };

        _consumerConfig = new ConsumerConfig
        {
            BootstrapServers = bootstrapServers,
            GroupId = "default-group",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false
        };

        _producer = new ProducerBuilder<string, string>(producerConfig).Build();
    }

    public async Task PublishAsync<T>(string topic, T message, CancellationToken cancellationToken = default)
    {
        await PublishAsync(topic, message, null, cancellationToken);
    }

    public async Task PublishAsync<T>(string topic, T message, string? key, CancellationToken cancellationToken = default)
    {
        try
        {
            var jsonMessage = JsonSerializer.Serialize(message);
            var kafkaMessage = new Message<string, string>
            {
                Key = key,
                Value = jsonMessage
            };

            var result = await _producer.ProduceAsync(topic, kafkaMessage, cancellationToken);
            
            _logger.LogInformation("Message published to topic {Topic} at partition {Partition} with offset {Offset}", 
                result.Topic, result.Partition, result.Offset);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish message to topic {Topic}", topic);
            throw;
        }
    }

    public IConsumer<string, T> CreateConsumer<T>(string groupId, string topic)
    {
        var config = new ConsumerConfig(_consumerConfig)
        {
            GroupId = groupId
        };

        var consumer = new ConsumerBuilder<string, T>(config)
            .SetValueDeserializer(new JsonDeserializer<T>())
            .Build();

        consumer.Subscribe(topic);
        return consumer;
    }

    public async Task ConsumeAsync<T>(string groupId, string topic, Func<T, Task> messageHandler, CancellationToken cancellationToken = default)
    {
        using var consumer = CreateConsumer<T>(groupId, topic);
        
        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var consumeResult = consumer.Consume(cancellationToken);

                    if (consumeResult == null || consumeResult.Message.Value == null) continue;
                    await messageHandler(consumeResult.Message.Value);
                    consumer.Commit(consumeResult);
                        
                    _logger.LogInformation("Message consumed from topic {Topic} at partition {Partition} with offset {Offset}", 
                        consumeResult.Topic, consumeResult.Partition, consumeResult.Offset);
                }
                catch (ConsumeException ex)
                {
                    _logger.LogError(ex, "Error consuming message from topic {Topic}", topic);
                }
            }
        }
        finally
        {
            consumer.Close();
        }
    }

    public void Dispose()
    {
        _producer?.Dispose();
    }
}

public class JsonDeserializer<T> : IDeserializer<T>
{
    public T Deserialize(ReadOnlySpan<byte> data, bool isNull, SerializationContext context)
    {
        if (isNull) return default!;
        
        var json = System.Text.Encoding.UTF8.GetString(data);
        var result = JsonSerializer.Deserialize<T>(json);
        return result ?? default!;
    }
} 
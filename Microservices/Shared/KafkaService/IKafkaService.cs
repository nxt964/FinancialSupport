using Confluent.Kafka;

namespace KafkaService;

public interface IKafkaService
{
    Task PublishAsync<T>(string topic, T message, CancellationToken cancellationToken = default);
    Task PublishAsync<T>(string topic, T message, string key, CancellationToken cancellationToken = default);
    IConsumer<string, T> CreateConsumer<T>(string groupId, string topic);
    Task ConsumeAsync<T>(string groupId, string topic, Func<T, Task> messageHandler, CancellationToken cancellationToken = default);
} 
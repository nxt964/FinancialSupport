using System.Runtime.Serialization;

namespace UserService.Application.Exceptions;

[Serializable]
public class UnauthenticatedException : Exception
{
    public UnauthenticatedException() : base("You are not authenticated") { }

    public UnauthenticatedException(string message) : base(message) { }

    public UnauthenticatedException(string message, Exception innerException)
        : base(message, innerException) { }

    protected UnauthenticatedException(SerializationInfo info, StreamingContext context)
        : base(info, context) { }
}
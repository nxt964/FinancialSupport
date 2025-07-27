using System.Runtime.Serialization;

namespace UserService.Infrastructure.Exceptions
{
    [Serializable]
    public class InvalidOperationException : Exception
    {
        public InvalidOperationException() : base("Invaid request.") { }

        public InvalidOperationException(string message)
            : base(message) { }

        public InvalidOperationException(string message, Exception innerException)
            : base(message, innerException) { }

        protected InvalidOperationException(SerializationInfo info, StreamingContext context) 
            : base(info, context) { }
    }
}
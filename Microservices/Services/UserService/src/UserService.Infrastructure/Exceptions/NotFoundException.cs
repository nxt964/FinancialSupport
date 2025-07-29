using System.Runtime.Serialization;

namespace UserService.Infrastructure.Exceptions
{
    [Serializable]
    public class NotFoundException : Exception
    {
        public NotFoundException() : base("Item can't be found!") { }

        public NotFoundException(string message)
            : base(message) { }

        public NotFoundException(string message, Exception innerException)
            : base(message, innerException) { }

        protected NotFoundException(SerializationInfo info, StreamingContext context) 
            : base(info, context) { }
    }
}
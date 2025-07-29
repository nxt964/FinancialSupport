﻿using System.Runtime.Serialization;

namespace UserService.Application.Exceptions
{
    [Serializable]
    public class ValidationException : Exception
    {
        public ValidationException() : base("Validation failed.") { }

        public ValidationException(string message) : base(message) { }

        public ValidationException(string message, Exception innerException)
            : base(message, innerException) { }

        protected ValidationException(SerializationInfo info, StreamingContext context)
            : base(info, context) { }
    }
}

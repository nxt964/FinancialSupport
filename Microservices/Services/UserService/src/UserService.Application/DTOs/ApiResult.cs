namespace UserService.Application.DTOs;

public class ApiResult<T>
{
    private ApiResult(bool succeeded, T result, IEnumerable<string> errors)
    {
        Succeeded = succeeded;
        Result = result;
        Errors = errors;
    }

    public bool Succeeded { get; set; }

    public T Result { get; set; }

    public IEnumerable<string> Errors { get; set; }

    public static ApiResult<T> Success(T result)
    {
        return new ApiResult<T>(true, result, Array.Empty<string>());
    }

    public static ApiResult<T> Failure(IEnumerable<string> errors)
    {
        return new ApiResult<T>(false, default!, errors);
    }

    public static ApiResult<T> Failure(string error)
    {
        return new ApiResult<T>(false, default!, new[] { error });
    }
}

public static class ApiResultExtensions
{
    public static ApiResult<T> ToApiResult<T>(this T result)
    {
        return ApiResult<T>.Success(result);
    }

    public static ApiResult<T> ToApiResultFailure<T>(this string error)
    {
        return ApiResult<T>.Failure(error);
    }

    public static ApiResult<T> ToApiResultFailure<T>(this IEnumerable<string> errors)
    {
        return ApiResult<T>.Failure(errors);
    }
}

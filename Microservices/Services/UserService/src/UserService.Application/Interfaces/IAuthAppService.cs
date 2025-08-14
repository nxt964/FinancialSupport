using UserService.Application.DTOs;
using UserService.Application.DTOs.Identities;
using UserService.Application.DTOs.Users;
using UserService.Domain.Entities;

namespace UserService.Application.Interfaces;

public interface IAuthAppService
{
    Task<LoginResponse> AuthenticateAsync(LoginRequest request);
    
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
    
    Task<ConfirmRegisterResponse> ConfirmRegisterAsync(ConfirmRegisterRequest request);
    
    Task<ResetPasswordTokenResponse> RequestResetPasswordTokenAsync(ResetPasswordTokenRequest request);
    
    Task<ConfirmResetPasswordTokenResponse> ValidateResetPasswordTokenAsync(ConfirmResetPasswordTokenRequest request);
    
    Task<ResetPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request);
    
    Task<ChangePasswordResponse> UpdatePasswordAsync(ChangePasswordRequest request);
    
    Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request);
    
    Task<LogoutResponse> LogoutAsync(LogoutRequest request);
    
    Task<ResendCodeResponse> ResendRegisterCodeAsync(ResendCodeRequest request);
    
    Task<ResendCodeResponse> ResendResetPasswordCodeAsync(ResendCodeRequest request);
}
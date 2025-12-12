package org.example.service;

import org.example.exception.ActionNotAllowedException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.dto.authDto.JwtAuthDTO;
import org.example.dto.authDto.RefreshTokenDTO;
import org.example.dto.authDto.UserCredentialsDTO;
import org.example.entity.User;
import org.example.exception.AuthenticationFailedException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository repository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public JwtAuthDTO login(UserCredentialsDTO userCredentials){
        User user = findUserByCredentials(userCredentials);
        return jwtService.generateAuthTokens(user.getUsername());
    }

    public void logout(RefreshTokenDTO token){
        String refreshToken = token.getRefreshToken();
        if (refreshToken == null){
            throw new ActionNotAllowedException("Refresh token is required!");
        }
        jwtService.validateRefreshToken(refreshToken);

        String username = jwtService.getUsernameFromRefreshToken(refreshToken);
        if (getUserByUsername(username) == null){
            throw new ResourceNotFoundException("User with username " + username + " not found!");
        }
        jwtService.deleteTokens(refreshToken);
    }

    public JwtAuthDTO refreshToken(RefreshTokenDTO refreshTokenDTO){
        String refreshToken = refreshTokenDTO.getRefreshToken();

        if (refreshToken != null && jwtService.validateRefreshToken(refreshToken)){
            return jwtService.refreshTokens(refreshToken);
        }
        throw new AuthenticationFailedException("Invalid refresh token!");
    }

    private User findUserByCredentials(UserCredentialsDTO userCredentials){
        Optional<User> optionalUser = repository.findByUsername(userCredentials.getUsername());
        if (optionalUser.isPresent()){
            User user = optionalUser.get();
            if (encoder.matches(userCredentials.getPassword(), user.getPasswordHash())){
                return user;
            }
        }
        throw new AuthenticationFailedException("Username or Password is not correct");
    }

    private User getUserByUsername(String username) {
        return repository.findByUsername(username).orElse(null);
    }
}

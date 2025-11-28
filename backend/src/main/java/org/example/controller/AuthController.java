package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.authDto.*;
import org.example.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public JwtAuthDTO login(@RequestBody UserCredentialsDTO dto){
        return authService.login(dto);
    }

    @DeleteMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenDTO tokens){
        authService.logout(tokens);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh")
    public JwtAuthDTO refresh(@RequestBody RefreshTokenDTO dto){
        return authService.refreshToken(dto);
    }
}

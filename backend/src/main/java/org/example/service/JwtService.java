package org.example.service;

import io.jsonwebtoken.*;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.exception.AuthenticationFailedException;
import org.example.exception.InvalidTokenException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.RefreshTokenRepository;
import org.example.security.jwt.JwtProperties;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.security.Keys;
import org.example.dto.authDto.JwtAuthDTO;
import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;


@Component
@RequiredArgsConstructor
@Transactional
public class JwtService {
    private final JwtProperties jwtProperties;
    private final RefreshTokenRepository refreshTokenRepository;


    public JwtAuthDTO generateAuthTokens(String username){
        JwtAuthDTO dto = new JwtAuthDTO();
        dto.setAccessToken(generateAccessToken(username));
        dto.setRefreshToken(generateRefreshToken(username));

        refreshTokenRepository.saveToken(username, dto.getRefreshToken());

        return dto;
    }

    public JwtAuthDTO refreshTokens(String refreshToken){
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey(jwtProperties.getRefreshSecret()))
                .build()
                .parseClaimsJws(refreshToken)
                .getBody();

        String username = claims.getSubject();
        if (refreshTokenRepository.getToken(username) == null) {
            throw new ResourceNotFoundException("Token with key " + username + "not found!");
        }

        return generateAuthTokens(username);
    }

    public void deleteTokens(String refreshToken){
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey(jwtProperties.getRefreshSecret()))
                .build()
                .parseClaimsJws(refreshToken)
                .getBody();

        String username = claims.getSubject();
        refreshTokenRepository.deleteToken(username);
    }

    public String getUsernameFromAccessToken(String token){
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey(jwtProperties.getAccessSecret()))
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public String getUsernameFromRefreshToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey(jwtProperties.getRefreshSecret()))
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateAccessToken(String accessToken){
        try{
            Jwts.parserBuilder()
                    .setSigningKey(getSignKey(jwtProperties.getAccessSecret()))
                    .build()
                    .parseClaimsJws(accessToken);
            return true;

        } catch (ExpiredJwtException e) {
            throw new InvalidTokenException("Token has expired");
        } catch (MalformedJwtException e) {
            throw new InvalidTokenException("Token is malformed");
        } catch (SecurityException e) {
            throw new InvalidTokenException("Invalid token signature");
        } catch (JwtException e) {
            throw new AuthenticationFailedException("Access Token invalid");
        }
    }

    public boolean validateRefreshToken(String refreshToken){
        try{
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSignKey(jwtProperties.getRefreshSecret()))
                    .build()
                    .parseClaimsJws(refreshToken)
                    .getBody();

            String username = claims.getSubject();
            if (refreshTokenRepository.getToken(username) == null) {
                throw new ResourceNotFoundException("Token with key " + username + "not found!");
            }

            return true;

        } catch (ExpiredJwtException e) {
            throw new InvalidTokenException("Token has expired");
        } catch (MalformedJwtException e) {
            throw new InvalidTokenException("Token is malformed");
        } catch (SecurityException e) {
            throw new InvalidTokenException("Invalid token signature");
        } catch (JwtException e) {
            throw new AuthenticationFailedException("Refresh Token invalid");
        }
    }

    private String generateAccessToken(String username){
        Date expirationDate = Date.from(LocalDateTime.now()
                                        .plusSeconds(jwtProperties.getAccessValidity())
                                        .atZone(ZoneId.systemDefault()).toInstant());
        return Jwts.builder()
                .setSubject(username)
                .setExpiration(expirationDate)
                .signWith(getSignKey(jwtProperties.getAccessSecret()))
                .compact();
    }

    private String generateRefreshToken(String username){
        Date expirationDate = Date.from(LocalDateTime.now()
                .plusSeconds(jwtProperties.getRefreshValidity())
                .atZone(ZoneId.systemDefault()).toInstant());
        return Jwts.builder()
                .setSubject(username)
                .setExpiration(expirationDate)
                .signWith(getSignKey(jwtProperties.getRefreshSecret()))
                .compact();
    }

    private SecretKey getSignKey(String tokenSecret){
        return Keys.hmacShaKeyFor(tokenSecret.getBytes(StandardCharsets.UTF_8));
    }
}

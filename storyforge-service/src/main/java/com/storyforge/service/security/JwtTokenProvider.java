package com.storyforge.service.security;

import com.storyforge.common.constant.StoryForgeConstants;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT 令牌工具类
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessExpiration;
    private final long refreshExpiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long accessExpiration,
            @Value("${jwt.refresh-expiration}") long refreshExpiration) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    /**
     * 生成 Access Token
     */
    public String generateAccessToken(Long userId, String username) {
        return buildToken(userId, username, accessExpiration, StoryForgeConstants.TOKEN_TYPE_ACCESS);
    }

    /**
     * 生成 Refresh Token
     */
    public String generateRefreshToken(Long userId, String username) {
        return buildToken(userId, username, refreshExpiration, StoryForgeConstants.TOKEN_TYPE_REFRESH);
    }

    /**
     * 获取 Access Token 过期时间（秒）
     */
    public long getAccessExpirationSeconds() {
        return accessExpiration / 1000;
    }

    /**
     * 从 Token 中提取用户ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 从 Token 中提取用户名
     */
    public String getUsernameFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("username", String.class);
    }

    /**
     * 获取 Token 类型（access / refresh）
     */
    public String getTokenType(String token) {
        Claims claims = parseToken(token);
        return claims.get("type", String.class);
    }

    /**
     * 校验 Token 是否有效
     */
    public boolean validateToken(String token) {
        return getValidClaims(token) != null;
    }

    public Claims getValidClaims(String token) {
        try {
            return parseToken(token);
        } catch (ExpiredJwtException e) {
            log.warn("JWT token 已过期: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("不支持的 JWT token: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT token 格式错误: {}", e.getMessage());
        } catch (SecurityException e) {
            log.warn("JWT 签名无效: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT token 为空: {}", e.getMessage());
        }
        return null;
    }

    private String buildToken(Long userId, String username, long expiration, String type) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .claim("type", type)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

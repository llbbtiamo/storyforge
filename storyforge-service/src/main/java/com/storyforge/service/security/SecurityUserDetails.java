package com.storyforge.service.security;

import com.storyforge.common.constant.StoryForgeConstants;
import com.storyforge.domain.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security UserDetails 实现，包装 User 实体
 */
@Getter
public class SecurityUserDetails implements UserDetails {

    private final Long userId;
    private final String username;
    private final String password;
    private final Integer status;
    private final Collection<? extends GrantedAuthority> authorities;

    public SecurityUserDetails(User user) {
        this.userId = user.getId();
        this.username = user.getUsername();
        this.password = user.getPasswordHash();
        this.status = user.getStatus();
        // MVP 阶段仅使用 ROLE_USER，可后续扩展 VIP 等角色
        this.authorities = List.of(new SimpleGrantedAuthority(StoryForgeConstants.ROLE_USER));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != null && status == StoryForgeConstants.USER_STATUS_ACTIVE;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status != null && status == StoryForgeConstants.USER_STATUS_ACTIVE;
    }
}

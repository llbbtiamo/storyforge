package com.storyforge.service;

import com.storyforge.domain.dto.CaptchaResponse;
import com.storyforge.domain.dto.RegisterEmailCodeResponse;

public interface IAuthVerificationService {

    CaptchaResponse createCaptcha(String purpose);

    RegisterEmailCodeResponse sendRegisterEmailCode(String email, String captchaId, String captchaCode);

    void verifyLoginCaptcha(String captchaId, String captchaCode);

    void verifyRegisterEmailCode(String email, String emailVerificationCode);

    void consumeRegisterEmailCode(String email);

    String normalizeEmail(String email);
}

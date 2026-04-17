package com.facilio.facilio_campus.security;

import com.facilio.facilio_campus.dto.AuthResponse;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final OAuthLoginHandoffService oAuthLoginHandoffService;
    private final String frontendSuccessUrl;

    public OAuth2LoginSuccessHandler(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            OAuthLoginHandoffService oAuthLoginHandoffService,
            @Value("${app.oauth2.frontend-success-url:http://localhost:5173/login}") String frontendSuccessUrl
    ) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.oAuthLoginHandoffService = oAuthLoginHandoffService;
        this.frontendSuccessUrl = frontendSuccessUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = safeValue(oauthUser.getAttribute("email")).toLowerCase();
        if (email.isBlank()) {
            redirectWithError(request, response, "Google account email could not be read.");
            return;
        }

        User user = userRepository.findByGoogleEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElse(null);
        if (user == null) {
            redirectWithError(request, response, "This Google account is not linked to an approved campus account yet. Please send an access request first.");
            return;
        }

        AuthResponse authResponse = new AuthResponse(
                jwtUtil.generateToken(new CustomUserDetails(user)),
                user.getName(),
                user.getRole().name()
        );
        String oauthCode = oAuthLoginHandoffService.issueCode(authResponse);
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendSuccessUrl)
                .queryParam("oauthCode", oauthCode)
                .build()
                .encode()
                .toUriString();

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private void redirectWithError(HttpServletRequest request, HttpServletResponse response, String message)
            throws IOException {
        getRedirectStrategy().sendRedirect(
                request,
                response,
                UriComponentsBuilder.fromUriString(frontendSuccessUrl)
                        .queryParam("oauthError", message)
                        .build()
                        .encode()
                        .toUriString()
        );
    }

    private String safeValue(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}

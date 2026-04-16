package com.facilio.facilio_campus.security;

import com.facilio.facilio_campus.model.Role;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OAuth2LoginSuccessHandlerTests {

    @Test
    void unknownGoogleEmailRedirectsToAccessRequestMessage() throws Exception {
        UserRepository userRepository = mock(UserRepository.class);
        JwtUtil jwtUtil = mock(JwtUtil.class);
        OAuthLoginHandoffService handoffService = mock(OAuthLoginHandoffService.class);
        Authentication authentication = mock(Authentication.class);
        OAuth2User oauthUser = new DefaultOAuth2User(
                List.of(),
                Map.of("email", "newstudent@fcu.lk", "name", "New Student"),
                "email"
        );

        when(authentication.getPrincipal()).thenReturn(oauthUser);
        when(userRepository.findByEmail("newstudent@fcu.lk")).thenReturn(Optional.empty());

        OAuth2LoginSuccessHandler handler = new OAuth2LoginSuccessHandler(
                userRepository,
                jwtUtil,
                handoffService,
                "http://localhost:5173/login"
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.onAuthenticationSuccess(request, response, authentication);

        assertTrue(response.getRedirectedUrl().contains("oauthError="));
        assertTrue(response.getRedirectedUrl().contains("access"));
        assertTrue(response.getRedirectedUrl().contains("request"));
        assertTrue(!response.getRedirectedUrl().contains("oauthCode="));
        verify(jwtUtil, never()).generateToken(any());
        verify(handoffService, never()).issueCode(any());
    }

    @Test
    void existingGoogleUserReceivesOAuthCodeRedirect() throws Exception {
        UserRepository userRepository = mock(UserRepository.class);
        JwtUtil jwtUtil = mock(JwtUtil.class);
        OAuthLoginHandoffService handoffService = mock(OAuthLoginHandoffService.class);
        Authentication authentication = mock(Authentication.class);
        OAuth2User oauthUser = new DefaultOAuth2User(
                List.of(),
                Map.of("email", "approved.student@gmail.com", "name", "Approved Student"),
                "email"
        );
        User user = new User("Approved Student", "approved@fcu.lk", "approved.student@gmail.com", "encoded", Role.ROLE_STUDENT);

        when(authentication.getPrincipal()).thenReturn(oauthUser);
        when(userRepository.findByGoogleEmailIgnoreCase("approved.student@gmail.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(any())).thenReturn("jwt-token");
        when(handoffService.issueCode(any())).thenReturn("oauth-code-123");

        OAuth2LoginSuccessHandler handler = new OAuth2LoginSuccessHandler(
                userRepository,
                jwtUtil,
                handoffService,
                "http://localhost:5173/login"
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.onAuthenticationSuccess(request, response, authentication);

        assertTrue(response.getRedirectedUrl().contains("oauthCode=oauth-code-123"));
        verify(jwtUtil).generateToken(any());
        verify(handoffService).issueCode(any());
    }
}

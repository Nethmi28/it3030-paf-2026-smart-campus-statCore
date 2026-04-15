package com.facilio.facilio_campus.controller;

import com.facilio.facilio_campus.dto.AuthResponse;
import com.facilio.facilio_campus.dto.LoginRequest;
import com.facilio.facilio_campus.model.Role;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.UserRepository;
import com.facilio.facilio_campus.security.CustomUserDetails;
import com.facilio.facilio_campus.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;
    private final boolean enableTestUserEndpoint;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, 
                          UserRepository userRepository, PasswordEncoder passwordEncoder,
                          Environment environment,
                          @Value("${app.auth.enable-test-user:true}") boolean enableTestUserEndpoint) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
        this.enableTestUserEndpoint = enableTestUserEndpoint;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                userDetails.getUser().getName(),
                userDetails.getUser().getRole().name()
        ));
    }

    // Temporary helper endpoint so we can seed a test user
    @PostMapping("/register-test-user")
    public ResponseEntity<?> registerTestUser() {
        boolean isProdProfile = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (isProdProfile || !enableTestUserEndpoint) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (!userRepository.existsByEmail("test@campus.edu")) {
             userRepository.save(new User("System Admin", "test@campus.edu", passwordEncoder.encode("password123"), Role.ROLE_ADMIN));
        }
        if (!userRepository.existsByEmail("mghettiarchhi@fcu.lk")) {
             userRepository.save(new User("Manager Ghettiarchhi", "mghettiarchhi@fcu.lk", passwordEncoder.encode("password123"), Role.ROLE_MANAGER));
        }
        if (!userRepository.existsByEmail("tcsaman@fcu.lk")) {
             userRepository.save(new User("Technician Saman", "tcsaman@fcu.lk", passwordEncoder.encode("password123"), Role.ROLE_TECHNICIAN));
        }
        if (!userRepository.existsByEmail("cu2354675@fcu.lk")) {
             userRepository.save(new User("Student Center", "cu2354675@fcu.lk", passwordEncoder.encode("password123"), Role.ROLE_STUDENT));
        }

        return ResponseEntity.ok("All test users verified/seeded successfully!");
    }
}

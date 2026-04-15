package com.facilio.facilio_campus.controller;

import com.facilio.facilio_campus.dto.AccountRequestDto;
import com.facilio.facilio_campus.dto.AuthResponse;
import com.facilio.facilio_campus.dto.LoginRequest;
import com.facilio.facilio_campus.model.AccountRequest;
import com.facilio.facilio_campus.model.Role;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.AccountRequestRepository;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final AccountRequestRepository accountRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;
    private final boolean enableTestUserEndpoint;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, 
                          UserRepository userRepository, AccountRequestRepository accountRequestRepository,
                          PasswordEncoder passwordEncoder,
                          Environment environment,
                          @Value("${app.auth.enable-test-user:true}") boolean enableTestUserEndpoint) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.accountRequestRepository = accountRequestRepository;
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

    @PostMapping("/account-requests")
    public ResponseEntity<?> createAccountRequest(@RequestBody AccountRequestDto request) {
        String fullName = safeTrim(request.getFullName());
        String email = safeTrim(request.getEmail()).toLowerCase();
        String studentId = safeTrim(request.getStudentId()).toUpperCase();
        String faculty = safeTrim(request.getFaculty());
        String note = safeTrim(request.getNote());

        if (fullName.isBlank() || email.isBlank() || studentId.isBlank() || faculty.isBlank()) {
            return ResponseEntity.badRequest().body("Full name, university email, student ID, and faculty are required.");
        }

        if (!email.contains("@")) {
            return ResponseEntity.badRequest().body("Enter a valid email address.");
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("An account already exists for this email.");
        }

        if (accountRequestRepository.existsByEmailIgnoreCase(email) || accountRequestRepository.existsByStudentIdIgnoreCase(studentId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("A request has already been sent for this student.");
        }

        AccountRequest accountRequest = new AccountRequest(fullName, email, studentId, faculty, note, "PENDING");
        accountRequestRepository.save(accountRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body("Your account request has been sent to the campus admin team.");
    }

    @GetMapping("/account-requests")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAccountRequests() {
        return ResponseEntity.ok(accountRequestRepository.findAllByOrderByCreatedAtDesc());
    }

    @PatchMapping("/account-requests/{id}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> approveAccountRequest(@PathVariable Long id) {
        AccountRequest accountRequest = accountRequestRepository.findById(id)
                .orElse(null);

        if (accountRequest == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Registration request not found.");
        }

        String email = safeTrim(accountRequest.getEmail()).toLowerCase();
        String studentId = safeTrim(accountRequest.getStudentId()).toUpperCase();

        if ("APPROVED".equalsIgnoreCase(accountRequest.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("This registration request has already been approved.");
        }

        if (userRepository.existsByEmail(email)) {
            accountRequest.setStatus("APPROVED");
            accountRequestRepository.save(accountRequest);
            return ResponseEntity.ok(Map.of(
                    "message", "A student account already exists for this request.",
                    "email", email,
                    "temporaryPassword", buildTemporaryPassword(studentId),
                    "status", accountRequest.getStatus()
            ));
        }

        String temporaryPassword = buildTemporaryPassword(studentId);

        User newStudent = new User(
                accountRequest.getFullName(),
                email,
                passwordEncoder.encode(temporaryPassword),
                Role.ROLE_STUDENT
        );
        userRepository.save(newStudent);

        accountRequest.setStatus("APPROVED");
        accountRequestRepository.save(accountRequest);

        return ResponseEntity.ok(Map.of(
                "message", "Student access has been approved.",
                "email", email,
                "temporaryPassword", temporaryPassword,
                "status", accountRequest.getStatus()
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

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private String buildTemporaryPassword(String studentId) {
        return studentId + "@2026";
    }
}

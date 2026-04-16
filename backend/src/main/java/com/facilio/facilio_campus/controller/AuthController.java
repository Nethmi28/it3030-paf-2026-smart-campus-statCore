package com.facilio.facilio_campus.controller;

import com.facilio.facilio_campus.dto.AccountRequestDto;
import com.facilio.facilio_campus.dto.AdminUserDto;
import com.facilio.facilio_campus.dto.AuthResponse;
import com.facilio.facilio_campus.dto.LoginRequest;
import com.facilio.facilio_campus.dto.OAuthExchangeRequest;
import com.facilio.facilio_campus.dto.UpdateUserRoleDto;
import com.facilio.facilio_campus.model.AccountRequest;
import com.facilio.facilio_campus.model.Role;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.AccountRequestRepository;
import com.facilio.facilio_campus.repository.UserRepository;
import com.facilio.facilio_campus.security.CustomUserDetails;
import com.facilio.facilio_campus.security.JwtUtil;
import com.facilio.facilio_campus.security.OAuthLoginHandoffService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
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
    private final OAuthLoginHandoffService oAuthLoginHandoffService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, 
                          UserRepository userRepository, AccountRequestRepository accountRequestRepository,
                          PasswordEncoder passwordEncoder,
                          Environment environment,
                          OAuthLoginHandoffService oAuthLoginHandoffService,
                          @Value("${app.auth.enable-test-user:true}") boolean enableTestUserEndpoint) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.accountRequestRepository = accountRequestRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
        this.oAuthLoginHandoffService = oAuthLoginHandoffService;
        this.enableTestUserEndpoint = enableTestUserEndpoint;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail().trim().toLowerCase(),
                            loginRequest.getPassword()
                    )
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return ResponseEntity.ok(buildAuthResponse(userDetails));
        } catch (AuthenticationException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        }
    }

    @PostMapping("/oauth/exchange")
    public ResponseEntity<?> exchangeOAuthCode(@Valid @RequestBody OAuthExchangeRequest request) {
        return oAuthLoginHandoffService.consumeCode(request.getCode())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("The Google sign-in session is invalid or has expired."));
    }

    @PostMapping("/account-requests")
    public ResponseEntity<?> createAccountRequest(@RequestBody AccountRequestDto request) {
        String fullName = safeTrim(request.getFullName());
        String requestedRoleValue = safeTrim(request.getRequestedRole());
        String email = safeTrim(request.getEmail()).toLowerCase();
        String googleEmail = normalizeOptionalEmail(request.getGoogleEmail());
        String password = safeTrim(request.getPassword());
        String studentId = safeTrim(request.getStudentId()).toUpperCase();
        String faculty = safeTrim(request.getFaculty());
        String note = safeTrim(request.getNote());
        Role requestedRole = parseRequestedRole(requestedRoleValue);

        if (fullName.isBlank() || requestedRoleValue.isBlank() || email.isBlank() || studentId.isBlank() || faculty.isBlank()) {
            return ResponseEntity.badRequest().body("Full name, role, campus email, campus ID, and faculty or unit are required.");
        }

        if (requestedRole == null) {
            return ResponseEntity.badRequest().body("Choose a valid account role for your request.");
        }

        if (!email.contains("@")) {
            return ResponseEntity.badRequest().body("Enter a valid email address.");
        }

        if (!googleEmail.isBlank() && !googleEmail.contains("@")) {
            return ResponseEntity.badRequest().body("Enter a valid Google sign-in email address.");
        }

        if (!isValidRequestedPassword(password)) {
            return ResponseEntity.badRequest().body("Choose a password with at least 8 characters for your account request.");
        }

        if (!isValidCampusIdentity(requestedRole, email, studentId)) {
            return ResponseEntity.badRequest().body("Use the correct campus ID and email format for the selected role. Example: st23707290 / st23707290@my.cu.lk.");
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("An account already exists for this email.");
        }

        if (!googleEmail.isBlank() && userRepository.existsByGoogleEmailIgnoreCase(googleEmail)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("This Google sign-in email is already linked to another account.");
        }

        if (accountRequestRepository.existsByEmailIgnoreCase(email) || accountRequestRepository.existsByStudentIdIgnoreCase(studentId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("A request has already been sent for this student.");
        }

        if (!googleEmail.isBlank() && accountRequestRepository.existsByGoogleEmailIgnoreCase(googleEmail)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("A request has already been sent with this Google sign-in email.");
        }

        AccountRequest accountRequest = new AccountRequest(
                fullName,
                email,
                googleEmail,
                passwordEncoder.encode(password),
                requestedRole.name(),
                studentId,
                faculty,
                note,
                "PENDING"
        );
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
        String googleEmail = normalizeOptionalEmail(accountRequest.getGoogleEmail());
        String studentId = safeTrim(accountRequest.getStudentId()).toUpperCase();
        Role requestedRole = parseRequestedRole(accountRequest.getRequestedRole());

        User userLinkedToGoogleEmail = googleEmail.isBlank()
                ? null
                : userRepository.findByGoogleEmailIgnoreCase(googleEmail).orElse(null);

        if ("APPROVED".equalsIgnoreCase(accountRequest.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("This registration request has already been approved.");
        }

        if (requestedRole == null) {
            requestedRole = Role.ROLE_STUDENT;
        }

        if (userRepository.existsByEmail(email)) {
            User existingUser = userRepository.findByEmail(email).orElseThrow();
            if (userLinkedToGoogleEmail != null && !existingUser.getId().equals(userLinkedToGoogleEmail.getId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("This Google sign-in email is already linked to another account.");
            }
            if (!googleEmail.isBlank()) {
                existingUser.setGoogleEmail(googleEmail);
            }
            existingUser.setRole(requestedRole);
            userRepository.save(existingUser);
            accountRequest.setStatus("APPROVED");
            accountRequestRepository.save(accountRequest);
            return ResponseEntity.ok(Map.of(
                    "message", "An account already exists for this campus email.",
                    "email", email,
                    "loginNote", "The existing account keeps its current password.",
                    "status", accountRequest.getStatus()
            ));
        }

        String temporaryPassword = buildTemporaryPassword(studentId);
        String approvedPasswordHash = accountRequest.getPasswordHash();

        if (userLinkedToGoogleEmail != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("This Google sign-in email is already linked to another account.");
        }

        User newUser = new User(
                accountRequest.getFullName(),
                email,
                googleEmail.isBlank() ? null : googleEmail,
                approvedPasswordHash == null || approvedPasswordHash.isBlank()
                        ? passwordEncoder.encode(temporaryPassword)
                        : approvedPasswordHash,
                requestedRole
        );
        userRepository.save(newUser);

        accountRequest.setStatus("APPROVED");
        accountRequestRepository.save(accountRequest);

        return ResponseEntity.ok(Map.of(
                "message", "Account access has been approved.",
                "email", email,
                "loginNote", approvedPasswordHash == null || approvedPasswordHash.isBlank()
                        ? "Temporary password: " + temporaryPassword
                        : "The user can now sign in with the password they created in the request form.",
                "status", accountRequest.getStatus()
        ));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAdminUsers() {
        List<AdminUserDto> users = userRepository.findAll()
                .stream()
                .map(user -> new AdminUserDto(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name()
                ))
                .toList();

        return ResponseEntity.ok(users);
    }

    @PatchMapping("/admin/users/{id}/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody UpdateUserRoleDto request) {
        String requestedRole = safeTrim(request.getRole()).toUpperCase();

        if (requestedRole.isBlank()) {
            return ResponseEntity.badRequest().body("A role is required.");
        }

        Role role;
        try {
            role = Role.valueOf(requestedRole);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body("The selected role is not valid.");
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(new AdminUserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        ));
    }

    // Temporary helper endpoint so we can seed a test user
    @PostMapping("/register-test-user")
    public ResponseEntity<?> registerTestUser() {
        boolean isProdProfile = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (isProdProfile || !enableTestUserEndpoint) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        upsertTestUser("System Admin", "test@campus.edu", "AD@2026", Role.ROLE_ADMIN);
        upsertTestUser("Manager Ghettiarchhi", "mghettiarchhi@fcu.lk", "MG@2026", Role.ROLE_MANAGER);
        upsertTestUser("Technician Saman", "tcsaman@fcu.lk", "TC@2026", Role.ROLE_TECHNICIAN);
        upsertTestUser("Student Center", "cu2354675@fcu.lk", "ST@2026", Role.ROLE_STUDENT);

        return ResponseEntity.ok("All test users verified/seeded successfully!");
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeOptionalEmail(String value) {
        return safeTrim(value).toLowerCase();
    }

    private AuthResponse buildAuthResponse(CustomUserDetails userDetails) {
        String jwt = jwtUtil.generateToken(userDetails);
        return new AuthResponse(
                jwt,
                userDetails.getUser().getName(),
                userDetails.getUser().getRole().name()
        );
    }

    private String buildTemporaryPassword(String studentId) {
        return studentId + "@2026";
    }

    private boolean isValidRequestedPassword(String password) {
        return password != null && password.length() >= 8;
    }

    private Role parseRequestedRole(String requestedRole) {
        String normalizedRole = safeTrim(requestedRole).toUpperCase();
        if (normalizedRole.isBlank()) {
            return null;
        }

        try {
            return Role.valueOf(normalizedRole);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private boolean isValidCampusIdentity(Role role, String email, String campusId) {
        if (role == null) {
            return false;
        }

        String normalizedEmail = safeTrim(email).toLowerCase();
        String normalizedCampusId = safeTrim(campusId).toLowerCase();
        String expectedPrefix = getRolePrefix(role);

        if (expectedPrefix.isBlank()) {
            return false;
        }

        String expectedPattern = "^" + expectedPrefix + "\\d+@my\\.cu\\.lk$";
        if (!normalizedEmail.matches(expectedPattern)) {
            return false;
        }

        return normalizedCampusId.matches("^" + expectedPrefix + "\\d+$")
                && normalizedEmail.substring(0, normalizedEmail.indexOf('@')).equals(normalizedCampusId);
    }

    private String getRolePrefix(Role role) {
        return switch (role) {
            case ROLE_ADMIN -> "ad";
            case ROLE_MANAGER -> "mg";
            case ROLE_TECHNICIAN -> "tc";
            case ROLE_STUDENT -> "st";
        };
    }

    private void upsertTestUser(String name, String email, String rawPassword, Role role) {
        User user = userRepository.findByEmail(email)
                .orElse(new User(name, email, passwordEncoder.encode(rawPassword), role));

        user.setName(name);
        user.setRole(role);
        user.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
    }
}

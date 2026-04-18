package com.facilio.facilio_campus.controller;

import com.facilio.facilio_campus.dto.BookingAuditLogResponseDTO;
import com.facilio.facilio_campus.dto.BookingCheckInRequestDTO;
import com.facilio.facilio_campus.dto.BookingRequestDTO;
import com.facilio.facilio_campus.dto.BookingResponseDTO;
import com.facilio.facilio_campus.dto.BookingStatusUpdateDTO;
import com.facilio.facilio_campus.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*") // Ideally front end host
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping(consumes = {"multipart/form-data", "application/json"})
    public ResponseEntity<?> createBooking(
            @RequestPart("booking") BookingRequestDTO request, 
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be authenticated");
            }
            BookingResponseDTO response = bookingService.createBooking(request, file, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            // Return 409 Conflict if resource is already booked
            if (e.getMessage() != null && e.getMessage().contains("already booked")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage() != null ? e.getMessage() : "An unexpected error occurred");
        }
    }

    @GetMapping("/availability")
    public ResponseEntity<List<BookingResponseDTO>> getAvailability(
            @RequestParam Long resourceId, 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<BookingResponseDTO> bookings = bookingService.getConflictingBookingsForDate(resourceId, date);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<BookingResponseDTO> myBookings = bookingService.getMyBookings(authentication.getName());
        return ResponseEntity.ok(myBookings);
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> allBookings = bookingService.getAllBookings();
        return ResponseEntity.ok(allBookings);
    }

    @GetMapping("/audit")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<BookingAuditLogResponseDTO>> getRecentAuditLogs() {
        return ResponseEntity.ok(bookingService.getRecentAuditLogs());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestBody BookingStatusUpdateDTO request) {
        try {
            BookingResponseDTO response = bookingService.updateBookingStatus(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be authenticated");
            }
            BookingResponseDTO response = bookingService.cancelBooking(id, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            if(e.getMessage() != null && e.getMessage().contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> verifyCheckIn(@PathVariable Long id, @RequestBody BookingCheckInRequestDTO request, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be authenticated");
            }
            BookingResponseDTO response = bookingService.verifyCheckIn(id, request, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}

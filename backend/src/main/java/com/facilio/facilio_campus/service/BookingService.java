package com.facilio.facilio_campus.service;

import com.facilio.facilio_campus.dto.BookingAuditLogResponseDTO;
import com.facilio.facilio_campus.dto.BookingCheckInRequestDTO;
import com.facilio.facilio_campus.dto.BookingRequestDTO;
import com.facilio.facilio_campus.dto.BookingResponseDTO;
import com.facilio.facilio_campus.dto.BookingStatusUpdateDTO;
import com.facilio.facilio_campus.model.BookingAuditAction;
import com.facilio.facilio_campus.model.BookingAuditLog;
import com.facilio.facilio_campus.model.Booking;
import com.facilio.facilio_campus.model.BookingStatus;
import com.facilio.facilio_campus.model.NotificationPriority;
import com.facilio.facilio_campus.model.NotificationType;
import com.facilio.facilio_campus.model.Role;
import com.facilio.facilio_campus.model.Resource;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.BookingAuditLogRepository;
import com.facilio.facilio_campus.repository.BookingRepository;
import com.facilio.facilio_campus.repository.ResourceRepository;
import com.facilio.facilio_campus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final LocalTime BOOKING_DAY_END_TIME = LocalTime.of(17, 0);
    private static final int CHECK_IN_OPEN_BUFFER_MINUTES = 30;
    private static final String CHECK_IN_PREFIX = "FACILIO-CHECKIN";

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingAuditLogRepository bookingAuditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private NotificationService notificationService;

    private final String UPLOAD_DIR = "uploads/bookings/";

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request, MultipartFile file, String userEmail) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        validateBookingRequest(request, resource);

        long conflicts = bookingRepository.countConflictingBookings(
                request.getResourceId(), request.getBookingDate(), request.getStartTime(), request.getEndTime());

        if (conflicts > 0) {
            throw new IllegalArgumentException("Resource is already booked for the selected time.");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setAdditionalRequirements(request.getAdditionalRequirements());
        booking.setStatus(BookingStatus.PENDING);

        // Handle File upload if it's an Auditorium
        if (resource.getName().toLowerCase().contains("auditorium")) {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("PDF approval from faculty head is required for auditorium bookings.");
            }
            
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            booking.setFacultyApprovalPdf(filePath.toString());
        }

        Booking savedBooking = bookingRepository.save(booking);
        notificationService.notifyRoles(
                List.of(Role.ROLE_MANAGER, Role.ROLE_ADMIN),
                "New booking request submitted",
                user.getName() + " requested " + resource.getName()
                        + " for " + request.getBookingDate()
                        + " from " + request.getStartTime()
                        + " to " + request.getEndTime() + ".",
                NotificationType.BOOKING,
                NotificationPriority.MEDIUM,
                "Booking Management"
        );
        return mapToDTO(savedBooking);
    }

    private void validateBookingRequest(BookingRequestDTO request, Resource resource) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (request.getEndTime().isAfter(BOOKING_DAY_END_TIME)) {
            throw new IllegalArgumentException("Bookings must end by 5:00 PM. The last booking period is 3:00 PM to 5:00 PM.");
        }

        if (request.getExpectedAttendees() == null || request.getExpectedAttendees() < 1) {
            throw new IllegalArgumentException("Expected attendees must be at least 1");
        }

        if (request.getExpectedAttendees() > resource.getCapacity()) {
            throw new IllegalArgumentException(
                    "Expected attendees cannot exceed the selected resource capacity of " + resource.getCapacity() + "."
            );
        }
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getConflictingBookingsForDate(Long resourceId, LocalDate date) {
        return bookingRepository.findConflictingBookingsForDate(resourceId, date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return bookingRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingAuditLogResponseDTO> getRecentAuditLogs() {
        return bookingAuditLogRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .map(this::mapAuditToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponseDTO updateBookingStatus(Long id, BookingStatusUpdateDTO updateDTO) {
        if (updateDTO.getStatus() == null) {
            throw new IllegalArgumentException("Booking status is required");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        BookingStatus previousStatus = booking.getStatus();

        booking.setStatus(updateDTO.getStatus());
        if (updateDTO.getAdminReason() != null) {
            booking.setAdminReason(updateDTO.getAdminReason());
        }
        
        Booking updatedBooking = bookingRepository.save(booking);
        notificationService.notifyUser(
                updatedBooking.getUser(),
                "Booking " + humanizeBookingStatus(updatedBooking.getStatus()),
                "Your booking for " + updatedBooking.getResource().getName()
                        + " on " + updatedBooking.getBookingDate()
                        + " is now " + humanizeBookingStatus(updatedBooking.getStatus()).toLowerCase()
                        + formatAdminReason(updatedBooking.getAdminReason()),
                NotificationType.BOOKING,
                updatedBooking.getStatus() == BookingStatus.REJECTED
                        ? NotificationPriority.HIGH
                        : NotificationPriority.MEDIUM,
                "Booking Management"
        );
        return mapToDTO(updatedBooking);
    }

    @Transactional
    public BookingResponseDTO cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
             throw new IllegalArgumentException("Cannot cancel booking with current status");
        }

        if (Boolean.TRUE.equals(booking.getCheckedIn())) {
            throw new IllegalArgumentException("Cannot cancel a booking that has already been checked in");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);
        notificationService.notifyRoles(
                List.of(Role.ROLE_MANAGER, Role.ROLE_ADMIN),
                "Booking cancelled",
                booking.getUser().getName() + " cancelled the booking for "
                        + booking.getResource().getName()
                        + " on " + booking.getBookingDate() + ".",
                NotificationType.BOOKING,
                NotificationPriority.LOW,
                "Booking Management"
        );
        return mapToDTO(cancelledBooking);
    }

    private String humanizeBookingStatus(BookingStatus status) {
        return status.name().replace('_', ' ');
    }

    private String formatAdminReason(String adminReason) {
        if (adminReason == null || adminReason.isBlank()) {
            return ".";
        }

        return ". Reason: " + adminReason;
    }

    private BookingResponseDTO mapToDTO(Booking booking) {
        return new BookingResponseDTO(
            booking.getId(),
            booking.getUser().getId(),
            booking.getUser().getName(),
            booking.getUser().getEmail(),
            booking.getResource().getId(),
            booking.getResource().getName(),
            booking.getBookingDate(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getPurpose(),
            booking.getExpectedAttendees(),
            booking.getStatus(),
            booking.getAdminReason(),
            booking.getFacultyApprovalPdf(),
            booking.getAdditionalRequirements(),
            buildCheckInPayload(booking),
            booking.getCheckedIn(),
            booking.getCheckedInAt(),
            booking.getCheckedInBy(),
            booking.getCreatedAt()
        );
    }

    private String generateCheckInToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String buildCheckInPayload(Booking booking) {
        if (booking.getCheckInToken() == null || booking.getCheckInToken().isBlank()) {
            return null;
        }
        return CHECK_IN_PREFIX + "|" + booking.getId() + "|" + booking.getCheckInToken();
    }

    private ParsedCheckInPayload parseCheckInPayload(String qrPayload) {
        String[] parts = qrPayload.trim().split("\\|", 3);
        if (parts.length != 3 || !CHECK_IN_PREFIX.equals(parts[0])) {
            throw new IllegalArgumentException("Invalid QR check-in code");
        }

        try {
            return new ParsedCheckInPayload(Long.parseLong(parts[1]), parts[2]);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Invalid QR check-in code");
        }
    }

    private record ParsedCheckInPayload(Long bookingId, String token) {
    }

    private void recordAuditEvent(Booking booking, BookingAuditAction action, String actorEmail, String details) {
        BookingAuditLog auditLog = new BookingAuditLog();
        auditLog.setBookingId(booking.getId());
        auditLog.setAction(action);
        auditLog.setActorEmail(actorEmail == null || actorEmail.isBlank() ? "system" : actorEmail);
        auditLog.setBookingUserEmail(booking.getUser().getEmail());
        auditLog.setResourceName(booking.getResource().getName());
        auditLog.setBookingStatus(booking.getStatus().name());
        auditLog.setDetails(details);
        bookingAuditLogRepository.save(auditLog);
    }

    private BookingAuditLogResponseDTO mapAuditToDTO(BookingAuditLog auditLog) {
        return new BookingAuditLogResponseDTO(
                auditLog.getId(),
                auditLog.getBookingId(),
                auditLog.getAction().name(),
                auditLog.getActorEmail(),
                auditLog.getBookingUserEmail(),
                auditLog.getResourceName(),
                auditLog.getBookingStatus(),
                auditLog.getDetails(),
                auditLog.getCreatedAt()
        );
    }
}

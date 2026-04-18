package com.facilio.facilio_campus.service;

import com.facilio.facilio_campus.dto.BookingRequestDTO;
import com.facilio.facilio_campus.dto.BookingResponseDTO;
import com.facilio.facilio_campus.dto.BookingStatusUpdateDTO;
import com.facilio.facilio_campus.model.Booking;
import com.facilio.facilio_campus.model.BookingStatus;
import com.facilio.facilio_campus.model.NotificationPriority;
import com.facilio.facilio_campus.model.NotificationType;
import com.facilio.facilio_campus.model.Role;
import com.facilio.facilio_campus.model.Resource;
import com.facilio.facilio_campus.model.User;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

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

        if(request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

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

    @Transactional
    public BookingResponseDTO updateBookingStatus(Long id, BookingStatusUpdateDTO updateDTO) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        
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
            booking.getCreatedAt()
        );
    }
}

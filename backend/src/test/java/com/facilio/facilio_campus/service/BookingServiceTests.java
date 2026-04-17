package com.facilio.facilio_campus.service;

import com.facilio.facilio_campus.dto.BookingRequestDTO;
import com.facilio.facilio_campus.dto.BookingResponseDTO;
import com.facilio.facilio_campus.dto.BookingStatusUpdateDTO;
import com.facilio.facilio_campus.model.BookingAuditLog;
import com.facilio.facilio_campus.model.Booking;
import com.facilio.facilio_campus.model.BookingStatus;
import com.facilio.facilio_campus.model.Resource;
import com.facilio.facilio_campus.model.Role;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.BookingAuditLogRepository;
import com.facilio.facilio_campus.repository.BookingRepository;
import com.facilio.facilio_campus.repository.ResourceRepository;
import com.facilio.facilio_campus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTests {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingAuditLogRepository bookingAuditLogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Resource resource;
    private Booking booking;

    @BeforeEach
    void setUp() {
        user = new User("Test Student", "student@campus.edu", "password", Role.ROLE_STUDENT);
        user.setId(1L);

        resource = new Resource();
        resource.setId(10L);
        resource.setName("Seminar Room 1");
        resource.setCapacity(30);

        booking = new Booking();
        booking.setId(25L);
        booking.setUser(user);
        booking.setResource(resource);
        booking.setBookingDate(LocalDate.now());
        booking.setStartTime(LocalTime.now().minusMinutes(5));
        booking.setEndTime(LocalTime.now().plusMinutes(55));
        booking.setPurpose("Team meeting");
        booking.setExpectedAttendees(15);
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now().minusHours(2));
    }

    @Test
    void createBookingRejectsTimeRangesThatEndAfterFivePm() throws IOException {
        BookingRequestDTO request = buildRequest(LocalTime.of(15, 30), LocalTime.of(17, 30), 10);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(resourceRepository.findById(resource.getId())).thenReturn(Optional.of(resource));

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.createBooking(request, null, user.getEmail())
        );

        assertEquals(
                "Bookings must end by 5:00 PM. The last booking period is 3:00 PM to 5:00 PM.",
                error.getMessage()
        );
        verifyNoInteractions(bookingRepository);
    }

    @Test
    void createBookingRejectsAttendeeCountsAboveResourceCapacity() throws IOException {
        BookingRequestDTO request = buildRequest(LocalTime.of(13, 0), LocalTime.of(15, 0), 45);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(resourceRepository.findById(resource.getId())).thenReturn(Optional.of(resource));

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.createBooking(request, null, user.getEmail())
        );

        assertEquals(
                "Expected attendees cannot exceed the selected resource capacity of 30.",
                error.getMessage()
        );
        verifyNoInteractions(bookingRepository, bookingAuditLogRepository);
    }

    @Test
    void approvingBookingReturnsApprovedStatusAndRecordsAudit() {
        BookingStatusUpdateDTO request = new BookingStatusUpdateDTO();
        request.setStatus(BookingStatus.APPROVED);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponseDTO response = bookingService.updateBookingStatus(booking.getId(), request);

        assertEquals(BookingStatus.APPROVED, response.getStatus());
        verify(bookingAuditLogRepository).save(any(BookingAuditLog.class));
    }

    private BookingRequestDTO buildRequest(LocalTime startTime, LocalTime endTime, int expectedAttendees) {
        BookingRequestDTO request = new BookingRequestDTO();
        request.setResourceId(resource.getId());
        request.setBookingDate(LocalDate.of(2026, 4, 20));
        request.setStartTime(startTime);
        request.setEndTime(endTime);
        request.setPurpose("Team meeting");
        request.setExpectedAttendees(expectedAttendees);
        request.setAdditionalRequirements("Projector");
        return request;
    }
}

package com.facilio.facilio_campus.seeder;

import com.facilio.facilio_campus.model.Booking;
import com.facilio.facilio_campus.model.BookingStatus;
import com.facilio.facilio_campus.model.Resource;
import com.facilio.facilio_campus.model.Role;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.BookingRepository;
import com.facilio.facilio_campus.repository.ResourceRepository;
import com.facilio.facilio_campus.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemoBookingSeederTests {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private Environment environment;

    private DemoBookingSeeder demoBookingSeeder;

    @BeforeEach
    void setUp() {
        demoBookingSeeder = new DemoBookingSeeder(
                bookingRepository,
                userRepository,
                resourceRepository,
                environment,
                true
        );
    }

    @Test
    void seedsDemoBookingsWhenTableIsEmpty() {
        User student = new User("Student Center", "cu2354675@fcu.lk", "password", Role.ROLE_STUDENT);

        Resource bm104 = new Resource();
        bm104.setName("BM104");
        bm104.setCapacity(120);

        Resource auditorium = new Resource();
        auditorium.setName("Main Auditorium");
        auditorium.setCapacity(500);

        Resource lab = new Resource();
        lab.setName("BMLab1");
        lab.setCapacity(60);

        when(environment.getActiveProfiles()).thenReturn(new String[0]);
        when(bookingRepository.count()).thenReturn(0L);
        when(userRepository.findByEmail("cu2354675@fcu.lk")).thenReturn(Optional.of(student));
        when(resourceRepository.findAll()).thenReturn(List.of(bm104, auditorium, lab));

        demoBookingSeeder.run();

        ArgumentCaptor<List<Booking>> bookingsCaptor = ArgumentCaptor.forClass(List.class);
        verify(bookingRepository).saveAll(bookingsCaptor.capture());

        List<Booking> seededBookings = bookingsCaptor.getValue();
        assertEquals(3, seededBookings.size());
        assertTrue(seededBookings.stream().anyMatch(booking ->
                "BM104".equals(booking.getResource().getName()) && booking.getStatus() == BookingStatus.APPROVED));
        assertTrue(seededBookings.stream().anyMatch(booking ->
                "Main Auditorium".equals(booking.getResource().getName()) && booking.getStatus() == BookingStatus.CANCELLED));
        assertTrue(seededBookings.stream().anyMatch(booking ->
                "BMLab1".equals(booking.getResource().getName()) && booking.getStatus() == BookingStatus.PENDING));
    }

    @Test
    void skipsSeedingWhenBookingsAlreadyExist() {
        when(environment.getActiveProfiles()).thenReturn(new String[0]);
        when(bookingRepository.count()).thenReturn(2L);

        demoBookingSeeder.run();

        verify(bookingRepository, never()).saveAll(anyList());
    }
}

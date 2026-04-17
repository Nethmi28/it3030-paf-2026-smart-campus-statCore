package com.facilio.facilio_campus.seeder;

import com.facilio.facilio_campus.model.Booking;
import com.facilio.facilio_campus.model.BookingStatus;
import com.facilio.facilio_campus.model.Resource;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.BookingRepository;
import com.facilio.facilio_campus.repository.ResourceRepository;
import com.facilio.facilio_campus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class DemoBookingSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DemoBookingSeeder.class);
    private static final String DEMO_STUDENT_EMAIL = "cu2354675@fcu.lk";
    private static final List<SeedBookingSpec> DEMO_BOOKINGS = List.of(
            new SeedBookingSpec(
                    "BM104",
                    0,
                    LocalTime.of(11, 45),
                    LocalTime.of(13, 45),
                    48,
                    BookingStatus.APPROVED,
                    "Weekly business analytics discussion",
                    "Whiteboard markers and projector setup"
            ),
            new SeedBookingSpec(
                    "Main Auditorium",
                    2,
                    LocalTime.of(11, 45),
                    LocalTime.of(14, 45),
                    220,
                    BookingStatus.CANCELLED,
                    "Campus orientation rehearsal",
                    "Stage microphones and front-row seating"
            ),
            new SeedBookingSpec(
                    "BMLab1",
                    1,
                    LocalTime.of(8, 0),
                    LocalTime.of(10, 0),
                    28,
                    BookingStatus.PENDING,
                    "Spreadsheet lab practice",
                    "Lab assistant support for setup"
            )
    );

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final Environment environment;
    private final boolean demoBookingSeedEnabled;

    public DemoBookingSeeder(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            ResourceRepository resourceRepository,
            Environment environment,
            @Value("${app.seed.demo-bookings:true}") boolean demoBookingSeedEnabled
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.environment = environment;
        this.demoBookingSeedEnabled = demoBookingSeedEnabled;
    }

    @Override
    public void run(String... args) {
        if (!demoBookingSeedEnabled) {
            logger.info("Skipping demo booking seed because it is disabled.");
            return;
        }

        if (Arrays.asList(environment.getActiveProfiles()).contains("prod")) {
            logger.info("Skipping demo booking seed because the prod profile is active.");
            return;
        }

        if (bookingRepository.count() > 0) {
            logger.info("Skipping demo booking seed because bookings already exist.");
            return;
        }

        User demoStudent = userRepository.findByEmail(DEMO_STUDENT_EMAIL)
                .orElse(null);
        if (demoStudent == null) {
            logger.warn("Skipping demo booking seed because user {} was not found.", DEMO_STUDENT_EMAIL);
            return;
        }

        Map<String, Resource> resourcesByName = resourceRepository.findAll().stream()
                .collect(Collectors.toMap(
                        resource -> resource.getName().toLowerCase(Locale.ROOT),
                        Function.identity(),
                        (existing, ignored) -> existing
                ));

        List<Booking> seedBookings = DEMO_BOOKINGS.stream()
                .map(spec -> buildBooking(spec, demoStudent, resourcesByName.get(spec.resourceName().toLowerCase(Locale.ROOT))))
                .filter(Objects::nonNull)
                .toList();

        if (seedBookings.isEmpty()) {
            logger.warn("Skipping demo booking seed because none of the configured demo resources were found.");
            return;
        }

        bookingRepository.saveAll(seedBookings);
        logger.info("Seeded {} demo bookings for {}.", seedBookings.size(), DEMO_STUDENT_EMAIL);
    }

    private Booking buildBooking(SeedBookingSpec spec, User user, Resource resource) {
        if (resource == null) {
            logger.warn("Skipping demo booking for resource {} because it does not exist.", spec.resourceName());
            return null;
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setBookingDate(LocalDate.now().plusDays(spec.dayOffset()));
        booking.setStartTime(spec.startTime());
        booking.setEndTime(spec.endTime());
        booking.setPurpose(spec.purpose());
        booking.setExpectedAttendees(Math.min(spec.expectedAttendees(), resource.getCapacity()));
        booking.setAdditionalRequirements(spec.additionalRequirements());
        booking.setStatus(spec.status());

        if (spec.status() == BookingStatus.CANCELLED) {
            booking.setAdminReason("Demo booking cancelled for showcase purposes.");
        }

        return booking;
    }

    private record SeedBookingSpec(
            String resourceName,
            int dayOffset,
            LocalTime startTime,
            LocalTime endTime,
            int expectedAttendees,
            BookingStatus status,
            String purpose,
            String additionalRequirements
    ) {
    }
}

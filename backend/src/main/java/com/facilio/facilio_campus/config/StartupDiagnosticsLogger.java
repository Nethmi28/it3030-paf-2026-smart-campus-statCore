package com.facilio.facilio_campus.config;

import com.facilio.facilio_campus.repository.BookingRepository;
import com.facilio.facilio_campus.repository.ResourceRepository;
import com.facilio.facilio_campus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class StartupDiagnosticsLogger {

    private static final Logger logger = LoggerFactory.getLogger(StartupDiagnosticsLogger.class);

    private final Environment environment;
    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final String dataSourceUrl;
    private final boolean demoBookingSeedEnabled;

    public StartupDiagnosticsLogger(
            Environment environment,
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            UserRepository userRepository,
            @Value("${spring.datasource.url:}") String dataSourceUrl,
            @Value("${app.seed.demo-bookings:true}") boolean demoBookingSeedEnabled
    ) {
        this.environment = environment;
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.dataSourceUrl = dataSourceUrl;
        this.demoBookingSeedEnabled = demoBookingSeedEnabled;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logStartupSummary() {
        String[] activeProfiles = environment.getActiveProfiles();
        String profileSummary = activeProfiles.length == 0 ? "[default]" : Arrays.toString(activeProfiles);

        long bookingCount = bookingRepository.count();
        long resourceCount = resourceRepository.count();
        long userCount = userRepository.count();

        logger.info(
                "Startup diagnostics | datasource={} | profiles={} | demoBookingSeedEnabled={} | users={} | resources={} | bookings={}",
                sanitizeJdbcUrl(dataSourceUrl),
                profileSummary,
                demoBookingSeedEnabled,
                userCount,
                resourceCount,
                bookingCount
        );

        if (bookingCount == 0) {
            logger.warn("Startup diagnostics detected an empty bookings table after application startup.");
        }
    }

    private String sanitizeJdbcUrl(String jdbcUrl) {
        if (jdbcUrl == null || jdbcUrl.isBlank()) {
            return "[not configured]";
        }

        return jdbcUrl
                .replaceAll("(?i)(password=)[^&]+", "$1***")
                .replaceAll("(?i)(username=)[^&]+", "$1***");
    }
}

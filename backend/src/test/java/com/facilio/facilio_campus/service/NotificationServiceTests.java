package com.facilio.facilio_campus.service;

import com.facilio.facilio_campus.dto.NotificationDto;
import com.facilio.facilio_campus.model.Notification;
import com.facilio.facilio_campus.model.NotificationPriority;
import com.facilio.facilio_campus.model.NotificationType;
import com.facilio.facilio_campus.model.Role;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.NotificationRepository;
import com.facilio.facilio_campus.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationServiceTests {

    @Test
    void notifyAdminsCreatesOneNotificationPerAdmin() {
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        NotificationService service = new NotificationService(notificationRepository, userRepository);

        User adminOne = new User("Admin One", "admin1@fcu.lk", "encoded", Role.ROLE_ADMIN);
        User adminTwo = new User("Admin Two", "admin2@fcu.lk", "encoded", Role.ROLE_ADMIN);
        adminOne.setId(1L);
        adminTwo.setId(2L);

        when(userRepository.findByRoleIn(List.of(Role.ROLE_ADMIN))).thenReturn(List.of(adminOne, adminTwo));

        service.notifyAdmins(
                "New admin registration request",
                "A request is waiting for review.",
                NotificationType.ACCESS_REQUEST,
                NotificationPriority.HIGH,
                "Authentication"
        );

        verify(notificationRepository).saveAll(any());
    }

    @Test
    void getNotificationsForAdminMapsReadableLabels() {
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        NotificationService service = new NotificationService(notificationRepository, userRepository);

        User admin = new User("System Admin", "admin@fcu.lk", "encoded", Role.ROLE_ADMIN);
        admin.setId(10L);

        Notification notification = new Notification();
        notification.setId(99L);
        notification.setRecipient(admin);
        notification.setTitle("User role updated");
        notification.setMessage("A role was updated.");
        notification.setType(NotificationType.ROLE_CHANGE);
        notification.setPriority(NotificationPriority.MEDIUM);
        notification.setSource("Role Management");
        notification.setRead(false);

        when(userRepository.findByEmail("admin@fcu.lk")).thenReturn(Optional.of(admin));
        when(notificationRepository.findByRecipientOrderByCreatedAtDesc(admin)).thenReturn(List.of(notification));

        List<NotificationDto> notifications = service.getNotificationsForAdmin("admin@fcu.lk");

        assertEquals(1, notifications.size());
        assertEquals("Role Change", notifications.getFirst().getType());
        assertEquals("Medium", notifications.getFirst().getPriority());
        assertEquals("Admins", notifications.getFirst().getAudience());
        assertFalse(notifications.getFirst().isRead());
    }

    @Test
    void markAsReadUpdatesUnreadNotification() {
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        NotificationService service = new NotificationService(notificationRepository, userRepository);

        User admin = new User("System Admin", "admin@fcu.lk", "encoded", Role.ROLE_ADMIN);
        admin.setId(10L);

        Notification notification = new Notification();
        notification.setId(5L);
        notification.setRecipient(admin);
        notification.setTitle("Security alert");
        notification.setMessage("Auth monitor alert.");
        notification.setType(NotificationType.SECURITY);
        notification.setPriority(NotificationPriority.LOW);
        notification.setSource("Authentication");
        notification.setRead(false);

        when(userRepository.findByEmail("admin@fcu.lk")).thenReturn(Optional.of(admin));
        when(notificationRepository.findByIdAndRecipient(5L, admin)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(notification)).thenReturn(notification);

        NotificationDto result = service.markAsRead(5L, "admin@fcu.lk");

        assertTrue(result.isRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void getNotificationsForUserMapsStudentAudience() {
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        NotificationService service = new NotificationService(notificationRepository, userRepository);

        User student = new User("Student Center", "student@fcu.lk", "encoded", Role.ROLE_STUDENT);
        student.setId(20L);

        Notification notification = new Notification();
        notification.setId(7L);
        notification.setRecipient(student);
        notification.setTitle("Booking approved");
        notification.setMessage("Your booking was approved.");
        notification.setType(NotificationType.BOOKING);
        notification.setPriority(NotificationPriority.MEDIUM);
        notification.setSource("Booking Management");
        notification.setRead(false);

        when(userRepository.findByEmail("student@fcu.lk")).thenReturn(Optional.of(student));
        when(notificationRepository.findByRecipientOrderByCreatedAtDesc(student)).thenReturn(List.of(notification));

        List<NotificationDto> notifications = service.getNotificationsForUser("student@fcu.lk");

        assertEquals(1, notifications.size());
        assertEquals("Booking", notifications.getFirst().getType());
        assertEquals("Students", notifications.getFirst().getAudience());
    }
}

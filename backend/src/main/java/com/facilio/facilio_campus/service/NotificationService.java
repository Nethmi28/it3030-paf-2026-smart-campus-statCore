package com.facilio.facilio_campus.service;

import com.facilio.facilio_campus.dto.NotificationDto;
import com.facilio.facilio_campus.model.Notification;
import com.facilio.facilio_campus.model.NotificationPriority;
import com.facilio.facilio_campus.model.NotificationType;
import com.facilio.facilio_campus.model.Role;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.NotificationRepository;
import com.facilio.facilio_campus.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void notifyAdmins(
            String title,
            String message,
            NotificationType type,
            NotificationPriority priority,
            String source
    ) {
        notifyRoles(List.of(Role.ROLE_ADMIN), title, message, type, priority, source);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForAdmin(String userEmail) {
        User adminUser = getAdminUserByEmail(userEmail);
        return getNotificationsForUser(adminUser.getEmail());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User adminUser = getAdminUserByEmail(userEmail);
        return getUnreadCountForUser(adminUser.getEmail());
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId, String userEmail) {
        User adminUser = getAdminUserByEmail(userEmail);
        return markAsReadForUser(notificationId, adminUser.getEmail());
    }

    @Transactional
    public int markAllAsRead(String userEmail) {
        User adminUser = getAdminUserByEmail(userEmail);
        return markAllAsReadForUser(adminUser.getEmail());
    }

    @Transactional
    public void notifyUser(
            User recipient,
            String title,
            String message,
            NotificationType type,
            NotificationPriority priority,
            String source
    ) {
        if (recipient == null) {
            return;
        }

        notificationRepository.save(buildNotification(recipient, title, message, type, priority, source));
    }

    @Transactional
    public void notifyUsers(
            List<User> recipients,
            String title,
            String message,
            NotificationType type,
            NotificationPriority priority,
            String source
    ) {
        if (recipients == null || recipients.isEmpty()) {
            return;
        }

        Map<Long, User> uniqueRecipients = new LinkedHashMap<>();
        for (User user : recipients) {
            if (user != null && user.getId() != null) {
                uniqueRecipients.putIfAbsent(user.getId(), user);
            }
        }

        if (uniqueRecipients.isEmpty()) {
            return;
        }

        List<Notification> notifications = uniqueRecipients.values().stream()
                .map(user -> buildNotification(user, title, message, type, priority, source))
                .toList();

        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void notifyRoles(
            List<Role> roles,
            String title,
            String message,
            NotificationType type,
            NotificationPriority priority,
            String source
    ) {
        if (roles == null || roles.isEmpty()) {
            return;
        }

        notifyUsers(userRepository.findByRoleIn(roles), title, message, type, priority, source);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForUser(String userEmail) {
        User user = getUserByEmail(userEmail);
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCountForUser(String userEmail) {
        User user = getUserByEmail(userEmail);
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    @Transactional
    public NotificationDto markAsReadForUser(Long notificationId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findByIdAndRecipient(notificationId, user)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found."));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }

        return mapToDto(notification);
    }

    @Transactional
    public int markAllAsReadForUser(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);

        int updatedCount = 0;
        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            notificationRepository.saveAll(notifications);
        }

        return updatedCount;
    }

    private User getAdminUserByEmail(String userEmail) {
        User adminUser = getUserByEmail(userEmail);
        if (adminUser.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalArgumentException("Admin access is required.");
        }

        return adminUser;
    }

    private Notification buildNotification(
            User recipient,
            String title,
            String message,
            NotificationType type,
            NotificationPriority priority,
            String source
    ) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setPriority(priority);
        notification.setSource(source);
        notification.setRead(false);
        return notification;
    }

    private User getUserByEmail(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }

    private NotificationDto mapToDto(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                formatType(notification.getType()),
                formatPriority(notification.getPriority()),
                notification.getSource(),
                formatAudience(notification.getRecipient()),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    private String formatType(NotificationType type) {
        return switch (type) {
            case ACCESS_REQUEST -> "Access Request";
            case ROLE_CHANGE -> "Role Change";
            case SECURITY -> "Security";
            case BOOKING -> "Booking";
            case TICKET -> "Ticket";
            case COMMENT -> "Comment";
        };
    }

    private String formatPriority(NotificationPriority priority) {
        return switch (priority) {
            case HIGH -> "High";
            case MEDIUM -> "Medium";
            case LOW -> "Low";
        };
    }

    private String formatAudience(User recipient) {
        if (recipient == null || recipient.getRole() == null) {
            return "User";
        }

        return switch (recipient.getRole()) {
            case ROLE_ADMIN -> "Admins";
            case ROLE_MANAGER -> "Managers";
            case ROLE_TECHNICIAN -> "Technicians";
            case ROLE_STUDENT -> "Students";
        };
    }
}

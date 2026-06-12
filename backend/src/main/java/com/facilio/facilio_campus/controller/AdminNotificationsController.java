package com.facilio.facilio_campus.controller;

import com.facilio.facilio_campus.dto.NotificationDto;
import com.facilio.facilio_campus.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminNotificationsController {

    private final NotificationService notificationService;

    public AdminNotificationsController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getAdminNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getNotificationsForAdmin(authentication.getName()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "unreadCount",
                notificationService.getUnreadCount(authentication.getName())
        ));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId, Authentication authentication) {
        try {
            return ResponseEntity.ok(notificationService.markAsRead(notificationId, authentication.getName()));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exception.getMessage());
        }
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "updatedCount",
                notificationService.markAllAsRead(authentication.getName())
        ));
    }
}

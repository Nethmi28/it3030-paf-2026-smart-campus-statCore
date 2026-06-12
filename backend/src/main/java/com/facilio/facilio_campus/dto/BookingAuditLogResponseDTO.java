package com.facilio.facilio_campus.dto;

import java.time.LocalDateTime;

public class BookingAuditLogResponseDTO {
    private Long id;
    private Long bookingId;
    private String action;
    private String actorEmail;
    private String bookingUserEmail;
    private String resourceName;
    private String bookingStatus;
    private String details;
    private LocalDateTime createdAt;

    public BookingAuditLogResponseDTO() {
    }

    public BookingAuditLogResponseDTO(Long id, Long bookingId, String action, String actorEmail, String bookingUserEmail, String resourceName, String bookingStatus, String details, LocalDateTime createdAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.action = action;
        this.actorEmail = actorEmail;
        this.bookingUserEmail = bookingUserEmail;
        this.resourceName = resourceName;
        this.bookingStatus = bookingStatus;
        this.details = details;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public String getBookingUserEmail() { return bookingUserEmail; }
    public void setBookingUserEmail(String bookingUserEmail) { this.bookingUserEmail = bookingUserEmail; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

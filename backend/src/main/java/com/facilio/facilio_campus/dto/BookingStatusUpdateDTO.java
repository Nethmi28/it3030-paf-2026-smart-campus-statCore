package com.facilio.facilio_campus.dto;

import com.facilio.facilio_campus.model.BookingStatus;

public class BookingStatusUpdateDTO {
    private BookingStatus status;
    private String adminReason;

    // Getters and Setters
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public String getAdminReason() { return adminReason; }
    public void setAdminReason(String adminReason) { this.adminReason = adminReason; }
}

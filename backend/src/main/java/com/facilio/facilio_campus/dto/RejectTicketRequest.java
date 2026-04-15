package com.facilio.facilio_campus.dto;

import jakarta.validation.constraints.NotBlank;

public class RejectTicketRequest {

    @NotBlank(message = "Rejection reason is required")
    private String rejectedReason;

    public String getRejectedReason() {
        return rejectedReason;
    }

    public void setRejectedReason(String rejectedReason) {
        this.rejectedReason = rejectedReason;
    }
}
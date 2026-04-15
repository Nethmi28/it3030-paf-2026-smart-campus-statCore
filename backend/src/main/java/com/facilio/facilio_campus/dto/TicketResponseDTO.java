package com.facilio.facilio_campus.dto;

import com.facilio.facilio_campus.model.TicketPriority;
import com.facilio.facilio_campus.model.TicketStatus;
import java.time.LocalDateTime;
import java.util.List;

public class TicketResponseDTO {

    private Long id;
    private Long resourceId;
    private String locationText;
    private String category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String preferredContact;
    private Long reportedById;
    private String reportedByName;
    private Long assignedToId;
    private String assignedToName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<String> attachmentNames;
    private List<Long> attachmentIds;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getLocationText() { return locationText; }
    public void setLocationText(String locationText) { this.locationText = locationText; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public String getPreferredContact() { return preferredContact; }
    public void setPreferredContact(String preferredContact) { this.preferredContact = preferredContact; }

    public Long getReportedById() { return reportedById; }
    public void setReportedById(Long reportedById) { this.reportedById = reportedById; }

    public String getReportedByName() { return reportedByName; }
    public void setReportedByName(String reportedByName) { this.reportedByName = reportedByName; }

    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<String> getAttachmentNames() { return attachmentNames; }
    public void setAttachmentNames(List<String> attachmentNames) { this.attachmentNames = attachmentNames; }

    public List<Long> getAttachmentIds() { return attachmentIds; }
    public void setAttachmentIds(List<Long> attachmentIds) { this.attachmentIds = attachmentIds; }
}

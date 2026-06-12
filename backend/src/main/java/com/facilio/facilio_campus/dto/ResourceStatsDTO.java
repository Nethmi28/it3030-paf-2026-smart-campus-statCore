package com.facilio.facilio_campus.dto;

import java.util.Map;

public class ResourceStatsDTO {
    private long totalResources;
    private long availableCount;
    private long maintenanceCount;
    private long totalCapacity;
    private Map<String, Long> facultyDistribution;
    private Map<String, Long> typeDistribution;
    private Map<String, Long> capacityGroups;

    public ResourceStatsDTO() {}

    public ResourceStatsDTO(long totalResources, long availableCount, long maintenanceCount, long totalCapacity, 
                          Map<String, Long> facultyDistribution, Map<String, Long> typeDistribution, 
                          Map<String, Long> capacityGroups) {
        this.totalResources = totalResources;
        this.availableCount = availableCount;
        this.maintenanceCount = maintenanceCount;
        this.totalCapacity = totalCapacity;
        this.facultyDistribution = facultyDistribution;
        this.typeDistribution = typeDistribution;
        this.capacityGroups = capacityGroups;
    }

    // Getters and Setters
    public long getTotalResources() { return totalResources; }
    public void setTotalResources(long totalResources) { this.totalResources = totalResources; }

    public long getAvailableCount() { return availableCount; }
    public void setAvailableCount(long availableCount) { this.availableCount = availableCount; }

    public long getMaintenanceCount() { return maintenanceCount; }
    public void setMaintenanceCount(long maintenanceCount) { this.maintenanceCount = maintenanceCount; }

    public long getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(long totalCapacity) { this.totalCapacity = totalCapacity; }

    public Map<String, Long> getFacultyDistribution() { return facultyDistribution; }
    public void setFacultyDistribution(Map<String, Long> facultyDistribution) { this.facultyDistribution = facultyDistribution; }

    public Map<String, Long> getTypeDistribution() { return typeDistribution; }
    public void setTypeDistribution(Map<String, Long> typeDistribution) { this.typeDistribution = typeDistribution; }

    public Map<String, Long> getCapacityGroups() { return capacityGroups; }
    public void setCapacityGroups(Map<String, Long> capacityGroups) { this.capacityGroups = capacityGroups; }
}

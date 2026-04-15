package com.facilio.facilio_campus.dto;

import java.util.List;

public class ResourceDTO {
    private Long id;
    private String name;
    private String type;
    private String faculty;
    private String location;
    private int capacity;
    private String status;
    private String description;
    private String imageUrl;
    private List<String> amenities;

    public ResourceDTO() {}

    // All-args constructor
    public ResourceDTO(Long id, String name, String type, String faculty, String location, int capacity, String status, String description, String imageUrl, List<String> amenities) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.faculty = faculty;
        this.location = location;
        this.capacity = capacity;
        this.status = status;
        this.description = description;
        this.imageUrl = imageUrl;
        this.amenities = amenities;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }
}

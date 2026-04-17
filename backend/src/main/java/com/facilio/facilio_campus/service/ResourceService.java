package com.facilio.facilio_campus.service;

import com.facilio.facilio_campus.dto.ResourceDTO;
import com.facilio.facilio_campus.model.Resource;
import com.facilio.facilio_campus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    private final String UPLOAD_DIR = "uploads/resources/";
    private static final List<String> ALLOWED_MIME_TYPES = java.util.Arrays.asList(
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public List<ResourceDTO> getAllResources(String faculty, Integer minCapacity) {
        List<Resource> resources;
        if (faculty != null && minCapacity != null) {
            resources = resourceRepository.findByFacultyAndCapacityGreaterThanEqualOrderByIdAsc(faculty, minCapacity);
        } else if (faculty != null) {
            resources = resourceRepository.findByFacultyOrderByIdAsc(faculty);
        } else if (minCapacity != null) {
            resources = resourceRepository.findByCapacityGreaterThanEqualOrderByIdAsc(minCapacity);
        } else {
            resources = resourceRepository.findAllByOrderByIdAsc();
        }
        return resources.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public ResourceDTO getResourceById(Long id) {
        return resourceRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public ResourceDTO createResource(ResourceDTO resourceDTO, org.springframework.web.multipart.MultipartFile image) throws java.io.IOException {
        Resource resource = convertToEntity(resourceDTO);
        
        if (image != null && !image.isEmpty()) {
            validateFile(image);
            String imageUrl = saveImage(image);
            resource.setImageUrl(imageUrl);
        }
        
        Resource saved = resourceRepository.save(resource);
        return convertToDTO(saved);
    }

    public ResourceDTO updateResource(Long id, ResourceDTO resourceDTO, org.springframework.web.multipart.MultipartFile image) throws java.io.IOException {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        
        existing.setName(resourceDTO.getName());
        existing.setType(resourceDTO.getType());
        existing.setFaculty(resourceDTO.getFaculty());
        existing.setLocation(resourceDTO.getLocation());
        existing.setCapacity(resourceDTO.getCapacity());
        existing.setStatus(resourceDTO.getStatus());
        existing.setDescription(resourceDTO.getDescription());
        existing.setAmenities(resourceDTO.getAmenities());
        
        if (image != null && !image.isEmpty()) {
            validateFile(image);
            String imageUrl = saveImage(image);
            existing.setImageUrl(imageUrl);
        } else if (resourceDTO.getImageUrl() != null) {
            existing.setImageUrl(resourceDTO.getImageUrl());
        }
        
        Resource updated = resourceRepository.save(existing);
        return convertToDTO(updated);
    }

    private void validateFile(org.springframework.web.multipart.MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File " + file.getOriginalFilename() + " exceeds 5MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("File " + file.getOriginalFilename() + " is not an allowed image type");
        }
    }

    private String saveImage(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        java.nio.file.Path uploadPath = java.nio.file.Paths.get(UPLOAD_DIR);
        if (!java.nio.file.Files.exists(uploadPath)) {
            java.nio.file.Files.createDirectories(uploadPath);
        }

        String fileName = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        java.nio.file.Path filePath = uploadPath.resolve(fileName);
        java.nio.file.Files.copy(file.getInputStream(), filePath);
        
        // Return URL path that can be used by the frontend to fetch the image
        return "/api/resources/images/" + fileName;
    }

    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    private ResourceDTO convertToDTO(Resource entity) {
        return new ResourceDTO(
                entity.getId(),
                entity.getName(),
                entity.getType(),
                entity.getFaculty(),
                entity.getLocation(),
                entity.getCapacity(),
                entity.getStatus(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getAmenities()
        );
    }

    private Resource convertToEntity(ResourceDTO dto) {
        return new Resource(
                dto.getName(),
                dto.getType(),
                dto.getFaculty(),
                dto.getLocation(),
                dto.getCapacity(),
                dto.getStatus(),
                dto.getDescription(),
                dto.getImageUrl(),
                dto.getAmenities()
        );
    }
}

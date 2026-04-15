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

    public List<ResourceDTO> getAllResources(String faculty, Integer minCapacity) {
        List<Resource> resources;
        if (faculty != null && minCapacity != null) {
            resources = resourceRepository.findByFacultyAndCapacityGreaterThanEqual(faculty, minCapacity);
        } else if (faculty != null) {
            resources = resourceRepository.findByFaculty(faculty);
        } else if (minCapacity != null) {
            resources = resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        } else {
            resources = resourceRepository.findAll();
        }
        return resources.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public ResourceDTO getResourceById(Long id) {
        return resourceRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public ResourceDTO createResource(ResourceDTO resourceDTO) {
        Resource resource = convertToEntity(resourceDTO);
        Resource saved = resourceRepository.save(resource);
        return convertToDTO(saved);
    }

    public ResourceDTO updateResource(Long id, ResourceDTO resourceDTO) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        
        existing.setName(resourceDTO.getName());
        existing.setType(resourceDTO.getType());
        existing.setFaculty(resourceDTO.getFaculty());
        existing.setLocation(resourceDTO.getLocation());
        existing.setCapacity(resourceDTO.getCapacity());
        existing.setStatus(resourceDTO.getStatus());
        existing.setDescription(resourceDTO.getDescription());
        existing.setImageUrl(resourceDTO.getImageUrl());
        existing.setAmenities(resourceDTO.getAmenities());
        
        Resource updated = resourceRepository.save(existing);
        return convertToDTO(updated);
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

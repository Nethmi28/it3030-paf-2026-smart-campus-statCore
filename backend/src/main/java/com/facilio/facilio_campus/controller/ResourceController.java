package com.facilio.facilio_campus.controller;

import com.facilio.facilio_campus.dto.ResourceDTO;
import com.facilio.facilio_campus.dto.ResourceStatsDTO;
import com.facilio.facilio_campus.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.io.IOException;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAllResources(
            @RequestParam(required = false) String faculty,
            @RequestParam(required = false) Integer minCapacity) {
        return ResponseEntity.ok(resourceService.getAllResources(faculty, minCapacity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<ResourceStatsDTO> getResourceStats() {
        return ResponseEntity.ok(resourceService.getResourceStats());
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ResourceDTO> createResource(
            @RequestPart("resource") ResourceDTO resourceDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return ResponseEntity.ok(resourceService.createResource(resourceDTO, image));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ResourceDTO> updateResource(
            @PathVariable Long id,
            @RequestPart("resource") ResourceDTO resourceDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return ResponseEntity.ok(resourceService.updateResource(id, resourceDTO, image));
    }

    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<Resource> getResourceImage(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get("uploads/resources/").resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "image/jpeg"; // Default
                if (fileName.endsWith(".png")) contentType = "image/png";
                if (fileName.endsWith(".gif")) contentType = "image/gif";
                if (fileName.endsWith(".webp")) contentType = "image/webp";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}

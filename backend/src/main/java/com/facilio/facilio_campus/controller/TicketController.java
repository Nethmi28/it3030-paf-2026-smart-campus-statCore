package com.facilio.facilio_campus.controller;

import com.facilio.facilio_campus.dto.TicketRequestDTO;
import com.facilio.facilio_campus.dto.TicketResponseDTO;
import com.facilio.facilio_campus.dto.CommentRequestDTO;
import com.facilio.facilio_campus.dto.CommentResponseDTO;
import com.facilio.facilio_campus.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import com.facilio.facilio_campus.model.TicketAttachment;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TicketResponseDTO> createTicket(
            @RequestPart("ticket") TicketRequestDTO ticketDTO,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            Authentication authentication) {

        try {
            // For now, assuming standard JWT where username equals email
            String userEmail = authentication.getName();
            TicketResponseDTO response = ticketService.createTicket(ticketDTO, files, userEmail);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(Authentication authentication) {
        String userEmail = authentication.getName();
        List<TicketResponseDTO> myTickets = ticketService.getMyTickets(userEmail);
        return new ResponseEntity<>(myTickets, HttpStatus.OK);
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long ticketId,
            @RequestBody CommentRequestDTO commentDTO,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            CommentResponseDTO response = ticketService.addComment(ticketId, commentDTO, userEmail);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getTicketComments(@PathVariable Long ticketId) {
        List<CommentResponseDTO> comments = ticketService.getTicketComments(ticketId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @GetMapping("/attachments/{attachmentId}")
    public ResponseEntity<Resource> getAttachment(@PathVariable Long attachmentId) {
        try {
            TicketAttachment attachment = ticketService.getAttachment(attachmentId);
            Path filePath = Paths.get(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(attachment.getFileType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

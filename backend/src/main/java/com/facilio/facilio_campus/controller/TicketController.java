package com.facilio.facilio_campus.controller;

import com.facilio.facilio_campus.dto.*;
import com.facilio.facilio_campus.service.TicketService;
import jakarta.validation.Valid;
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

    // ==================== CREATE TICKET ====================
    
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestPart("ticket") TicketRequestDTO ticketDTO,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            TicketResponseDTO response = ticketService.createTicket(ticketDTO, files, userEmail);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // ==================== GET TICKETS ====================
    
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(Authentication authentication) {
        String userEmail = authentication.getName();
        List<TicketResponseDTO> myTickets = ticketService.getMyTickets(userEmail);
        return new ResponseEntity<>(myTickets, HttpStatus.OK);
    }
    
    @GetMapping("/assigned-to-me")
    public ResponseEntity<List<TicketResponseDTO>> getTicketsAssignedToMe(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<TicketResponseDTO> tickets = ticketService.getTicketsAssignedToMe(userEmail);
            return new ResponseEntity<>(tickets, HttpStatus.OK);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<TicketResponseDTO> tickets = ticketService.getAllTickets(userEmail, status, priority, category);
            return new ResponseEntity<>(tickets, HttpStatus.OK);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }
    
    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketResponseDTO> getTicketById(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            TicketResponseDTO ticket = ticketService.getTicketById(ticketId, userEmail);
            return new ResponseEntity<>(ticket, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }

    // ==================== TICKET ACTIONS ====================
    
    @PatchMapping("/{ticketId}/assign")
    public ResponseEntity<TicketResponseDTO> assignTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody AssignTicketRequest request,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            TicketResponseDTO response = ticketService.assignTicket(ticketId, request.getTechnicianId(), adminEmail);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }
    
    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<TicketResponseDTO> updateTicketStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            TicketResponseDTO response = ticketService.updateTicketStatus(ticketId, request, userEmail);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
    }
    
    @PatchMapping("/{ticketId}/reject")
    public ResponseEntity<TicketResponseDTO> rejectTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody RejectTicketRequest request,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            TicketResponseDTO response = ticketService.rejectTicket(ticketId, request, adminEmail);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
    }

    // ==================== COMMENTS ====================
    
    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequestDTO commentDTO,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            CommentResponseDTO response = ticketService.addComment(ticketId, commentDTO, userEmail);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getTicketComments(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<CommentResponseDTO> comments = ticketService.getTicketComments(ticketId, userEmail);
            return new ResponseEntity<>(comments, HttpStatus.OK);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    
    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            CommentResponseDTO response = ticketService.updateComment(commentId, request, userEmail);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }
    
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            ticketService.deleteComment(commentId, userEmail);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    // ==================== ATTACHMENTS ====================
    
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
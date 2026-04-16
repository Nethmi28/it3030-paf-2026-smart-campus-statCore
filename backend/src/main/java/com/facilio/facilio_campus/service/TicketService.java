package com.facilio.facilio_campus.service;

import com.facilio.facilio_campus.dto.*;
import com.facilio.facilio_campus.model.*;
import com.facilio.facilio_campus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    private final String UPLOAD_DIR = "uploads/tickets/";
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"
    );

    @Autowired
    public TicketService(TicketRepository ticketRepository, 
                         TicketAttachmentRepository attachmentRepository,
                         UserRepository userRepository,
                         CommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.attachmentRepository = attachmentRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }

    // ==================== TICKET CRUD ====================

    // Only STUDENTS can create tickets
    public TicketResponseDTO createTicket(TicketRequestDTO dto, MultipartFile[] files, String userEmail) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Only ROLE_STUDENT can create tickets
        if (user.getRole() != Role.ROLE_STUDENT) {
            throw new SecurityException("Only students can create tickets");
        }

        if (files != null && files.length > 3) {
            throw new IllegalArgumentException("Maximum of 3 image attachments allowed per ticket.");
        }

        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    validateFile(file);
                }
            }
        }

        Ticket ticket = new Ticket();
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setPreferredContact(dto.getPreferredContact());
        ticket.setLocationText(dto.getLocationText());
        ticket.setResourceId(dto.getResourceId());
        ticket.setReportedBy(user);
        ticket.setStatus(TicketStatus.OPEN);

        ticket = ticketRepository.save(ticket);

        if (files != null && files.length > 0) {
            saveAttachments(files, ticket);
        }

        return mapToDTO(ticket);
    }

    // View single ticket with role-based access
    public TicketResponseDTO getTicketById(Long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        boolean hasAccess = false;
        
        switch (currentUser.getRole()) {
            case ROLE_STUDENT:
                hasAccess = ticket.getReportedBy().getId().equals(currentUser.getId());
                break;
            case ROLE_TECHNICIAN:
                hasAccess = ticket.getAssignedTo() != null && 
                           ticket.getAssignedTo().getId().equals(currentUser.getId());
                break;
            case ROLE_MANAGER:
            case ROLE_ADMIN:
                hasAccess = true;
                break;
            default:
                hasAccess = false;
        }
        
        if (!hasAccess) {
            throw new SecurityException("You don't have permission to view this ticket");
        }
        
        return mapToDTO(ticket);
    }

    // Get tickets based on role
    public List<TicketResponseDTO> getMyTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Ticket> tickets;
        
        switch (user.getRole()) {
            case ROLE_STUDENT:
                tickets = ticketRepository.findByReportedById(user.getId());
                break;
            case ROLE_TECHNICIAN:
                tickets = ticketRepository.findByAssignedToId(user.getId());
                break;
            case ROLE_MANAGER:
            case ROLE_ADMIN:
                tickets = ticketRepository.findAll();
                break;
            default:
                tickets = List.of();
        }
        
        return tickets.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Get tickets assigned to the current technician
    public List<TicketResponseDTO> getTicketsAssignedToMe(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getRole() != Role.ROLE_TECHNICIAN && 
            user.getRole() != Role.ROLE_ADMIN && 
            user.getRole() != Role.ROLE_MANAGER) {
            throw new SecurityException("Only technicians, admins, and managers can view assigned tickets");
        }
        
        List<Ticket> tickets = ticketRepository.findByAssignedToId(user.getId());
        return tickets.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Get all tickets with filters (Manager/Admin only)
    public List<TicketResponseDTO> getAllTickets(String userEmail, String status, String priority, String category) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getRole() != Role.ROLE_ADMIN && user.getRole() != Role.ROLE_MANAGER) {
            throw new SecurityException("Only admins and managers can view all tickets");
        }
        
        TicketStatus statusEnum = null;
        if (status != null && !status.isEmpty()) {
            try {
                statusEnum = TicketStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore filter
            }
        }
        
        List<Ticket> tickets = ticketRepository.findAllWithFilters(statusEnum, priority, category);
        return tickets.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // ==================== TICKET ACTIONS ====================
    
    // Manager or Admin can assign technician
    public TicketResponseDTO assignTicket(Long ticketId, Long technicianId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (admin.getRole() != Role.ROLE_ADMIN && admin.getRole() != Role.ROLE_MANAGER) {
            throw new SecurityException("Only admins and managers can assign technicians to tickets");
        }
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));
        
        if (technician.getRole() != Role.ROLE_TECHNICIAN) {
            throw new IllegalArgumentException("Selected user is not a technician");
        }
        
        ticket.setAssignedTo(technician);
        
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        
        ticket = ticketRepository.save(ticket);
        
        return mapToDTO(ticket);
    }

    // Manager, Admin, or assigned Technician can update status
    public TicketResponseDTO updateTicketStatus(Long ticketId, StatusUpdateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        boolean canUpdateStatus = false;
        
        switch (user.getRole()) {
            case ROLE_TECHNICIAN:
                canUpdateStatus = ticket.getAssignedTo() != null && 
                                 ticket.getAssignedTo().getId().equals(user.getId());
                break;
            case ROLE_MANAGER:
            case ROLE_ADMIN:
                canUpdateStatus = true;
                break;
            default:
                canUpdateStatus = false;
        }
        
        if (!canUpdateStatus) {
            throw new SecurityException("You don't have permission to update this ticket's status");
        }
        
        // TEMPORARY: Allow any status change for testing
        // TODO: Add proper validation later
        System.out.println("Changing status from " + ticket.getStatus() + " to " + request.getStatus());
        
        ticket.setStatus(request.getStatus());
        
        if (request.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        if (request.getStatus() == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }
        
        if (request.getResolutionNotes() != null && !request.getResolutionNotes().isEmpty()) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        
        ticket = ticketRepository.save(ticket);
        
        return mapToDTO(ticket);
    }

    // Manager or Admin can delete a ticket
    public void deleteTicket(Long ticketId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getRole() != Role.ROLE_ADMIN && user.getRole() != Role.ROLE_MANAGER) {
            throw new SecurityException("Only admins and managers can delete tickets");
        }
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        List<TicketAttachment> attachments = attachmentRepository.findByTicketId(ticketId);
        attachmentRepository.deleteAll(attachments);
        
        List<Comment> comments = commentRepository.findByTicketId(ticketId);
        commentRepository.deleteAll(comments);
        
        ticketRepository.delete(ticket);
    }

    // Manager or Admin can reject a ticket
    public TicketResponseDTO rejectTicket(Long ticketId, RejectTicketRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getRole() != Role.ROLE_ADMIN && user.getRole() != Role.ROLE_MANAGER) {
            throw new SecurityException("Only admins and managers can reject tickets");
        }
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new IllegalStateException("Only open tickets can be rejected");
        }
        
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectedReason(request.getRejectedReason());
        ticket = ticketRepository.save(ticket);
        
        return mapToDTO(ticket);
    }

    // ==================== COMMENTS ====================

    // Add comment - Allow any authenticated user (TEMPORARY for testing)
    public CommentResponseDTO addComment(Long ticketId, CommentRequestDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        // Cannot comment on CLOSED or REJECTED tickets
        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new IllegalStateException("Cannot add comments to closed or rejected tickets");
        }
        
        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setAuthor(user);
        comment.setContent(dto.getContent());
        comment = commentRepository.save(comment);
        
        return mapCommentToDTO(comment, user);
    }

    // Get comments - Allow any authenticated user (TEMPORARY for testing)
    public List<CommentResponseDTO> getTicketComments(Long ticketId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        List<Comment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return comments.stream()
                .map(comment -> mapCommentToDTO(comment, currentUser))
                .collect(Collectors.toList());
    }

    // Edit comment - only comment author or Manager/Admin
    public CommentResponseDTO updateComment(Long commentId, UpdateCommentRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        
        boolean canEdit = false;
        
        if (comment.getAuthor().getId().equals(user.getId())) {
            canEdit = true;
        }
        else if (user.getRole() == Role.ROLE_MANAGER || user.getRole() == Role.ROLE_ADMIN) {
            canEdit = true;
        }
        
        if (!canEdit) {
            throw new SecurityException("You don't have permission to edit this comment");
        }
        
        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);
        
        return mapCommentToDTO(comment, user);
    }

    // Delete comment - only comment author or Manager/Admin
    public void deleteComment(Long commentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        
        boolean canDelete = false;
        
        if (comment.getAuthor().getId().equals(user.getId())) {
            canDelete = true;
        }
        else if (user.getRole() == Role.ROLE_MANAGER || user.getRole() == Role.ROLE_ADMIN) {
            canDelete = true;
        }
        
        if (!canDelete) {
            throw new SecurityException("You don't have permission to delete this comment");
        }
        
        commentRepository.delete(comment);
    }

    // ==================== ATTACHMENTS ====================

    public TicketAttachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File " + file.getOriginalFilename() + " exceeds 5MB limit");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("File " + file.getOriginalFilename() + " is not an allowed image type. Allowed: JPEG, PNG, GIF, WEBP");
        }
    }

    private void saveAttachments(MultipartFile[] files, Ticket ticket) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath);

                TicketAttachment attachment = new TicketAttachment();
                attachment.setTicket(ticket);
                attachment.setFileName(file.getOriginalFilename());
                attachment.setFilePath(filePath.toString());
                attachment.setFileType(file.getContentType());
                attachmentRepository.save(attachment);
            }
        }
    }

    private CommentResponseDTO mapCommentToDTO(Comment comment, User currentUser) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicket().getId());
        dto.setAuthorId(comment.getAuthor().getId());
        dto.setAuthorName(comment.getAuthor().getName());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setEdited(comment.isEdited());
        
        boolean isAuthor = comment.getAuthor().getId().equals(currentUser.getId());
        boolean isManagerOrAdmin = currentUser.getRole() == Role.ROLE_MANAGER || 
                                   currentUser.getRole() == Role.ROLE_ADMIN;
        dto.setCanEdit(isAuthor || isManagerOrAdmin);
        dto.setCanDelete(isAuthor || isManagerOrAdmin);
        
        return dto;
    }

    private TicketResponseDTO mapToDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        dto.setResourceId(ticket.getResourceId());
        dto.setLocationText(ticket.getLocationText());
        dto.setCategory(ticket.getCategory());
        dto.setDescription(ticket.getDescription());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setPreferredContact(ticket.getPreferredContact());
        dto.setReportedById(ticket.getReportedBy().getId());
        dto.setReportedByName(ticket.getReportedBy().getName());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        
        if (ticket.getAssignedTo() != null) {
            dto.setAssignedToId(ticket.getAssignedTo().getId());
            dto.setAssignedToName(ticket.getAssignedTo().getName());
        }
        
        if (ticket.getResolutionNotes() != null) {
            dto.setResolutionNotes(ticket.getResolutionNotes());
        }
        
        if (ticket.getRejectedReason() != null) {
            dto.setRejectedReason(ticket.getRejectedReason());
        }
        
        dto.setResolvedAt(ticket.getResolvedAt());
        dto.setClosedAt(ticket.getClosedAt());

        List<TicketAttachment> attachments = attachmentRepository.findByTicketId(ticket.getId());
        dto.setAttachmentIds(attachments.stream().map(TicketAttachment::getId).collect(Collectors.toList()));
        dto.setAttachmentNames(attachments.stream().map(TicketAttachment::getFileName).collect(Collectors.toList()));

        return dto;
    }
}
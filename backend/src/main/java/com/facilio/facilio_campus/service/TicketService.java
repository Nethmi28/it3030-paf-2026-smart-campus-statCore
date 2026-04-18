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
import java.util.ArrayList;
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
    private final NotificationService notificationService;

    private final String UPLOAD_DIR = "uploads/tickets/";
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"
    );

    @Autowired
    public TicketService(TicketRepository ticketRepository, 
                         TicketAttachmentRepository attachmentRepository,
                         UserRepository userRepository,
                         CommentRepository commentRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.attachmentRepository = attachmentRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
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

        notificationService.notifyRoles(
                List.of(Role.ROLE_MANAGER, Role.ROLE_ADMIN),
                "New incident ticket created",
                user.getName() + " reported a " + dto.getPriority().name()
                        + " priority ticket for "
                        + describeTicketTarget(ticket) + ".",
                NotificationType.TICKET,
                resolvePriority(dto.getPriority()),
                "Ticketing"
        );

        return mapToDTO(ticket);
    }

    // View single ticket - ALLOW any authenticated user for testing
    public TicketResponseDTO getTicketById(Long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        // TEMPORARY: Allow any authenticated user to view any ticket
        // TODO: Add proper role-based access when user module is ready
        
        return mapToDTO(ticket);
    }

    // Get tickets based on role
    public List<TicketResponseDTO> getMyTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Ticket> tickets;
        
        switch (user.getRole()) {
            case ROLE_STUDENT:
                // Students see only their own tickets
                tickets = ticketRepository.findByReportedById(user.getId());
                break;
            case ROLE_TECHNICIAN:
                // Technicians see only tickets assigned to them
                tickets = ticketRepository.findByAssignedToId(user.getId());
                break;
            case ROLE_MANAGER:
            case ROLE_ADMIN:
                // Managers and Admins see all tickets
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
        
        List<Ticket> tickets = ticketRepository.findByAssignedToId(user.getId());
        return tickets.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Get all tickets with filters (Manager/Admin only)
    public List<TicketResponseDTO> getAllTickets(String userEmail, String status, String priority, String category) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Only MANAGER and ADMIN can view all tickets
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
        
        // Only MANAGER or ADMIN can assign technicians
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
        notificationService.notifyUser(
                technician,
                "Ticket assigned to you",
                "Ticket #" + ticket.getId() + " has been assigned to you for "
                        + describeTicketTarget(ticket) + ".",
                NotificationType.TICKET,
                resolvePriority(ticket.getPriority()),
                "Ticket Assignment"
        );
        notificationService.notifyUser(
                ticket.getReportedBy(),
                "Technician assigned to your ticket",
                "Your ticket #" + ticket.getId() + " is now assigned to " + technician.getName() + ".",
                NotificationType.TICKET,
                NotificationPriority.MEDIUM,
                "Ticket Assignment"
        );
        
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
                // Technician can only update status of tickets assigned to them
                canUpdateStatus = ticket.getAssignedTo() != null && 
                                 ticket.getAssignedTo().getId().equals(user.getId());
                break;
            case ROLE_MANAGER:
            case ROLE_ADMIN:
                // Manager and Admin can update any ticket status
                canUpdateStatus = true;
                break;
            default:
                canUpdateStatus = false;
        }
        
        if (!canUpdateStatus) {
            throw new SecurityException("You don't have permission to update this ticket's status");
        }
        
        // Allow status change (no strict validation for testing)
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
        notificationService.notifyUser(
                ticket.getReportedBy(),
                "Ticket status updated",
                "Your ticket #" + ticket.getId() + " is now "
                        + humanizeTicketStatus(ticket.getStatus()).toLowerCase() + ".",
                NotificationType.TICKET,
                resolvePriority(ticket.getPriority()),
                "Ticketing"
        );

        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getEmail().equalsIgnoreCase(userEmail)) {
            notificationService.notifyUser(
                    ticket.getAssignedTo(),
                    "Assigned ticket updated",
                    "Ticket #" + ticket.getId() + " changed to "
                            + humanizeTicketStatus(ticket.getStatus()).toLowerCase() + ".",
                    NotificationType.TICKET,
                    resolvePriority(ticket.getPriority()),
                    "Ticketing"
            );
        }
        
        return mapToDTO(ticket);
    }

    // Manager or Admin can delete a ticket
    public void deleteTicket(Long ticketId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Only MANAGER or ADMIN can delete tickets
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
        
        // Only MANAGER or ADMIN can reject tickets
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
        notificationService.notifyUser(
                ticket.getReportedBy(),
                "Ticket rejected",
                "Your ticket #" + ticket.getId() + " was rejected. Reason: " + request.getRejectedReason(),
                NotificationType.TICKET,
                NotificationPriority.HIGH,
                "Ticketing"
        );
        
        return mapToDTO(ticket);
    }

    // ==================== COMMENTS ====================

    // Add comment - Allow any authenticated user for testing
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

        List<User> commentRecipients = new ArrayList<>();
        if (!ticket.getReportedBy().getId().equals(user.getId())) {
            commentRecipients.add(ticket.getReportedBy());
        }
        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getId().equals(user.getId())) {
            commentRecipients.add(ticket.getAssignedTo());
        }
        commentRecipients.addAll(
                userRepository.findByRoleIn(List.of(Role.ROLE_MANAGER, Role.ROLE_ADMIN)).stream()
                        .filter(recipient -> !recipient.getId().equals(user.getId()))
                        .toList()
        );
        notificationService.notifyUsers(
                commentRecipients,
                "New ticket comment",
                user.getName() + " added a comment on ticket #" + ticket.getId() + ".",
                NotificationType.COMMENT,
                NotificationPriority.LOW,
                "Ticket Comments"
        );
        
        return mapCommentToDTO(comment, user);
    }

    // Get comments - Allow any authenticated user for testing
    public List<CommentResponseDTO> getTicketComments(Long ticketId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
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
        
        // Comment author can always edit their own comment
        if (comment.getAuthor().getId().equals(user.getId())) {
            canEdit = true;
        }
        // Manager and Admin can edit any comment
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
        
        // Comment author can always delete their own comment
        if (comment.getAuthor().getId().equals(user.getId())) {
            canDelete = true;
        }
        // Manager and Admin can delete any comment
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

    private String describeTicketTarget(Ticket ticket) {
        if (ticket.getLocationText() != null && !ticket.getLocationText().isBlank()) {
            return ticket.getLocationText();
        }

        if (ticket.getResourceId() != null) {
            return "resource #" + ticket.getResourceId();
        }

        return "the reported location";
    }

    private String humanizeTicketStatus(TicketStatus status) {
        return status.name().replace('_', ' ');
    }

    private NotificationPriority resolvePriority(TicketPriority priority) {
        if (priority == null) {
            return NotificationPriority.MEDIUM;
        }

        return switch (priority) {
            case CRITICAL, HIGH -> NotificationPriority.HIGH;
            case MEDIUM -> NotificationPriority.MEDIUM;
            case LOW -> NotificationPriority.LOW;
        };
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

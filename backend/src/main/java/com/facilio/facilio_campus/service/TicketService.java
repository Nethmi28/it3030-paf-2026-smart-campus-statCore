package com.facilio.facilio_campus.service;

import com.facilio.facilio_campus.dto.*;
import com.facilio.facilio_campus.model.*;
import com.facilio.facilio_campus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
    
    // Max file size: 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    
    // Allowed image MIME types
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

    public TicketResponseDTO createTicket(TicketRequestDTO dto, MultipartFile[] files, String userEmail) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate file count
        if (files != null && files.length > 3) {
            throw new IllegalArgumentException("Maximum of 3 image attachments allowed per ticket.");
        }

        // Validate each file
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

        // Save attachments
        if (files != null && files.length > 0) {
            saveAttachments(files, ticket);
        }

        return mapToDTO(ticket);
    }

    public TicketResponseDTO getTicketById(Long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Check access: ticket owner, assigned technician, admin, or manager can view
        boolean hasAccess = ticket.getReportedBy().getId().equals(currentUser.getId()) ||
                            (ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(currentUser.getId())) ||
                            currentUser.getRole() == Role.ROLE_ADMIN ||
                            currentUser.getRole() == Role.ROLE_MANAGER;
        
        if (!hasAccess) {
            throw new SecurityException("You don't have permission to view this ticket");
        }
        
        return mapToDTO(ticket);
    }

    public List<TicketResponseDTO> getMyTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Ticket> tickets = ticketRepository.findByReportedById(user.getId());
        return tickets.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getTicketsAssignedToMe(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getRole() != Role.ROLE_TECHNICIAN && user.getRole() != Role.ROLE_ADMIN && user.getRole() != Role.ROLE_MANAGER) {
            throw new SecurityException("Only technicians, admins, and managers can view assigned tickets");
        }
        
        List<Ticket> tickets = ticketRepository.findByAssignedToId(user.getId());
        return tickets.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getAllTickets(String userEmail, String status, String priority, String category) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Only ADMIN and MANAGER can view all tickets
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

    public TicketResponseDTO assignTicket(Long ticketId, Long technicianId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        
        // Only ADMIN or MANAGER can assign technicians
        if (admin.getRole() != Role.ROLE_ADMIN && admin.getRole() != Role.ROLE_MANAGER) {
            throw new SecurityException("Only admins and managers can assign technicians to tickets");
        }
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));
        
        // Verify the user is actually a technician
        if (technician.getRole() != Role.ROLE_TECHNICIAN && technician.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalArgumentException("Selected user is not a technician");
        }
        
        ticket.setAssignedTo(technician);
        
        // If ticket is OPEN, move to IN_PROGRESS when assigned
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        
        ticket = ticketRepository.save(ticket);
        
        // TODO: Trigger notification for technician (Member 4 will implement)
        
        return mapToDTO(ticket);
    }

    public TicketResponseDTO updateTicketStatus(Long ticketId, StatusUpdateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        // Check permission: only assigned technician or admin/manager can update status
        boolean isAssignedTech = ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(user.getId());
        boolean isAdminOrManager = user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_MANAGER;
        
        if (!isAssignedTech && !isAdminOrManager) {
            throw new SecurityException("Only assigned technician or admin can update ticket status");
        }
        
        // Validate status transition
        validateStatusTransition(ticket.getStatus(), request.getStatus());
        
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(request.getStatus());
        
        // Set timestamps based on status
        if (request.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        if (request.getStatus() == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }
        
        // Add resolution notes if provided
        if (request.getResolutionNotes() != null && !request.getResolutionNotes().isEmpty()) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        
        ticket = ticketRepository.save(ticket);
        
        // TODO: Trigger notification for ticket owner (Member 4 will implement)
        
        return mapToDTO(ticket);
    }

    public TicketResponseDTO rejectTicket(Long ticketId, RejectTicketRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        
        // Only ADMIN can reject tickets (or MANAGER if configured)
        if (admin.getRole() != Role.ROLE_ADMIN && admin.getRole() != Role.ROLE_MANAGER) {
            throw new SecurityException("Only admins and managers can reject tickets");
        }
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        // Can only reject OPEN tickets
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new IllegalStateException("Only open tickets can be rejected");
        }
        
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectedReason(request.getRejectedReason());
        ticket = ticketRepository.save(ticket);
        
        // TODO: Trigger notification for ticket owner (Member 4 will implement)
        
        return mapToDTO(ticket);
    }

   // ==================== COMMENTS ====================

public CommentResponseDTO addComment(Long ticketId, CommentRequestDTO dto, String userEmail) {
    User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
    
    // Allow any authenticated user to comment
    Comment comment = new Comment();
    comment.setTicket(ticket);
    comment.setAuthor(user);
    comment.setContent(dto.getContent());
    comment = commentRepository.save(comment);
    
    return mapCommentToDTO(comment, user);
}

public List<CommentResponseDTO> getTicketComments(Long ticketId, String userEmail) {
    User currentUser = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    
    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
    
    // Allow any authenticated user to view comments
    List<Comment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    return comments.stream()
            .map(comment -> mapCommentToDTO(comment, currentUser))
            .collect(Collectors.toList());
}

public CommentResponseDTO updateComment(Long commentId, UpdateCommentRequest request, String userEmail) {
    User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    
    Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
    
    // Only comment author or admin can edit
    boolean isAuthor = comment.getAuthor().getId().equals(user.getId());
    boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
    
    if (!isAuthor && !isAdmin) {
        throw new SecurityException("Only the comment author or admin can edit this comment");
    }
    
    comment.setContent(request.getContent());
    comment = commentRepository.save(comment);
    
    return mapCommentToDTO(comment, user);
}

public void deleteComment(Long commentId, String userEmail) {
    User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    
    Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
    
    // Only comment author or admin can delete
    boolean isAuthor = comment.getAuthor().getId().equals(user.getId());
    boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
    
    if (!isAuthor && !isAdmin) {
        throw new SecurityException("Only the comment author or admin can delete this comment");
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
        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File " + file.getOriginalFilename() + " exceeds 5MB limit");
        }
        
        // Check MIME type
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

    private void validateStatusTransition(TicketStatus current, TicketStatus newStatus) {
        switch (current) {
            case OPEN:
                if (newStatus != TicketStatus.IN_PROGRESS && newStatus != TicketStatus.REJECTED) {
                    throw new IllegalStateException("Open tickets can only be moved to IN_PROGRESS or REJECTED");
                }
                break;
            case IN_PROGRESS:
                if (newStatus != TicketStatus.RESOLVED && newStatus != TicketStatus.OPEN) {
                    throw new IllegalStateException("In-progress tickets can only be moved to RESOLVED or back to OPEN");
                }
                break;
            case RESOLVED:
                if (newStatus != TicketStatus.CLOSED && newStatus != TicketStatus.IN_PROGRESS) {
                    throw new IllegalStateException("Resolved tickets can only be moved to CLOSED or back to IN_PROGRESS");
                }
                break;
            case CLOSED:
                throw new IllegalStateException("Closed tickets cannot be modified");
            case REJECTED:
                throw new IllegalStateException("Rejected tickets cannot be modified");
            default:
                break;
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
        
        // Determine if current user can edit/delete
        boolean isAuthor = comment.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        dto.setCanEdit(isAuthor || isAdmin);
        dto.setCanDelete(isAuthor || isAdmin);
        
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
package com.facilio.facilio_campus.service;

import com.facilio.facilio_campus.dto.TicketRequestDTO;
import com.facilio.facilio_campus.dto.TicketResponseDTO;
import com.facilio.facilio_campus.model.Ticket;
import com.facilio.facilio_campus.model.TicketAttachment;
import com.facilio.facilio_campus.model.User;
import com.facilio.facilio_campus.repository.TicketAttachmentRepository;
import com.facilio.facilio_campus.repository.TicketRepository;
import com.facilio.facilio_campus.repository.UserRepository;
import com.facilio.facilio_campus.repository.CommentRepository;
import com.facilio.facilio_campus.model.Comment;
import com.facilio.facilio_campus.dto.CommentRequestDTO;
import com.facilio.facilio_campus.dto.CommentResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    public TicketResponseDTO createTicket(TicketRequestDTO dto, MultipartFile[] files, String userEmail) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (files != null && files.length > 3) {
            throw new IllegalArgumentException("Maximum of 3 image attachments allowed per ticket.");
        }

        Ticket ticket = new Ticket();
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setPreferredContact(dto.getPreferredContact());
        ticket.setLocationText(dto.getLocationText());
        ticket.setResourceId(dto.getResourceId());
        ticket.setReportedBy(user);

        ticket = ticketRepository.save(ticket);

        if (files != null && files.length > 0) {
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

        return mapToDTO(ticket);
    }

    public List<TicketResponseDTO> getMyTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Ticket> tickets = ticketRepository.findByReportedById(user.getId());
        return tickets.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public CommentResponseDTO addComment(Long ticketId, CommentRequestDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setAuthor(user);
        comment.setContent(dto.getContent());
        comment = commentRepository.save(comment);

        return mapCommentToDTO(comment);
    }

    public List<CommentResponseDTO> getTicketComments(Long ticketId) {
        List<Comment> comments = commentRepository.findByTicketId(ticketId);
        return comments.stream().map(this::mapCommentToDTO).collect(Collectors.toList());
    }

    public TicketAttachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
    }

    private CommentResponseDTO mapCommentToDTO(Comment comment) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicket().getId());
        dto.setAuthorId(comment.getAuthor().getId());
        dto.setAuthorName(comment.getAuthor().getName());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
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

        List<TicketAttachment> attachments = attachmentRepository.findByTicketId(ticket.getId());
        dto.setAttachmentIds(attachments.stream().map(TicketAttachment::getId).collect(Collectors.toList()));
        dto.setAttachmentNames(attachments.stream().map(TicketAttachment::getFileName).collect(Collectors.toList()));

        return dto;
    }
}

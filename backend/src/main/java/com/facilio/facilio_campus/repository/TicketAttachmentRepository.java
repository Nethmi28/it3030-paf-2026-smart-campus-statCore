package com.facilio.facilio_campus.repository;

import com.facilio.facilio_campus.model.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicketId(Long ticketId);
}

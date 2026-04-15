package com.facilio.facilio_campus.repository;

import com.facilio.facilio_campus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReportedById(Long userId);
    List<Ticket> findByAssignedToId(Long technicianId);
}

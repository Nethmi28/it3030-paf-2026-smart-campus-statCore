package com.facilio.facilio_campus.repository;

import com.facilio.facilio_campus.model.Ticket;
import com.facilio.facilio_campus.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReportedById(Long userId);
    List<Ticket> findByAssignedToId(Long technicianId);
    
    // For Admin/Manager - get all tickets with optional filters
    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:category IS NULL OR t.category = :category)")
    List<Ticket> findAllWithFilters(@Param("status") TicketStatus status,
                                     @Param("priority") String priority,
                                     @Param("category") String category);
    
    // Get tickets assigned to specific technician with status filter
    List<Ticket> findByAssignedToIdAndStatus(Long technicianId, TicketStatus status);
    
    Optional<Ticket> findByIdAndReportedById(Long ticketId, Long userId);
}
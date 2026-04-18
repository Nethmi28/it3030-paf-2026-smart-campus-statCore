package com.facilio.facilio_campus.repository;

import com.facilio.facilio_campus.model.BookingAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingAuditLogRepository extends JpaRepository<BookingAuditLog, Long> {
    List<BookingAuditLog> findTop20ByOrderByCreatedAtDesc();
}

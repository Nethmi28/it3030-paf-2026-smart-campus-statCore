package com.facilio.facilio_campus.repository;

import com.facilio.facilio_campus.model.Booking;
import com.facilio.facilio_campus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByCreatedAtDesc(User user);
    
    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.resource.id = :resourceId AND b.bookingDate = :date AND b.status IN ('PENDING', 'APPROVED') AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    long countConflictingBookings(
        @Param("resourceId") Long resourceId, 
        @Param("date") LocalDate date, 
        @Param("startTime") LocalTime startTime, 
        @Param("endTime") LocalTime endTime
    );

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.bookingDate = :date AND b.status IN ('PENDING', 'APPROVED')")
    List<Booking> findConflictingBookingsForDate(
        @Param("resourceId") Long resourceId, 
        @Param("date") LocalDate date
    );
}

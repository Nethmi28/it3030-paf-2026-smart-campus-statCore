package com.facilio.facilio_campus.repository;

import com.facilio.facilio_campus.model.AccountRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRequestRepository extends JpaRepository<AccountRequest, Long> {
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByStudentIdIgnoreCase(String studentId);
    List<AccountRequest> findAllByOrderByCreatedAtDesc();
}

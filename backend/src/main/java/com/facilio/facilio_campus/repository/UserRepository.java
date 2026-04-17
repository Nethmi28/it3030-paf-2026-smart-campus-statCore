package com.facilio.facilio_campus.repository;

import com.facilio.facilio_campus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleEmailIgnoreCase(String googleEmail);
    Boolean existsByEmail(String email);
    Boolean existsByGoogleEmailIgnoreCase(String googleEmail);
}

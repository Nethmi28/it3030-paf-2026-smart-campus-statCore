package com.facilio.facilio_campus.repository;

import com.facilio.facilio_campus.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByFaculty(String faculty);
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
    List<Resource> findByFacultyAndCapacityGreaterThanEqual(String faculty, int capacity);
}

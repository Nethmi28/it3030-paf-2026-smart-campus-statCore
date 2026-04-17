package com.facilio.facilio_campus.repository;

import com.facilio.facilio_campus.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    @EntityGraph(attributePaths = "amenities")
    List<Resource> findAllByOrderByIdAsc();

    @EntityGraph(attributePaths = "amenities")
    List<Resource> findByFacultyOrderByIdAsc(String faculty);

    @EntityGraph(attributePaths = "amenities")
    List<Resource> findByCapacityGreaterThanEqualOrderByIdAsc(int capacity);

    @EntityGraph(attributePaths = "amenities")
    List<Resource> findByFacultyAndCapacityGreaterThanEqualOrderByIdAsc(String faculty, int capacity);
}

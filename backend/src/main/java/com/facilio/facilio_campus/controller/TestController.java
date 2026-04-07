package com.facilio.facilio_campus.controller;

import com.facilio.facilio_campus.model.Student;
import com.facilio.facilio_campus.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/database")
    public String testDatabaseConnection() {
        // Create a test student
        Student testStudent = new Student("Test User", "test@example.com", "Computer Science");
        studentRepository.save(testStudent);
        
        // Retrieve from database
        List<Student> students = studentRepository.findAll();
        
        return "Database Connection Successful! 🎉<br/>" +
               "Test table 'student' accessed successfully.<br/>" +
               "Total students in DB right now: " + students.size();
    }
}

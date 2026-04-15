package com.facilio.facilio_campus.seeder;

import com.facilio.facilio_campus.model.Resource;
import com.facilio.facilio_campus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class ResourceSeeder implements CommandLineRunner {

    @Autowired
    private ResourceRepository resourceRepository;

    @Override
    public void run(String... args) throws Exception {
        // Clear existing to apply new images during development
        resourceRepository.deleteAll();
        seedResources();
    }

    private void seedResources() {
        List<Resource> resources = new ArrayList<>();

        // Local AI-generated images
        String lectureImg = "/images/lecture_hall.png";
        String labImg = "/images/lab.png";
        String libraryImg = "/images/library.png";
        String auditoriumImg = "/images/auditorium.png";

        // Computing Series
        resources.addAll(generateSeries("A", 301, 306, "LECTURE ROOM", "Faculty of Computing", 120, lectureImg));
        resources.addAll(generateSeries("A", 501, 505, "LECTURE ROOM", "Faculty of Computing", 240, lectureImg));
        resources.addAll(generateSeries("B", 506, 507, "LECTURE ROOM", "Faculty of Computing", 60, lectureImg));
        resources.addAll(generateSeries("A", 401, 412, "LECTURE ROOM", "Faculty of Computing", 120, lectureImg));
        resources.addAll(generateSeries("F", 301, 315, "LECTURE ROOM", "Faculty of Computing", 60, lectureImg));
        resources.addAll(generateSeries("F", 401, 406, "LECTURE ROOM", "Faculty of Computing", 240, lectureImg));
        resources.addAll(generateSeries("F", 1301, 1307, "LECTURE ROOM", "Faculty of Computing", 120, lectureImg));
        resources.addAll(generateSeries("G", 1301, 1307, "LECTURE ROOM", "Faculty of Computing", 120, lectureImg));
        resources.addAll(generateSeries("CompLab", 1, 10, "LAB", "Faculty of Computing", 60, labImg));

        // Business
        resources.addAll(generateSeries("BM", 101, 110, "LECTURE ROOM", "Business School", 120, lectureImg));
        resources.addAll(generateSeries("BMLab", 1, 10, "LAB", "Business School", 30, labImg));

        // Engineering
        resources.addAll(generateSeries("E", 101, 110, "LECTURE ROOM", "Faculty of Engineering", 240, lectureImg));
        resources.addAll(generateSeries("ELab", 1, 10, "LAB", "Faculty of Engineering", 60, labImg));

        // Architecture
        resources.addAll(generateSeries("ARC", 101, 110, "LECTURE ROOM", "School of architecture", 60, lectureImg));
        resources.addAll(generateSeries("ARCLab", 1, 10, "LAB", "School of architecture", 30, labImg));

        // Humanities
        resources.addAll(generateSeries("HS", 101, 110, "LECTURE ROOM", "Faculty of Humanities & science", 120, lectureImg));
        resources.addAll(generateSeries("HSLab", 1, 10, "LAB", "Faculty of Humanities & science", 60, labImg));

        // Global
        resources.add(new Resource("Main Library - New Building", "LIBRARY", "General", "Main Campus", 500, "Available", "State-of-the-art library.", libraryImg, Arrays.asList("Wi-Fi", "Quiet Zone")));
        resources.add(new Resource("Main Auditorium", "AUDITORIUM", "General", "Admin Block", 500, "Available", "Large auditorium.", auditoriumImg, Arrays.asList("Full AV", "Stage")));
        
        resourceRepository.saveAll(resources);
    }

    private List<Resource> generateSeries(String prefix, int start, int end, String type, String faculty, int capacity, String imageUrl) {
        List<Resource> series = new ArrayList<>();
        for (int i = start; i <= end; i++) {
            series.add(new Resource(
                prefix + i,
                type,
                faculty,
                faculty + " Building, Floor " + String.valueOf(i).charAt(0),
                capacity,
                Math.random() > 0.1 ? "Available" : "Unavailable",
                "Educational " + type.toLowerCase() + " for " + faculty + ".",
                imageUrl,
                type.equals("LAB") ? Arrays.asList("Wi-Fi", "Workstations", "AC") : Arrays.asList("Wi-Fi", "Projector", "Sound System")
            ));
        }
        return series;
    }
}

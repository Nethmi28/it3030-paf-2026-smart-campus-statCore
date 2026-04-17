package com.facilio.facilio_campus.seeder;

import com.facilio.facilio_campus.model.Resource;
import com.facilio.facilio_campus.repository.ResourceRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class ResourceSeeder implements CommandLineRunner {

    @Autowired
    private ResourceRepository resourceRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Use native truncate for maximum performance and stability on remote DB
        entityManager.createNativeQuery("TRUNCATE TABLE resource_amenities CASCADE").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE resources CASCADE").executeUpdate();
        
        seedResources();
    }

    private void seedResources() {
        List<Resource> resources = new ArrayList<>();

        // Images
        String labImg = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800";
        String libraryImg = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800";
        String auditoriumImg = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800";
        String equipImg = "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800";

        // Faculty-specific Lecture Hall Images (Stable & Simple)
        String lecCompImg = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800";
        String lecBusImg = "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800";
        String lecEngImg = "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800";
        String lecArchImg = "https://images.unsplash.com/photo-1503387762-592dee5814e?auto=format&fit=crop&q=80&w=800";
        String lecHumImg = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800";

        // 5 Lecture Rooms per Faculty with specific prefixes
        
        // Computing
        resources.addAll(generateSeries("A", 401, 402, "LECTURE ROOM", "Faculty of Computing", 120, lecCompImg));
        resources.addAll(generateSeries("F", 1301, 1302, "LECTURE ROOM", "Faculty of Computing", 120, lecCompImg));
        resources.addAll(generateSeries("G", 1301, 1301, "LECTURE ROOM", "Faculty of Computing", 120, lecCompImg));
        resources.addAll(generateSeries("CompLab", 1, 2, "LAB", "Faculty of Computing", 60, labImg));
        resources.add(new Resource("Computing Equipment Room", "EQUIPMENT_ROOM", "Faculty of Computing", "Computing Building, Floor 1", 1, "Available", "Central equipment store for Computing Faculty containing all necessary peripherals and AV gear.", equipImg, Arrays.asList("Projectors", "Whiteboards", "PCs", "Keyboards", "Mouses", "Speakers", "Mics")));

        // Business: BM
        resources.addAll(generateSeries("BM", 101, 105, "LECTURE ROOM", "Business School", 120, lecBusImg));
        resources.addAll(generateSeries("BMLab", 1, 2, "LAB", "Business School", 60, labImg));
        resources.add(new Resource("Business School Equipment Room", "EQUIPMENT_ROOM", "Business School", "Business School, Floor 1", 1, "Available", "Central equipment store for Business School including standard presentation tools.", equipImg, Arrays.asList("Projectors", "Whiteboards", "Wireless Mics", "Laser Pointers")));

        // Engineering: E
        resources.addAll(generateSeries("E", 101, 105, "LECTURE ROOM", "Faculty of Engineering", 240, lecEngImg));
        resources.addAll(generateSeries("ELab", 1, 2, "LAB", "Faculty of Engineering", 60, labImg));
        resources.add(new Resource("Engineering Equipment Room", "EQUIPMENT_ROOM", "Faculty of Engineering", "Engineering Building, Floor 1", 1, "Available", "Central equipment store for Engineering Faculty with specialized hardware and testing tools.", equipImg, Arrays.asList("Projectors", "Whiteboards", "Drill Presses", "Oscilloscopes", "Multimeters", "Soldering Stations")));

        // Humanities: H
        resources.addAll(generateSeries("H", 101, 105, "LECTURE ROOM", "Faculty of Humanities & Science", 120, lecHumImg));
        resources.addAll(generateSeries("HSLab", 1, 2, "LAB", "Faculty of Humanities & Science", 60, labImg));
        resources.add(new Resource("Humanities & Science Equipment Room", "EQUIPMENT_ROOM", "Faculty of Humanities & Science", "Humanities Building, Floor 1", 1, "Available", "Central equipment store for Humanities & Science students.", equipImg, Arrays.asList("Projectors", "Whiteboards", "Wireless Mics", "Laser Pointers")));

        // Architecture: ARC
        resources.addAll(generateSeries("ARC", 101, 105, "LECTURE ROOM", "School of Architecture", 120, lecArchImg));
        resources.addAll(generateSeries("ARCLab", 1, 2, "LAB", "School of Architecture", 60, labImg));
        resources.add(new Resource("Architecture Equipment Room", "EQUIPMENT_ROOM", "School of Architecture", "Architecture Building, Floor 1", 1, "Available", "Central equipment store for Architecture School with drafting and modeling tools.", equipImg, Arrays.asList("Projectors", "Whiteboards", "Drafting Boards", "Plotters", "Cutting Mats", "3D Printers")));

        // Sports equipments
        String sportsCategory = "Sports equipments";
        resources.add(new Resource("Basketball", "EQUIPMENTS", sportsCategory, "Sports Complex", 12, "Available", "Standard basketball for matches.", "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80&w=800", Arrays.asList("Regulation size", "Vibrant color")));
        resources.add(new Resource("Volleyball", "EQUIPMENTS", sportsCategory, "Sports Complex", 12, "Available", "Professional volleyball.", "https://images.unsplash.com/photo-1592656094267-764a45159577?auto=format&fit=crop&q=80&w=800", Arrays.asList("Soft touch", "Indoor/Outdoor")));
        resources.add(new Resource("Carrom Board", "EQUIPMENTS", sportsCategory, "Student Lounge", 4, "Available", "Wooden carrom board with pieces.", "https://images.unsplash.com/photo-1577748651212-32abb372993d?auto=format&fit=crop&q=80&w=800", Arrays.asList("Smooth surface", "Complete set")));
        resources.add(new Resource("Chess Set", "EQUIPMENTS", sportsCategory, "Student Lounge", 2, "Available", "Professional chess board and pieces.", "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&q=80&w=800", Arrays.asList("Weighted pieces", "Foldable board")));
        resources.add(new Resource("Badminton Set", "EQUIPMENTS", sportsCategory, "Sports Complex", 4, "Available", "Pair of rackets and shuttlecocks.", "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&q=80&w=800", Arrays.asList("Lightweight", "Includes shuttlecocks")));
        resources.add(new Resource("Main Gym Facility", "FACILITY", sportsCategory, "Lower Ground", 50, "Available", "Fully equipped modern gym.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800", Arrays.asList("Cardio", "Weights", "Trainer available")));

        // Student Services - Transportation
        String studentServices = "Student Services";
        String busImg = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800";
        String busDesc = "Morning: Arrives at campus at 8:00 AM. Evening: Departs from campus at 6:00 PM. Follows university schedule.";
        resources.add(new Resource("Bus - Kolpity Route", "TRANSPORTATION", studentServices, "Bus Bay 01", 50, "Available", busDesc, busImg, Arrays.asList("AC", "WIFI", "GPS")));
        resources.add(new Resource("Bus - Panadura Route", "TRANSPORTATION", studentServices, "Bus Bay 02", 50, "Available", busDesc, busImg, Arrays.asList("AC", "WIFI", "GPS")));
        resources.add(new Resource("Bus - Negombo Route", "TRANSPORTATION", studentServices, "Bus Bay 03", 50, "Available", busDesc, busImg, Arrays.asList("AC", "WIFI", "GPS")));
        resources.add(new Resource("Bus - Gampaha Route", "TRANSPORTATION", studentServices, "Bus Bay 04", 50, "Available", busDesc, busImg, Arrays.asList("AC", "WIFI", "GPS")));

        // Global
        resources.add(new Resource("Main Library", "LIBRARY", "General", "Main Campus", 500, "Available", "Central university library.", libraryImg, Arrays.asList("Wi-Fi", "Quiet Zone")));
        resources.add(new Resource("Main Auditorium", "AUDITORIUM", "General", "Admin Block", 500, "Available", "Large auditorium for events.", auditoriumImg, Arrays.asList("Full AV", "Stage")));
        
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

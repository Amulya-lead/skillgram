package org.example.skillgrammmm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.example.skillgrammmm.model.Post;
import org.example.skillgrammmm.repository.PostRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SkillgrammmmApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillgrammmmApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(PostRepository postRepo) {
        return args -> {
            if (postRepo.count() == 0) {
                Post post1 = new Post();
                post1.setTitle("Mastering Spring Boot 4.0 & Java 22");
                post1.setDescription("Just upgraded my API controllers to use the new Jackson 3.x serialization standards. Loving the performance gains with virtual threads! #SpringBoot #Java");
                postRepo.save(post1);

                Post post2 = new Post();
                post2.setTitle("Stunning Glassmorphism Design Tricks");
                post2.setDescription("Tip: When building glass cards, use `backdrop-filter: blur(16px)` and a subtle semi-transparent border `1px solid rgba(255,255,255,0.08)`. It creates a hyper-premium look! #CSS #UIUX #Design");
                postRepo.save(post2);

                Post post3 = new Post();
                post3.setTitle("Switched to Podman & Jib builds");
                post3.setDescription("Container builds are so much cleaner now. Using Jib to build OCI images directly without needing a local daemon or running into Windows named pipe connection issues. #Docker #Podman #DevOps");
                postRepo.save(post3);
            }
        };
    }
}
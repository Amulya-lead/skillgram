package org.example.skillgrammmm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // hashed

    @Enumerated(EnumType.STRING)
@Builder.Default
    private Role role = Role.USER;

    private String profileImageUrl;
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String skillSet; // JSON array of skills

@Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

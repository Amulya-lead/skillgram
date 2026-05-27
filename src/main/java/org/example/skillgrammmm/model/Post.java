package org.example.skillgrammmm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
public class Post {

    @Id
    @GeneratedValue
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String codeSnippet;

    private String language; // e.g. "javascript", "java", "python"
}
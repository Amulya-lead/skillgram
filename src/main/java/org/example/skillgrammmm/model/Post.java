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
    private String description;
}
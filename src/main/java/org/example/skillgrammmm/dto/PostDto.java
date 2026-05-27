package org.example.skillgrammmm.dto;

import org.example.skillgrammmm.model.Post;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private Long id;
    private String title;
    private String description;

    public static PostDto fromEntity(Post post) {
        return new PostDto(post.getId(), post.getTitle(), post.getDescription());
    }

    public Post toEntity() {
        Post p = new Post();
        p.setId(this.id);
        p.setTitle(this.title);
        p.setDescription(this.description);
        return p;
    }
}

package org.example.skillgrammmm.repository;

import org.example.skillgrammmm.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Spring Data JPA repository for {@link Post} entities.
 * Add custom query methods here if needed.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Example custom method (uncomment if needed):
    // List<Post> findByTitleContainingIgnoreCase(String keyword);
}
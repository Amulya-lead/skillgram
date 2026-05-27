package org.example.skillgrammmm.controller;

import org.example.skillgrammmm.model.Post;
import org.example.skillgrammmm.repository.PostRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostRepository repo;

    public PostController(PostRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public Post create(@RequestBody Post post) {
        return repo.save(post);
    }

    @GetMapping
    public List<Post> getAll() {
        return repo.findAll();
    }
}
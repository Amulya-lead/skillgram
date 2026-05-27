package org.example.skillgrammmm.controller;

import org.example.skillgrammmm.model.Post;
import org.example.skillgrammmm.repository.PostRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostRepository repo;
    private final SimpMessagingTemplate messagingTemplate;

    public PostController(PostRepository repo, SimpMessagingTemplate messagingTemplate) {
        this.repo = repo;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public Post create(@RequestBody Post post) {
        Post saved = repo.save(post);
        // Broadcast new post to all WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/feed", saved);
        return saved;
    }

    @GetMapping
    public List<Post> getAll() {
        return repo.findAll();
    }
}
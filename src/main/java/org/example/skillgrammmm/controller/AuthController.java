package org.example.skillgrammmm.controller;

import org.example.skillgrammmm.entity.User;
import org.example.skillgrammmm.repository.UserRepository;
import org.example.skillgrammmm.service.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthController(UserRepository repo,
                          PasswordEncoder encoder,
                          JwtService jwtService) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);
        return "User registered";
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {

        User dbUser = repo.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(user.getPassword(), dbUser.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(dbUser.getUsername());

        return Map.of("token", token);
    }

    @GetMapping("/me")
    public User getMe(java.security.Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        User user = repo.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(null);
        return user;
    }

    @PutMapping("/me")
    public User updateMe(java.security.Principal principal, @RequestBody User updatedUser) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        User user = repo.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedUser.getBio() != null) user.setBio(updatedUser.getBio());
        if (updatedUser.getProfileImageUrl() != null) user.setProfileImageUrl(updatedUser.getProfileImageUrl());
        if (updatedUser.getSkillSet() != null) user.setSkillSet(updatedUser.getSkillSet());
        if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());

        repo.save(user);
        user.setPassword(null);
        return user;
    }
}
package PipelinePioneers.example.user_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // Set default role if not specified
        if (user.getRole() == null) {
            user.setRole(UserRole.USER);
        }
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        Optional<User> user = userRepository.findByUsername(loginRequest.getUsername());
        if (user.isEmpty() || !user.get().getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        
        // Return user info with role for frontend
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.get().getId());
        response.put("username", user.get().getUsername());
        response.put("email", user.get().getEmail());
        response.put("role", user.get().getRole().toString());
        response.put("phoneNumber", user.get().getPhoneNumber());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        // Set default role if not specified
        if (user.getRole() == null) {
            user.setRole(UserRole.USER);
        }
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(updatedUser.getUsername());
        user.setPassword(updatedUser.getPassword());
        user.setEmail(updatedUser.getEmail());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        
        // Only allow role update if specified
        if (updatedUser.getRole() != null) {
            user.setRole(updatedUser.getRole());
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    // Get all users (admin only in practice)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user statistics (admin only)
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", userRepository.count());
        stats.put("admins", userRepository.countByRole(UserRole.ADMIN));
        stats.put("users", userRepository.countByRole(UserRole.USER));
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
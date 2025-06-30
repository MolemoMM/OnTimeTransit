package PipelinePioneers.example.user_service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public void register(User user) {
        System.out.println("Registering user: " + user);

        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            System.out.println("Username already exists: " + user.getUsername());
            throw new RuntimeException("Username already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        System.out.println("Saving user to the database: " + user);
        userRepository.save(user);

        System.out.println("User registered successfully: " + user.getUsername());
    }

    public String login(User user) {
        System.out.println("Attempting login for username: " + user.getUsername());

        // Check for admin credentials
        if ("admin".equals(user.getUsername()) && "admin123".equals(user.getPassword())) {
            System.out.println("Admin login successful");
            return "ADMIN";
        }

        // Check for regular user credentials
        User existingUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            System.out.println("Invalid password for username: " + user.getUsername());
            throw new RuntimeException("Invalid credentials");
        }

        System.out.println("User login successful: " + user.getUsername());
        return "USER";
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }
}

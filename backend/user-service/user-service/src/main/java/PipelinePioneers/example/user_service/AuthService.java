package PipelinePioneers.example.user_service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public void register(User user) {
        System.out.println("Registering user: " + user.getUsername());

        // Validate required fields
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        // Check if username already exists
        if (userRepository.findByUsername(user.getUsername().trim()).isPresent()) {
            System.out.println("Username already exists: " + user.getUsername());
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail().trim()).isPresent()) {
            System.out.println("Email already exists: " + user.getEmail());
            throw new RuntimeException("Email already exists");
        }

        // Set trimmed values and encode password
        user.setUsername(user.getUsername().trim());
        user.setEmail(user.getEmail().trim());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        System.out.println("Saving user to the database: " + user.getUsername());
        userRepository.save(user);

        System.out.println("User registered successfully: " + user.getUsername());
    }

    public String login(User user) {
        System.out.println("Attempting login for username: " + user.getUsername());

        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        String username = user.getUsername().trim();
        String password = user.getPassword();

        // Check for admin credentials first (hardcoded for now)
        if ("admin".equals(username) && "admin123".equals(password)) {
            System.out.println("Admin login successful");
            return "ADMIN";
        }

        // Check for regular user credentials in database
        User existingUser = userRepository.findByUsername(username).orElse(null);

        if (existingUser == null) {
            System.out.println("User not found: " + username);
            throw new RuntimeException("Invalid username or password");
        }

        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            System.out.println("Invalid password for username: " + username);
            throw new RuntimeException("Invalid username or password");
        }

        System.out.println("User login successful: " + username);
        return "USER";
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }
}

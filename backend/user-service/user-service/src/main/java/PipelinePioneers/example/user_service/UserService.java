package PipelinePioneers.example.user_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Add other user-related methods here

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}

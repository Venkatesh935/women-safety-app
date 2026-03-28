package com.venkatesh.womensafety;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public Map<String,String> register(@RequestBody User user){
        userRepository.save(user);

        Map<String,String> response = new HashMap<>();
        response.put("message","User registered successfully");
        return response;
    }

    @PostMapping("/auth/login")
    public LoginResponse login(@RequestBody Map<String,String> data){

        String email = data.get("email");
        String password = data.get("password");

        Optional<User> user = userRepository.findByEmail(email);

        if(user.isPresent() && user.get().getPassword().equals(password)){
            User u = user.get();
            return new LoginResponse(
                    u.getUserId(),
                    u.getName(),
                    u.getEmail(),
                    u.getPhone()
            );
        }

        throw new RuntimeException("Invalid credentials");
    }
}
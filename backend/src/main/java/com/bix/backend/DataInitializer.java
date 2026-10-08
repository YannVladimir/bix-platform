package com.bix.backend;

import com.bix.backend.user.User;
import com.bix.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Drop constraints that might prevent SUPER_ADMIN role assignment
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            System.out.println("Constraint check successfully dropped or already absent.");
        } catch (Exception e) {
            System.out.println("Note: Could not drop constraint: " + e.getMessage());
        }

        String adminEmail = "yannvladimirbajeneza@gmail.com";
        User admin = userRepository.findByEmail(adminEmail).orElse(null);

        if (admin == null) {
            admin = new User();
            admin.setName("Super Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("password@123"));
            admin.setRole(User.Role.SUPER_ADMIN);
            admin.setStatus("ACTIVE");
            admin.setCompany(null);
            userRepository.save(admin);
            System.out.println("Super Admin user created successfully: " + adminEmail);
        } else if (admin.getRole() != User.Role.SUPER_ADMIN) {
            admin.setRole(User.Role.SUPER_ADMIN);
            admin.setCompany(null); // Super admin shouldn't be tied to a company
            userRepository.save(admin);
            System.out.println("Existing user upgraded to Super Admin: " + adminEmail);
        } else {
            System.out.println("Super Admin user verified: " + adminEmail);
        }
    }
}

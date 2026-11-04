package com.bix.backend;

import com.bix.backend.user.User;
import com.bix.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Bootstraps the initial SUPER_ADMIN account, if configured.
 *
 * This previously hardcoded a specific admin email and a plaintext
 * password ("password@123") directly in source, created automatically on
 * every application startup (including production). Anyone with read
 * access to the repository therefore had a working super-admin login for
 * any deployment where the owner hadn't manually changed it. It also ran
 * an unconditional "ALTER TABLE users DROP CONSTRAINT IF EXISTS
 * users_role_check" on every boot, silently mutating the production
 * schema outside of any reviewed migration.
 *
 * Fix: the admin account is now only bootstrapped when ADMIN_EMAIL and
 * ADMIN_PASSWORD are explicitly supplied via environment variables, the
 * password is never hardcoded or logged, and an existing admin's password
 * is never silently overwritten on restart. The automatic ALTER TABLE has
 * been removed entirely — a schema/constraint change like that should be
 * a deliberate, reviewed migration (e.g. Flyway/Liquibase), not a
 * side effect of starting the app.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            System.out.println(
                    "ADMIN_EMAIL/ADMIN_PASSWORD not set - skipping super admin bootstrap. "
                            + "Set both environment variables to create/verify the initial SUPER_ADMIN user.");
            return;
        }

        User admin = userRepository.findByEmail(adminEmail).orElse(null);

        if (admin == null) {
            admin = new User();
            admin.setName("Super Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(User.Role.SUPER_ADMIN);
            admin.setStatus("ACTIVE");
            admin.setCompany(null);
            userRepository.save(admin);
            System.out.println("Super Admin user created: " + adminEmail);
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

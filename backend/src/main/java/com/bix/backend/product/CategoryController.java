package com.bix.backend.product;

import com.bix.backend.common.TenantContext;
import com.bix.backend.company.Company;
import com.bix.backend.company.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.bix.backend.approval.ApprovalRequest;
import com.bix.backend.approval.ApprovalRequestRepository;
import com.bix.backend.user.User;
import com.bix.backend.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final CompanyRepository companyRepository;
    private final ApprovalRequestRepository approvalRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<Category> getAllCategories() {
        Long companyId = TenantContext.getCurrentCompanyId();
        return categoryRepository.findAllByCompanyId(companyId);
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        category.setCompany(company);

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (user.getRole() == com.bix.backend.user.User.Role.EMPLOYEE) {
            try {
                ApprovalRequest req = new ApprovalRequest();
                req.setEntityType("CATEGORY");
                req.setActionType("CREATE");
                req.setCompany(company);
                req.setRequestedBy(user);

                // Exclude company to prevent infinite recursion or large payloads
                category.setCompany(null);
                req.setPayload(objectMapper.writeValueAsString(category));

                approvalRepository.save(req);
                return ResponseEntity.accepted().body("Request submitted for manager approval");
            } catch (Exception e) {
                return ResponseEntity.status(500).build();
            }
        }

        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).build();
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (user.getRole() == com.bix.backend.user.User.Role.EMPLOYEE) {
            try {
                ApprovalRequest req = new ApprovalRequest();
                req.setEntityType("CATEGORY");
                req.setActionType("UPDATE");
                req.setEntityId(id);
                req.setCompany(category.getCompany());
                req.setRequestedBy(user);

                categoryDetails.setCompany(null);
                req.setPayload(objectMapper.writeValueAsString(categoryDetails));

                approvalRepository.save(req);
                return ResponseEntity.accepted().body("Request submitted for manager approval");
            } catch (Exception e) {
                return ResponseEntity.status(500).build();
            }
        }

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());

        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).build();
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (user.getRole() == com.bix.backend.user.User.Role.EMPLOYEE) {
            try {
                ApprovalRequest req = new ApprovalRequest();
                req.setEntityType("CATEGORY");
                req.setActionType("DELETE");
                req.setEntityId(id);
                req.setCompany(category.getCompany());
                req.setRequestedBy(user);
                req.setPayload("{}"); // Empty payload for delete

                approvalRepository.save(req);
                return ResponseEntity.accepted().body("Request submitted for manager approval");
            } catch (Exception e) {
                return ResponseEntity.status(500).build();
            }
        }

        categoryRepository.delete(category);
        return ResponseEntity.noContent().build();
    }
}

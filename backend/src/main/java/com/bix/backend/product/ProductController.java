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
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;
    private final CompanyRepository companyRepository;
    private final CategoryRepository categoryRepository;
    private final ApprovalRequestRepository approvalRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<Product> getAllProducts() {
        Long companyId = TenantContext.getCurrentCompanyId();
        return productRepository.findAllByCompanyId(companyId);
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (user.getRole() == com.bix.backend.user.User.Role.EMPLOYEE) {
            try {
                ApprovalRequest req = new ApprovalRequest();
                req.setEntityType("PRODUCT");
                req.setActionType("CREATE");
                req.setCompany(company);
                req.setRequestedBy(user);
                req.setPayload(objectMapper.writeValueAsString(request));

                approvalRepository.save(req);
                return ResponseEntity.accepted().body("Request submitted for manager approval");
            } catch (Exception e) {
                return ResponseEntity.status(500).build();
            }
        }

        Product product = new Product();
        product.setCompany(company);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            if (!category.getCompany().getId().equals(companyId)) {
                throw new RuntimeException("Category does not belong to your company");
            }
            product.setCategory(category);
        }

        return ResponseEntity.ok(productRepository.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).build();
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (user.getRole() == com.bix.backend.user.User.Role.EMPLOYEE) {
            try {
                ApprovalRequest req = new ApprovalRequest();
                req.setEntityType("PRODUCT");
                req.setActionType("UPDATE");
                req.setEntityId(id);
                req.setCompany(product.getCompany());
                req.setRequestedBy(user);
                req.setPayload(objectMapper.writeValueAsString(request));

                approvalRepository.save(req);
                return ResponseEntity.accepted().body("Request submitted for manager approval");
            } catch (Exception e) {
                return ResponseEntity.status(500).build();
            }
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            if (!category.getCompany().getId().equals(companyId)) {
                return ResponseEntity.status(403).build();
            }
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        return ResponseEntity.ok(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).build();
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (user.getRole() == com.bix.backend.user.User.Role.EMPLOYEE) {
            try {
                ApprovalRequest req = new ApprovalRequest();
                req.setEntityType("PRODUCT");
                req.setActionType("DELETE");
                req.setEntityId(id);
                req.setCompany(product.getCompany());
                req.setRequestedBy(user);
                req.setPayload("{}"); // Empty payload for delete

                approvalRepository.save(req);
                return ResponseEntity.accepted().body("Request submitted for manager approval");
            } catch (Exception e) {
                return ResponseEntity.status(500).build();
            }
        }

        productRepository.delete(product);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Product> uploadImage(@PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).build();
        }

        try {
            String uploadDir = "uploads/products";
            String newFilename = com.bix.backend.util.ImageUtil.saveAndCompressImage(file, uploadDir);

            // Set the imageUrl to the static path exposing the file
            String imageUrl = "/uploads/products/" + newFilename;
            product.setImageUrl(imageUrl);

            return ResponseEntity.ok(productRepository.save(product));
        } catch (java.io.IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}

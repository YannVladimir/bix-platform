package com.bix.backend.approval;

import com.bix.backend.common.TenantContext;
import com.bix.backend.company.Company;
import com.bix.backend.company.CompanyRepository;
import com.bix.backend.product.Category;
import com.bix.backend.product.CategoryRepository;
import com.bix.backend.product.Product;
import com.bix.backend.product.ProductRepository;
import com.bix.backend.product.ProductRequest;
import com.bix.backend.stock.StockEntry;
import com.bix.backend.stock.StockRepository;
import com.bix.backend.stock.StockRequest;
import com.bix.backend.user.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalRequestRepository approvalRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;
    private final CompanyRepository companyRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public List<ApprovalRequest> getPendingApprovals() {
        Long companyId = TenantContext.getCurrentCompanyId();
        return approvalRepository.findAllByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, "PENDING");
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> rejectApproval(@PathVariable Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        ApprovalRequest request = approvalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval request not found"));

        if (!request.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).build();
        }

        request.setStatus("REJECTED");
        approvalRepository.save(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        ApprovalRequest request = approvalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval request not found"));

        if (!request.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).build();
        }

        if (!request.getStatus().equals("PENDING")) {
            return ResponseEntity.badRequest().body("Request is already " + request.getStatus());
        }

        try {
            Company company = request.getCompany();
            User user = request.getRequestedBy();

            if (request.getEntityType().equals("CATEGORY")) {
                if (request.getActionType().equals("DELETE")) {
                    categoryRepository.deleteById(request.getEntityId());
                } else {
                    Category parsed = objectMapper.readValue(request.getPayload(), Category.class);
                    Category cat = request.getActionType().equals("CREATE") ? new Category()
                            : categoryRepository.findById(request.getEntityId()).orElseThrow();
                    cat.setName(parsed.getName());
                    cat.setDescription(parsed.getDescription());
                    cat.setCompany(company);
                    categoryRepository.save(cat);
                }
            } else if (request.getEntityType().equals("PRODUCT")) {
                if (request.getActionType().equals("DELETE")) {
                    productRepository.deleteById(request.getEntityId());
                } else {
                    ProductRequest parsed = objectMapper.readValue(request.getPayload(), ProductRequest.class);
                    Product prod = request.getActionType().equals("CREATE") ? new Product()
                            : productRepository.findById(request.getEntityId()).orElseThrow();
                    prod.setName(parsed.getName());
                    prod.setDescription(parsed.getDescription());
                    prod.setPrice(parsed.getPrice());
                    prod.setImageUrl(parsed.getImageUrl());
                    prod.setCompany(company);

                    if (parsed.getCategoryId() != null) {
                        Category category = categoryRepository.findById(parsed.getCategoryId()).orElseThrow();
                        prod.setCategory(category);
                    } else {
                        prod.setCategory(null);
                    }
                    productRepository.save(prod);
                }
            } else if (request.getEntityType().equals("STOCK")) {
                if (request.getActionType().equals("CREATE")) {
                    StockRequest parsed = objectMapper.readValue(request.getPayload(), StockRequest.class);
                    Product prod = productRepository.findById(parsed.getProductId()).orElseThrow();

                    StockEntry stock = new StockEntry();
                    stock.setProduct(prod);
                    stock.setQuantityAdded(parsed.getQuantityAdded());
                    stock.setPurchasePrice(parsed.getPurchasePrice());
                    stock.setAddedBy(user);
                    stockRepository.save(stock);
                }
            }

            request.setStatus("APPROVED");
            approvalRepository.save(request);
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing approval: " + e.getMessage());
        }
    }

    @GetMapping("/my-pending")
    public List<ApprovalRequest> getMyPendingRequests() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return approvalRepository.findAllByRequestedByEmailAndStatusOrderByCreatedAtDesc(auth.getName(), "PENDING");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelPendingRequest(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        ApprovalRequest request = approvalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval request not found"));

        if (!request.getRequestedBy().getEmail().equals(auth.getName())) {
            return ResponseEntity.status(403).build();
        }

        if (!request.getStatus().equals("PENDING")) {
            return ResponseEntity.badRequest().build();
        }

        approvalRepository.delete(request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePendingRequest(@PathVariable Long id, @RequestBody String payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        ApprovalRequest request = approvalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval request not found"));

        if (!request.getRequestedBy().getEmail().equals(auth.getName())) {
            return ResponseEntity.status(403).build();
        }

        if (!request.getStatus().equals("PENDING")) {
            return ResponseEntity.badRequest().build();
        }

        request.setPayload(payload);
        approvalRepository.save(request);
        return ResponseEntity.ok().build();
    }
}

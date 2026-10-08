package com.bix.backend.stock;

import com.bix.backend.common.TenantContext;
import com.bix.backend.product.Product;
import com.bix.backend.product.ProductRepository;
import com.bix.backend.user.User;
import com.bix.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.bix.backend.approval.ApprovalRequest;
import com.bix.backend.approval.ApprovalRequestRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ApprovalRequestRepository approvalRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<StockEntry> getAllStock() {
        Long companyId = TenantContext.getCurrentCompanyId();
        return stockRepository.findAllByProductCompanyId(companyId);
    }

    @PostMapping
    public ResponseEntity<?> addStock(@RequestBody StockRequest request) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).build();
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (user.getRole() == com.bix.backend.user.User.Role.EMPLOYEE) {
            try {
                ApprovalRequest req = new ApprovalRequest();
                req.setEntityType("STOCK");
                req.setActionType("CREATE");
                req.setCompany(product.getCompany());
                req.setRequestedBy(user);
                req.setPayload(objectMapper.writeValueAsString(request));

                approvalRepository.save(req);
                return ResponseEntity.accepted().body("Request submitted for manager approval");
            } catch (Exception e) {
                return ResponseEntity.status(500).build();
            }
        }

        StockEntry entry = new StockEntry();
        entry.setProduct(product);
        entry.setQuantityAdded(request.getQuantityAdded());
        entry.setPurchasePrice(request.getPurchasePrice());
        entry.setAddedBy(user);

        return ResponseEntity.ok(stockRepository.save(entry));
    }
}

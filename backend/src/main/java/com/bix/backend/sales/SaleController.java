package com.bix.backend.sales;

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

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final com.bix.backend.stock.StockRepository stockRepository;

    @GetMapping
    public List<Sale> getAllSales() {
        Long companyId = TenantContext.getCurrentCompanyId();
        return saleRepository.findAllByProductCompanyId(companyId);
    }

    @PostMapping
    public ResponseEntity<?> createSale(@RequestBody SaleRequest request) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).build();
        }

        Integer totalAdded = stockRepository.sumQuantityAddedByProductId(product.getId());
        Integer totalSold = saleRepository.sumQuantitySoldByProductId(product.getId());
        Integer availableStock = totalAdded - totalSold;

        if (request.getQuantitySold() > availableStock) {
            return ResponseEntity.badRequest().body("Insufficient stock! Available: " + availableStock);
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Sale sale = new Sale();
        sale.setProduct(product);
        sale.setQuantitySold(request.getQuantitySold());
        sale.setSellingPrice(request.getSellingPrice());
        sale.setSoldBy(user);

        return ResponseEntity.ok(saleRepository.save(sale));
    }
}

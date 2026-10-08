package com.bix.backend.stock;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class StockRequest {
    private Long productId;
    private Integer quantityAdded;
    private BigDecimal purchasePrice;
}

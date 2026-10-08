package com.bix.backend.sales;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SaleRequest {
    private Long productId;
    private Integer quantitySold;
    private BigDecimal sellingPrice;
}

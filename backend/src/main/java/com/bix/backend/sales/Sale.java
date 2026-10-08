package com.bix.backend.sales;

import com.bix.backend.common.BaseEntity;
import com.bix.backend.product.Product;
import com.bix.backend.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "sales")
@Getter
@Setter
public class Sale extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantitySold;
    private BigDecimal sellingPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sold_by")
    private User soldBy;
}

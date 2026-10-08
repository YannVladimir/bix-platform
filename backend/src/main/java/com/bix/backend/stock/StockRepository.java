package com.bix.backend.stock;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<StockEntry, Long> {
    List<StockEntry> findAllByProductCompanyId(Long companyId);

    @Query("SELECT COALESCE(SUM(s.quantityAdded), 0) FROM StockEntry s WHERE s.product.id = :productId")
    Integer sumQuantityAddedByProductId(@Param("productId") Long productId);
}

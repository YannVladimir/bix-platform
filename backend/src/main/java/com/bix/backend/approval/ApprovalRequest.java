package com.bix.backend.approval;

import com.bix.backend.common.BaseEntity;
import com.bix.backend.company.Company;
import com.bix.backend.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "approval_requests")
@Getter
@Setter
public class ApprovalRequest extends BaseEntity {

    @Column(nullable = false)
    private String entityType; // PRODUCT, CATEGORY, STOCK

    @Column(nullable = false)
    private String actionType; // CREATE, UPDATE, DELETE

    private Long entityId; // Null for CREATE

    @Column(columnDefinition = "TEXT", nullable = false)
    private String payload; // JSON data

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}

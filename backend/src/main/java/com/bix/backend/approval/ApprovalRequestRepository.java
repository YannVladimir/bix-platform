package com.bix.backend.approval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {
    List<ApprovalRequest> findAllByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, String status);

    List<ApprovalRequest> findAllByRequestedByEmailAndStatusOrderByCreatedAtDesc(String email, String status);
}

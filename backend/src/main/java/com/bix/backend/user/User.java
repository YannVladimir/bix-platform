package com.bix.backend.user;

import com.bix.backend.common.BaseEntity;
import com.bix.backend.company.Company;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {
    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String status = "ACTIVE";

    private String language = "EN";

    private String avatarUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "company_id", nullable = true)
    private Company company;

    public enum Role {
        SUPER_ADMIN, MANAGER, EMPLOYEE
    }
}

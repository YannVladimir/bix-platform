package com.bix.backend.company;

import com.bix.backend.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class Company extends BaseEntity {
    private String name;
    private String email;
    private String phone;
    private String address;
}

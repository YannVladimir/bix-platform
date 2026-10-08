package com.bix.backend.common;

public class TenantContext {
    private static final ThreadLocal<Long> CURRENT_COMPANY_ID = new ThreadLocal<>();

    public static void setCurrentCompanyId(Long companyId) {
        CURRENT_COMPANY_ID.set(companyId);
    }

    public static Long getCurrentCompanyId() {
        return CURRENT_COMPANY_ID.get();
    }

    public static void clear() {
        CURRENT_COMPANY_ID.remove();
    }
}

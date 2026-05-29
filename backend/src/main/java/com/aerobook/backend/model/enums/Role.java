package com.aerobook.backend.model.enums;

public enum Role {

    PASSENGER,
    ADMIN;

    public String toAuthority() {
        return "ROLE_" + this.name();
    }
}
package com.aerobook.backend.model.enums;

import java.math.BigDecimal;

public enum SeatClass {

    ECONOMY(BigDecimal.ONE),       // multiplier 1x — base price
    BUSINESS(new BigDecimal("2.5")); // multiplier 2.5x — base price

    private final BigDecimal priceMultiplier;

    SeatClass(BigDecimal priceMultiplier) {
        this.priceMultiplier = priceMultiplier;
    }

    /**
     * Calculates seat price from flight base price.
     * Used when generating seats for a new flight and at booking time.
     */
    public BigDecimal calculatePrice(BigDecimal basePrice) {
        return basePrice.multiply(priceMultiplier);
    }
}
package com.aerobook.backend.model.enums;

import java.util.Set;

public enum BookingStatus {

    PENDING {
        @Override
        public Set<BookingStatus> allowedTransitions() {
            return Set.of(CONFIRMED, CANCELLED);
        }
    },
    CONFIRMED {
        @Override
        public Set<BookingStatus> allowedTransitions() {
            return Set.of(CHECKED_IN, CANCELLED);
        }
    },
    CHECKED_IN {
        @Override
        public Set<BookingStatus> allowedTransitions() {
            return Set.of();
        }
    },
    CANCELLED {
        @Override
        public Set<BookingStatus> allowedTransitions() {
            return Set.of();
        }
    };

    public abstract Set<BookingStatus> allowedTransitions();

    /**
     * Used by BookingService before applying any status change.
     */
    public boolean canTransitionTo(BookingStatus next) {
        return allowedTransitions().contains(next);
    }
}
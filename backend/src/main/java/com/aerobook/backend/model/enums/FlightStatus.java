package com.aerobook.backend.model.enums;

import java.util.Set;

public enum FlightStatus {

    SCHEDULED {
        @Override
        public Set<FlightStatus> allowedTransitions() {
            return Set.of(BOARDING, CANCELLED);
        }
    },
    BOARDING {
        @Override
        public Set<FlightStatus> allowedTransitions() {
            return Set.of(DEPARTED);
        }
    },
    DEPARTED {
        @Override
        public Set<FlightStatus> allowedTransitions() {
            return Set.of(LANDED);
        }
    },
    LANDED {
        @Override
        public Set<FlightStatus> allowedTransitions() {
            return Set.of();
        }
    },
    CANCELLED {
        @Override
        public Set<FlightStatus> allowedTransitions() {
            return Set.of();
        }
    };

    public abstract Set<FlightStatus> allowedTransitions();

    /**
     * Used by FlightService before applying any status change.
     * Throws nothing — caller decides what to do with false.
     */
    public boolean canTransitionTo(FlightStatus next) {
        return allowedTransitions().contains(next);
    }
}
package tr.erginatolye.ledger;

import java.time.Instant;
import java.util.Map;

public record AuditEvent(
    String eventId, String tenantId, String action, String subjectId,
    Instant occurredAt, Map<String, String> attributes
) {
    public AuditEvent {
        if (eventId == null || eventId.isBlank()) throw new IllegalArgumentException("eventId is required");
        if (tenantId == null || tenantId.isBlank()) throw new IllegalArgumentException("tenantId is required");
        if (action == null || action.isBlank()) throw new IllegalArgumentException("action is required");
        if (subjectId == null || subjectId.isBlank()) throw new IllegalArgumentException("subjectId is required");
        if (occurredAt == null) throw new IllegalArgumentException("occurredAt is required");
        attributes = attributes == null ? Map.of() : Map.copyOf(attributes);
    }
}

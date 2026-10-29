package tr.erginatolye.ledger;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * In-memory learning core showing tenant-scoped queries and idempotent commands.
 * Production needs authenticated tenant context, transactional storage, outbox,
 * access control, retention policy, and integration tests.
 */
public final class TenantLedger {
    private final Map<String, List<TransactionRecord>> byTenant = new HashMap<>();
    private final Map<String, TransactionRecord> commandResults = new HashMap<>();
    private final List<AuditEvent> auditEvents = new ArrayList<>();

    public synchronized TransactionRecord record(String tenantId, String commandId, long amountMinor, String currency) {
        requireText(tenantId, "tenantId");
        requireText(commandId, "commandId");
        String key = tenantId + ":" + commandId;
        TransactionRecord previous = commandResults.get(key);
        if (previous != null) return previous;

        TransactionRecord record = new TransactionRecord(UUID.randomUUID().toString(), tenantId, commandId,
                amountMinor, currency, Instant.now());
        byTenant.computeIfAbsent(tenantId, ignored -> new ArrayList<>()).add(record);
        commandResults.put(key, record);
        auditEvents.add(new AuditEvent(UUID.randomUUID().toString(), tenantId, "TRANSACTION_RECORDED",
                record.transactionId(), Instant.now(), Map.of("currency", currency)));
        return record;
    }

    public synchronized List<TransactionRecord> listForTenant(String tenantId) {
        requireText(tenantId, "tenantId");
        return List.copyOf(byTenant.getOrDefault(tenantId, List.of()));
    }

    public synchronized List<AuditEvent> auditForTenant(String tenantId) {
        requireText(tenantId, "tenantId");
        return auditEvents.stream().filter(event -> event.tenantId().equals(tenantId)).toList();
    }

    public synchronized Optional<TransactionRecord> findForTenant(String tenantId, String transactionId) {
        return listForTenant(tenantId).stream().filter(record -> record.transactionId().equals(transactionId)).findFirst();
    }

    private static void requireText(String value, String name) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(name + " is required");
    }
}

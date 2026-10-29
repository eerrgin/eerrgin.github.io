package tr.erginatolye.ledger;

import java.time.Instant;

public record TransactionRecord(
    String transactionId, String tenantId, String commandId,
    long amountMinor, String currency, Instant createdAt
) {
    public TransactionRecord {
        if (transactionId == null || transactionId.isBlank()) throw new IllegalArgumentException("transactionId is required");
        if (tenantId == null || tenantId.isBlank()) throw new IllegalArgumentException("tenantId is required");
        if (commandId == null || commandId.isBlank()) throw new IllegalArgumentException("commandId is required");
        if (amountMinor <= 0) throw new IllegalArgumentException("amountMinor must be positive");
        if (currency == null || !currency.matches("[A-Z]{3}")) throw new IllegalArgumentException("currency must be a 3-letter code");
        if (createdAt == null) throw new IllegalArgumentException("createdAt is required");
    }
}

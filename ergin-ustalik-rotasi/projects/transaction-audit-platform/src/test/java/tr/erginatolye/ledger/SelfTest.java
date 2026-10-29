package tr.erginatolye.ledger;

public final class SelfTest {
    public static void main(String[] args) {
        TenantLedger ledger = new TenantLedger();
        TransactionRecord first = ledger.record("tenant-a", "command-001", 1299, "TRY");
        TransactionRecord repeated = ledger.record("tenant-a", "command-001", 1299, "TRY");
        assert first.equals(repeated) : "idempotency must return the prior result";
        assert ledger.listForTenant("tenant-a").size() == 1 : "duplicate command created a second record";
        assert ledger.listForTenant("tenant-b").isEmpty() : "tenant data leaked";
        assert ledger.auditForTenant("tenant-a").size() == 1 : "audit event missing";
        assert ledger.auditForTenant("tenant-b").isEmpty() : "audit event leaked";

        CircuitBreaker breaker = new CircuitBreaker(2, 100);
        breaker.recordFailure(1000);
        assert breaker.state() == CircuitBreaker.State.CLOSED;
        breaker.recordFailure(1010);
        assert breaker.state() == CircuitBreaker.State.OPEN;
        assert !breaker.allowRequest(1050) : "open breaker must reject early request";
        assert breaker.allowRequest(1110) : "breaker should allow half-open probe after cooldown";
        assert breaker.state() == CircuitBreaker.State.HALF_OPEN;
        breaker.recordSuccess();
        assert breaker.state() == CircuitBreaker.State.CLOSED;

        boolean rejected = false;
        try { ledger.record("tenant-a", "bad", 0, "TRY"); }
        catch (IllegalArgumentException expected) { rejected = true; }
        assert rejected : "invalid amount should be rejected";
        System.out.println("PASS: tenant isolation, idempotency, audit trail, validation, circuit breaker");
    }
}

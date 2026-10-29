package tr.erginatolye.ledger;

/** Deterministic breaker state machine; production needs metrics and concurrency review. */
public final class CircuitBreaker {
    public enum State { CLOSED, OPEN, HALF_OPEN }
    private final int failureThreshold;
    private final long openDurationMillis;
    private int consecutiveFailures;
    private long openedAtMillis;
    private State state = State.CLOSED;

    public CircuitBreaker(int failureThreshold, long openDurationMillis) {
        if (failureThreshold < 1) throw new IllegalArgumentException("failureThreshold must be positive");
        if (openDurationMillis < 1) throw new IllegalArgumentException("openDurationMillis must be positive");
        this.failureThreshold = failureThreshold;
        this.openDurationMillis = openDurationMillis;
    }

    public synchronized boolean allowRequest(long nowMillis) {
        if (state == State.OPEN && nowMillis - openedAtMillis >= openDurationMillis) {
            state = State.HALF_OPEN;
            return true;
        }
        return state != State.OPEN;
    }

    public synchronized void recordSuccess() {
        consecutiveFailures = 0;
        state = State.CLOSED;
    }

    public synchronized void recordFailure(long nowMillis) {
        consecutiveFailures++;
        if (state == State.HALF_OPEN || consecutiveFailures >= failureThreshold) {
            state = State.OPEN;
            openedAtMillis = nowMillis;
        }
    }

    public synchronized State state() { return state; }
}

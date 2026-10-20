#!/bin/sh
# Static night-shift site. Idempotent: leave a healthy :8080 alone.
if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi
node /workspace/github-pages/serve.mjs >/tmp/gh-pages.log 2>&1 &
i=0
while [ "$i" -lt 20 ]; do
  if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
    exit 0
  fi
  i=$((i + 1))
  sleep 0.25
done
exit 1

#!/usr/bin/env bash
set -euo pipefail

HOSTS=(web1 web2 web3 web4 web5 web6 mon1)

for host in "${HOSTS[@]}"; do
  echo "Checking ${host}..."
  curl -fsS "http://${host}/" >/dev/null || echo "WARN: ${host} unavailable"
done

echo "Checking Grafana health API..."
curl -fsS http://localhost:3000/api/health

echo "Checking Prometheus alert rules are loaded..."
curl -fsS http://localhost:9090/api/v1/rules | grep -q "infraforge-alerts"

echo "Smoke checks completed."

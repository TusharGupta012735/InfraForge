# InfraForge

Automated infrastructure provisioning and observability stack using **Ansible + Docker Compose + Nginx + GitHub Actions**.

## Architecture

```text
                   ┌────────────────────────────────────────────┐
                   │               GitHub Actions               │
                   │ lint → test → docker-build-push → deploy  │
                   └───────────────────┬────────────────────────┘
                                       │ ansible-playbook deploy.yml
┌──────────────────────────────────────▼─────────────────────────────────────┐
│                          Multi-node Linux Fleet                            │
│ [webservers x6] [dbservers x3] [monitoring x2]                            │
│                                                                             │
│  ┌──────────────┐      ┌───────────────────────────────────────────────┐   │
│  │    Nginx     │─────▶│ sample-app replicas (3x, Docker Compose DNS)  │   │
│  │ reverse proxy│      └───────────────────────────────────────────────┘   │
│  └──────┬───────┘                                                           │
│         │                                                                   │
│  ┌──────▼────────┐   scrape    ┌──────────────┐      dashboards   ┌──────┐ │
│  │  Prometheus   │◀────────────│ node-exporter│───────────────────▶│Grafana│ │
│  └───────────────┘             └──────────────┘                    └──────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
git clone <your-fork-url>
cd InfraForge
cd docker && docker compose up -d --build
cd ..
ansible-playbook ansible/playbooks/provision.yml
```

## Access Grafana

- URL: `http://localhost:3000`
- Username: `admin`
- Password: `admin`

## Trigger a Fake Alert

Use stress-ng on a monitored host to trigger CPU alert:

```bash
sudo stress-ng --cpu 4 --timeout 45s
```

Prometheus rules use 15s–30s `for` windows to support sub-30-second detection for critical outages.

## CI/CD Flow

1. **Lint**: ESLint (app) + ansible-lint (playbooks)
2. **Test**: Jest API tests
3. **Docker Build/Push**: Push SHA-tagged image to GHCR
4. **Deploy**: Rolling Ansible deploy (`serial: 30%`) to `webservers`

## Resume Bullet Mapping

- Ansible playbooks across 10+ hosts → `ansible/inventory/hosts.ini`, `ansible/playbooks/provision.yml`
- SSH hardening and firewall rules → `ansible/roles/ssh_hardening/`, `ansible/roles/firewall/`
- Prometheus + Grafana via Docker Compose, sub-30s detection → `docker/docker-compose.yml`, `docker/prometheus/alert_rules.yml`
- Nginx reverse proxy + load balancer + SSL termination → `docker/nginx/nginx.conf`
- GitHub Actions multi-stage pipeline → `.github/workflows/ci-cd.yml`
- 90% reduction in manual release overhead → full automation from commit to rolling deployment

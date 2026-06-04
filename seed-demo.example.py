#!/usr/bin/env python3
"""
Seed demo data to HRIS API.

SECURITY: This script requires credentials via environment variables.
NEVER hardcode passwords in source code.

Usage:
    export API_BASE_URL="http://localhost:4000/api/v1"
    export SUPER_ADMIN_EMAIL="superadmin@hris-payroll.com"
    export SUPER_ADMIN_PASSWORD="<your-password>"
    export COMPANY_ADMIN_EMAIL="admin@teknusantara.co.id"
    export COMPANY_ADMIN_PASSWORD="<your-password>"
    export COMPANY_ADMIN_COMPANY_ID="<uuid>"
    python3 seed-demo.example.py
"""

import os
import sys
import requests

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:4000/api/v1")
SUPER_ADMIN_EMAIL = os.environ.get("SUPER_ADMIN_EMAIL", "superadmin@hris-payroll.com")
SUPER_ADMIN_PASSWORD = os.environ.get("SUPER_ADMIN_PASSWORD")
COMPANY_ADMIN_EMAIL = os.environ.get("COMPANY_ADMIN_EMAIL", "admin@teknusantara.co.id")
COMPANY_ADMIN_PASSWORD = os.environ.get("COMPANY_ADMIN_PASSWORD")
COMPANY_ID = os.environ.get("COMPANY_ADMIN_COMPANY_ID")

# Verify required env vars
missing = [v for v, val in {
    "SUPER_ADMIN_PASSWORD": SUPER_ADMIN_PASSWORD,
    "COMPANY_ADMIN_PASSWORD": COMPANY_ADMIN_PASSWORD,
    "COMPANY_ADMIN_COMPANY_ID": COMPANY_ID,
}.items() if not val]

if missing:
    print(f"ERROR: Missing required env vars: {', '.join(missing)}", file=sys.stderr)
    sys.exit(1)


def login(email: str, password: str) -> str:
    r = requests.post(
        f"{API_BASE_URL}/auth/login",
        json={"email": email, "password": password},
        timeout=10,
    )
    r.raise_for_status()
    return r.json()["access_token"]


def main():
    print(f"Logging in as super admin: {SUPER_ADMIN_EMAIL}")
    super_token = login(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD)
    print(f"Logging in as company admin: {COMPANY_ADMIN_EMAIL}")
    token = login(COMPANY_ADMIN_EMAIL, COMPANY_ADMIN_PASSWORD)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # NOTE: For production, generate employee data using faker library
    # (pip install faker) instead of hardcoded PII. This template shows
    # the structure but you should replace with synthetic data.
    print("Done. Use this template to build your own seed script with synthetic data.")


if __name__ == "__main__":
    main()

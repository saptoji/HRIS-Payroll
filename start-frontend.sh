#!/bin/bash
cd /root/hris-payroll/frontend
export NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
exec npx next start -p 3001

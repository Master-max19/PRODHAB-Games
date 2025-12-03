#!/bin/bash
/opt/mssql/bin/sqlservr &   # arranca SQL Server en background
pid=$!

echo "Esperando SQL Server..."
until /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'StrongPassword123!' -Q 'SELECT 1' &> /dev/null; do
  sleep 2
done

echo "SQL Server listo, ejecutando scripts..."

for f in /docker-entrypoint-initdb.d/sql/*.sql; do
  echo "Ejecutando $f"
  /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'StrongPassword123!' -i "$f"
done

wait $pid

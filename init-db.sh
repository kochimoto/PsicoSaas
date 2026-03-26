#!/bin/bash
# Creates the evolution_db database if it doesn't exist
# This script runs automatically on first PostgreSQL startup
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE evolution_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evolution_db')\gexec
EOSQL

#!/usr/bin/env bash
set -eo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_PATH="${BACKUP_DIR}/ioma_backup_${TIMESTAMP}"

echo "=========================================="
echo " Starting IOMA Production Backup: ${TIMESTAMP}"
echo "=========================================="

mkdir -p "${BACKUP_PATH}/mongo"
mkdir -p "${BACKUP_PATH}/minio"

# 1. MongoDB Backup
echo "[1/2] Executing MongoDB Dump..."
docker exec ioma-prod-mongo mongodump --db=ioma --archive="${BACKUP_PATH}/mongo/ioma_db_${TIMESTAMP}.archive.gz" --gzip

# 2. MinIO S3 Backup (Public & Private Buckets)
echo "[2/2] Synchronizing MinIO Storage Buckets..."
docker exec ioma-prod-minio mc alias set local http://localhost:9000 "${MINIO_ACCESS_KEY:-ioma_admin}" "${MINIO_SECRET_KEY:-ioma_secret_key_change_in_prod}" > /dev/null
docker exec ioma-prod-minio mc mirror local/ioma-public "${BACKUP_PATH}/minio/ioma-public" || true
docker exec ioma-prod-minio mc mirror local/ioma-private "${BACKUP_PATH}/minio/ioma-private" || true

# Compress full backup archive
tar -czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "ioma_backup_${TIMESTAMP}"
rm -rf "${BACKUP_PATH}"

echo "=========================================="
echo " ✅ Backup Completed Successfully!"
echo " Archive Saved: ${BACKUP_PATH}.tar.gz"
echo "=========================================="

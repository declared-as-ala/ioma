#!/usr/bin/env bash
set -eo pipefail

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <path-to-backup-tar.gz>"
  exit 1
fi

TAR_FILE="$1"
TMP_DIR=$(mktemp -d)

echo "=========================================="
echo " Starting IOMA Disaster Recovery Restore"
echo " Archive: ${TAR_FILE}"
echo "=========================================="

tar -xzf "${TAR_FILE}" -C "${TMP_DIR}"
BACKUP_FOLDER=$(ls "${TMP_DIR}")
FULL_PATH="${TMP_DIR}/${BACKUP_FOLDER}"

# 1. MongoDB Restore
echo "[1/2] Restoring MongoDB Database..."
ARCHIVE_FILE=$(find "${FULL_PATH}/mongo" -name "*.archive.gz" | head -n 1)
if [ -f "${ARCHIVE_FILE}" ]; then
  docker exec -i ioma-prod-mongo mongorestore --nsInclude="ioma.*" --archive --gzip --drop < "${ARCHIVE_FILE}"
  echo "  ✓ MongoDB restored successfully."
else
  echo "  ⚠️ No Mongo archive found."
fi

# 2. MinIO Restore
echo "[2/2] Restoring MinIO Buckets..."
if [ -d "${FULL_PATH}/minio/ioma-public" ]; then
  docker exec ioma-prod-minio mc mirror "${FULL_PATH}/minio/ioma-public" local/ioma-public || true
fi
if [ -d "${FULL_PATH}/minio/ioma-private" ]; then
  docker exec ioma-prod-minio mc mirror "${FULL_PATH}/minio/ioma-private" local/ioma-private || true
fi

rm -rf "${TMP_DIR}"

echo "=========================================="
echo " ✅ Restore Completed Successfully!"
echo "=========================================="

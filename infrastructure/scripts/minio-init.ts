/**
 * Creates the public/private MinIO buckets this platform depends on and
 * sets the public bucket's anonymous-read policy. Idempotent — safe to
 * run on every deploy. See ARCHITECTURE.md "File storage" and
 * SECURITY.md "Storage".
 */
import { Client } from "minio";

async function main() {
  const client = new Client({
    endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: Number(process.env.MINIO_PORT ?? 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY ?? "",
    secretKey: process.env.MINIO_SECRET_KEY ?? "",
  });

  const publicBucket = process.env.MINIO_BUCKET_PUBLIC ?? "ioma-public";
  const privateBucket = process.env.MINIO_BUCKET_PRIVATE ?? "ioma-private";

  for (const bucket of [publicBucket, privateBucket]) {
    const exists = await client.bucketExists(bucket).catch(() => false);
    if (!exists) {
      await client.makeBucket(bucket);
       
      console.log(`Created bucket: ${bucket}`);
    } else {
       
      console.log(`Bucket already exists: ${bucket}`);
    }
  }

  // Public bucket: anonymous read-only. Private bucket: no public policy —
  // access exclusively via signed URLs issued by the API.
  const publicReadPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${publicBucket}/*`],
      },
    ],
  };
  await client.setBucketPolicy(publicBucket, JSON.stringify(publicReadPolicy));

   
  console.log("MinIO bucket initialization complete.");
}

main().catch((err) => {
   
  console.error("MinIO bucket initialization failed:", err);
  process.exit(1);
});

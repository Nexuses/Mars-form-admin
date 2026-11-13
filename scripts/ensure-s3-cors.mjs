/**
 * Ensures the application S3 bucket allows browser PUT uploads from the form.
 * Usage: node --env-file=.env.local scripts/ensure-s3-cors.mjs
 */
import {
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

const region = required("AWS_REGION");
const bucket = required("S3_BUCKET");
const siteOrigin = (process.env.NEXT_PUBLIC_SERVER_URL || "")
  .replace(/\/$/, "");

const origins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
];
if (siteOrigin) origins.push(siteOrigin);
if (process.env.S3_CORS_ORIGINS) {
  for (const o of process.env.S3_CORS_ORIGINS.split(",")) {
    const trimmed = o.trim().replace(/\/$/, "");
    if (trimmed) origins.push(trimmed);
  }
}

const uniqueOrigins = [...new Set(origins)];

const client = new S3Client({
  region,
  credentials: {
    accessKeyId: required("AWS_ACCESS_KEY_ID"),
    secretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
  },
});

const rule = {
  AllowedHeaders: ["*"],
  AllowedMethods: ["GET", "PUT", "HEAD"],
  AllowedOrigins: uniqueOrigins,
  ExposeHeaders: ["ETag", "Content-Type"],
  MaxAgeSeconds: 3000,
};

const existing = await client
  .send(new GetBucketCorsCommand({ Bucket: bucket }))
  .then((r) => r.CORSRules || [])
  .catch(() => []);

const already = existing.some((r) => {
  const methods = new Set(r.AllowedMethods || []);
  const allowed = new Set(r.AllowedOrigins || []);
  return (
    methods.has("PUT") &&
    uniqueOrigins.every((o) => allowed.has(o) || allowed.has("*"))
  );
});

if (already) {
  console.log(`S3 CORS already allows PUT for ${bucket}`);
  console.log(JSON.stringify(existing, null, 2));
  process.exit(0);
}

const CORSRules = [...existing.filter((r) => !(r.AllowedMethods || []).includes("PUT")), rule];

await client.send(
  new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: { CORSRules },
  }),
);

console.log(`Updated S3 CORS on ${bucket}`);
console.log(JSON.stringify(CORSRules, null, 2));

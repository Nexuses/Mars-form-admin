/**
 * End-to-end: presign → S3 PUT → /api/apply → MongoDB has S3 URLs only.
 * Usage: node --env-file=.env.local scripts/e2e-apply-s3.mjs
 */
import { ObjectId, MongoClient } from "mongodb";

const base = process.env.E2E_BASE_URL || "http://localhost:3000";

async function main() {
  const pdf = Buffer.from("%PDF-1.4 test mars upload");
  const fileName = "mars-test-license.pdf";
  const contentType = "application/pdf";

  const prepRes = await fetch(`${base}/api/apply/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      slot: "license",
      fileName,
      contentType,
      size: pdf.length,
    }),
  });
  const prepText = await prepRes.text();
  if (!prepRes.ok) {
    throw new Error(`upload-url failed ${prepRes.status} ${prepText}`);
  }
  const signed = JSON.parse(prepText);
  if (!signed.uploadUrl || !signed.publicUrl) {
    throw new Error("upload-url missing urls");
  }
  console.log("PASS upload-url");

  const putRes = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: pdf,
  });
  if (!putRes.ok) {
    throw new Error(`S3 PUT failed ${putRes.status} ${await putRes.text()}`);
  }
  console.log("PASS s3-put");

  // Reject oversize in upload-url
  const over = await fetch(`${base}/api/apply/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      slot: "license",
      fileName: "big.pdf",
      contentType,
      size: 51 * 1024 * 1024,
    }),
  });
  if (over.status !== 400) {
    throw new Error(`expected 400 for >50MB, got ${over.status}`);
  }
  console.log("PASS max-50mb-rejected");

  const fd = new FormData();
  const fields = {
    full_name: "E2E Test Candidate",
    address_line1: "123 Test St",
    city: "Chicago",
    state: "IL",
    zip: "60601",
    phone: "3125550199",
    email: "e2e.mars.test@example.com",
    dob: "1990-01-15",
    ssn_last4: "1234",
    work_auth: "Yes",
    vehicle: "Yes",
    background_ok: "Yes",
    flu_shot: "Yes",
    start_asap: "Yes",
    days_off: "No",
    other_offers: "No",
    interview_availability: "Weekdays after 3pm",
    profession: "Registered Nurse (RN)",
    education_level: "Bachelor's degree",
    education_field: "Nursing",
    education_school: "Test University",
    edu_docs: "Yes",
    checklist_specialty: "other",
    ref1_client: "Hospital A",
    ref1_name: "Jane Manager",
    ref1_title: "Nurse Manager",
    ref1_contact: "jane@example.com",
    ref2_client: "Hospital B",
    ref2_name: "John Director",
    ref2_title: "Director",
    ref2_contact: "3125550188",
    consent: "Yes",
    signature: "E2E Test Candidate",
    signature_date: "March 13, 2026",
    form_version: "1.0",
    client: "Advocate Aurora Health",
    submitted_at: new Date().toISOString(),
    page_url: `${base}/`,
  };
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  fd.append("emr", "Epic");
  fd.append(
    "attachments_json",
    JSON.stringify([
      {
        slot: "license",
        originalName: fileName,
        url: signed.publicUrl,
        contentType,
        size: pdf.length,
      },
      {
        slot: "lifesupport",
        originalName: "bls.pdf",
        url: signed.publicUrl,
        contentType,
        size: pdf.length,
      },
    ]),
  );

  const applyRes = await fetch(`${base}/api/apply`, {
    method: "POST",
    body: fd,
    headers: { Accept: "application/json" },
  });
  const applyText = await applyRes.text();
  if (!applyRes.ok) {
    throw new Error(`apply failed ${applyRes.status} ${applyText}`);
  }
  const applied = JSON.parse(applyText);
  if (!applied.ok || !applied.id || !applied.reference) {
    throw new Error(`apply response incomplete: ${applyText}`);
  }
  console.log("PASS apply", applied.reference);

  const mongo = new MongoClient(process.env.MONGODB_URI);
  await mongo.connect();

  let doc = null;
  const admin = mongo.db().admin();
  const { databases } = await admin.listDatabases();
  for (const d of databases) {
    if (["admin", "local", "config"].includes(d.name)) continue;
    const found = await mongo
      .db(d.name)
      .collection("applications")
      .findOne({ _id: ObjectId.createFromHexString(applied.id) });
    if (found) {
      doc = found;
      doc.__db = d.name;
      break;
    }
  }
  if (!doc) throw new Error("application not found in mongo");

  if (!doc.attachments?.length) throw new Error("no attachments on doc");
  for (const a of doc.attachments) {
    if (!String(a.url).includes("amazonaws.com")) {
      throw new Error(`attachment missing S3 url: ${a.url}`);
    }
    if (a.content) throw new Error("raw file content stored in mongo");
  }
  console.log(
    "PASS mongo-s3-urls",
    `db=${doc.__db}`,
    `count=${doc.attachments.length}`,
  );

  await mongo
    .db(doc.__db)
    .collection("applications")
    .deleteOne({ _id: doc._id });
  console.log("PASS cleanup");
  await mongo.close();
  console.log("ALL TESTS PASSED");
}

main().catch((err) => {
  console.error("FAIL", err);
  process.exit(1);
});

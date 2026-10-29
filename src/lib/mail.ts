import nodemailer from "nodemailer";

const BRAND = {
  navy: "#25245E",
  navyDeep: "#1B1940",
  crimson: "#C9252D",
  blush: "#FBE9EA",
  lilac: "#EEEDF8",
  bg: "#F6F5FA",
  ink: "#1B1940",
  muted: "#5E5D7A",
  line: "#DCDAEA",
  white: "#FFFFFF",
  logo: "https://mars-solutions.s3.us-east-2.amazonaws.com/MARS-logo-color.png",
} as const;

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export function createMailTransport() {
  const port = Number(process.env.SMTP_PORT || "587");
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.SMTP_SECURE === "1" ||
    port === 465;

  return nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port,
    secure,
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: requiredEnv("SMTP_PASS"),
    },
  });
}

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Native logo is ~3762×2751 — keep that ratio so email clients do not stretch it. */
const LOGO_W = 88;
const LOGO_H = 64;

function emailLogoBadge(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0">
      <tr>
        <td style="background:${BRAND.white};border-radius:12px;padding:10px 14px;line-height:0">
          <a href="https://www.marssg.com/" target="_blank" rel="noopener noreferrer" style="text-decoration:none;border:0;outline:none">
            <img
              src="${BRAND.logo}"
              alt="MARS Solutions Group"
              width="${LOGO_W}"
              height="${LOGO_H}"
              style="display:block;width:${LOGO_W}px;height:${LOGO_H}px;max-width:${LOGO_W}px;border:0;outline:none;text-decoration:none"
            >
          </a>
        </td>
      </tr>
    </table>`;
}

export function rowsToHtml(
  title: string,
  rows: { label: string; value: string }[],
): string {
  const visible = rows.filter((r) => r.value);
  if (!visible.length) return "";

  const body = visible
    .map(
      (r, i) => `
      <tr>
        <td style="padding:12px 14px;width:38%;vertical-align:top;font-size:13px;line-height:1.45;color:${BRAND.muted};font-weight:600;background:${i % 2 === 0 ? BRAND.lilac : BRAND.white};border-bottom:1px solid ${BRAND.line}">
          ${escapeHtml(r.label)}
        </td>
        <td style="padding:12px 14px;vertical-align:top;font-size:14px;line-height:1.5;color:${BRAND.ink};background:${i % 2 === 0 ? BRAND.lilac : BRAND.white};border-bottom:1px solid ${BRAND.line}">
          ${escapeHtml(r.value).replace(/\n/g, "<br>")}
        </td>
      </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border-collapse:separate;border-spacing:0">
      <tr>
        <td style="padding:0 0 10px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:4px;background:${BRAND.crimson};border-radius:2px"></td>
              <td style="padding:0 0 0 10px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:16px;line-height:1.3;font-weight:700;color:${BRAND.navy}">
                ${escapeHtml(title)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="border:1px solid ${BRAND.line};border-radius:10px;overflow:hidden">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
            ${body}
          </table>
        </td>
      </tr>
    </table>`;
}

export function buildApplicationEmailHtml(opts: {
  reference: string;
  fullName: string;
  client?: string;
  sectionsHtml: string;
}): string {
  const { reference, fullName, client, sectionsHtml } = opts;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>MARS candidate application</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};color:${BRAND.ink}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">
    New healthcare candidate application from ${escapeHtml(fullName)} — ${escapeHtml(reference)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};margin:0;padding:0">
    <tr>
      <td align="center" style="padding:28px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;border-collapse:separate;border-spacing:0">

          <!-- Navy header + logo -->
          <tr>
            <td style="background:${BRAND.navy};border-radius:12px 12px 0 0;padding:24px 28px 26px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 0 20px">
                    ${emailLogoBadge()}
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Inter,Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:#D8D7EC;padding:0 0 10px">
                    New application received
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Inter,Arial,Helvetica,sans-serif;font-size:24px;line-height:1.25;font-weight:700;color:${BRAND.white};padding:0 0 10px">
                    ${escapeHtml(fullName)}
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Inter,Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#D8D7EC;padding:0">
                    A candidate submitted the healthcare application form.${client ? ` Client: <strong style="color:${BRAND.white}">${escapeHtml(client)}</strong>.` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reference chip -->
          <tr>
            <td style="background:${BRAND.blush};border-left:1px solid ${BRAND.line};border-right:1px solid ${BRAND.line};padding:14px 28px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:4px;background:${BRAND.crimson};border-radius:2px"></td>
                  <td style="padding:0 0 0 12px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:${BRAND.navyDeep}">
                    Reference&nbsp;&nbsp;<strong style="color:${BRAND.crimson};letter-spacing:0.02em">${escapeHtml(reference)}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:${BRAND.white};border:1px solid ${BRAND.line};border-top:0;border-radius:0 0 12px 12px;padding:28px">
              ${sectionsHtml}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px">
                <tr>
                  <td style="border-top:1px solid ${BRAND.line};padding-top:18px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55;color:${BRAND.muted}">
                    Reply directly to this email to contact the candidate. Attachments from the application are included when provided.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:22px 12px 0;font-family:Inter,Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55;color:${BRAND.muted}">
              &copy; ${year} MARS Solutions Group<br>
              <a href="https://www.marssg.com/" style="color:${BRAND.navy};text-decoration:none;font-weight:600">marssg.com</a>
              &nbsp;&middot;&nbsp;
              <a href="https://www.marssg.com/privacy-policy" style="color:${BRAND.navy};text-decoration:none;font-weight:600">Privacy Policy</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildCandidateThankYouEmailHtml(opts: {
  reference: string;
  fullName: string;
  client?: string;
}): string {
  const { reference, fullName, client } = opts;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Thank you for your application</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};color:${BRAND.ink}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">
    Thanks ${escapeHtml(fullName)} — we received your MARS application (${escapeHtml(reference)}).
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};margin:0;padding:0">
    <tr>
      <td align="center" style="padding:28px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;border-collapse:separate;border-spacing:0">

          <tr>
            <td style="background:${BRAND.navy};border-radius:12px 12px 0 0;padding:24px 28px 26px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 0 20px">
                    ${emailLogoBadge()}
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Inter,Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:#D8D7EC;padding:0 0 10px">
                    Application received
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Inter,Arial,Helvetica,sans-serif;font-size:24px;line-height:1.25;font-weight:700;color:${BRAND.white};padding:0 0 10px">
                    Thank you for applying
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Inter,Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#D8D7EC;padding:0">
                    Hi ${escapeHtml(fullName)}, we received your healthcare candidate application${client ? ` for <strong style="color:${BRAND.white}">${escapeHtml(client)}</strong>` : ""}. Our recruitment team will review it shortly.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:${BRAND.blush};border-left:1px solid ${BRAND.line};border-right:1px solid ${BRAND.line};padding:14px 28px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:4px;background:${BRAND.crimson};border-radius:2px"></td>
                  <td style="padding:0 0 0 12px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:${BRAND.navyDeep}">
                    Your reference&nbsp;&nbsp;<strong style="color:${BRAND.crimson};letter-spacing:0.02em">${escapeHtml(reference)}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:${BRAND.white};border:1px solid ${BRAND.line};border-top:0;border-radius:0 0 12px 12px;padding:28px;font-family:Inter,Arial,Helvetica,sans-serif">
              <p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:${BRAND.ink}">
                Please keep this reference number for your records. A recruiter may contact you by email or phone if we need anything else or to discuss next steps.
              </p>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:${BRAND.ink}">
                If you have questions, reply to this email and our team will help.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px">
                <tr>
                  <td style="border-radius:8px;background:${BRAND.crimson}">
                    <a href="https://www.marssg.com/" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 18px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${BRAND.white};text-decoration:none">
                      Visit MARS Solutions Group
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0;padding-top:16px;border-top:1px solid ${BRAND.line};font-size:12px;line-height:1.55;color:${BRAND.muted}">
                This message confirms your submission only. It is not an offer of employment.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:22px 12px 0;font-family:Inter,Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55;color:${BRAND.muted}">
              &copy; ${year} MARS Solutions Group<br>
              <a href="https://www.marssg.com/" style="color:${BRAND.navy};text-decoration:none;font-weight:600">marssg.com</a>
              &nbsp;&middot;&nbsp;
              <a href="https://www.marssg.com/privacy-policy" style="color:${BRAND.navy};text-decoration:none;font-weight:600">Privacy Policy</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildCandidateThankYouText(opts: {
  reference: string;
  fullName: string;
  client?: string;
}): string {
  const { reference, fullName, client } = opts;
  return [
    `Thank you for applying.`,
    ``,
    `Hi ${fullName}, we received your healthcare candidate application${client ? ` for ${client}` : ""}.`,
    `Your reference number is ${reference}.`,
    ``,
    `Our recruitment team will review your submission and may contact you if we need anything else.`,
    ``,
    `MARS Solutions Group`,
    `https://www.marssg.com/`,
  ].join("\n");
}

import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env['RESEND_API_KEY']);
  return _resend;
}

export interface LeadEmailData {
  type: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyPrice?: number;
  address?: string;         // seller property address
  preferredContact?: string;
  source?: string;
}

function leadTypeLabel(type: string): string {
  const map: Record<string, string> = {
    buyer:   'Buyer',
    seller:  'Seller',
    contact: 'General Inquiry',
    tour:    'Tour Request',
  };
  return map[type] ?? 'New Lead';
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

function buildLeadEmailHtml(lead: LeadEmailData): string {
  const typeLabel   = leadTypeLabel(lead.type);
  const firstName   = lead.name.split(' ')[0];
  const timestamp   = new Date().toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });

  const propertySection = (lead.propertyAddress || lead.address)
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border:1px solid #E4D9C8;">
        <tr>
          <td style="background:#F9F5EF;padding:14px 18px;border-bottom:1px solid #E4D9C8;">
            <p style="margin:0;font-size:11px;font-weight:700;color:#C97A2A;text-transform:uppercase;letter-spacing:1px;">Property of Interest</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 18px;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#142033;">${lead.propertyAddress ?? lead.address}</p>
            ${lead.propertyCity ? `<p style="margin:0 0 8px;font-size:13px;color:#64748b;">${lead.propertyCity}${lead.propertyState ? ', ' + lead.propertyState : ''}</p>` : ''}
            ${lead.propertyPrice ? `<p style="margin:0;font-size:15px;font-weight:700;color:#C97A2A;">${formatPrice(lead.propertyPrice)}</p>` : ''}
          </td>
        </tr>
      </table>`
    : '';

  const messageSection = lead.message
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border:1px solid #E4D9C8;">
        <tr>
          <td style="background:#F9F5EF;padding:14px 18px;border-bottom:1px solid #E4D9C8;">
            <p style="margin:0;font-size:11px;font-weight:700;color:#C97A2A;text-transform:uppercase;letter-spacing:1px;">Message</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 18px;">
            <p style="margin:0;font-size:13px;color:#334155;line-height:1.7;font-style:italic;">"${lead.message}"</p>
          </td>
        </tr>
      </table>`
    : '';

  const phoneRow = lead.phone
    ? `<tr>
        <td style="padding:5px 0;font-size:13px;color:#64748b;width:110px;vertical-align:top;">Phone</td>
        <td style="padding:5px 0;font-size:13px;color:#142033;">
          <a href="tel:${lead.phone}" style="color:#C97A2A;text-decoration:none;">${lead.phone}</a>
        </td>
       </tr>`
    : '';

  const preferredRow = lead.preferredContact
    ? `<tr>
        <td style="padding:5px 0;font-size:13px;color:#64748b;vertical-align:top;">Prefers</td>
        <td style="padding:5px 0;font-size:13px;color:#142033;">${lead.preferredContact}</td>
       </tr>`
    : '';

  const sourceRow = lead.source
    ? `<tr>
        <td style="padding:5px 0;font-size:13px;color:#64748b;vertical-align:top;">Source</td>
        <td style="padding:5px 0;font-size:13px;color:#94a3b8;">${lead.source}</td>
       </tr>`
    : '';

  const callButton = lead.phone
    ? `<a href="tel:${lead.phone}"
         style="display:inline-block;margin-left:12px;background:#C97A2A;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:12px 22px;text-transform:uppercase;letter-spacing:0.8px;">
         Call ${firstName}
       </a>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New ${typeLabel} Lead — Aaron Krier REALTOR®</title>
</head>
<body style="margin:0;padding:0;background:#F0EBE3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0EBE3;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- Top bar -->
        <tr><td style="background:#C97A2A;height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Header -->
        <tr>
          <td style="background:#142033;padding:26px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Aaron Krier</p>
                  <p style="margin:3px 0 0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;">REALTOR® &nbsp;·&nbsp; Nebraska &amp; Iowa</p>
                </td>
                <td align="right">
                  <span style="display:inline-block;background:#C97A2A;color:#ffffff;font-size:11px;font-weight:700;padding:5px 14px;text-transform:uppercase;letter-spacing:0.8px;">${typeLabel}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider line -->
        <tr><td style="background:#1e3147;height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px;">

            <!-- Title + timestamp -->
            <h1 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#142033;letter-spacing:-0.3px;">New ${typeLabel} Lead</h1>
            <p style="margin:0 0 32px;font-size:12px;color:#94a3b8;">${timestamp}</p>

            <!-- Contact info -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border:1px solid #E4D9C8;">
              <tr>
                <td style="background:#F9F5EF;padding:13px 18px;border-bottom:1px solid #E4D9C8;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#C97A2A;text-transform:uppercase;letter-spacing:1.2px;">Contact Information</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 18px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding:5px 0;font-size:13px;color:#64748b;width:110px;vertical-align:top;">Name</td>
                      <td style="padding:5px 0;font-size:14px;color:#142033;font-weight:700;">${lead.name}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:13px;color:#64748b;vertical-align:top;">Email</td>
                      <td style="padding:5px 0;font-size:13px;color:#142033;">
                        <a href="mailto:${lead.email}" style="color:#C97A2A;text-decoration:none;">${lead.email}</a>
                      </td>
                    </tr>
                    ${phoneRow}
                    ${preferredRow}
                    ${sourceRow}
                  </table>
                </td>
              </tr>
            </table>

            ${propertySection}
            ${messageSection}

            <!-- CTA buttons -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
              <tr>
                <td>
                  <a href="mailto:${lead.email}?subject=Re%3A%20Your%20real%20estate%20inquiry&body=Hi%20${encodeURIComponent(firstName)}%2C%0A%0A"
                     style="display:inline-block;background:#142033;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:12px 22px;text-transform:uppercase;letter-spacing:0.8px;">
                    Reply to ${firstName}
                  </a>
                  ${callButton}
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F9F5EF;border-top:1px solid #E4D9C8;padding:22px 32px;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.8;">
              Aaron Krier &nbsp;·&nbsp; REALTOR® &nbsp;·&nbsp; NE License #NE-45821 &nbsp;·&nbsp; IA License #IA-78234<br>
              <a href="tel:+14025550187" style="color:#94a3b8;text-decoration:none;">(402) 555-0187</a>
              &nbsp;·&nbsp;
              <a href="mailto:aaron@krierrealty.com" style="color:#94a3b8;text-decoration:none;">aaron@krierrealty.com</a><br>
              Carter Lake, IA &nbsp;·&nbsp; Serving Greater Omaha &amp; Council Bluffs
            </p>
          </td>
        </tr>

        <!-- Bottom bar -->
        <tr><td style="background:#C97A2A;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendLeadNotification(lead: LeadEmailData): Promise<void> {
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping email');
    return;
  }

  const toAddress   = process.env['LEAD_NOTIFY_EMAIL'] ?? 'aaron@krierrealty.com';
  const fromAddress = process.env['FROM_EMAIL'] ?? 'leads@krierrealty.com';
  const typeLabel   = leadTypeLabel(lead.type);

  const resend = getResend();
  const { error } = await resend.emails.send({
    from:    fromAddress,
    to:      toAddress,
    replyTo: lead.email,
    subject: `New ${typeLabel} Lead — ${lead.name}`,
    html:    buildLeadEmailHtml(lead),
  });

  if (error) {
    console.error('[email] Resend error:', error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

import { Resend } from "resend";
import { EVENT_DETAILS } from "@/lib/constants";

const resendApiKey = process.env.RESEND_API_KEY || "";
export const resend = new Resend(resendApiKey);

interface TicketEmailPayload {
  toEmail: string;
  purchaserName: string;
  bookingId: string;
  ticketNumbers: string[];
  quantity: number;
  totalAmount: number;
  pdfAttachment?: Buffer;
}

export async function sendTicketEmail(payload: TicketEmailPayload) {
  const fromEmail = process.env.EMAIL_FROM || "Garba Gala Tickets <onboarding@resend.dev>";
  
  const ticketListHtml = payload.ticketNumbers
    .map(
      (num) => `
      <div style="background-color: #14121B; border: 1px solid #F7B731; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #F7B731; font-weight: bold; font-size: 16px;">Pass #${num}</span>
        <span style="color: #FFFFFF; font-size: 14px;">General Sale</span>
      </div>
    `
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A090D; color: #FFFFFF; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #14121B; border-radius: 12px; overflow: hidden; border: 1px solid #272435; }
          .header { background: linear-gradient(135deg, #E03616 0%, #FF9F1C 100%); padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; color: #FFFFFF; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; }
          .header p { margin: 5px 0 0 0; color: #F7B731; font-weight: bold; font-size: 14px; }
          .body { padding: 30px 20px; }
          .info-box { background-color: #0A090D; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #F7B731; }
          .info-row { display: flex; margin-bottom: 8px; justify-content: space-between; }
          .info-label { color: #8E8A9F; font-size: 12px; text-transform: uppercase; font-weight: bold; }
          .info-val { color: #FFFFFF; font-size: 14px; font-weight: bold; }
          .rules { background-color: #1F1B2C; padding: 16px; border-radius: 8px; font-size: 12px; color: #B5B1C5; margin-top: 24px; line-height: 1.6; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #8E8A9F; border-top: 1px solid #272435; }
          .btn { display: inline-block; background-color: #F7B731; color: #0A090D; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GARBA GALA 2026</h1>
            <p>Official Admission Pass Confirmed 🎟️</p>
          </div>
          <div class="body">
            <p>Namaste <strong>${payload.purchaserName}</strong>,</p>
            <p>Your payment of <strong>₹${payload.totalAmount}</strong> has been successfully processed! Your official passes for Garba Gala 2026 are ready.</p>

            <div class="info-box">
              <div style="margin-bottom: 12px;">
                <div class="info-label">Event</div>
                <div class="info-val" style="font-size: 18px; color: #F7B731;">${EVENT_DETAILS.name}</div>
              </div>
              <div style="margin-bottom: 12px;">
                <div class="info-label">Date & Time</div>
                <div class="info-val">${EVENT_DETAILS.date} | ${EVENT_DETAILS.time}</div>
              </div>
              <div style="margin-bottom: 12px;">
                <div class="info-label">Venue</div>
                <div class="info-val">${EVENT_DETAILS.venue}, ${EVENT_DETAILS.venueAddress}</div>
              </div>
              <div>
                <div class="info-label">Booking Reference</div>
                <div class="info-val" style="color: #FF9F1C;">${payload.bookingId}</div>
              </div>
            </div>

            <h3 style="color: #F7B731; margin-top: 24px; margin-bottom: 12px;">Your Issued Passes (${payload.quantity}):</h3>
            ${ticketListHtml}

            <div style="text-align: center;">
              <a href="https://garbagala.com/my-tickets/${payload.bookingId}" class="btn">View Digital Passes & QR Codes</a>
            </div>

            <div class="rules">
              <strong style="color: #F7B731;">IMPORTANT ENTRY GUIDELINES:</strong><br>
              • <strong>Age Limit:</strong> Minimum 10+ years required.<br>
              • <strong>ID:</strong> Government ID is not required, but QR pass must be scanned at entrance.<br>
              • <strong>Policy:</strong> Tickets are strictly <strong>NON-REFUNDABLE</strong> and <strong>NON-TRANSFERABLE</strong>.<br>
              • Please bring your digital PDF ticket attached to this email or access it live from your account.
            </div>
          </div>
          <div class="footer">
            Organized by Rotaract Clubs of Mumbai Ghatkopar, Salt City & Medico Marvel<br>
            © 2026 Garba Gala. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  const attachments = payload.pdfAttachment
    ? [
        {
          filename: `Garba_Gala_2026_Tickets_${payload.bookingId}.pdf`,
          content: payload.pdfAttachment.toString("base64"),
        },
      ]
    : [];

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: payload.toEmail,
      subject: `Your Garba Gala 2026 Tickets 🎟️ [${payload.bookingId}]`,
      html: emailHtml,
      attachments,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error("Resend Email error:", error);
    return { success: false, error: error.message || error };
  }
}

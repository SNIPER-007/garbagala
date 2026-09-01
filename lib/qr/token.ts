import crypto from "crypto";
import QRCode from "qrcode";

export function generateSecureQrToken(): string {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  return `tkt_${randomBytes}`;
}

export async function generateQrDataUrl(token: string): Promise<string> {
  // Encodes secure validation URL or direct opaque token
  const qrContent = token.startsWith("http")
    ? token
    : `https://garbagala.com/organizer/scan?token=${token}`;

  try {
    return await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
      color: {
        dark: "#0A090D",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new Error("Failed to generate QR code");
  }
}

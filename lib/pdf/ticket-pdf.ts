import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { generateQrDataUrl } from "@/lib/qr/token";
import { EVENT_DETAILS } from "@/lib/constants";

interface TicketPdfInput {
  ticketNumber: string;
  bookingId: string;
  holderName: string;
  ticketType: string;
  qrToken: string;
  price: number;
}

export async function generateTicketPdf(input: TicketPdfInput): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 850]);
  const { width, height } = page.getSize();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const obsidian = rgb(10 / 255, 9 / 255, 13 / 255);
  const cardBg = rgb(20 / 255, 18 / 255, 27 / 255);
  const gold = rgb(247 / 255, 183 / 255, 49 / 255);
  const amber = rgb(255 / 255, 159 / 255, 28 / 255);
  const white = rgb(1, 1, 1);
  const textMuted = rgb(181 / 255, 177 / 255, 197 / 255);
  const crimson = rgb(224 / 255, 54 / 255, 22 / 255);

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: obsidian,
  });

  // Ticket Container Card
  const margin = 30;
  const cardWidth = width - margin * 2;
  const cardHeight = height - margin * 2;
  
  page.drawRectangle({
    x: margin,
    y: margin,
    width: cardWidth,
    height: cardHeight,
    color: cardBg,
    borderColor: amber,
    borderWidth: 2,
  });

  // Header Banner Accent
  page.drawRectangle({
    x: margin,
    y: height - margin - 110,
    width: cardWidth,
    height: 110,
    color: crimson,
  });

  // Event Title
  page.drawText(EVENT_DETAILS.name.toUpperCase(), {
    x: margin + 24,
    y: height - margin - 50,
    size: 28,
    font: fontHelveticaBold,
    color: white,
  });

  // Event Tagline/Subheading
  page.drawText("OFFICIAL ADMISSION PASS", {
    x: margin + 24,
    y: height - margin - 75,
    size: 13,
    font: fontHelveticaBold,
    color: gold,
  });

  page.drawText("ROTARACT CLUBS OF MUMBAI PRESENTATION", {
    x: margin + 24,
    y: height - margin - 95,
    size: 10,
    font: fontHelvetica,
    color: white,
  });

  // Main Ticket Details Section
  let currentY = height - margin - 150;

  // Ticket Number & Status Pill
  page.drawText("TICKET NUMBER", {
    x: margin + 24,
    y: currentY,
    size: 10,
    font: fontHelveticaBold,
    color: textMuted,
  });

  page.drawText(input.ticketNumber, {
    x: margin + 24,
    y: currentY - 20,
    size: 20,
    font: fontHelveticaBold,
    color: gold,
  });

  page.drawText("BOOKING ID", {
    x: margin + 300,
    y: currentY,
    size: 10,
    font: fontHelveticaBold,
    color: textMuted,
  });

  page.drawText(input.bookingId, {
    x: margin + 300,
    y: currentY - 20,
    size: 16,
    font: fontHelveticaBold,
    color: white,
  });

  currentY -= 60;

  // Divider Line
  page.drawLine({
    start: { x: margin + 24, y: currentY },
    end: { x: width - margin - 24, y: currentY },
    thickness: 1,
    color: textMuted,
  });

  currentY -= 35;

  // Purchaser Name & Pass Type
  page.drawText("PASS HOLDER / PURCHASER", {
    x: margin + 24,
    y: currentY,
    size: 10,
    font: fontHelveticaBold,
    color: textMuted,
  });

  page.drawText(input.holderName, {
    x: margin + 24,
    y: currentY - 22,
    size: 18,
    font: fontHelveticaBold,
    color: white,
  });

  page.drawText("CATEGORY", {
    x: margin + 300,
    y: currentY,
    size: 10,
    font: fontHelveticaBold,
    color: textMuted,
  });

  page.drawText(`${input.ticketType.toUpperCase()} (₹${input.price})`, {
    x: margin + 300,
    y: currentY - 22,
    size: 15,
    font: fontHelveticaBold,
    color: amber,
  });

  currentY -= 65;

  // Date, Time & Venue
  page.drawText("DATE & TIME", {
    x: margin + 24,
    y: currentY,
    size: 10,
    font: fontHelveticaBold,
    color: textMuted,
  });

  page.drawText(`${EVENT_DETAILS.date} | ${EVENT_DETAILS.time}`, {
    x: margin + 24,
    y: currentY - 18,
    size: 12,
    font: fontHelveticaBold,
    color: white,
  });

  page.drawText("VENUE", {
    x: margin + 300,
    y: currentY,
    size: 10,
    font: fontHelveticaBold,
    color: textMuted,
  });

  page.drawText(`${EVENT_DETAILS.venue}`, {
    x: margin + 300,
    y: currentY - 18,
    size: 12,
    font: fontHelveticaBold,
    color: white,
  });

  page.drawText(`${EVENT_DETAILS.venueAddress}`, {
    x: margin + 300,
    y: currentY - 34,
    size: 10,
    font: fontHelvetica,
    color: textMuted,
  });

  currentY -= 75;

  // QR Code Image Generation & Embedding
  const qrDataUrl = await generateQrDataUrl(input.qrToken);
  const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  const qrSize = 170;
  const qrX = width / 2 - qrSize / 2;
  const qrY = currentY - qrSize;

  page.drawRectangle({
    x: qrX - 10,
    y: qrY - 10,
    width: qrSize + 20,
    height: qrSize + 20,
    color: white,
    borderColor: gold,
    borderWidth: 2,
  });

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  currentY = qrY - 30;

  page.drawText("SCAN AT GATE FOR ENTRY", {
    x: width / 2 - 80,
    y: currentY,
    size: 11,
    font: fontHelveticaBold,
    color: gold,
  });

  currentY -= 40;

  // Entry Rules Box
  page.drawRectangle({
    x: margin + 24,
    y: margin + 20,
    width: cardWidth - 48,
    height: 110,
    color: obsidian,
    borderColor: textMuted,
    borderWidth: 1,
  });

  page.drawText("ENTRY INSTRUCTIONS & TERMS", {
    x: margin + 36,
    y: margin + 105,
    size: 10,
    font: fontHelveticaBold,
    color: amber,
  });

  const rules = [
    "• Age restriction: Minimum 10+ years required for entry.",
    "• Tickets are strictly NON-REFUNDABLE and NON-TRANSFERABLE.",
    "• Present this digital PDF pass or physical printout with valid QR code at entrance.",
    "• Duplicate or copied passes will be invalidated instantly by the gate scanner.",
    "• Management reserves the right of admission."
  ];

  let ruleY = margin + 88;
  for (const rule of rules) {
    page.drawText(rule, {
      x: margin + 36,
      y: ruleY,
      size: 9,
      font: fontHelvetica,
      color: textMuted,
    });
    ruleY -= 15;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

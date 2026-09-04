export type UserRole = 'customer' | 'organizer' | 'checkin_staff' | 'super_admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface EventData {
  eventId: string;
  name: string;
  date: string;
  startTime: string;
  venue: string;
  venueAddress: string;
  ageRestriction: string;
  idRequired: boolean;
  description: string;
  artists: { name: string; role: string; image?: string }[];
  organisers: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface TicketTypeData {
  ticketTypeId: string;
  eventId: string;
  name: string;
  price: number;
  currency: string;
  totalQuantity: number;
  soldQuantity: number;
  status: 'active' | 'sold_out' | 'inactive';
  saleStart?: string;
  saleEnd?: string;
  maxPerBooking: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'failed';
export type BookingStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'failed';

export interface BookingData {
  bookingId: string;
  customerId: string;
  eventId: string;
  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone: string;
  ticketType: string;
  quantity: number;
  subtotal: number;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  paymentProvider?: 'payu';
  payuTxnId?: string;
  payuPaymentId?: string;
  paymentVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = 'valid' | 'checked_in' | 'cancelled' | 'refunded';

export interface IndividualTicketData {
  ticketId: string;
  bookingId: string;
  eventId: string;
  ticketNumber: string; // e.g. GG26-000001
  ticketType: string;
  holderName: string;
  holderEmail: string;
  holderPhone: string;
  qrToken: string; // Cryptographically secure token, e.g. tkt_8f92a7...
  ticketStatus: TicketStatus;
  pdfUrl?: string;
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  paymentId: string;
  bookingId: string;
  paymentProvider: 'payu';
  payuTxnId: string;
  payuPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  rawPayload?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInRecord {
  checkInId: string;
  ticketId: string;
  ticketNumber: string;
  bookingId: string;
  holderName: string;
  scannedBy: string;
  scannedByRole: string;
  scannedAt: string;
  deviceInfo?: string;
}

export interface AuditLogRecord {
  logId: string;
  action: string;
  actor: string;
  actorRole: string;
  target: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

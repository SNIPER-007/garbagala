export const EVENT_DETAILS = {
  eventId: "garba-gala-2026",
  name: "Garba Gala 2026",
  date: "27 September 2026",
  dateFormatted: "Sunday, September 27, 2026",
  time: "5:30 PM onwards",
  venue: "Golden Celebration Hall",
  venueAddress: "Mulund West, Mumbai, Maharashtra",
  venueMapUrl: "https://share.google/IlMivdoRsZrs44KYa",
  ageRestriction: "10+",
  idRequired: false,
  description: "Experience Mumbai's most magnificent and energetic traditional Dandiya & Garba celebration! Featuring legendary live performers, mesmerizing lights, authentic food stalls, and an unparalleled festive atmosphere.",
  artists: [
    { name: "Divya Joshi Ganatra", role: "Lead Singer", image: "/artists/divya-joshi.JPG" },
    { name: "Jigar Dama", role: "Co Singer", image: "/artists/jigar-dama.jpeg" },
    { name: "Nisha Soni", role: "Singer", image: "/artists/nisha-soni.jpeg" },
    { name: "Chetan Deshmukh", role: "Singer / Musician", image: "/artists/chetan-deshmukh.jpeg" },
    { name: "Bharat Kotak & Band", role: "Percussionist", image: "/artists/bharat-kotak.jpeg" },
  ],
  organisers: [
    "Rotaract Club of Mumbai Ghatkopar",
    "Rotaract Club Of Mumbai Salt City",
    "Rotaract Club of Mumbai Medico Marvel",
    "Natyam Garba by Pooja Dedhia",
    "Nisha Soni",
    "Romil Bharat Lodaya",
  ],
  faqs: [
    {
      q: "Are tickets refundable or transferable?",
      a: "No. All tickets are strictly non-refundable and non-transferable under any circumstances."
    },
    {
      q: "Can I buy multiple tickets in one booking?",
      a: "Yes! A single purchaser can buy multiple tickets. All tickets within the booking will be issued under the purchaser's name, each with its own unique ticket number and QR code."
    },
    {
      q: "How will I receive my ticket after payment?",
      a: "Upon successful payment verification, your tickets will be instantly generated and sent to your registered email address with attached PDF passes. You can also view and download them anytime from 'My Tickets'."
    }
  ]
};

export const INITIAL_TICKET_TYPES = [
  {
    ticketTypeId: "general-sale",
    eventId: "garba-gala-2026",
    name: "General Sale",
    price: 450,
    currency: "INR",
    totalQuantity: 500,
    soldQuantity: 0,
    status: "active" as const,
    saleStart: "2026-08-01T00:00:00Z",
    saleEnd: "2026-09-27T17:00:00Z",
    maxPerBooking: 10,
    description: "Full access to Garba Gala 2026 main dance floor, live artist performances, and food court access."
  }
];

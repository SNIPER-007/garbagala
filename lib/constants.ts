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
    { name: "Nisha Soni", role: "Lead Vocalist", image: "/artists/nisha-soni.jpg" },
    { name: "Jiger Dama", role: "Rhythm & Percussion Maestro", image: "/artists/jiger-dama.jpg" },
    { name: "Divya Joshi Ganatra", role: "Classical & Folk Vocalist", image: "/artists/divya-joshi.jpg" },
    { name: "Chetan Deshmukh", role: "Dholak & Octapad Specialist", image: "/artists/chetan-deshmukh.jpg" },
    { name: "Bharat Kotak and Band", role: "Grand Fusion Live Orchestra", image: "/artists/bharat-kotak.jpg" },
  ],
  organisers: [
    "Rotaract Club of Mumbai Ghatkopar",
    "Rotaract Club Of Mumbai Salt City",
    "Rotaract Club of Mumbai Medico Marvel",
    "Nisha Soni",
    "Romil Bharat Lodaya",
  ],
  faqs: [
    {
      q: "What is the minimum age requirement?",
      a: "The minimum age requirement for entry is 10 years and above. Children below 10 years are not permitted entry."
    },
    {
      q: "Is government ID required at entry?",
      a: "No physical ID card is strictly required at entry, but you must present your valid digital pass with QR code."
    },
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
    totalQuantity: 150,
    soldQuantity: 0,
    status: "active" as const,
    saleStart: "2026-08-01T00:00:00Z",
    saleEnd: "2026-09-27T17:00:00Z",
    maxPerBooking: 10,
    description: "Full access to Garba Gala 2026 main dance floor, live artist performances, and food court access."
  }
];

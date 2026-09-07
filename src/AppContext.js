import React, { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

// ---------------------------------------------------------------------------
// Dummy data — swap for real API calls when the backend is ready.
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  { id: 'cars', label: 'Cars', icon: 'car-outline', from: 300 },
  { id: 'bakkies', label: 'Bakkies', icon: 'truck-outline', from: 650 },
  { id: 'minibuses', label: 'Minibuses', icon: 'van-passenger', from: 900 },
  { id: 'buses', label: 'Buses', icon: 'bus', from: 1800 },
  { id: 'trucks', label: 'Trucks', icon: 'truck', from: 1500 },
  { id: 'trailers', label: 'Trailers', icon: 'truck-trailer', from: 250 },
  { id: 'construction', label: 'Construction', icon: 'excavator', from: 2200 },
  { id: 'agriculture', label: 'Agriculture', icon: 'tractor', from: 1600 },
];

const SAMPLE_AVAILABILITY = {
  v1: { status: 'available', nextAvailable: '2026-09-12', blockedDates: ['2026-09-13', '2026-09-14'], responseMinutes: 15, note: '2 vehicles still available for this week' },
  v2: { status: 'limited', nextAvailable: '2026-09-11', blockedDates: ['2026-09-15'], responseMinutes: 30, note: 'Weekend demand is high this month' },
  v3: { status: 'available', nextAvailable: '2026-09-10', blockedDates: [], responseMinutes: 20, note: 'Insurance and roadside assist included' },
  v4: { status: 'limited', nextAvailable: '2026-09-13', blockedDates: ['2026-09-16'], responseMinutes: 25, note: 'Driver included option is booked on Friday' },
  v5: { status: 'available', nextAvailable: '2026-09-09', blockedDates: [], responseMinutes: 18, note: 'Most flexible for short weekend rentals' },
  v6: { status: 'booked', nextAvailable: '2026-09-17', blockedDates: ['2026-09-18', '2026-09-19'], responseMinutes: 45, note: 'Business fleet booking locked until next week' },
  v7: { status: 'available', nextAvailable: '2026-09-11', blockedDates: ['2026-09-12'], responseMinutes: 12, note: 'Tarpaulin included and easy self-collection' },
  v8: { status: 'limited', nextAvailable: '2026-09-14', blockedDates: ['2026-09-16'], responseMinutes: 35, note: 'Operator availability is limited this week' },
};

const SAMPLE_TRACKING = {
  v1: {
    status: 'En route',
    eta: '12 min',
    speed: '58 km/h',
    driverName: 'Mpho',
    vehicleLocation: { latitude: -26.678784, longitude: 27.907319 },
    driverLocation: { latitude: -26.673938, longitude: 27.910231 },
    route: [
      { latitude: -26.673938, longitude: 27.910231 },
      { latitude: -26.675812, longitude: 27.910984 },
      { latitude: -26.677529, longitude: 27.908731 },
      { latitude: -26.678784, longitude: 27.907319 },
    ],
    pickup: 'Vereeniging station',
    dropoff: 'Vaal Mall',
    lastUpdated: '2 min ago',
  },
  v2: {
    status: 'Waiting pickup',
    eta: '6 min',
    speed: '12 km/h',
    driverName: 'Zanele',
    vehicleLocation: { latitude: -26.7081, longitude: 27.8974 },
    driverLocation: { latitude: -26.7037, longitude: 27.8949 },
    route: [
      { latitude: -26.7037, longitude: 27.8949 },
      { latitude: -26.7054, longitude: 27.8961 },
      { latitude: -26.7081, longitude: 27.8974 },
    ],
    pickup: 'Vanderbijlpark depot',
    dropoff: 'Meyerton office park',
    lastUpdated: '1 min ago',
  },
  v4: {
    status: 'On route',
    eta: '18 min',
    speed: '41 km/h',
    driverName: 'Lerato',
    vehicleLocation: { latitude: -26.6921, longitude: 27.9468 },
    driverLocation: { latitude: -26.6896, longitude: 27.9402 },
    route: [
      { latitude: -26.6896, longitude: 27.9402 },
      { latitude: -26.6918, longitude: 27.9444 },
      { latitude: -26.6921, longitude: 27.9468 },
    ],
    pickup: 'Duncan Rd',
    dropoff: 'Sasolburg community hall',
    lastUpdated: '4 min ago',
  },
};

const SAMPLE_DRIVER_DASHBOARD = {
  overview: {
    activeTrips: 12,
    onTimeRate: 96,
    avgEta: '11 min',
    revenue: 'R48,760',
  },
  routeHealth: [
    { id: 'r1', route: 'Vereeniging → Vaal Mall', status: 'On time', eta: '12 min', driver: 'Mpho' },
    { id: 'r2', route: 'Vanderbijlpark → Meyerton', status: 'Delayed 4 min', eta: '16 min', driver: 'Zanele' },
    { id: 'r3', route: 'Sasolburg → Community Hall', status: 'On time', eta: '18 min', driver: 'Lerato' },
    { id: 'r4', route: 'Meyerton → Emfuleni', status: 'Ready', eta: '5 min', driver: 'Kamohelo' },
  ],
  liveAlerts: [
    'Fuel check due in 40 min',
    '2 vehicles have maintenance reminders',
    'Driver Mpho reports smooth traffic on Route 5',
  ],
  reminders: [
    { label: 'Next service', value: 'Tue 10 Sep', tone: 'warning' },
    { label: 'Driver check-in', value: '4/8 complete', tone: 'success' },
    { label: 'Invoices', value: 'R12,400 due', tone: 'info' },
  ],
};

const SAMPLE_REVIEWS = {
  v1: [
    { id: 'rv1', name: 'Thabo N.', rating: 5, text: 'Clean car, easy pickup, and the provider answered all my booking questions quickly.' },
    { id: 'rv2', name: 'Jessica K.', rating: 4, text: 'Well maintained and the pickup process felt professional. Great value.' },
    { id: 'rv3', name: 'Lehlohonolo M.', rating: 5, text: 'Exactly as described. Would rent again for a long weekend.' },
  ],
  v2: [
    { id: 'rv4', name: 'Anika V.', rating: 5, text: 'Friendly provider and smooth handover. Very fair terms.' },
    { id: 'rv5', name: 'Mpho T.', rating: 4, text: 'Good value and responsive on chat.' },
  ],
  v3: [
    { id: 'rv6', name: 'Neo S.', rating: 5, text: 'Strong bakkie for work trips. Reliable and easy to drive.' },
  ],
  v4: [
    { id: 'rv7', name: 'Tumi A.', rating: 5, text: 'Perfect for a team trip — clean, spacious and well managed.' },
  ],
  v5: [
    { id: 'rv8', name: 'Aphiwe R.', rating: 4, text: 'Fuel efficient and great for city use. No hidden surprises.' },
  ],
  v6: [
    { id: 'rv9', name: 'Sipho M.', rating: 5, text: 'Arrived on time and the vehicle was in excellent condition.' },
  ],
  v7: [
    { id: 'rv10', name: 'Lerato P.', rating: 4, text: 'Good for moving small loads. Simple and straightforward process.' },
  ],
  v8: [
    { id: 'rv11', name: 'Chris D.', rating: 5, text: 'Very professional and the equipment was in great shape.' },
  ],
};

const SAMPLE_VEHICLES = [
  {
    id: 'v1',
    title: 'Toyota Hilux 2.8 GD6',
    category: 'bakkies',
    priceDaily: 850,
    year: 2021,
    fuel: 'Diesel',
    transmission: 'Manual',
    drivetrain: '4x4',
    seats: 5,
    rating: 4.8,
    reviews: 56,
    provider: 'Vaal Bakkies',
    location: 'Vereeniging, Gauteng',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    ],
    features: ['Air conditioning', 'Bluetooth audio', 'Tow bar', 'Reverse camera'],
  },
  {
    id: 'v2',
    title: 'Ford Ranger 2.2 TDCi',
    category: 'bakkies',
    priceDaily: 700,
    year: 2019,
    fuel: 'Diesel',
    transmission: 'Manual',
    drivetrain: '4x2',
    seats: 5,
    rating: 4.6,
    reviews: 32,
    provider: 'Highway Motors',
    location: 'Vanderbijlpark, Gauteng',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
    ],
    features: ['Air conditioning', 'Load bin liner', 'USB charging'],
  },
  {
    id: 'v3',
    title: 'Isuzu D-Max 250 HO',
    category: 'bakkies',
    priceDaily: 750,
    year: 2020,
    fuel: 'Diesel',
    transmission: 'Manual',
    drivetrain: '4x2',
    seats: 5,
    rating: 4.7,
    reviews: 41,
    provider: 'Isuzu Rentals',
    location: 'Sasolburg, Free State',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    ],
    features: ['Air conditioning', 'Cruise control', 'Tow bar'],
  },
  {
    id: 'v4',
    title: 'Toyota Quantum 15-Seater',
    category: 'minibuses',
    priceDaily: 1350,
    year: 2020,
    fuel: 'Diesel',
    transmission: 'Manual',
    drivetrain: null,
    seats: 15,
    rating: 4.9,
    reviews: 74,
    provider: 'Vaal Shuttles',
    location: 'Vereeniging, Gauteng',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    ],
    features: ['Air conditioning', '15 seatbelts', 'Driver included option'],
  },
  {
    id: 'v5',
    title: 'VW Polo Vivo 1.4',
    category: 'cars',
    priceDaily: 420,
    year: 2022,
    fuel: 'Petrol',
    transmission: 'Automatic',
    drivetrain: null,
    seats: 5,
    rating: 4.5,
    reviews: 63,
    provider: 'City Wheels',
    location: 'Vereeniging, Gauteng',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
    ],
    features: ['Air conditioning', 'Bluetooth audio', 'Fuel efficient'],
  },
  {
    id: 'v6',
    title: 'Mercedes-Benz Actros Flatbed',
    category: 'trucks',
    priceDaily: 2600,
    year: 2018,
    fuel: 'Diesel',
    transmission: 'Automatic',
    drivetrain: null,
    seats: 3,
    rating: 4.6,
    reviews: 19,
    provider: 'Vaal Freight',
    location: 'Meyerton, Gauteng',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    ],
    features: ['Flatbed 12m', 'Tail lift', 'GPS tracked'],
  },
  {
    id: 'v7',
    title: 'Utility Trailer 2.5m',
    category: 'trailers',
    priceDaily: 280,
    year: 2021,
    fuel: null,
    transmission: null,
    drivetrain: null,
    seats: null,
    rating: 4.4,
    reviews: 28,
    provider: 'Vaal Bakkies',
    location: 'Vereeniging, Gauteng',
    image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=1200&q=80',
    ],
    features: ['Braked axle', 'Tarpaulin included'],
  },
  {
    id: 'v8',
    title: 'JCB 3CX Backhoe Loader',
    category: 'construction',
    priceDaily: 3200,
    year: 2019,
    fuel: 'Diesel',
    transmission: 'Automatic',
    drivetrain: null,
    seats: 1,
    rating: 4.7,
    reviews: 14,
    provider: 'Vaal Plant Hire',
    location: 'Vanderbijlpark, Gauteng',
    image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=80',
    ],
    features: ['Operator available', 'Fuel not included'],
  },
];

const VEHICLE_META = {
  v1: {
    providerBadges: ['Verified provider', 'Insured', 'Response in 15 min'],
    verification: { idVerified: true, insured: true, businessVerified: true },
    pricingRules: { weekendSurcharge: 12, weeklyDiscount: 10, minDays: 2, cancellation: 'Free cancellation up to 48 hours' },
    availabilityNote: 'Next available Tue 12 Sep',
  },
  v2: {
    providerBadges: ['Verified provider', 'Top rated', 'Flexible pickup'],
    verification: { idVerified: true, insured: true, businessVerified: true },
    pricingRules: { weekendSurcharge: 8, weeklyDiscount: 12, minDays: 2, cancellation: 'Free cancellation up to 24 hours' },
    availabilityNote: 'Weekend demand is high',
  },
  v3: {
    providerBadges: ['Insured', 'Roadside assist', 'Trusted host'],
    verification: { idVerified: true, insured: true, businessVerified: false },
    pricingRules: { weekendSurcharge: 10, weeklyDiscount: 9, minDays: 1, cancellation: 'Free cancellation up to 72 hours' },
    availabilityNote: 'Daily pricing with free roadside support',
  },
  v4: {
    providerBadges: ['Verified provider', 'Driver included', 'Family friendly'],
    verification: { idVerified: true, insured: true, businessVerified: true },
    pricingRules: { weekendSurcharge: 15, weeklyDiscount: 12, minDays: 3, cancellation: 'Free cancellation up to 48 hours' },
    availabilityNote: 'Driver included option available on request',
  },
  v5: {
    providerBadges: ['Verified provider', 'Lowest daily rate', 'Quick handover'],
    verification: { idVerified: true, insured: true, businessVerified: true },
    pricingRules: { weekendSurcharge: 6, weeklyDiscount: 8, minDays: 1, cancellation: 'Free cancellation up to 24 hours' },
    availabilityNote: 'Popular for short weekend bookings',
  },
  v6: {
    providerBadges: ['Business fleet', 'GPS tracked', 'Insured'],
    verification: { idVerified: true, insured: true, businessVerified: true },
    pricingRules: { weekendSurcharge: 18, weeklyDiscount: 14, minDays: 5, cancellation: 'Business terms apply' },
    availabilityNote: 'Fleet booking locked until next week',
  },
  v7: {
    providerBadges: ['Verified provider', 'Self-collection', 'Flexible'],
    verification: { idVerified: true, insured: false, businessVerified: true },
    pricingRules: { weekendSurcharge: 5, weeklyDiscount: 10, minDays: 1, cancellation: 'Free cancellation up to 24 hours' },
    availabilityNote: 'Easy collection from Vereeniging yard',
  },
  v8: {
    providerBadges: ['Verified operator', 'Machine insured', 'On-site support'],
    verification: { idVerified: true, insured: true, businessVerified: true },
    pricingRules: { weekendSurcharge: 20, weeklyDiscount: 15, minDays: 2, cancellation: 'Free cancellation up to 72 hours' },
    availabilityNote: 'Operator availability is included',
  },
};

const buildVehicleCatalog = () =>
  SAMPLE_VEHICLES.map((vehicle) => ({
    ...vehicle,
    providerBadges: VEHICLE_META[vehicle.id]?.providerBadges || ['Verified provider'],
    verification: VEHICLE_META[vehicle.id]?.verification || { idVerified: true, insured: true, businessVerified: true },
    pricingRules: VEHICLE_META[vehicle.id]?.pricingRules || { weekendSurcharge: 10, weeklyDiscount: 8, minDays: 1, cancellation: 'Standard terms apply' },
    availabilityNote: VEHICLE_META[vehicle.id]?.availabilityNote || 'Available for immediate booking',
  }));

const now = Date.now();
const day = 86400000;

const SAMPLE_BOOKINGS = [
  {
    id: 'b1',
    vehicleId: 'v1',
    pickup: new Date(now + 2 * day).toISOString(),
    dropoff: new Date(now + 3 * day).toISOString(),
    total: 1000,
    status: 'upcoming',
    location: 'Vereeniging, Gauteng',
    code: 'VM2505247846',
  },
  {
    id: 'b2',
    vehicleId: 'v4',
    pickup: new Date(now - 10 * day).toISOString(),
    dropoff: new Date(now - 8 * day).toISOString(),
    total: 2850,
    status: 'completed',
    location: 'Vereeniging, Gauteng',
    code: 'VM2504118231',
  },
  {
    id: 'b3',
    vehicleId: 'v2',
    pickup: new Date(now - 20 * day).toISOString(),
    dropoff: new Date(now - 19 * day).toISOString(),
    total: 850,
    status: 'cancelled',
    location: 'Vanderbijlpark, Gauteng',
    code: 'VM2503301190',
  },
];

const SAMPLE_CONVERSATIONS = [
  {
    id: 'c1',
    name: 'Vaal Bakkies',
    role: 'Provider',
    avatarColor: '#2F7FE0',
    lastMessage: "Great, the Hilux will be ready for pickup at 08:00.",
    time: '09:24',
    unread: 2,
    messages: [
      { id: 'm1', from: 'them', text: 'Hi! Thanks for booking the Hilux with us.', time: '09:10' },
      { id: 'm2', from: 'them', text: 'Just confirming pickup is at our Vereeniging yard.', time: '09:11' },
      { id: 'm3', from: 'me', text: 'Perfect, see you Saturday morning.', time: '09:20' },
      { id: 'm4', from: 'them', text: 'Great, the Hilux will be ready for pickup at 08:00.', time: '09:24' },
    ],
  },
  {
    id: 'c2',
    name: 'LexRidesZA Support',
    role: 'Support',
    avatarColor: '#2FA85B',
    lastMessage: 'Let us know if there is anything else we can help with!',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm1', from: 'them', text: 'Hi there 👋 How can we help today?', time: 'Yesterday' },
      { id: 'm2', from: 'me', text: 'I wanted to update my payment method.', time: 'Yesterday' },
      { id: 'm3', from: 'them', text: 'You can do that under Profile > Payment Methods.', time: 'Yesterday' },
      { id: 'm4', from: 'them', text: 'Let us know if there is anything else we can help with!', time: 'Yesterday' },
    ],
  },
  {
    id: 'c3',
    name: 'Highway Motors',
    role: 'Provider',
    avatarColor: '#A24FC7',
    lastMessage: 'Thank you for renting with us!',
    time: 'Mon',
    unread: 0,
    messages: [
      { id: 'm1', from: 'them', text: 'Thank you for renting with us!', time: 'Mon' },
    ],
  },
];

const SAMPLE_NOTIFICATIONS = [
  { id: 'n1', title: 'Booking confirmed', body: 'Your Toyota Hilux booking is confirmed for Saturday.', time: '2h ago', read: false, icon: 'checkmark-circle-outline', color: '#2FA85B' },
  { id: 'n2', title: 'New message', body: 'Vaal Bakkies sent you a message.', time: '4h ago', read: false, icon: 'chatbubble-outline', color: '#2F7FE0' },
  { id: 'n3', title: 'Price drop', body: 'Ford Ranger 2.2 TDCi is now R700/day.', time: '1d ago', read: true, icon: 'pricetag-outline', color: '#E08A2B' },
  { id: 'n4', title: 'Payment received', body: 'Your payment of R1,000 was successful.', time: '3d ago', read: true, icon: 'card-outline', color: '#A24FC7' },
];

const SAMPLE_PAYMENT_METHODS = [
  { id: 'p1', type: 'card', label: 'Visa •••• 4821', meta: 'Expires 08/27', isDefault: true },
  { id: 'p2', type: 'card', label: 'Mastercard •••• 1190', meta: 'Expires 02/26', isDefault: false },
  { id: 'p3', type: 'wallet', label: 'Wallet Balance', meta: 'R501.00 available', isDefault: false },
];

const SAMPLE_LOCATIONS = [
  { id: 'l1', label: 'Home', address: '14 Kerk Street, Vereeniging, 1930', icon: 'home-outline' },
  { id: 'l2', label: 'Work', address: '3 Frikkie Meyer Blvd, Vanderbijlpark, 1911', icon: 'briefcase-outline' },
];

// ---------------------------------------------------------------------------

export function AppProvider({ children }) {
  const [vehicles, setVehicles] = useState(buildVehicleCatalog());
  const [bookings, setBookings] = useState(SAMPLE_BOOKINGS);
  const [favorites, setFavorites] = useState(['v1', 'v4']);
  const [conversations, setConversations] = useState(SAMPLE_CONVERSATIONS);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [paymentMethods, setPaymentMethods] = useState(SAMPLE_PAYMENT_METHODS);
  const [savedLocations, setSavedLocations] = useState(SAMPLE_LOCATIONS);
  const [postedJobs, setPostedJobs] = useState([]);

  const [user, setUser] = useState({
    name: 'Lesedi Moraba',
    email: 'lesedi@example.com',
    phone: '082 555 0134',
    initials: 'LM',
    memberSince: '2024',
    isProvider: true,
    providerName: 'Vaal Bakkies',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    push: true,
    email: true,
    sms: false,
    promotions: true,
  });

  const [filters, setFilters] = useState({
    query: '',
    category: null,
    location: 'Vereeniging',
    startDate: null,
    endDate: null,
    minPrice: 0,
    maxPrice: 4000,
    transmission: null,
    sort: 'recommended',
  });

  const [bookingDraft, setBookingDraft] = useState(null);

  function getVehicleById(id) {
    return vehicles.find((v) => v.id === id) || null;
  }

  function getVehicleAvailability(id) {
    return SAMPLE_AVAILABILITY[id] || { status: 'available', nextAvailable: 'Today', blockedDates: [], responseMinutes: 30, note: 'Available for immediate booking' };
  }

  function getVehicleReviews(id) {
    return SAMPLE_REVIEWS[id] || [
      { id: `rv-${id}`, name: 'Verified renter', rating: 5, text: 'Fast communication and a smooth process from start to finish.' },
    ];
  }

  function getVehicleTracking(id) {
    return SAMPLE_TRACKING[id] || {
      status: 'Ready',
      eta: 'Available now',
      speed: '0 km/h',
      driverName: 'Dispatch team',
      vehicleLocation: { latitude: -26.6813, longitude: 27.9168 },
      driverLocation: { latitude: -26.6779, longitude: 27.9122 },
      route: [
        { latitude: -26.6779, longitude: 27.9122 },
        { latitude: -26.6813, longitude: 27.9168 },
      ],
      pickup: 'Collection point',
      dropoff: 'Destination point',
      lastUpdated: 'Just now',
    };
  }

  function getDriverDashboard() {
    return SAMPLE_DRIVER_DASHBOARD;
  }

  function toggleFavorite(id) {
    setFavorites((s) => (s.includes(id) ? s.filter((f) => f !== id) : [...s, id]));
  }

  function isFavorite(id) {
    return favorites.includes(id);
  }

  const favoriteVehicles = useMemo(
    () => vehicles.filter((v) => favorites.includes(v.id)),
    [vehicles, favorites]
  );

  function filteredVehicles() {
    let list = [...vehicles];
    if (filters.category) list = list.filter((v) => v.category === filters.category);
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (v) => v.title.toLowerCase().includes(q) || v.provider.toLowerCase().includes(q)
      );
    }
    if (filters.transmission) list = list.filter((v) => v.transmission === filters.transmission);
    list = list.filter((v) => v.priceDaily >= filters.minPrice && v.priceDaily <= filters.maxPrice);
    if (filters.sort === 'price_low') list.sort((a, b) => a.priceDaily - b.priceDaily);
    if (filters.sort === 'price_high') list.sort((a, b) => b.priceDaily - a.priceDaily);
    if (filters.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }

  function updateFilters(patch) {
    setFilters((s) => ({ ...s, ...patch }));
  }

  function addBooking(booking) {
    const id = `b${bookings.length + 1}${Math.floor(Math.random() * 1000)}`;
    const code = `VM${Math.floor(1000000 + Math.random() * 8999999)}`;
    const record = { id, status: 'upcoming', code, ...booking };
    setBookings((s) => [record, ...s]);
    return record;
  }

  function cancelBooking(id) {
    setBookings((s) => s.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
  }

  function sendMessage(conversationId, text) {
    setConversations((s) =>
      s.map((c) => {
        if (c.id !== conversationId) return c;
        const msg = { id: `m${c.messages.length + 1}`, from: 'me', text, time: 'Now' };
        return { ...c, messages: [...c.messages, msg], lastMessage: text, time: 'Now', unread: 0 };
      })
    );
  }

  function simulateReply(conversationId) {
    const replies = [
      "Thanks for the message, we'll get back to you shortly.",
      'Got it — checking on that now.',
      "Sounds good, I'll confirm the details.",
      'Sure thing! Anything else you need?',
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    setConversations((s) =>
      s.map((c) => {
        if (c.id !== conversationId) return c;
        const msg = { id: `m${c.messages.length + 1}`, from: 'them', text: reply, time: 'Now' };
        return { ...c, messages: [...c.messages, msg], lastMessage: reply, time: 'Now' };
      })
    );
  }

  function markConversationRead(conversationId) {
    setConversations((s) => s.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)));
  }

  function markAllNotificationsRead() {
    setNotifications((s) => s.map((n) => ({ ...n, read: true })));
  }

  function updateUser(patch) {
    setUser((s) => ({ ...s, ...patch }));
  }

  function updateNotificationSettings(patch) {
    setNotificationSettings((s) => ({ ...s, ...patch }));
  }

  function addPaymentMethod(method) {
    const id = `p${paymentMethods.length + 1}${Math.floor(Math.random() * 1000)}`;
    setPaymentMethods((s) => [...s, { id, isDefault: s.length === 0, ...method }]);
  }

  function removePaymentMethod(id) {
    setPaymentMethods((s) => s.filter((p) => p.id !== id));
  }

  function setDefaultPaymentMethod(id) {
    setPaymentMethods((s) => s.map((p) => ({ ...p, isDefault: p.id === id })));
  }

  function addSavedLocation(loc) {
    const id = `l${savedLocations.length + 1}${Math.floor(Math.random() * 1000)}`;
    setSavedLocations((s) => [...s, { id, icon: 'location-outline', ...loc }]);
  }

  function removeSavedLocation(id) {
    setSavedLocations((s) => s.filter((l) => l.id !== id));
  }

  function addPostedJob(job) {
    const id = `j${postedJobs.length + 1}${Math.floor(Math.random() * 1000)}`;
    setPostedJobs((s) => [{ id, status: 'open', ...job }, ...s]);
  }

  function addVehicleListing(listing) {
    const id = `v${vehicles.length + 1}${Math.floor(Math.random() * 1000)}`;
    const record = {
      id,
      rating: 0,
      reviews: 0,
      gallery: [listing.image],
      features: listing.features || [],
      ...listing,
    };
    setVehicles((s) => [record, ...s]);
    return record;
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread, 0);

  const value = {
    vehicles,
    getVehicleById,
    getVehicleAvailability,
    getVehicleReviews,
    getVehicleTracking,
    getDriverDashboard,
    bookings,
    addBooking,
    cancelBooking,
    favorites,
    favoriteVehicles,
    toggleFavorite,
    isFavorite,
    filters,
    updateFilters,
    filteredVehicles,
    conversations,
    sendMessage,
    simulateReply,
    markConversationRead,
    notifications,
    markAllNotificationsRead,
    unreadNotifications,
    unreadMessages,
    user,
    updateUser,
    notificationSettings,
    updateNotificationSettings,
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    postedJobs,
    addPostedJob,
    addVehicleListing,
    bookingDraft,
    setBookingDraft,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}

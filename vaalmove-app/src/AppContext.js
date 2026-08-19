import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const SAMPLE_VEHICLES = [
  {
    id: 'v1',
    title: 'Toyota Hilux 2.8 GD6',
    category: 'Bakkie',
    priceDaily: 850,
    year: 2021,
    fuel: 'Diesel',
    transmission: 'Manual',
    drivetrain: '4x4',
    rating: 4.8,
    reviews: 56,
    provider: 'Vaal Bakkies',
    seats: 5,
    luggage: 'Large boot',
    image:
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    id: 'v2',
    title: 'Ford Ranger 2.2 TDCi',
    category: 'Bakkie',
    priceDaily: 700,
    year: 2019,
    fuel: 'Diesel',
    transmission: 'Manual',
    drivetrain: '4x2',
    rating: 4.6,
    reviews: 32,
    provider: 'Highway Motors',
    seats: 5,
    luggage: 'Double cab',
    image:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    id: 'v3',
    title: 'Isuzu D-Max 250 HO',
    category: 'Bakkie',
    priceDaily: 750,
    year: 2020,
    fuel: 'Diesel',
    transmission: 'Manual',
    drivetrain: '4x4',
    rating: 4.7,
    reviews: 41,
    provider: 'Isuzu Rentals',
    seats: 5,
    luggage: 'Utility tray',
    image:
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    id: 'v4',
    title: 'Mercedes Sprinter Executive',
    category: 'Minibus',
    priceDaily: 1350,
    year: 2022,
    fuel: 'Diesel',
    transmission: 'Automatic',
    drivetrain: 'Rear-wheel drive',
    rating: 4.9,
    reviews: 88,
    provider: 'City Shuttle Co.',
    seats: 15,
    luggage: 'Luxury luggage bays',
    image:
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    id: 'v5',
    title: 'Toyota Quantum 16 Seater',
    category: 'Minibus',
    priceDaily: 1100,
    year: 2020,
    fuel: 'Diesel',
    transmission: 'Automatic',
    drivetrain: 'Front-wheel drive',
    rating: 4.7,
    reviews: 51,
    provider: 'RouteFlow Mobility',
    seats: 16,
    luggage: 'Cargo area',
    image:
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    ],
  },
];

const SAMPLE_BOOKINGS = [
  {
    id: 'b1',
    vehicleId: 'v1',
    pickup: '2025-08-20T08:00',
    return: '2025-08-21T17:00',
    total: 980,
    status: 'Confirmed',
  },
  {
    id: 'b2',
    vehicleId: 'v4',
    pickup: '2025-08-27T07:30',
    return: '2025-08-28T18:30',
    total: 1560,
    status: 'Pending',
  },
];

export function AppProvider({ children }) {
  const [vehicles] = useState(SAMPLE_VEHICLES);
  const [bookings, setBookings] = useState(SAMPLE_BOOKINGS);

  function getVehicleById(id) {
    return vehicles.find((v) => v.id === id) || null;
  }

  function addBooking(booking) {
    setBookings((s) => [{ id: `b${s.length + 1}`, ...booking }, ...s]);
  }

  function searchVehicles(filters = {}) {
    const query = (filters.query || '').toLowerCase();
    const category = (filters.category || '').toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesQuery =
        !query ||
        vehicle.title.toLowerCase().includes(query) ||
        vehicle.category.toLowerCase().includes(query) ||
        vehicle.provider.toLowerCase().includes(query);
      const matchesCategory = !category || vehicle.category.toLowerCase() === category.toLowerCase();
      return matchesQuery && matchesCategory;
    });
  }

  return (
    <AppContext.Provider value={{ vehicles, getVehicleById, bookings, addBooking, searchVehicles }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

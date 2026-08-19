import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const SAMPLE_VEHICLES = [
  {
    id: 'v1',
    title: 'Toyota Hilux 2.8 GD6',
    priceDaily: 850,
    year: 2021,
    fuel: 'Diesel',
    transmission: 'Manual',
    drivetrain: '4x4',
    rating: 4.8,
    reviews: 56,
    provider: 'Vaal Bakkies',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'v2',
    title: 'Ford Ranger 2.2 TDCi',
    priceDaily: 700,
    year: 2019,
    fuel: 'Diesel',
    transmission: 'Manual',
    drivetrain: null,
    rating: 4.6,
    reviews: 32,
    provider: 'Highway Motors',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'v3',
    title: 'Isuzu D-Max 250 HO',
    priceDaily: 750,
    year: 2020,
    fuel: 'Diesel',
    transmission: 'Manual',
    drivetrain: null,
    rating: 4.7,
    reviews: 41,
    provider: 'Isuzu Rentals',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
  },
];

const SAMPLE_BOOKINGS = [
  { id: 'b1', vehicleId: 'v1', pickup: '2025-05-24T08:00', return: '2025-05-25T17:00', total: 1000 },
];

export function AppProvider({ children }) {
  const [vehicles] = useState(SAMPLE_VEHICLES);
  const [bookings, setBookings] = useState(SAMPLE_BOOKINGS);

  function getVehicleById(id) {
    return vehicles.find((v) => v.id === id) || null;
  }

  function addBooking(booking) {
    setBookings((s) => [...s, { id: `b${s.length + 1}`, ...booking }]);
  }

  return (
    <AppContext.Provider value={{ vehicles, getVehicleById, bookings, addBooking }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

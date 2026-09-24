import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { supabase } from './lib/supabase';

const AppContext = createContext(null);

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

const EMPTY_USER = {
  name: '',
  email: '',
  phone: '',
  initials: '?',
  memberSince: '',
  isProvider: false,
  providerName: '',
};

const EMPTY_FILTERS = {
  query: '',
  category: null,
  location: '',
  startDate: null,
  endDate: null,
  minPrice: 0,
  maxPrice: 4000,
  transmission: null,
  sort: 'recommended',
};

const DEFAULT_APP_SETTINGS = {
  language: 'English',
  currency: 'ZAR (R)',
  darkMode: false,
  biometric: false,
};

function initialsFor(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
}

function mapVehicle(row) {
  const provider = row.profiles || {};
  const images = (row.vehicle_images || []).sort((a, b) => a.display_order - b.display_order);
  const gallery = images.map((image) => {
    if (image.public_url) return image.public_url;
    if (!image.storage_path) return null;
    return image.storage_path.startsWith('http')
      ? image.storage_path
      : supabase.storage.from('vehicle-images').getPublicUrl(image.storage_path).data.publicUrl;
  }).filter(Boolean);
  const features = (row.vehicle_features || []).map((feature) => feature.feature);
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    category: row.category,
    priceDaily: Number(row.price_daily || 0),
    year: row.year,
    fuel: row.fuel,
    transmission: row.transmission,
    drivetrain: row.drivetrain,
    seats: row.seats,
    description: row.description,
    rating: Number(row.rating || 0),
    reviews: row.review_count || 0,
    provider: provider.provider_name || provider.full_name || 'Vehicle provider',
    providerId: row.provider_id,
    location: row.location_name,
    latitude: row.latitude,
    longitude: row.longitude,
    image: gallery[0] || null,
    gallery,
    features,
    minDays: row.min_rental_days || 1,
    insurance: row.insurance_details,
    providerBadges: provider.provider_name ? ['Verified provider'] : [],
    verification: { idVerified: true, insured: Boolean(row.insurance_details), businessVerified: Boolean(provider.provider_name) },
    pricingRules: {
      weekendSurcharge: Number(row.weekend_surcharge_percent || 0),
      weeklyDiscount: Number(row.weekly_discount_percent || 0),
      minDays: row.min_rental_days || 1,
      cancellation: row.cancellation_policy || 'See provider terms',
    },
    availabilityNote: row.status === 'published' ? 'Available for booking' : 'Not currently published',
  };
}

function mapBooking(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    pickup: row.pickup_at,
    dropoff: row.dropoff_at,
    total: Number(row.total || 0),
    subtotal: Number(row.subtotal || 0),
    status: row.status === 'pending' || row.status === 'confirmed' || row.status === 'active' ? 'upcoming' : row.status,
    rawStatus: row.status,
    location: row.pickup_location,
    code: row.booking_code,
    paymentStatus: row.payment_status,
  };
}

function mapConversation(conversation, participants, messages, currentUserId) {
  const member = participants.find((item) => item.user_id !== currentUserId)?.profiles || {};
  const ownMessages = messages.filter((message) => message.conversation_id === conversation.id);
  const unread = ownMessages.filter((message) => message.sender_id !== currentUserId && !message.read_at).length;
  const last = ownMessages[ownMessages.length - 1];
  return {
    id: conversation.id,
    name: member.provider_name || member.full_name || 'Conversation',
    role: member.provider_name ? 'Provider' : 'Member',
    avatarColor: '#2F7FE0',
    lastMessage: last?.body || '',
    time: formatTime(last?.created_at),
    unread,
    messages: ownMessages.map((message) => ({
      id: message.id,
      from: message.sender_id === currentUserId ? 'me' : 'them',
      text: message.body,
      time: formatTime(message.created_at),
    })),
  };
}

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [savedLocations, setSavedLocations] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [availabilityRows, setAvailabilityRows] = useState([]);
  const [trackingRows, setTrackingRows] = useState([]);
  const [user, setUser] = useState(EMPTY_USER);
  const [notificationSettings, setNotificationSettings] = useState({ push: true, email: true, sms: false, promotions: true });
  const [appSettings, setAppSettings] = useState(DEFAULT_APP_SETTINGS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [bookingDraft, setBookingDraft] = useState(null);

  const report = useCallback((message) => {
    if (message) setError(message);
  }, []);

  function listingErrorMessage(error) {
    const message = String(error?.message || error || '');
    const normalized = message.toLowerCase();
    if (normalized.includes('bucket') && (normalized.includes('not found') || normalized.includes('does not exist'))) {
      return 'Vehicle image storage is not configured. Create the public "vehicle-images" bucket in Supabase Storage, then try again.';
    }
    if (normalized.includes('row-level security') || normalized.includes('not authorized') || normalized.includes('permission')) {
      return 'Supabase permissions blocked this listing. Run the vehicle and storage policies from supabase/schema.sql, then try again.';
    }
    if (normalized.includes('not authenticated') || normalized.includes('jwt')) {
      return 'Your session has expired. Please sign in again before publishing a listing.';
    }
    return 'We could not publish this listing. Check your Supabase setup and try again.';
  }

  const loadData = useCallback(async (activeSession) => {
    if (!activeSession?.user?.id) {
      setVehicles([]); setBookings([]); setFavorites([]); setConversations([]); setNotifications([]);
      setPaymentMethods([]); setSavedLocations([]); setPostedJobs([]); setUser(EMPTY_USER);
      setAppSettings(DEFAULT_APP_SETTINGS);
      return;
    }
    setLoading(true);
    setError(null);
    const userId = activeSession.user.id;
    try {
      const [
        profileResult, vehicleResult, bookingResult, favoriteResult, notificationResult,
        locationResult, paymentResult, preferenceResult, jobResult, reviewResult, availabilityResult,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('vehicles').select('*, profiles:provider_id(id, full_name, provider_name), vehicle_images(id, storage_path, display_order, is_cover), vehicle_features(feature)').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('favorites').select('vehicle_id').eq('user_id', userId),
        supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('saved_locations').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('payment_methods').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('job_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('reviews').select('*, profiles:renter_id(full_name)').order('created_at', { ascending: false }),
        supabase.from('vehicle_availability').select('*'),
      ]);
      const firstError = [profileResult, vehicleResult, bookingResult, favoriteResult, notificationResult, locationResult, paymentResult, preferenceResult, jobResult, reviewResult, availabilityResult].find((result) => result.error);
      if (firstError) throw firstError.error;

      const profile = profileResult.data || { id: userId, full_name: activeSession.user.user_metadata?.full_name || '' };
      setUser({
        name: profile.full_name || '',
        email: activeSession.user.email || '',
        phone: profile.phone || activeSession.user.phone || '',
        initials: initialsFor(profile.full_name),
        memberSince: profile.created_at ? new Date(profile.created_at).getFullYear().toString() : '',
        isProvider: Boolean(profile.is_provider),
        providerName: profile.provider_name || '',
        avatarUrl: profile.avatar_url,
      });
      setVehicles((vehicleResult.data || []).map(mapVehicle));
      setBookings((bookingResult.data || []).map(mapBooking));
      setFavorites((favoriteResult.data || []).map((row) => row.vehicle_id));
      setNotifications((notificationResult.data || []).map((row) => ({
        ...row,
        read: Boolean(row.read_at),
        time: formatTime(row.created_at),
        icon: row.icon || 'notifications-outline',
        color: row.color || '#2F7FE0',
      })));
      setSavedLocations((locationResult.data || []).map((row) => ({ ...row, icon: row.label.toLowerCase() === 'home' ? 'home-outline' : 'location-outline' })));
      setPaymentMethods((paymentResult.data || []).map((row) => ({ ...row, isDefault: row.is_default, label: row.label, meta: row.meta })));
      const persistedSettings = preferenceResult.data?.settings || {};
      setNotificationSettings({
        push: persistedSettings.push ?? true,
        email: persistedSettings.email ?? true,
        sms: persistedSettings.sms ?? false,
        promotions: persistedSettings.promotions ?? true,
      });
      setAppSettings({ ...DEFAULT_APP_SETTINGS, ...persistedSettings });
      setPostedJobs((jobResult.data || []).map((row) => ({ ...row, budget: String(row.budget || ''), photos: row.photos || [] })));
      setReviews(reviewResult.data || []);
      setAvailabilityRows(availabilityResult.data || []);

      const conversationResult = await supabase.from('conversations').select('id, booking_id, created_at').order('created_at', { ascending: false });
      if (conversationResult.error) throw conversationResult.error;
      const conversationIds = (conversationResult.data || []).map((row) => row.id);
      if (conversationIds.length) {
        const [participantResult, messageResult] = await Promise.all([
          supabase.from('conversation_participants').select('conversation_id, user_id, profiles:user_id(full_name, provider_name)').in('conversation_id', conversationIds),
          supabase.from('messages').select('*').in('conversation_id', conversationIds).order('created_at', { ascending: true }),
        ]);
        if (participantResult.error) throw participantResult.error;
        if (messageResult.error) throw messageResult.error;
        setConversations((conversationResult.data || []).map((row) => mapConversation(row, participantResult.data || [], messageResult.data || [], userId)));
      } else {
        setConversations([]);
      }
      const trackingResult = bookingResult.data?.length
        ? await supabase.from('tracking_locations').select('*').in('booking_id', bookingResult.data.map((row) => row.id)).order('recorded_at', { ascending: true })
        : { data: [], error: null };
      if (trackingResult.error) throw trackingResult.error;
      setTrackingRows(trackingResult.data || []);
    } catch (loadError) {
      report(loadError.message || 'Unable to load your data.');
    } finally {
      setLoading(false);
    }
  }, [report]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) report(sessionError.message);
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [report]);

  useEffect(() => {
    async function handleAuthRedirect(url) {
      if (!url) return;
      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) report(error.message);
        return;
      }
      const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) report(error.message);
      }
    }

    Linking.getInitialURL().then(handleAuthRedirect).catch((error) => report(error.message));
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthRedirect(url).catch((error) => report(error.message));
    });
    return () => subscription.remove();
  }, [report]);

  useEffect(() => {
    loadData(session);
  }, [session, loadData]);

  useEffect(() => {
    if (!session?.user?.id) return undefined;
    const channel = supabase
      .channel(`app-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => loadData(session))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` }, () => loadData(session))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => loadData(session))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, loadData]);

  const getVehicleById = useCallback((id) => vehicles.find((vehicle) => vehicle.id === id) || null, [vehicles]);

  const getVehicleAvailability = useCallback((id) => {
    const rows = availabilityRows.filter((row) => row.vehicle_id === id && row.status !== 'available');
    const bookingRows = bookings.filter((booking) => booking.vehicleId === id && ['upcoming', 'active'].includes(booking.status));
    const blockedDates = rows.map((row) => row.available_from).concat(bookingRows.map((booking) => booking.pickup?.slice(0, 10))).filter(Boolean);
    return {
      status: rows.some((row) => row.status === 'booked') || bookingRows.length ? 'limited' : 'available',
      nextAvailable: rows[0]?.available_to || 'Available now',
      blockedDates,
      responseMinutes: null,
      note: bookingRows.length ? 'This vehicle has an active booking.' : 'Availability is based on provider calendar and bookings.',
    };
  }, [availabilityRows, bookings]);

  const getVehicleReviews = useCallback((id) => reviews.filter((review) => review.vehicle_id === id).map((review) => ({
    id: review.id,
    name: review.profiles?.full_name || 'Verified renter',
    rating: review.rating,
    text: review.review_text || '',
  })), [reviews]);

  const getVehicleTracking = useCallback((id) => {
    const booking = bookings.find((item) => item.vehicleId === id && ['upcoming', 'active'].includes(item.status));
    const points = trackingRows.filter((row) => row.booking_id === booking?.id);
    if (!points.length) return null;
    const latest = points[points.length - 1];
    const first = points[0];
    return {
      status: booking?.rawStatus === 'active' ? 'En route' : 'Waiting pickup',
      eta: null,
      speed: latest.speed_kmh == null ? null : `${latest.speed_kmh} km/h`,
      driverName: 'Provider',
      vehicleLocation: { latitude: latest.latitude, longitude: latest.longitude },
      driverLocation: { latitude: first.latitude, longitude: first.longitude },
      route: points.map((point) => ({ latitude: point.latitude, longitude: point.longitude })),
      pickup: booking.location,
      dropoff: null,
      lastUpdated: formatTime(latest.recorded_at),
    };
  }, [bookings, trackingRows]);

  const getDriverDashboard = useCallback(() => {
    const providerVehicles = vehicles.filter((vehicle) => vehicle.providerId === session?.user?.id);
    const activeTrips = bookings.filter((booking) => booking.rawStatus === 'active').length;
    const revenue = bookings.filter((booking) => booking.status === 'completed').reduce((sum, booking) => sum + booking.total, 0);
    const routeHealth = bookings
      .filter((booking) => ['upcoming', 'active'].includes(booking.status) && providerVehicles.some((vehicle) => vehicle.id === booking.vehicleId))
      .slice(0, 5)
      .map((booking) => ({
        id: booking.id,
        route: getVehicleById(booking.vehicleId)?.title || 'Vehicle booking',
        status: booking.rawStatus || booking.status,
        eta: '—',
        driver: 'Provider',
      }));
    return {
      overview: { activeTrips, onTimeRate: '—', avgEta: '—', revenue: `R${revenue.toFixed(2)}` },
      routeHealth,
      liveAlerts: [],
      reminders: [{ label: 'Listings', value: String(providerVehicles.length), tone: 'info' }],
    };
  }, [bookings, getVehicleById, session, vehicles]);

  async function toggleFavorite(id) {
    if (!session?.user?.id) return;
    const exists = favorites.includes(id);
    const result = exists
      ? await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('vehicle_id', id)
      : await supabase.from('favorites').insert({ user_id: session.user.id, vehicle_id: id });
    if (result.error) return report(result.error.message);
    setFavorites((current) => (exists ? current.filter((item) => item !== id) : [...current, id]));
  }

  const favoriteVehicles = useMemo(() => vehicles.filter((vehicle) => favorites.includes(vehicle.id)), [vehicles, favorites]);
  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  function filteredVehicles() {
    let list = [...vehicles];
    if (filters.category) list = list.filter((vehicle) => vehicle.category === filters.category);
    if (filters.query) {
      const query = filters.query.toLowerCase();
      list = list.filter((vehicle) => vehicle.title.toLowerCase().includes(query) || vehicle.provider.toLowerCase().includes(query));
    }
    if (filters.location) list = list.filter((vehicle) => vehicle.location?.toLowerCase().includes(filters.location.toLowerCase()));
    if (filters.transmission) list = list.filter((vehicle) => vehicle.transmission === filters.transmission);
    list = list.filter((vehicle) => vehicle.priceDaily >= filters.minPrice && vehicle.priceDaily <= filters.maxPrice);
    if (filters.sort === 'price_low') list.sort((a, b) => a.priceDaily - b.priceDaily);
    if (filters.sort === 'price_high') list.sort((a, b) => b.priceDaily - a.priceDaily);
    if (filters.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }

  function updateFilters(patch) { setFilters((current) => ({ ...current, ...patch })); }

  async function addBooking(booking) {
    if (!session?.user?.id) return null;
    const result = await supabase.from('bookings').insert({
      renter_id: session.user.id,
      vehicle_id: booking.vehicleId,
      pickup_at: booking.pickup,
      dropoff_at: booking.dropoff,
      pickup_location: booking.location || 'Pickup location',
      dropoff_location: booking.dropoffLocation || null,
      subtotal: booking.subtotal ?? booking.total,
      total: booking.total,
      status: 'pending',
      payment_status: 'pending',
    }).select().single();
    if (result.error) { report(result.error.message); return null; }
    const record = mapBooking(result.data);
    setBookings((current) => [record, ...current]);
    return record;
  }

  async function cancelBooking(id) {
    const result = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    if (result.error) return report(result.error.message);
    setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status: 'cancelled', rawStatus: 'cancelled' } : booking));
  }

  async function sendMessage(conversationId, text) {
    if (!session?.user?.id) return;
    const result = await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: session.user.id, body: text.trim() });
    if (result.error) report(result.error.message);
    else await loadData(session);
  }

  async function markConversationRead(conversationId) {
    if (!session?.user?.id) return;
    const result = await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', conversationId).neq('sender_id', session.user.id).is('read_at', null);
    if (result.error) report(result.error.message);
    setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation));
  }

  async function markAllNotificationsRead() {
    if (!session?.user?.id) return;
    const result = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', session.user.id).is('read_at', null);
    if (result.error) return report(result.error.message);
    setNotifications((current) => current.map((notification) => ({ ...notification, read_at: new Date().toISOString(), read: true })));
  }

  async function updateUser(patch) {
    if (!session?.user?.id) return false;
    if (patch.email && patch.email !== session.user.email) {
      const authResult = await supabase.auth.updateUser({ email: patch.email });
      if (authResult.error) {
        report(authResult.error.message);
        return false;
      }
    }
    const profilePatch = {};
    if (patch.name !== undefined) profilePatch.full_name = patch.name;
    if (patch.phone !== undefined) profilePatch.phone = patch.phone;
    if (patch.providerName !== undefined) profilePatch.provider_name = patch.providerName;
    if (patch.isProvider !== undefined) profilePatch.is_provider = patch.isProvider;
    if (Object.keys(profilePatch).length) {
      const result = await supabase.from('profiles').upsert({ id: session.user.id, ...profilePatch });
      if (result.error) {
        report(result.error.message);
        return false;
      }
    }
    setUser((current) => ({ ...current, ...patch, initials: patch.name ? initialsFor(patch.name) : current.initials }));
    return true;
  }

  async function updateNotificationSettings(patch) {
    const next = { ...notificationSettings, ...patch };
    if (!session?.user?.id) return;
    const result = await supabase.from('notification_preferences').upsert({ user_id: session.user.id, settings: { ...appSettings, ...next } });
    if (result.error) return report(result.error.message);
    setNotificationSettings(next);
  }

  async function updateAppSettings(patch) {
    const next = { ...appSettings, ...patch };
    if (!session?.user?.id) return;
    const result = await supabase.from('notification_preferences').upsert({ user_id: session.user.id, settings: { ...next, ...notificationSettings } });
    if (result.error) return report(result.error.message);
    setAppSettings(next);
  }

  async function addPaymentMethod(method) {
    if (!session?.user?.id) return;
    const result = await supabase.from('payment_methods').insert({
      user_id: session.user.id, type: method.type || 'card', label: method.label, meta: method.meta, is_default: paymentMethods.length === 0,
    }).select().single();
    if (result.error) {
      report(result.error.message);
      return null;
    }
    const methodRecord = { ...result.data, isDefault: result.data.is_default };
    setPaymentMethods((current) => [...current, methodRecord]);
    return methodRecord;
  }

  async function removePaymentMethod(id) {
    const result = await supabase.from('payment_methods').delete().eq('id', id);
    if (result.error) return report(result.error.message);
    setPaymentMethods((current) => current.filter((method) => method.id !== id));
  }

  async function setDefaultPaymentMethod(id) {
    if (!session?.user?.id) return;
    const result = await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', session.user.id);
    if (result.error) {
      report(result.error.message);
      return false;
    }
    const selectedResult = await supabase.from('payment_methods').update({ is_default: true }).eq('id', id).eq('user_id', session.user.id);
    if (selectedResult.error) {
      report(selectedResult.error.message);
      return false;
    }
    setPaymentMethods((current) => current.map((method) => ({ ...method, isDefault: method.id === id })));
    return true;
  }

  async function addSavedLocation(location) {
    if (!session?.user?.id) return;
    const result = await supabase.from('saved_locations').insert({ user_id: session.user.id, label: location.label, address: location.address, latitude: location.latitude || null, longitude: location.longitude || null }).select().single();
    if (result.error) return report(result.error.message);
    setSavedLocations((current) => [{ ...result.data, icon: 'location-outline' }, ...current]);
  }

  async function removeSavedLocation(id) {
    const result = await supabase.from('saved_locations').delete().eq('id', id);
    if (result.error) return report(result.error.message);
    setSavedLocations((current) => current.filter((location) => location.id !== id));
  }

  async function addPostedJob(job) {
    if (!session?.user?.id) return false;
    const result = await supabase.from('job_posts').insert({ user_id: session.user.id, job_type: job.jobType, description: job.description, budget: Number(job.budget) || 0, date_needed: job.dateNeeded, contact: job.contact || null, photos: job.photos || [] }).select().single();
    if (result.error) {
      report(result.error.message);
      return false;
    }
    setPostedJobs((current) => [{ ...result.data, jobType: result.data.job_type, dateNeeded: result.data.date_needed, photos: result.data.photos || [], budget: String(result.data.budget) }, ...current]);
    return true;
  }

  async function updateVehicleStatus(id, status) {
    if (!session?.user?.id) return false;
    const result = await supabase.from('vehicles').update({ status }).eq('id', id).eq('provider_id', session.user.id);
    if (result.error) {
      report(result.error.message);
      return false;
    }
    setVehicles((current) => current.map((vehicle) => vehicle.id === id
      ? { ...vehicle, status, availabilityNote: status === 'published' ? 'Available for booking' : 'Paused by provider' }
      : vehicle));
    return true;
  }

  async function uploadVehicleImage(uri, providerId, vehicleId, index) {
    if (!uri || uri.startsWith('http')) return uri;
    const response = await fetch(uri);
    if (!response.ok) throw new Error('The selected vehicle image could not be read.');
    const blob = await response.blob();
    const path = `${providerId}/${vehicleId}/${Date.now()}-${index}.jpg`;
    const upload = await supabase.storage.from('vehicle-images').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (upload.error) throw upload.error;
    return supabase.storage.from('vehicle-images').getPublicUrl(path).data.publicUrl;
  }

  async function addVehicleListing(listing) {
    if (!session?.user?.id) throw new Error('Your session has expired. Please sign in again before publishing a listing.');
    const result = await supabase.from('vehicles').insert({
      provider_id: session.user.id, title: listing.title, category: listing.category, price_daily: listing.priceDaily,
      year: listing.year, fuel: listing.fuel, transmission: listing.transmission, description: listing.description || null,
      location_name: listing.location, status: 'published', insurance_details: listing.insurance || null,
      min_rental_days: listing.minDays || 1,
      weekend_surcharge_percent: listing.pricingRules?.weekendSurcharge || 0,
      weekly_discount_percent: listing.pricingRules?.weeklyDiscount || 0,
      cancellation_policy: listing.pricingRules?.cancellation || null,
    }).select('*, profiles:provider_id(id, full_name, provider_name)').single();
    if (result.error) {
      const message = listingErrorMessage(result.error);
      report(message);
      throw new Error(message);
    }
    try {
      const uris = listing.gallery || (listing.image ? [listing.image] : []);
      const urls = await Promise.all(uris.map((uri, index) => uploadVehicleImage(uri, session.user.id, result.data.id, index)));
      if (urls.length) {
        const imageRows = urls.map((url, index) => ({ vehicle_id: result.data.id, storage_path: url, display_order: index, is_cover: index === 0 }));
        const images = await supabase.from('vehicle_images').insert(imageRows);
        if (images.error) throw images.error;
      }

      if (listing.features?.length) {
        const features = await supabase.from('vehicle_features').insert(listing.features.map((feature) => ({ vehicle_id: result.data.id, feature })));
        if (features.error) throw features.error;
      }
      await loadData(session);
      return mapVehicle({ ...result.data, vehicle_images: urls.map((storage_path, index) => ({ storage_path, display_order: index })), vehicle_features: (listing.features || []).map((feature) => ({ feature })) });
    } catch (uploadError) {
      const message = listingErrorMessage(uploadError);
      report(message);
      await supabase.from('vehicles').delete().eq('id', result.data.id).eq('provider_id', session.user.id);
      await loadData(session);
      throw new Error(message);
    }
  }

  async function signOut() {
    const result = await supabase.auth.signOut();
    if (result.error) report(result.error.message);
  }

  const value = {
    session, authLoading, loading, error, refresh: () => loadData(session), clearError: () => setError(null),
    vehicles, getVehicleById, getVehicleAvailability, getVehicleReviews, getVehicleTracking, getDriverDashboard,
    bookings, addBooking, cancelBooking, favorites, favoriteVehicles, toggleFavorite, isFavorite,
    filters, updateFilters, filteredVehicles, conversations, sendMessage, markConversationRead,
    notifications, markAllNotificationsRead, unreadNotifications: notifications.filter((item) => !item.read_at).length,
    unreadMessages: conversations.reduce((sum, item) => sum + item.unread, 0), user, updateUser,
    notificationSettings, updateNotificationSettings, appSettings, updateAppSettings, paymentMethods, addPaymentMethod, removePaymentMethod,
    setDefaultPaymentMethod, savedLocations, addSavedLocation, removeSavedLocation, postedJobs, addPostedJob,
    addVehicleListing, updateVehicleStatus, bookingDraft, setBookingDraft, signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { supabase } from './lib/supabase';
import { verifyPaystackPayment } from './lib/payments';
import AuthSuccessOverlay from './components/AuthSuccessOverlay';

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

function mapProfileToUser(profile, authUser) {
  return {
    name: profile.full_name || '',
    email: authUser.email || '',
    phone: profile.phone || authUser.phone || '',
    initials: initialsFor(profile.full_name),
    memberSince: profile.created_at ? new Date(profile.created_at).getFullYear().toString() : '',
    isProvider: Boolean(profile.is_provider),
    providerName: profile.provider_name || '',
    avatarUrl: profile.avatar_url || null,
  };
}

function queryResult(query) {
  return Promise.resolve(query).then(
    (result) => result,
    (error) => ({ data: null, error }),
  );
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
}

function dateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
    providerPhone: provider.phone || null,
    location: row.location_name,
    latitude: row.latitude,
    longitude: row.longitude,
    image: gallery[0] || null,
    gallery,
    features,
    minDays: row.min_rental_days || 1,
    insurance: row.insurance_details,
    providerBadges: [],
    verification: { idVerified: false, insured: Boolean(row.insurance_details), businessVerified: false },
    pricingRules: {
      weekendSurcharge: Number(row.weekend_surcharge_percent || 0),
      weeklyDiscount: Number(row.weekly_discount_percent || 0),
      minDays: row.min_rental_days || 1,
      cancellation: row.cancellation_policy || 'See provider terms',
    },
    availabilityNote: row.status === 'published' ? 'Check dates for availability' : 'Not currently published',
  };
}

function mapBooking(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    renterId: row.renter_id,
    pickup: row.pickup_at,
    dropoff: row.dropoff_at,
    total: Number(row.total || 0),
    subtotal: Number(row.subtotal || 0),
    status: row.status === 'pending' || row.status === 'confirmed' || row.status === 'active' ? 'upcoming' : row.status,
    rawStatus: row.status,
    location: row.pickup_location,
    dropoffLocation: row.dropoff_location,
    code: row.booking_code,
    paymentStatus: row.payment_status,
  };
}

function mapConversation(conversation, participants, messages, currentUserId) {
  const member = participants.find((item) => item.user_id !== currentUserId) || {};
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
  const [publicBookingRanges, setPublicBookingRanges] = useState([]);
  const [trackingRows, setTrackingRows] = useState([]);
  const [user, setUser] = useState(EMPTY_USER);
  const [notificationSettings, setNotificationSettings] = useState({ push: true, email: true, sms: false, promotions: true });
  const [appSettings, setAppSettings] = useState(DEFAULT_APP_SETTINGS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [bookingDraft, setBookingDraft] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);
  const authSuccessTimer = useRef(null);
  const loadGeneration = useRef(0);
  const conversationLoadGeneration = useRef(0);
  const currentUserIdRef = useRef(null);
  const loadedUserIdRef = useRef(null);

  const report = useCallback((message) => {
    if (message) setError(message);
  }, []);

  const showAuthSuccess = useCallback((title, message) => {
    if (authSuccessTimer.current) clearTimeout(authSuccessTimer.current);
    setAuthSuccess({ title, message, key: Date.now() });
    authSuccessTimer.current = setTimeout(() => {
      setAuthSuccess(null);
      authSuccessTimer.current = null;
    }, 2300);
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
    if (message) {
      return `We could not publish this listing: ${message}`;
    }
    return 'We could not publish this listing. Check your Supabase setup and try again.';
  }

  const loadConversationData = useCallback(async (userId) => {
    const generation = ++conversationLoadGeneration.current;
    const conversationResult = await queryResult(supabase
      .from('conversations')
      .select('id, booking_id, vehicle_id, created_at')
      .order('created_at', { ascending: false }));
    if (conversationResult.error) throw conversationResult.error;

    const conversationRows = conversationResult.data || [];
    const conversationIds = conversationRows.map((row) => row.id);
    if (!conversationIds.length) {
      if (generation === conversationLoadGeneration.current && currentUserIdRef.current === userId) {
        setConversations([]);
      }
      return;
    }

    const [participantResult, messageResult] = await Promise.all([
      queryResult(supabase.rpc('get_conversation_participants')),
      queryResult(supabase.from('messages').select('*').in('conversation_id', conversationIds).order('created_at', { ascending: true })),
    ]);
    if (participantResult.error) throw participantResult.error;
    if (messageResult.error) throw messageResult.error;
    if (generation !== conversationLoadGeneration.current || currentUserIdRef.current !== userId) return;

    setConversations(conversationRows.map((row) => mapConversation(
      row,
      participantResult.data || [],
      messageResult.data || [],
      userId,
    )));
  }, []);

  function clearAccountData() {
    setVehicles([]);
    setBookings([]);
    setFavorites([]);
    setConversations([]);
    setNotifications([]);
    setPaymentMethods([]);
    setSavedLocations([]);
    setPostedJobs([]);
    setReviews([]);
    setAvailabilityRows([]);
    setPublicBookingRanges([]);
    setTrackingRows([]);
    setUser(EMPTY_USER);
    setNotificationSettings({ push: true, email: true, sms: false, promotions: true });
    setAppSettings(DEFAULT_APP_SETTINGS);
    loadedUserIdRef.current = null;
  }

  const loadData = useCallback(async (activeSession) => {
    const generation = ++loadGeneration.current;
    if (!activeSession?.user?.id) {
      currentUserIdRef.current = null;
      clearAccountData();
      setError(null);
      setLoading(false);
      return;
    }
    const userId = activeSession.user.id;
    currentUserIdRef.current = userId;
    if (loadedUserIdRef.current && loadedUserIdRef.current !== userId) clearAccountData();
    setLoading(true);
    setError(null);
    try {
      const [
        profileResult, vehicleResult, bookingResult, favoriteResult, notificationResult,
        locationResult, paymentResult, preferenceResult, jobResult, reviewResult, availabilityResult, publicBookingRangeResult,
      ] = await Promise.all([
        queryResult(supabase.from('profiles').select('*').eq('id', userId).maybeSingle()),
        queryResult(supabase.from('vehicles').select('*, profiles:provider_id(id, full_name, provider_name, phone), vehicle_images(id, storage_path, display_order, is_cover), vehicle_features(feature)').order('created_at', { ascending: false })),
        queryResult(supabase.from('bookings').select('*').order('created_at', { ascending: false })),
        queryResult(supabase.from('favorites').select('vehicle_id').eq('user_id', userId)),
        queryResult(supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })),
        queryResult(supabase.from('saved_locations').select('*').eq('user_id', userId).order('created_at', { ascending: false })),
        queryResult(supabase.from('payment_methods').select('*').eq('user_id', userId).order('created_at', { ascending: false })),
        queryResult(supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle()),
        queryResult(supabase.from('job_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false })),
        queryResult(supabase.from('reviews').select('*, profiles:renter_id(full_name)').order('created_at', { ascending: false })),
        queryResult(supabase.from('vehicle_availability').select('*')),
        queryResult(supabase.rpc('get_public_vehicle_booking_ranges')),
      ]);
      if (generation !== loadGeneration.current || currentUserIdRef.current !== userId) return;

      let profile = profileResult.data;
      const loadErrors = [];
      const collectError = (label, result) => {
        if (result?.error) loadErrors.push(`${label}: ${result.error.message || result.error}`);
      };
      collectError('Profile', profileResult);
      if (!profile && !profileResult.error) {
        const profileInsert = await queryResult(supabase.from('profiles').upsert({
          id: userId,
          full_name: activeSession.user.user_metadata?.full_name || '',
          phone: activeSession.user.user_metadata?.phone || activeSession.user.phone || null,
        }, { onConflict: 'id' }).select('*').single());
        if (profileInsert.error) collectError('Profile', profileInsert);
        else profile = profileInsert.data;
      }
      if (generation !== loadGeneration.current || currentUserIdRef.current !== userId) return;
      setUser(profile
        ? mapProfileToUser(profile, activeSession.user)
        : { ...EMPTY_USER, email: activeSession.user.email || '' });

      const results = [
        ['Vehicles', vehicleResult, setVehicles, (data) => data.map(mapVehicle)],
        ['Bookings', bookingResult, setBookings, (data) => data.map(mapBooking)],
        ['Favorites', favoriteResult, setFavorites, (data) => data.map((row) => row.vehicle_id)],
        ['Notifications', notificationResult, setNotifications, (data) => data.map((row) => ({
          ...row,
          read: Boolean(row.read_at),
          time: formatTime(row.created_at),
          icon: row.icon || 'notifications-outline',
          color: row.color || '#2F7FE0',
        }))],
        ['Saved locations', locationResult, setSavedLocations, (data) => data.map((row) => ({ ...row, icon: row.label?.toLowerCase() === 'home' ? 'home-outline' : 'location-outline' }))],
        ['Payment methods', paymentResult, setPaymentMethods, (data) => data.map((row) => ({ ...row, isDefault: row.is_default, label: row.label, meta: row.meta }))],
        ['Job posts', jobResult, setPostedJobs, (data) => data.map((row) => ({ ...row, budget: String(row.budget || ''), photos: row.photos || [] }))],
        ['Reviews', reviewResult, setReviews, (data) => data],
        ['Vehicle availability', availabilityResult, setAvailabilityRows, (data) => data],
        ['Booking availability', publicBookingRangeResult, setPublicBookingRanges, (data) => data],
      ];
      results.forEach(([label, result, setter, transform]) => {
        collectError(label, result);
        if (!result.error) setter(transform(result.data || []));
      });
      collectError('Notification preferences', preferenceResult);
      if (!preferenceResult.error) {
        const persistedSettings = preferenceResult.data?.settings || {};
        setNotificationSettings({
          push: persistedSettings.push ?? true,
          email: persistedSettings.email ?? true,
          sms: persistedSettings.sms ?? false,
          promotions: persistedSettings.promotions ?? true,
        });
        setAppSettings({ ...DEFAULT_APP_SETTINGS, ...persistedSettings });
      }

      try {
        await loadConversationData(userId);
      } catch (conversationError) {
        collectError('Messages', { error: conversationError });
      }

      const trackingResult = bookingResult.data?.length
        ? await queryResult(supabase.from('tracking_locations').select('*').in('booking_id', bookingResult.data.map((row) => row.id)).order('recorded_at', { ascending: true }))
        : { data: [], error: null };
      if (generation !== loadGeneration.current || currentUserIdRef.current !== userId) return;
      collectError('Live tracking', trackingResult);
      if (!trackingResult.error) setTrackingRows(trackingResult.data || []);
      loadedUserIdRef.current = userId;
      if (loadErrors.length) report(`Some account data could not be loaded. ${loadErrors.join(' · ')}`);
    } catch (loadError) {
      if (generation === loadGeneration.current && currentUserIdRef.current === userId) {
        report(loadError.message || 'Unable to load your data.');
      }
    } finally {
      if (generation === loadGeneration.current) setLoading(false);
    }
  }, [loadConversationData, report]);

  useEffect(() => {
    let mounted = true;
    let receivedAuthEvent = false;
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      receivedAuthEvent = true;
      currentUserIdRef.current = nextSession?.user?.id || null;
      setSession(nextSession);
      setAuthLoading(false);
      if (event === 'SIGNED_IN') {
        showAuthSuccess('Welcome back', 'You’re signed in and ready to go.');
      }
    });
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted || receivedAuthEvent) return;
      if (sessionError) report(sessionError.message);
      currentUserIdRef.current = data.session?.user?.id || null;
      setSession(data.session);
      setAuthLoading(false);
    }).catch((sessionError) => {
      if (!mounted || receivedAuthEvent) return;
      report(sessionError?.message || 'Unable to restore your session.');
      setAuthLoading(false);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [report, showAuthSuccess]);

  useEffect(() => () => {
    if (authSuccessTimer.current) clearTimeout(authSuccessTimer.current);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !session?.user?.id) return undefined;
    const acceptanceKey = 'lexridesza-legal-acceptance';
    const savedAcceptance = window.sessionStorage.getItem(acceptanceKey);
    if (!savedAcceptance) return undefined;

    let legalAcceptance;
    try {
      legalAcceptance = JSON.parse(savedAcceptance);
    } catch {
      window.sessionStorage.removeItem(acceptanceKey);
      report('We could not record your legal acceptance. Please review the terms and try signing in again.');
      return undefined;
    }
    if (
      !legalAcceptance
      || typeof legalAcceptance !== 'object'
      || typeof legalAcceptance.legal_terms_version !== 'string'
      || typeof legalAcceptance.privacy_policy_version !== 'string'
      || typeof legalAcceptance.legal_accepted_at !== 'string'
    ) {
      window.sessionStorage.removeItem(acceptanceKey);
      report('We could not record your legal acceptance. Please review the terms and try signing in again.');
      return undefined;
    }

    let active = true;
    supabase.auth.updateUser({ data: legalAcceptance }).then(({ error: acceptanceError }) => {
      if (!active) return;
      if (acceptanceError) {
        report(`Your account was created, but legal acceptance could not be recorded: ${acceptanceError.message}`);
        return;
      }
      window.sessionStorage.removeItem(acceptanceKey);
    }).catch((acceptanceError) => {
      if (active) {
        report(`Your account was created, but legal acceptance could not be recorded: ${acceptanceError?.message || 'Please contact support.'}`);
      }
    });
    return () => { active = false; };
  }, [session?.user?.id, report]);

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
    if (typeof window === 'undefined' || !session?.user?.id) return undefined;
    const callbackUrl = new URL(window.location.href);
    const reference = callbackUrl.searchParams.get('reference') || callbackUrl.searchParams.get('trxref');
    if (!reference) return undefined;

    let active = true;
    verifyPaystackPayment(reference)
      .then(() => {
        if (active) return loadData(session);
        return undefined;
      })
      .catch((paymentError) => {
        if (active) report(paymentError.message || 'Unable to verify Paystack payment.');
      })
      .finally(() => {
        if (!active) return;
        callbackUrl.searchParams.delete('reference');
        callbackUrl.searchParams.delete('trxref');
        window.history.replaceState(window.history.state, '', `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`);
      });

    return () => { active = false; };
  }, [session, loadData, report]);

  useEffect(() => {
    loadData(session);
  }, [session, loadData]);

  useEffect(() => {
    if (!session?.user?.id) return undefined;
    const channel = supabase
      .channel(`app-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        loadConversationData(session.user.id).catch((conversationError) => report(conversationError.message || 'Unable to refresh messages.'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` }, () => loadData(session))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => loadData(session))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, loadConversationData, loadData, report]);

  const getVehicleById = useCallback((id) => vehicles.find((vehicle) => vehicle.id === id) || null, [vehicles]);

  const getVehicleAvailability = useCallback((id) => {
    const rows = availabilityRows.filter((row) => row.vehicle_id === id && row.status !== 'available');
    const bookingRows = bookings.filter((booking) => booking.vehicleId === id && ['pending', 'confirmed', 'active'].includes(booking.rawStatus));
    const blockedRanges = rows.map((row) => ({ start: row.available_from, end: row.available_to }))
      .concat(bookingRows.map((booking) => ({ start: dateKey(booking.pickup), end: dateKey(booking.dropoff) })))
      .concat(publicBookingRanges.filter((range) => range.vehicle_id === id).map((range) => ({
        start: range.start_date,
        end: range.end_date,
      })))
      .filter((range) => range.start && range.end);
    return {
      status: blockedRanges.length ? 'limited' : 'available',
      nextAvailable: rows[0]?.available_to || 'Available now',
      blockedRanges,
      responseMinutes: null,
      note: blockedRanges.length ? 'Some dates are blocked by the provider or another booking.' : 'No unavailable dates are currently listed.',
    };
  }, [availabilityRows, bookings, publicBookingRanges]);

  const getVehicleReviews = useCallback((id) => reviews.filter((review) => review.vehicle_id === id).map((review) => ({
    id: review.id,
    name: review.profiles?.full_name || 'Verified renter',
    rating: review.rating,
    text: review.review_text || '',
  })), [reviews]);

  const getVehicleTracking = useCallback((id, bookingId) => {
    const booking = bookings.find((item) => item.id === bookingId)
      || bookings.find((item) => item.vehicleId === id && ['upcoming', 'active'].includes(item.status));
    if (!booking) return null;
    const providerId = getVehicleById(id)?.providerId;
    const points = trackingRows
      .filter((row) => row.booking_id === booking.id)
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    const providerPoints = points.filter((point) => !point.user_id || point.user_id === providerId);
    const renterPoints = points.filter((point) => point.user_id === booking.renterId);
    const latestProvider = providerPoints[providerPoints.length - 1];
    const latestRenter = renterPoints[renterPoints.length - 1];
    const toCoordinate = (point) => point
      ? { latitude: point.latitude, longitude: point.longitude, recordedAt: point.recorded_at }
      : null;
    const latest = points[points.length - 1];
    return {
      status: booking?.rawStatus === 'active' ? 'En route' : 'Waiting pickup',
      eta: null,
      speed: latestProvider?.speed_kmh == null ? null : `${latestProvider.speed_kmh} km/h`,
      driverName: 'Provider',
      providerPhone: getVehicleById(id)?.providerPhone || null,
      vehicleLocation: toCoordinate(latestProvider),
      driverLocation: toCoordinate(latestProvider),
      customerLocation: toCoordinate(latestRenter),
      route: providerPoints.map((point) => ({ latitude: point.latitude, longitude: point.longitude })),
      pickup: booking.location,
      dropoff: booking.dropoffLocation || null,
      lastUpdated: formatTime(latest?.recorded_at),
    };
  }, [bookings, getVehicleById, trackingRows]);

  const addTrackingLocation = useCallback(async (bookingId, location) => {
    if (!session?.user?.id) throw new Error('Sign in to share your location.');
    const result = await supabase.from('tracking_locations').upsert({
      booking_id: bookingId,
      user_id: session.user.id,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      speed_kmh: location.coords.speed == null ? null : Math.max(0, location.coords.speed * 3.6),
      recorded_at: new Date().toISOString(),
    }, { onConflict: 'booking_id,user_id' }).select('*').single();
    if (result.error) {
      report(result.error.message);
      throw result.error;
    }
    setTrackingRows((current) => [
      ...current.filter((point) => point.booking_id !== bookingId || point.user_id !== session.user.id),
      result.data,
    ]);
    return result.data;
  }, [report, session?.user?.id]);

  const refreshTrackingLocations = useCallback(async (bookingId) => {
    const result = await supabase.from('tracking_locations').select('*')
      .eq('booking_id', bookingId)
      .order('recorded_at', { ascending: true });
    if (result.error) {
      report(result.error.message);
      throw result.error;
    }
    setTrackingRows((current) => [
      ...current.filter((point) => point.booking_id !== bookingId),
      ...(result.data || []),
    ]);
  }, [report]);

  const removeTrackingLocations = useCallback(async (bookingId) => {
    if (!session?.user?.id) throw new Error('Sign in to stop sharing your location.');
    const result = await supabase.from('tracking_locations').delete()
      .eq('booking_id', bookingId)
      .eq('user_id', session.user.id);
    if (result.error) {
      report(result.error.message);
      throw result.error;
    }
    setTrackingRows((current) => current.filter(
      (point) => point.booking_id !== bookingId || point.user_id !== session.user.id,
    ));
  }, [report, session?.user?.id]);

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
    if (filters.startDate && filters.endDate) {
      const selectedStart = dateKey(filters.startDate);
      const selectedEnd = dateKey(filters.endDate);
      if (selectedStart && selectedEnd) {
        list = list.filter((vehicle) => {
          const hasAvailabilityConflict = availabilityRows.some((row) => (
            row.vehicle_id === vehicle.id
            && row.status !== 'available'
            && row.available_from <= selectedEnd
            && row.available_to >= selectedStart
          ));
          const hasBookingConflict = publicBookingRanges.some((range) => (
            range.vehicle_id === vehicle.id
            && range.start_date <= selectedEnd
            && range.end_date >= selectedStart
          )) || bookings.some((booking) => {
            if (booking.vehicleId !== vehicle.id || !['pending', 'confirmed', 'active'].includes(booking.rawStatus)) return false;
            const pickup = dateKey(booking.pickup);
            const dropoff = dateKey(booking.dropoff);
            return Boolean(pickup && dropoff && pickup <= selectedEnd && dropoff >= selectedStart);
          });
          return !hasAvailabilityConflict && !hasBookingConflict;
        });
      }
    }
    if (filters.sort === 'price_low') list.sort((a, b) => a.priceDaily - b.priceDaily);
    if (filters.sort === 'price_high') list.sort((a, b) => b.priceDaily - a.priceDaily);
    if (filters.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }

  function updateFilters(patch) { setFilters((current) => ({ ...current, ...patch })); }

  async function addBooking(booking) {
    if (!session?.user?.id) throw new Error('Sign in to create a booking.');
    if (!booking.rentalTermsVersion || !booking.rentalTermsAcceptedAt) {
      throw new Error('Review and accept the rental terms before continuing.');
    }
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
      payment_status: 'unpaid',
      rental_terms_version: booking.rentalTermsVersion,
      rental_terms_accepted_at: booking.rentalTermsAcceptedAt,
    }).select().single();
    if (result.error) {
      report(result.error.message);
      throw result.error;
    }
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
    if (!session?.user?.id || !text.trim()) return false;
    const result = await queryResult(supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: session.user.id, body: text.trim() })
      .select('*')
      .single());
    if (result.error) {
      report(result.error.message);
      return false;
    }
    const sentMessage = {
      id: result.data.id,
      from: 'me',
      text: result.data.body,
      time: formatTime(result.data.created_at),
    };
    setConversations((current) => current.map((conversation) => (
      conversation.id === conversationId
        ? {
          ...conversation,
          lastMessage: sentMessage.text,
          time: sentMessage.time,
          messages: [...conversation.messages, sentMessage],
        }
        : conversation
    )));
    return true;
  }

  async function startVehicleConversation(vehicleId) {
    if (!session?.user?.id) {
      report('Sign in to contact this vehicle provider.');
      return null;
    }
    const { data, error: conversationError } = await queryResult(supabase.rpc(
      'start_vehicle_conversation',
      { p_vehicle_id: vehicleId },
    ));
    if (conversationError) {
      report(conversationError.message);
      return null;
    }
    try {
      await loadConversationData(session.user.id);
    } catch (loadError) {
      report(loadError.message || 'The conversation was created, but could not be loaded.');
      return null;
    }
    return data;
  }

  async function reportVehicleListing(vehicleId, reason, details) {
    if (!session?.user?.id) {
      report('Sign in to report this vehicle listing.');
      return false;
    }
    const { error: reportError } = await supabase.from('listing_reports').insert({
      vehicle_id: vehicleId,
      reporter_id: session.user.id,
      reason,
      details: details?.trim() || null,
    });
    if (reportError) {
      report(reportError.message);
      return false;
    }
    return true;
  }

  async function markConversationRead(conversationId) {
    if (!session?.user?.id) return;
    const result = await queryResult(supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', conversationId).neq('sender_id', session.user.id).is('read_at', null));
    if (result.error) return report(result.error.message);
    setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation));
  }

  async function markAllNotificationsRead() {
    if (!session?.user?.id) return;
    const result = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', session.user.id).is('read_at', null);
    if (result.error) return report(result.error.message);
    setNotifications((current) => current.map((notification) => ({ ...notification, read_at: new Date().toISOString(), read: true })));
  }

  async function updateUser(patch) {
    setError(null);
    if (!session?.user?.id) {
      throw new Error('Your session has expired. Sign in again to update your profile.');
    }
    const profilePatch = {};
    if (patch.name !== undefined) profilePatch.full_name = patch.name;
    if (patch.phone !== undefined) profilePatch.phone = patch.phone;
    if (patch.providerName !== undefined) profilePatch.provider_name = patch.providerName;
    if (patch.isProvider !== undefined) profilePatch.is_provider = patch.isProvider;
    if (patch.avatarUrl !== undefined) profilePatch.avatar_url = patch.avatarUrl;
    if (Object.keys(profilePatch).length) {
      const result = await supabase.from('profiles').upsert({ id: session.user.id, ...profilePatch }, { onConflict: 'id' }).select('*').single();
      if (result.error) {
        report(result.error.message);
        throw result.error;
      }
      setUser(mapProfileToUser(result.data, session.user));
    }

    if (patch.email && patch.email !== session.user.email) {
      const authResult = await supabase.auth.updateUser({ email: patch.email });
      if (authResult.error) {
        report(authResult.error.message);
        throw authResult.error;
      }
      if (authResult.data.user) {
        setSession((current) => current?.user?.id === authResult.data.user.id
          ? { ...current, user: authResult.data.user }
          : current);
        setUser((current) => ({ ...current, email: authResult.data.user.email || current.email }));
      }
    }

    setUser((current) => ({
      ...current,
      ...patch,
      email: patch.email && patch.email !== session.user.email ? current.email : patch.email || current.email,
      initials: patch.name ? initialsFor(patch.name) : current.initials,
    }));
    return true;
  }

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return null;
    const [profileResult, authResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.auth.getUser(),
    ]);
    if (profileResult.error || authResult.error) {
      report(profileResult.error?.message || authResult.error?.message);
      return null;
    }
    const authUser = authResult.data.user;
    if (!authUser || authUser.id !== userId) return null;

    let profile = profileResult.data;
    if (!profile) {
      const inserted = await supabase.from('profiles').upsert({
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || '',
        phone: authUser.user_metadata?.phone || authUser.phone || null,
      }, { onConflict: 'id' }).select('*').single();
      if (inserted.error) {
        report(inserted.error.message);
        return null;
      }
      profile = inserted.data;
    }

    const refreshedUser = mapProfileToUser(profile, authUser);
    setUser(refreshedUser);
    return refreshedUser;
  }, [session?.user?.id, report]);

  async function uploadAvatar(uri) {
    if (!session?.user?.id || !uri) return null;
    try {
      const response = await fetch(uri);
      if (!response.ok) throw new Error('The selected profile image could not be read.');
      const blob = await response.blob();
      const path = `${session.user.id}/avatar.jpg`;
      const upload = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
      if (upload.error) throw upload.error;
      const avatarUrl = `${supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
      const saved = await updateUser({ avatarUrl });
      if (!saved) return null;
      return avatarUrl;
    } catch (uploadError) {
      report(listingErrorMessage(uploadError));
      return null;
    }
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
    if (!session?.user?.id) {
      throw new Error('Your session has expired. Please sign in again before posting a job.');
    }

    const uploadedPaths = [];
    try {
      const photoUrls = [];
      for (const [index, uri] of (job.photos || []).entries()) {
        if (uri.startsWith('http')) {
          photoUrls.push(uri);
          continue;
        }

        const response = await fetch(uri);
        if (!response.ok) throw new Error('A selected job photo could not be read.');
        const fileData = await response.arrayBuffer();
        const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${index}.jpg`;
        const upload = await supabase.storage.from('job-images').upload(path, fileData, {
          contentType: 'image/jpeg',
          upsert: false,
        });
        if (upload.error) throw upload.error;
        uploadedPaths.push(path);
        photoUrls.push(supabase.storage.from('job-images').getPublicUrl(path).data.publicUrl);
      }

      const result = await supabase.from('job_posts').insert({
        user_id: session.user.id,
        job_type: job.jobType,
        description: job.description,
        budget: Number(job.budget),
        date_needed: job.dateNeeded,
        contact: job.contact || null,
        photos: photoUrls,
      }).select().single();
      if (result.error) throw result.error;

      const postedJob = {
        ...result.data,
        jobType: result.data.job_type,
        dateNeeded: result.data.date_needed,
        photos: result.data.photos || [],
        budget: String(result.data.budget),
      };
      setPostedJobs((current) => [postedJob, ...current.filter((item) => item.id !== postedJob.id)]);
      return postedJob;
    } catch (jobError) {
      if (uploadedPaths.length) {
        try {
          const cleanup = await supabase.storage.from('job-images').remove(uploadedPaths);
          if (cleanup.error) {
            console.error('Unable to clean up job photos after a failed post:', cleanup.error);
          }
        } catch (cleanupError) {
          console.error('Unable to clean up job photos after a failed post:', cleanupError);
        }
      }
      const message = jobError instanceof Error ? jobError.message : 'Unable to post your job request.';
      report(message);
      throw new Error(message);
    }
  }

  async function updateVehicleStatus(id, status) {
    if (!session?.user?.id) return false;
    const result = await supabase.from('vehicles').update({ status }).eq('id', id).eq('provider_id', session.user.id);
    if (result.error) {
      report(result.error.message);
      return false;
    }
    setVehicles((current) => current.map((vehicle) => vehicle.id === id
      ? { ...vehicle, status, availabilityNote: status === 'published' ? 'Check dates for availability' : 'Paused by provider' }
      : vehicle));
    return true;
  }

  async function setVehicleMapPin(id, coordinates) {
    if (!session?.user?.id) throw new Error('Sign in as the vehicle provider to update its pickup pin.');
    const result = await supabase.from('vehicles').update({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    }).eq('id', id).eq('provider_id', session.user.id).select('*').single();
    if (result.error) {
      report(result.error.message);
      throw result.error;
    }
    setVehicles((current) => current.map((vehicle) => (
      vehicle.id === id
        ? { ...vehicle, latitude: result.data.latitude, longitude: result.data.longitude }
        : vehicle
    )));
  }

  async function uploadVehicleImage(uri, providerId, vehicleId, index) {
    if (!uri || uri.startsWith('http')) return uri;
    const response = await fetch(uri);
    if (!response.ok) throw new Error('The selected vehicle image could not be read.');
    const fileData = await response.arrayBuffer();
    const path = `${providerId}/${vehicleId}/${Date.now()}-${index}.jpg`;
    const upload = await supabase.storage.from('vehicle-images').upload(path, fileData, { contentType: 'image/jpeg', upsert: false });
    if (upload.error) throw upload.error;
    return supabase.storage.from('vehicle-images').getPublicUrl(path).data.publicUrl;
  }

  async function addVehicleListing(listing) {
    if (!session?.user?.id) throw new Error('Your session has expired. Please sign in again before publishing a listing.');
    const profile = await supabase.from('profiles').upsert({
      id: session.user.id,
      full_name: user.name || session.user.user_metadata?.full_name || '',
      provider_name: listing.provider || user.providerName || null,
      is_provider: true,
    }, { onConflict: 'id' });
    if (profile.error) {
      const message = listingErrorMessage(profile.error);
      report(message);
      throw new Error(message);
    }
    const result = await supabase.from('vehicles').insert({
      provider_id: session.user.id, title: listing.title, category: listing.category, price_daily: listing.priceDaily,
      year: listing.year, fuel: listing.fuel, transmission: listing.transmission, description: listing.description || null,
      location_name: listing.location, status: 'published', insurance_details: listing.insurance || null,
      latitude: listing.latitude ?? null,
      longitude: listing.longitude ?? null,
      min_rental_days: listing.minDays || 1,
      weekend_surcharge_percent: listing.pricingRules?.weekendSurcharge || 0,
      weekly_discount_percent: listing.pricingRules?.weeklyDiscount || 0,
      cancellation_policy: listing.pricingRules?.cancellation || null,
    }).select('*').single();
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

      const createdVehicle = mapVehicle({
        ...result.data,
        profiles: { full_name: listing.provider || user.providerName || user.name },
        vehicle_images: urls.map((storage_path, index) => ({ storage_path, display_order: index })),
        vehicle_features: (listing.features || []).map((feature) => ({ feature })),
      });
      await loadData(session);
      setVehicles((current) => [
        createdVehicle,
        ...current.filter((vehicle) => vehicle.id !== createdVehicle.id),
      ]);
      return createdVehicle;
    } catch (uploadError) {
      const message = listingErrorMessage(uploadError);
      report(message);
      await supabase.from('vehicles').delete().eq('id', result.data.id).eq('provider_id', session.user.id);
      await loadData(session);
      throw new Error(message);
    }
  }

  async function signOut() {
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    if (signOutError) {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        report(sessionError.message);
        throw sessionError;
      }
      if (data.session) {
        report(signOutError.message);
        throw signOutError;
      }
    }
    currentUserIdRef.current = null;
    setSession(null);
    clearAccountData();
  }

  async function deleteAccount() {
    const { error } = await supabase.functions.invoke('delete-account', { body: {} });
    if (error) {
      report(error.message || 'Unable to delete account.');
      return false;
    }
    await supabase.auth.signOut();
    return true;
  }

  const value = {
    session, authLoading, loading, error, refresh: () => loadData(session), clearError: () => setError(null),
    showAuthSuccess,
    vehicles, getVehicleById, getVehicleAvailability, getVehicleReviews, getVehicleTracking, getDriverDashboard,
    addTrackingLocation, refreshTrackingLocations, removeTrackingLocations,
    bookings, addBooking, cancelBooking, favorites, favoriteVehicles, toggleFavorite, isFavorite,
    filters, updateFilters, filteredVehicles, conversations, sendMessage, markConversationRead,
    startVehicleConversation, reportVehicleListing,
    notifications, markAllNotificationsRead, unreadNotifications: notifications.filter((item) => !item.read_at).length,
    unreadMessages: conversations.reduce((sum, item) => sum + item.unread, 0), user, updateUser, refreshProfile, uploadAvatar,
    notificationSettings, updateNotificationSettings, appSettings, updateAppSettings, paymentMethods, addPaymentMethod, removePaymentMethod,
    setDefaultPaymentMethod, savedLocations, addSavedLocation, removeSavedLocation, postedJobs, addPostedJob,
    addVehicleListing, updateVehicleStatus, setVehicleMapPin, bookingDraft, setBookingDraft, signOut, deleteAccount,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <AuthSuccessOverlay notice={authSuccess} />
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

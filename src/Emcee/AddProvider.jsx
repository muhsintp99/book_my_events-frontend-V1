import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  Chip,
  OutlinedInput
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getApiImageUrl } from '../utils/apiImageUtils';

function AddEmcee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(true);

  const activeModuleId = localStorage.getItem('moduleDbId');

  /* ---------------- BANK DETAILS (NEW) ---------------- */
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    accountType: 'savings',
    upiId: ''
  });

  const handleBankChange = (field) => (e) => {
    setBankDetails({ ...bankDetails, [field]: e.target.value });
  };
  // Subscription & free trial state
  const [plansLoading, setPlansLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState('');
  const [isFreeTrial, setIsFreeTrial] = useState(false);

  // Google Maps refs and state
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [map, setMap] = useState(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAfLUm1kPmeMkHh1Hr5nbgNpQJOsNa7B78';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    storeName: '',
    storeAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      fullAddress: ''
    },
    minimumDeliveryTime: '',
    maximumDeliveryTime: '',
    zone: '',
    module: activeModuleId || '',
    latitude: '',
    longitude: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerPhone: '',
    ownerEmail: '',
    status: 'pending',
    reviewedBy: '',
    reviewedAt: '',
    rejectionReason: '',
    adminNotes: '',
    isActive: true,
    approvedProvider: '',
    services: [],
    specialised: '',
    startingPrice: '',
    minBookingPrice: '',
    vendorType: 'individual',
    maxBookings: ''
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [zones, setZones] = useState([]);
  const [modules, setModules] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [files, setFiles] = useState({
    logo: null,
    coverImage: null
  });

  const [selectedMultiZones, setSelectedMultiZones] = useState([]);

  // Check if current module supports multi-zone
  const isMultiZoneModule = () => {
    if (!formData.module || !allModules.length) return false;
    const mod = allModules.find((m) => m._id === formData.module);
    if (!mod) return false;
    const title = (mod.title || '').toLowerCase();
    // Exclude venues (auditorium)
    return !title.includes('venue') && !title.includes('auditorium');
  };

  const handleMultiZoneChange = (event) => {
    const value = event.target.value;
    setSelectedMultiZones(typeof value === 'string' ? value.split(',') : value);
  };

  const handleRemoveMultiZone = (zoneIdToRemove) => {
    setSelectedMultiZones((prev) => prev.filter((id) => id !== zoneIdToRemove));
  };

  // API_BASE_URL is now imported from apiImageUtils

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      if (!formData.module) {
        setPlans([]);
        setPlansLoading(false);
        return;
      }

      try {
        setPlansLoading(true);
        const res = await fetch(`${API_BASE_URL}/subscription/plan/module/${formData.module}`);
        const data = await res.json();

        if (data && data.success && Array.isArray(data.plans)) {
          setPlans(data.plans);
        } else if (Array.isArray(data)) {
          setPlans(data);
        } else if (data && Array.isArray(data.data)) {
          setPlans(data.data);
        } else {
          setPlans([]);
        }
      } catch (err) {
        console.error('Error fetching plans', err);
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, [formData.module]);

  // Fetch categories for the module
  useEffect(() => {
    const fetchCategories = async () => {
      if (!formData.module) return;
      try {
        setCategoriesLoading(true);

        // Fetch directly from the secondary module — it has its own categories array
        const res = await fetch(`${API_BASE_URL}/secondary-modules/${formData.module}`);
        const data = await res.json();

        // SecondaryModule has populated categories array
        const moduleData = data.module || data.data || data;
        const sourceCats = Array.isArray(moduleData?.categories)
          ? moduleData.categories
          : [];

        const normalized = sourceCats.map((c) => ({
          ...c,
          _id: c._id?.$oid || c._id
        }));

        setCategories(normalized);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [formData.module]);

  // Fetch vendor data when editing
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchVendorData(id);
    }
  }, [id]);

  const fetchVendorData = async (vendorId) => {
    try {
      setLoading(true);
      // We use the admin details endpoint to get everything
      const response = await fetch(`${API_BASE_URL}/profile/admin/vendor/${vendorId}/details`);
      const result = await response.json();

      if (!result.success) throw new Error(result.message || 'Failed to fetch');

      const { user, profile, vendorProfile } = result.data.profile;
      setProfileId(profile?._id || null);

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        storeName: vendorProfile?.storeName || profile?.vendorName || '',
        storeAddress: vendorProfile?.storeAddress ||
          profile?.storeAddress || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          fullAddress: profile?.businessAddress || ''
        },
        minimumDeliveryTime: vendorProfile?.minimumDeliveryTime || '',
        maximumDeliveryTime: vendorProfile?.maximumDeliveryTime || '',
        zone: vendorProfile?.zone?._id?.$oid || vendorProfile?.zone?._id || vendorProfile?.zone || '',
        module:
          vendorProfile?.module?._id?.$oid ||
          vendorProfile?.module?._id ||
          vendorProfile?.module ||
          activeModuleId ||
          '',
        latitude: vendorProfile?.latitude || profile?.latitude || '',
        longitude: vendorProfile?.longitude || profile?.longitude || '',
        ownerFirstName: vendorProfile?.ownerFirstName || '',
        ownerLastName: vendorProfile?.ownerLastName || '',
        ownerPhone: vendorProfile?.ownerPhone || '',
        ownerEmail: vendorProfile?.ownerEmail || '',
        status: vendorProfile?.status || 'pending',
        reviewedBy: vendorProfile?.reviewedBy || '',
        reviewedAt: vendorProfile?.reviewedAt || '',
        rejectionReason: vendorProfile?.rejectionReason || '',
        adminNotes: vendorProfile?.adminNotes || '',
        isActive: vendorProfile?.isActive !== undefined ? vendorProfile.isActive : true,
        approvedProvider: vendorProfile?.approvedProvider || '',
        services: (vendorProfile?.services || []).map((s) => s._id?.$oid || s._id || s),
        specialised:
          vendorProfile?.specialised?._id?.$oid ||
          vendorProfile?.specialised?._id ||
          vendorProfile?.specialised ||
          '',
        startingPrice: vendorProfile?.startingPrice || '',
        minBookingPrice: vendorProfile?.minBookingPrice || '',
        vendorType: vendorProfile?.vendorType || 'individual',
        maxBookings: vendorProfile?.maxBookings || ''
      });

      if (profile?.bankDetails) {
        setBankDetails({
          ...bankDetails,
          ...profile.bankDetails
        });
      }

      const logo = vendorProfile?.logo || profile?.profilePhoto || user?.profilePhoto;
      if (logo) setLogoPreview(getApiImageUrl(logo));

      const cover = vendorProfile?.coverImage;
      if (cover) setCoverPreview(getApiImageUrl(cover));

      if (vendorProfile?.zone?._id || vendorProfile?.zone) {
        setSelectedZone(vendorProfile.zone?._id || vendorProfile.zone);
      }

      setIsFreeTrial(user.isFreeTrial || false);
      if (user.subscriptionPlan) setSubscriptionPlan(user.subscriptionPlan._id || user.subscriptionPlan);

      if (vendorProfile?.zones && Array.isArray(vendorProfile.zones)) {
        const multiZoneIds = vendorProfile.zones
          .map(z => z._id?.$oid || z._id || z)
          .filter(id => id !== (vendorProfile?.zone?._id?.$oid || vendorProfile?.zone?._id || vendorProfile?.zone?.$oid || vendorProfile?.zone));
        setSelectedMultiZones(multiZoneIds);
      }

      showAlert('Provider data loaded successfully', 'success');
    } catch (err) {
      console.error('Error fetching vendor:', err);
      showAlert('Failed to load provider data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not provided');
      showAlert('Google Maps API key is required for map features.', 'warning');
      return;
    }
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [GOOGLE_MAPS_API_KEY]);

  // Init map
  useEffect(() => {
    if (mapsLoaded && window.google?.maps) initMap();
  }, [mapsLoaded]);

  const initMap = useCallback(() => {
    if (!window.google || !mapRef.current || !mapsLoaded) return;

    const centerLat = formData.latitude && formData.longitude ? parseFloat(formData.latitude) : 25.2048;
    const centerLng = formData.latitude && formData.longitude ? parseFloat(formData.longitude) : 55.2708;
    const center = { lat: centerLat, lng: centerLng };

    const newMap = new window.google.maps.Map(mapRef.current, { zoom: 12, center });

    newMap.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setFormData((prev) => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));

      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new window.google.maps.Marker({ position: { lat, lng }, map: newMap });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].address_components || [];

          const get = (type) => {
            const item = address.find((a) => a.types.includes(type));
            return item ? item.long_name : '';
          };

          setFormData((prev) => ({
            ...prev,
            storeAddress: {
              street: get('route'),
              city: get('locality') || get('administrative_area_level_2') || '',
              state: get('administrative_area_level_1') || '',
              zipCode: get('postal_code') || '',
              fullAddress: results[0].formatted_address || ''
            },
            latitude: lat.toString(),
            longitude: lng.toString()
          }));

          showAlert('Location set and address auto-filled!', 'success');
        } else {
          showAlert('Location set, but could not determine address.', 'info');
        }
      });
    });

    setMap(newMap);
  }, [mapsLoaded, formData.latitude, formData.longitude]);

  // Autocomplete for search input
  useEffect(() => {
    if (!mapsLoaded || !map || !searchInputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      const loc = place.geometry.location;
      if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
      else {
        map.setCenter(loc);
        map.setZoom(17);
      }

      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new window.google.maps.Marker({ position: loc, map });

      const address = place.address_components || [];

      const get = (type) => {
        const item = address.find((a) => a.types.includes(type));
        return item ? item.long_name : '';
      };

      setFormData((prev) => ({
        ...prev,
        latitude: loc.lat().toString(),
        longitude: loc.lng().toString(),
        storeAddress: {
          street: get('route') || '',
          city: get('locality') || get('administrative_area_level_2') || '',
          state: get('administrative_area_level_1') || '',
          zipCode: get('postal_code') || '',
          fullAddress: place.formatted_address || place.name || ''
        }
      }));
      showAlert('Location selected!', 'success');
    });

    return () => {
      if (listener && listener.remove) listener.remove();
    };
  }, [mapsLoaded, map]);

  // Update marker when lat/lng change
  useEffect(() => {
    if (!map || !formData.latitude || !formData.longitude) return;
    const pos = { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) };
    map.setCenter(pos);
    map.setZoom(12);
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({ position: pos, map });
    } else {
      markerRef.current.setPosition(pos);
    }
  }, [formData.latitude, formData.longitude, map]);

  // Fetch zones & modules
  useEffect(() => {
    fetchZones();
    fetchModules();
  }, []);

  const fetchZones = async () => {
    try {
      setZonesLoading(true);
      const res = await fetch(`${API_BASE_URL}/zones`);
      const data = await res.json();
      const zoneList = data.data || data || [];
      const normalized = Array.isArray(zoneList)
        ? zoneList.map((z) => ({
          ...z,
          _id: z._id?.$oid || z._id
        }))
        : [];
      setZones(normalized);
    } catch (err) {
      console.error('Error fetching zones', err);
      showAlert('Error fetching zones', 'error');
      setZones([]);
    } finally {
      setZonesLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      setModulesLoading(true);

      const [modRes, secModRes] = await Promise.all([
        fetch(`${API_BASE_URL}/modules`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/secondary-modules`)
          .then((r) => r.json())
          .catch(() => [])
      ]);

      const mainModules = Array.isArray(modRes) ? modRes : modRes.data || [];
      const secModules = Array.isArray(secModRes) ? secModRes : secModRes.data || [];

      // Normalize IDs and combine
      const combined = [...mainModules, ...secModules].map((m) => ({
        ...m,
        _id: m._id?.$oid || m._id
      }));

      setAllModules(combined);

      const filtered = activeModuleId ? combined.filter((m) => m._id === activeModuleId) : combined;

      setModules(filtered);

      if (activeModuleId && filtered.length) {
        setFormData((prev) => ({
          ...prev,
          module: activeModuleId
        }));
      } else if (!activeModuleId || filtered.length === 0) {
        // Fallback: try to find Mehandi module by name
        const emceeMod = combined.find(
          (m) => (m.title || '').toLowerCase().includes('emcee')
        );
        if (emceeMod) {
          setFormData((prev) => ({ ...prev, module: emceeMod._id }));
          setModules([emceeMod]);
        }
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
      setModules([]);
      setAllModules([]);
    } finally {
      setModulesLoading(false);
    }
  };
  const showAlert = (msg, severity = 'success') => {
    setAlertMessage(msg);
    setAlertSeverity(severity);
    setOpen(true);
  };

  const handleInputChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });
  const handleAddressChange = (sub) => (e) =>
    setFormData({
      ...formData,
      storeAddress: { ...formData.storeAddress, [sub]: e.target.value }
    });
  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);
    setFormData({ ...formData, zone: zoneId });
  };
  const handleModuleChange = (e) => setFormData({ ...formData, module: e.target.value });

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles({ ...files, [type]: file });
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (type === 'logo') setLogoPreview(ev.target.result);
      if (type === 'coverImage') setCoverPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errs = [];
    if (!formData.firstName.trim()) errs.push('First name is required');
    if (!formData.lastName.trim()) errs.push('Last name is required');
    if (!formData.email.trim()) errs.push('Email is required');
    if (!formData.ownerFirstName.trim()) errs.push('Owner first name is required');
    if (!formData.ownerLastName.trim()) errs.push('Owner last name is required');
    if (!formData.ownerEmail.trim()) errs.push('Owner email is required');
    if (formData.ownerEmail && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.ownerEmail)) errs.push('Owner email is invalid');
    if (!formData.module) errs.push('Module is required');
    if (!isFreeTrial && !subscriptionPlan) errs.push('Subscription plan is required (or enable Free Trial)');
    return errs;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length) {
      showAlert(errors.join(', '), 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();

      // Basic info
      payload.append('firstName', formData.firstName);
      payload.append('lastName', formData.lastName);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('role', 'vendor');
      payload.append('storeName', formData.storeName);

      // ---------------- BANK DETAILS ----------------
      payload.append('accountHolderName', bankDetails.accountHolderName);
      payload.append('bankName', bankDetails.bankName);
      payload.append('accountNumber', bankDetails.accountNumber);
      payload.append('ifscCode', bankDetails.ifscCode);
      payload.append('branchName', bankDetails.branchName);
      payload.append('upiId', bankDetails.upiId);
      payload.append('accountType', bankDetails.accountType);

      // Address
      // payload.append('storeAddress[street]', formData.storeAddress.street);
      // payload.append('storeAddress[city]', formData.storeAddress.city);
      // payload.append('storeAddress[state]', formData.storeAddress.state);
      // payload.append('storeAddress[zipCode]', formData.storeAddress.zipCode);
      // payload.append('storeAddress[fullAddress]', formData.storeAddress.fullAddress);
      payload.append('storeAddress', JSON.stringify(formData.storeAddress));

      // Other fields
      payload.append('minimumDeliveryTime', formData.minimumDeliveryTime);
      payload.append('maximumDeliveryTime', formData.maximumDeliveryTime);
      payload.append('latitude', formData.latitude);
      payload.append('longitude', formData.longitude);
      payload.append('ownerFirstName', formData.ownerFirstName);
      payload.append('ownerLastName', formData.ownerLastName);
      payload.append('ownerPhone', formData.ownerPhone);
      payload.append('ownerEmail', formData.ownerEmail);
      payload.append('module', formData.module);
      payload.append('zone', formData.zone);

      // Send multi-zones for eligible modules
      if (isMultiZoneModule() && selectedMultiZones.length > 0) {
        const allZones = [formData.zone, ...selectedMultiZones.filter(z => z !== formData.zone)].filter(Boolean);
        payload.append('zones', allZones.join(','));
      }
      payload.append('status', formData.status);
      payload.append('reviewedBy', formData.reviewedBy);
      payload.append('reviewedAt', formData.reviewedAt);
      payload.append('rejectionReason', formData.rejectionReason);
      payload.append('adminNotes', formData.adminNotes);
      payload.append('isActive', formData.isActive);
      payload.append('approvedProvider', formData.approvedProvider);

      // Emcee specific fields
      payload.append('services', JSON.stringify(formData.services));
      payload.append('specialised', formData.specialised);
      payload.append('startingPrice', formData.startingPrice);
      payload.append('minBookingPrice', formData.minBookingPrice);
      payload.append('vendorType', formData.vendorType);
      payload.append('maxBookings', formData.maxBookings);

      // Subscription info
      payload.append('isFreeTrial', isFreeTrial);
      if (!isFreeTrial && subscriptionPlan) {
        payload.append('subscriptionPlan', subscriptionPlan);
      }

      // Files
      if (files.logo) payload.append('logo', files.logo);
      if (files.coverImage) payload.append('coverImage', files.coverImage);

      if (isEditMode) {
        // Update logic (Targets Profile update which also handles user if role=user,
        // but for vendor we might need to handle specific fields)
        // For simplicity and matching common pattern, we use the profile update endpoint
        // and let the backend handle the mapping.

        // Add role to payload for the backend to know how to handle it
        payload.append('role', 'vendor');

        const updateId = profileId || id; // Profile ID is better if available, else User ID

        const res = await fetch(`${API_BASE_URL}/profile/${updateId}`, {
          method: 'PUT',
          body: payload
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Update failed');

        showAlert('Provider updated successfully!', 'success');
        setTimeout(() => {
          navigate('/emcee/emceeprovider');
        }, 2000);
        return;
      }

      // Register provider
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: payload
      });

      let result;
      try {
        result = await res.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        showAlert('Invalid response from server', 'error');
        setLoading(false);
        return;
      }

      console.log('=== REGISTRATION RESPONSE ===');
      console.log('Status:', res.status);
      console.log('Response:', JSON.stringify(result, null, 2));
      console.log('============================');

      if (!res.ok) {
        showAlert(result.message || 'Failed to add provider', 'error');
        setLoading(false);
        return;
      }

      // Extract provider ID from response
      const providerId =
        result.providerId ||
        result.userId ||
        result._id ||
        result.id ||
        (result.data && (result.data.providerId || result.data._id)) ||
        (result.user && (result.user._id || result.user.id));

      console.log('Extracted providerId:', providerId);

      if (isFreeTrial) {
        showAlert('Provider added successfully with Free Trial!', 'success');
        setTimeout(() => {
          handleReset();
        }, 2000);
        setLoading(false);
        return;
      }

      // Paid plan: Create payment session
      if (!providerId) {
        console.error('=== PROVIDER ID NOT FOUND ===');
        console.error('Full response:', JSON.stringify(result, null, 2));
        console.error('============================');

        // Show detailed error with the actual response structure
        const responsePreview = JSON.stringify(result).substring(0, 200);
        showAlert(
          `Provider created but ID not found in response. Check console for details. Response preview: ${responsePreview}...`,
          'error'
        );

        // Still reset form so user can try again
        setTimeout(() => {
          handleReset();
        }, 5000);

        setLoading(false);
        return;
      }

      // Get selected plan details
      const selectedPlanDetails = plans.find((p) => (p._id || p.id) === subscriptionPlan);
      const amount = selectedPlanDetails ? selectedPlanDetails.price || selectedPlanDetails.amount || 0 : 0;

      // Create payment session
      const paymentRes = await fetch(`${API_BASE_URL}/payment/create-subscription-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          providerId: providerId,
          planId: subscriptionPlan,
          amount: amount,
          customerEmail: formData.email,
          customerPhone: formData.phone || '9999999999'
        })
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        showAlert('Provider created but payment session failed: ' + (paymentData.message || 'Unknown error'), 'error');
        setLoading(false);
        return;
      }

      // Redirect to payment page
      if (paymentData.success && paymentData.payment_links && paymentData.payment_links.web) {
        showAlert('Redirecting to payment page...', 'info');

        // Store necessary data in localStorage for return handling
        localStorage.setItem(
          'pendingPayment',
          JSON.stringify({
            providerId: providerId,
            planId: subscriptionPlan,
            orderId: paymentData.order_id,
            sessionId: paymentData.id
          })
        );

        // Redirect to SmartGateway payment page
        setTimeout(() => {
          window.location.href = paymentData.payment_links.web;
        }, 1500);
      } else {
        showAlert('Payment link not available. Please contact admin.', 'error');
      }
    } catch (err) {
      console.error('Error:', err);
      showAlert('Error processing request: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Find Emcee module ID from allModules
    const emceeMod = (allModules || []).find(
      (m) => (m.title || '').toLowerCase().includes('emcee')
    );

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      storeName: '',
      storeAddress: { street: '', city: '', state: '', zipCode: '', fullAddress: '' },
      minimumDeliveryTime: '',
      maximumDeliveryTime: '',
      zone: '',
      module: emceeMod ? emceeMod._id : activeModuleId || '',
      latitude: '',
      longitude: '',
      ownerFirstName: '',
      ownerLastName: '',
      ownerPhone: '',
      ownerEmail: '',
      status: 'pending',
      reviewedBy: '',
      reviewedAt: '',
      rejectionReason: '',
      adminNotes: '',
      isActive: true,
      approvedProvider: '',
      services: [],
      specialised: '',
      startingPrice: '',
      minBookingPrice: '',
      vendorType: 'individual',
      maxBookings: ''
    });
    setSelectedZone('');
    setSelectedMultiZones([]);
    setLogoPreview(null);
    setCoverPreview(null);
    setFiles({ logo: null, coverImage: null });
    setSubscriptionPlan('');
    setIsFreeTrial(false);
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  };

  const getSelectedModuleName = () => {
    if (modulesLoading) return 'Loading...';
    if (!formData.module) return 'No module selected';
    const mod = allModules.find((m) => m._id === formData.module);
    return mod ? mod.title : 'Unknown module';
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E15B65' },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#E15B65' }
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        {isEditMode ? 'Edit Emcee Provider' : 'Add Emcee Provider'}
      </Typography>

      {/* Store Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Store Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Vendor Type</InputLabel>
            <Select
              label="Vendor Type"
              value={formData.vendorType}
              onChange={handleInputChange('vendorType')}
            >
              <MenuItem value="individual">Individual</MenuItem>
              <MenuItem value="company">Company</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Maximum Bookings Per Day"
            name="maxBookings"
            type="number"
            variant="outlined"
            value={formData.maxBookings}
            onChange={handleInputChange('maxBookings')}
            placeholder="No limit if empty"
          />
        </Box>

        <TextField
          fullWidth
          label="Store Name"
          variant="outlined"
          value={formData.storeName}
          onChange={handleInputChange('storeName')}
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Logo */}
      {logoPreview && (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Selected Logo:
          </Typography>
          <img src={logoPreview} alt="Logo" style={{ maxWidth: '100px', maxHeight: '200px', objectFit: 'contain' }} />
        </Box>
      )}
      <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', mb: 2 }}>
        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ width: '100%' }}>
          {logoPreview ? 'Change Logo' : 'Upload Logo'}
          <input type="file" hidden accept="image/jpeg,image/png" onChange={(e) => handleImageUpload(e, 'logo')} />
        </Button>
      </Box>

      {/* Cover */}
      {coverPreview && (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Selected Cover:
          </Typography>
          <img src={coverPreview} alt="Cover" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
        </Box>
      )}
      <Box sx={{ border: '1px dashed grey', p: 2, textAlign: 'center', mb: 2 }}>
        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ width: '100%' }}>
          {coverPreview ? 'Change Cover' : 'Upload Cover'}
          <input type="file" hidden accept="image/jpeg,image/png" onChange={(e) => handleImageUpload(e, 'coverImage')} />
        </Button>
      </Box>

      {/* User Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          User Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="First Name *"
            required
            variant="outlined"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
          />
          <TextField
            fullWidth
            label="Last Name *"
            required
            variant="outlined"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
          />
        </Box>
        <TextField
          fullWidth
          label="Email *"
          required
          variant="outlined"
          value={formData.email}
          onChange={handleInputChange('email')}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Mobile Number"
          variant="outlined"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          placeholder="Enter mobile number"
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Mehandi Specific Fields */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fff' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Emcee Specialisation & Services
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Services (Multi-selection) *</InputLabel>
          <Select
            multiple
            value={formData.services}
            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
            label="Select Services (Multi-selection) *"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const cat = categories.find((c) => (c._id || c.id) === value);
                  return <Chip key={value} label={cat ? cat.title || cat.name : value} />;
                })}
              </Box>
            )}
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.title || cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Specialised (Single selection) *</InputLabel>
          <Select value={formData.specialised} onChange={handleInputChange('specialised')} label="Specialised (Single selection) *">
            {categories.map((cat) => (
              <MenuItem key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.title || cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Starting Price (Default Price) *"
            type="number"
            value={formData.startingPrice}
            onChange={handleInputChange('startingPrice')}
          />
          <TextField
            fullWidth
            label="Minimum Price for Booking *"
            type="number"
            value={formData.minBookingPrice}
            onChange={handleInputChange('minBookingPrice')}
          />
        </Box>
      </Box>

      {/* Location */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Location
        </Typography>

        {/* Module */}
        <Box sx={{ mb: 2 }}>
          {modulesLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading modules...</Typography>
            </Box>
          ) : modules.length ? (
            <FormControl fullWidth variant="outlined">
              <InputLabel id="module-select-label">Module *</InputLabel>
              <Select
                labelId="module-select-label"
                value={formData.module}
                onChange={handleModuleChange}
                label="Module *"
                disabled={modules.length === 1}
              >
                {modules.map((m) => (
                  <MenuItem key={m._id} value={m._id}>
                    {m.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Alert severity="warning">No modules available. Please configure modules first.</Alert>
          )}
          {formData.module && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="body2" color="primary">
                Selected Module: <strong>{getSelectedModuleName()}</strong>
              </Typography>
            </Box>
          )}
        </Box>

        {/* Zone */}
        <Box sx={{ mb: 2 }}>
          {zonesLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading zones...</Typography>
            </Box>
          ) : zones.length ? (
            <FormControl fullWidth variant="outlined">
              <InputLabel id="zone-select-label">Zone</InputLabel>
              <Select labelId="zone-select-label" value={selectedZone} onChange={handleZoneChange} label="Zone">
                <MenuItem value="">
                  <em>Select Zone</em>
                </MenuItem>
                {zones.map((z) => (
                  <MenuItem key={z._id} value={z._id}>
                    {z.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Alert severity="info">No zones available</Alert>
          )}
        </Box>

        {/* Multi-Zone (supported for all except Venues) */}
        {isMultiZoneModule() && zones.length > 0 && (
          <Box sx={{
            mb: 2,
            p: 2.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea0a 0%, #764ba20a 100%)',
            border: '1px solid #e0e7ff',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              borderRadius: '2px 2px 0 0'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#4338ca' }}>
                🌐 Additional Zones
              </Typography>
              <Chip
                label={`${selectedMultiZones.length} selected`}
                size="small"
                sx={{
                  bgcolor: selectedMultiZones.length > 0 ? '#667eea' : '#e0e7ff',
                  color: selectedMultiZones.length > 0 ? '#fff' : '#4338ca',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#6366f1', mb: 1.5, display: 'block' }}>
              Select additional zones where this provider will be listed
            </Typography>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="multi-zone-label">Select Additional Zones</InputLabel>
              <Select
                labelId="multi-zone-label"
                multiple
                value={selectedMultiZones}
                onChange={handleMultiZoneChange}
                input={<OutlinedInput label="Select Additional Zones" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((zoneId) => {
                      const zone = zones.find(z => (z._id?.$oid || z._id) === zoneId);
                      return (
                        <Chip
                          key={zoneId}
                          label={zone ? zone.name : zoneId}
                          size="small"
                          onDelete={() => handleRemoveMultiZone(zoneId)}
                          onMouseDown={(e) => e.stopPropagation()}
                          sx={{
                            bgcolor: '#667eea',
                            color: '#fff',
                            fontWeight: 500,
                            '& .MuiChip-deleteIcon': { color: '#fff', '&:hover': { color: '#fecaca' } }
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                sx={{
                  bgcolor: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c7d2fe' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }
                }}
              >
                {zones
                  .filter(z => (z._id?.$oid || z._id) !== selectedZone)
                  .map((z) => (
                    <MenuItem
                      key={z._id?.$oid || z._id}
                      value={z._id?.$oid || z._id}
                      sx={{
                        fontWeight: selectedMultiZones.includes(z._id?.$oid || z._id) ? 600 : 400,
                        bgcolor: selectedMultiZones.includes(z._id?.$oid || z._id) ? '#eef2ff' : 'transparent'
                      }}
                    >
                      {z.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Address fields */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Street"
            variant="outlined"
            value={formData.storeAddress.street}
            onChange={handleAddressChange('street')}
          />
          <TextField fullWidth label="City" variant="outlined" value={formData.storeAddress.city} onChange={handleAddressChange('city')} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="State"
            variant="outlined"
            value={formData.storeAddress.state}
            onChange={handleAddressChange('state')}
          />
          <TextField
            fullWidth
            label="Zip Code"
            variant="outlined"
            value={formData.storeAddress.zipCode}
            onChange={handleAddressChange('zipCode')}
          />
        </Box>
        <TextField
          fullWidth
          label="Full Address"
          variant="outlined"
          value={formData.storeAddress.fullAddress}
          onChange={handleAddressChange('fullAddress')}
          sx={{ mb: 2 }}
        />

        {/* Search */}
        <TextField
          fullWidth
          label="Search Location"
          inputRef={searchInputRef}
          variant="outlined"
          placeholder="Enter a location"
          sx={{ mb: 2, ...inputSx }}
        />

        {/* Map */}
        {mapsLoaded && GOOGLE_MAPS_API_KEY ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Click on the map below to select a location
            </Typography>
            <Box ref={mapRef} sx={{ height: 300, width: '100%', borderRadius: 1, border: '1px solid #ddd', mb: 2 }} />
          </>
        ) : (
          <Box
            sx={{
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ddd',
              borderRadius: 1,
              mb: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Map loading...
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Latitude"
            type="number"
            inputProps={{ step: '0.0001' }}
            value={formData.latitude}
            onChange={handleInputChange('latitude')}
          />
          <TextField
            fullWidth
            label="Longitude"
            type="number"
            inputProps={{ step: '0.0001' }}
            value={formData.longitude}
            onChange={handleInputChange('longitude')}
          />
        </Box>
      </Box>

      {/* Owner Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Owner Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Owner First Name *"
            required
            variant="outlined"
            value={formData.ownerFirstName}
            onChange={handleInputChange('ownerFirstName')}
          />
          <TextField
            fullWidth
            label="Owner Last Name *"
            required
            variant="outlined"
            value={formData.ownerLastName}
            onChange={handleInputChange('ownerLastName')}
          />
        </Box>
        <TextField
          fullWidth
          label="Owner Email *"
          required
          variant="outlined"
          value={formData.ownerEmail}
          onChange={handleInputChange('ownerEmail')}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Owner Phone"
          variant="outlined"
          value={formData.ownerPhone}
          onChange={handleInputChange('ownerPhone')}
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Subscription Information */}
      <Box sx={{ mb: 3, mt: 4, p: 2, borderRadius: 2, border: '1px solid #ddd', background: '#fafafa' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Subscription Information
        </Typography>

        {/* FREE TRIAL TOGGLE */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={isFreeTrial}
                onChange={(e) => {
                  setIsFreeTrial(e.target.checked);
                  if (e.target.checked) setSubscriptionPlan('');
                }}
              />
            }
            label="Enable Free Trial (No Payment Required)"
          />
        </Box>

        {/* PLAN SECTION - HIDE IF FREE TRIAL */}
        {!isFreeTrial && (
          <>
            {plansLoading ? (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <CircularProgress size={20} />
                <Typography>Loading plans...</Typography>
              </Box>
            ) : plans.length > 0 ? (
              <FormControl fullWidth>
                <InputLabel>Subscription Plan *</InputLabel>
                <Select label="Subscription Plan *" value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value)}>
                  <MenuItem value="">
                    <em>Select Subscription Plan</em>
                  </MenuItem>
                  {plans.map((p) => (
                    <MenuItem key={p._id || p.id} value={p._id || p.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ fontWeight: 'bold' }}>{p.name || p.title}</Typography>
                        <Typography sx={{ fontSize: '14px', color: '#555' }}>
                          Price: ₹{p.price ?? p.amount ?? 0} / {p.duration || 'month'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="info">No subscription plans available for this module</Alert>
            )}
          </>
        )}

        {isFreeTrial && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Free trial enabled. Provider will have limited access until subscription is purchased.
          </Alert>
        )}
      </Box>

      {/* BANK DETAILS */}
      <Box
        sx={{
          mb: 3,
          mt: 4,
          p: 2,
          borderRadius: 2,
          border: '1px solid #ddd',
          background: '#fafafa'
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Bank Details
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Please provide correct bank details. These details will be used for vendor settlements and payouts.
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Account Holder Name"
            value={bankDetails.accountHolderName}
            onChange={handleBankChange('accountHolderName')}
          />
          <TextField fullWidth label="Bank Name" value={bankDetails.bankName} onChange={handleBankChange('bankName')} />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField fullWidth label="Account Number" value={bankDetails.accountNumber} onChange={handleBankChange('accountNumber')} />
          <TextField fullWidth label="IFSC Code" value={bankDetails.ifscCode} onChange={handleBankChange('ifscCode')} />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField fullWidth label="Branch Name" value={bankDetails.branchName} onChange={handleBankChange('branchName')} />
          <TextField fullWidth label="UPI ID" value={bankDetails.upiId} onChange={handleBankChange('upiId')} />
        </Box>
      </Box>

      {/* Buttons */}
      <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={handleReset} disabled={loading}>
          Reset
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Processing...' : isEditMode ? 'Update' : isFreeTrial ? 'Submit' : 'Proceed to Payment'}
        </Button>
      </Box>

      <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AddEmcee;

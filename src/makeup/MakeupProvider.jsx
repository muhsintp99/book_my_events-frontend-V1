
// // AddAuditorium.jsx  (FINAL UPDATED VERSION)
// // ---------------------------------------------------------
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Select,
//   MenuItem,
//   Snackbar,
//   Alert,
//   CircularProgress,
//   InputLabel,
//   FormControl,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
// } from "@mui/material";
// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
// import { useParams, useNavigate } from 'react-router-dom';

// function AddAuditorium() {
//   const { id } = useParams(); // Get the ID from URL
//   const navigate = useNavigate();
//   const [isEditMode, setIsEditMode] = useState(false);
  
//   const [open, setOpen] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
//   const [alertSeverity, setAlertSeverity] = useState("success");
//   const [loading, setLoading] = useState(false);
//   const [zonesLoading, setZonesLoading] = useState(true);
//   const [modulesLoading, setModulesLoading] = useState(true);

//   const activeModuleId = localStorage.getItem("moduleDbId");

//   const mapRef = useRef(null);
//   const markerRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const [mapsLoaded, setMapsLoaded] = useState(false);
//   const [map, setMap] = useState(null);

//   const GOOGLE_MAPS_API_KEY = "AIzaSyAfLUm1kPmeMkHh1Hr5nbgNpQJOsNa7B78";

//   const [formData, setFormData] = useState({
//     vendorType: "individual",
//     fullName: "",
//     storeName: "",
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     bioTitle: "",
//     bioSubtitle: "",
//     bioDescription: "",
//     storeAddress: {
//       street: "",
//       city: "",
//       state: "",
//       zipCode: "",
//       fullAddress: "",
//     },
//     zone: "",
//     module: activeModuleId || "",
//     latitude: "",
//     longitude: "",
//     ownerFirstName: "",
//     ownerLastName: "",
//     ownerPhone: "",
//     ownerEmail: "",
//     status: "pending",
//     isActive: true,
//   });

//   const [zones, setZones] = useState([]);
//   const [modules, setModules] = useState([]);
//   const [allModules, setAllModules] = useState([]);
//   const [selectedZone, setSelectedZone] = useState("");
//   const [logoPreview, setLogoPreview] = useState(null);
//   const [coverPreview, setCoverPreview] = useState(null);

//   const [files, setFiles] = useState({
//     logo: null,
//     coverImage: null,
//   });

//   const API_BASE_URL =
//     import.meta.env.MODE === "development"
//       ? "http://localhost:5000/api"
//       : "https://api.bookmyevent.ae/api";

//   // Fetch vendor data when editing
//   useEffect(() => {
//     if (id) {
//       setIsEditMode(true);
//       fetchVendorData(id);
//     }
//   }, [id]);

//   const fetchVendorData = async (vendorId) => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_BASE_URL}/users/${vendorId}`);
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch vendor data');
//       }
      
//       const data = await response.json();
//       const vendor = data.user || data;
      
//       console.log('Fetched vendor data:', vendor); // Debug log
      
//       // Determine full name - could be from storeName or combined firstName/lastName
//       const fullName = vendor.storeName || 
//                        (vendor.firstName && vendor.lastName ? `${vendor.firstName} ${vendor.lastName}` : '') ||
//                        vendor.fullName || '';
      
//       // Populate form with vendor data
//       setFormData({
//         vendorType: vendor.vendorType || 'individual',
//         fullName: fullName,
//         storeName: vendor.storeName || fullName,
//         firstName: vendor.firstName || '',
//         lastName: vendor.lastName || '',
//         email: vendor.email || '',
//         phone: vendor.phone || vendor.mobile || '',
//         bioTitle: vendor.bioTitle || vendor.bio?.title || '',
//         bioSubtitle: vendor.bioSubtitle || vendor.bio?.subtitle || '',
//         bioDescription: vendor.bioDescription || vendor.bio?.description || '',
//         storeAddress: {
//           street: vendor.storeAddress?.street || vendor.address?.street || '',
//           city: vendor.storeAddress?.city || vendor.address?.city || '',
//           state: vendor.storeAddress?.state || vendor.address?.state || '',
//           zipCode: vendor.storeAddress?.zipCode || vendor.address?.zipCode || '',
//           fullAddress: vendor.storeAddress?.fullAddress || vendor.address?.fullAddress || '',
//         },
//         zone: vendor.zone?._id || vendor.zone || '',
//         module: vendor.module?._id || vendor.module || activeModuleId || '',
//         latitude: vendor.location?.latitude || vendor.latitude || '',
//         longitude: vendor.location?.longitude || vendor.longitude || '',
//         ownerFirstName: vendor.ownerFirstName || vendor.owner?.firstName || '',
//         ownerLastName: vendor.ownerLastName || vendor.owner?.lastName || '',
//         ownerPhone: vendor.ownerPhone || vendor.owner?.phone || '',
//         ownerEmail: vendor.ownerEmail || vendor.owner?.email || '',
//         status: vendor.status || 'pending',
//         isActive: vendor.isActive !== undefined ? vendor.isActive : true,
//       });
      
//       // Set previews if images exist
//       if (vendor.logo) {
//         setLogoPreview(vendor.logo);
//       }
//       if (vendor.coverImage) {
//         setCoverPreview(vendor.coverImage);
//       }
      
//       if (vendor.zone?._id || vendor.zone) {
//         setSelectedZone(vendor.zone?._id || vendor.zone);
//       }
      
//       showAlert('Vendor data loaded successfully', 'success');
//     } catch (error) {
//       console.error('Error fetching vendor:', error);
//       showAlert('Failed to load vendor data', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----------------------------------------------------
//   // GOOGLE MAPS
//   // ----------------------------------------------------
//   useEffect(() => {
//     if (window.google && window.google.maps) {
//       setMapsLoaded(true);
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
//     script.async = true;
//     script.defer = true;
//     script.onload = () => setMapsLoaded(true);
//     document.head.appendChild(script);
//   }, []);

//   useEffect(() => {
//     if (mapsLoaded && window.google?.maps) {
//       initMap();
//     }
//   }, [mapsLoaded, formData.latitude, formData.longitude]);

//   const initMap = useCallback(() => {
//     if (!window.google || !mapRef.current) return;

//     const center = {
//       lat: formData.latitude ? parseFloat(formData.latitude) : 25.2048,
//       lng: formData.longitude ? parseFloat(formData.longitude) : 55.2708,
//     };

//     const newMap = new window.google.maps.Map(mapRef.current, {
//       zoom: 12,
//       center,
//     });

//     newMap.addListener("click", (event) => {
//       const lat = event.latLng.lat();
//       const lng = event.latLng.lng();

//       setFormData((prev) => ({
//         ...prev,
//         latitude: lat.toString(),
//         longitude: lng.toString(),
//       }));

//       if (markerRef.current) markerRef.current.setMap(null);
//       markerRef.current = new window.google.maps.Marker({
//         position: { lat, lng },
//         map: newMap,
//       });

//       // Reverse geocode to get address
//       const geocoder = new window.google.maps.Geocoder();
//       geocoder.geocode({ location: { lat, lng } }, (results, status) => {
//         if (status === "OK" && results[0]) {
//           const address = results[0].address_components || [];

//           const get = (type) => {
//             const item = address.find((a) => a.types.includes(type));
//             return item ? item.long_name : "";
//           };

//           setFormData((prev) => ({
//             ...prev,
//             storeAddress: {
//               street: get("route") || "",
//               city: get("locality") || get("administrative_area_level_2") || "",
//               state: get("administrative_area_level_1") || "",
//               zipCode: get("postal_code") || "",
//               fullAddress: results[0].formatted_address || "",
//             },
//           }));

//           showAlert("Location set and address auto-filled!", "success");
//         }
//       });
//     });

//     setMap(newMap);
//   }, [formData.latitude, formData.longitude]);

//   // ----------------------------------------------------
//   // AUTOCOMPLETE
//   // ----------------------------------------------------
//   useEffect(() => {
//     if (!map || !searchInputRef.current) return;

//     const autocomplete = new window.google.maps.places.Autocomplete(
//       searchInputRef.current,
//       { fields: ["geometry", "formatted_address", "address_components"] }
//     );

//     autocomplete.addListener("place_changed", () => {
//       const place = autocomplete.getPlace();
//       if (!place.geometry) return;

//       const loc = place.geometry.location;

//       if (markerRef.current) markerRef.current.setMap(null);

//       markerRef.current = new window.google.maps.Marker({
//         position: loc,
//         map,
//       });

//       const address = place.address_components || [];

//       const get = (type) => {
//         const item = address.find((a) => a.types.includes(type));
//         return item ? item.long_name : "";
//       };

//       setFormData((prev) => ({
//         ...prev,
//         latitude: loc.lat().toString(),
//         longitude: loc.lng().toString(),
//         storeAddress: {
//           street: get("route") || "",
//           city: get("locality") || get("administrative_area_level_2") || "",
//           state: get("administrative_area_level_1") || "",
//           zipCode: get("postal_code") || "",
//           fullAddress: place.formatted_address || "",
//         },
//       }));
      
//       showAlert("Location selected!", "success");
//     });
//   }, [map]);

//   // Update marker when lat/lng change
//   useEffect(() => {
//     if (!map || !formData.latitude || !formData.longitude) return;
//     const pos = {
//       lat: parseFloat(formData.latitude),
//       lng: parseFloat(formData.longitude),
//     };
//     map.setCenter(pos);
//     map.setZoom(12);
//     if (!markerRef.current) {
//       markerRef.current = new window.google.maps.Marker({ position: pos, map });
//     } else {
//       markerRef.current.setPosition(pos);
//     }
//   }, [formData.latitude, formData.longitude, map]);

//   // ----------------------------------------------------
//   // FETCH MODULES + ZONES
//   // ----------------------------------------------------
//   useEffect(() => {
//     fetchZones();
//     fetchModules();
//   }, []);

//   const fetchZones = async () => {
//     try {
//       setZonesLoading(true);
//       const res = await fetch(`${API_BASE_URL}/zones`);
//       const data = await res.json();
//       setZones(data.data || []);
//     } finally {
//       setZonesLoading(false);
//     }
//   };

//   const fetchModules = async () => {
//     try {
//       setModulesLoading(true);
//       const res = await fetch(`${API_BASE_URL}/modules`);
//       const data = await res.json();

//       setAllModules(data);
//       const filtered = activeModuleId
//         ? data.filter((m) => m._id === activeModuleId)
//         : data;

//       setModules(filtered);
//     } finally {
//       setModulesLoading(false);
//     }
//   };

//   // ----------------------------------------------------
//   // FORM INPUT HANDLERS
//   // ----------------------------------------------------
//   const handleInputChange = (field) => (e) =>
//     setFormData({ ...formData, [field]: e.target.value });

//   const handleAddressChange = (field) => (e) =>
//     setFormData({
//       ...formData,
//       storeAddress: { ...formData.storeAddress, [field]: e.target.value },
//     });

//   const handleZoneChange = (e) => {
//     setSelectedZone(e.target.value);
//     setFormData({ ...formData, zone: e.target.value });
//   };

//   const handleModuleChange = (e) =>
//     setFormData({ ...formData, module: e.target.value });

//   const handleVendorTypeChange = (e) =>
//     setFormData({
//       ...formData,
//       vendorType: e.target.value,
//       fullName: "",
//       storeName: "",
//     });

//   const handleImageUpload = (e, type) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setFiles((prev) => ({ ...prev, [type]: file }));

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       if (type === "logo") setLogoPreview(event.target.result);
//       if (type === "coverImage") setCoverPreview(event.target.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   // ----------------------------------------------------
//   // VALIDATE FORM
//   // ----------------------------------------------------
//   const validateForm = () => {
//     const errors = [];

//     if (formData.vendorType === "individual" && !formData.fullName)
//       errors.push("Full name is required");

//     if (formData.vendorType === "company" && !formData.storeName)
//       errors.push("Store name is required");

//     if (!formData.firstName) errors.push("First name is required");
//     if (!formData.lastName) errors.push("Last name is required");
//     if (!formData.email) errors.push("Email is required");
//     if (!formData.module) errors.push("Module is required");

//     return errors;
//   };

//   // ----------------------------------------------------
//   // SUBMIT HANDLER
//   // ----------------------------------------------------
//   const handleSubmit = async () => {
//     const errors = validateForm();
//     if (errors.length) return showAlert(errors.join(", "), "error");

//     try {
//       setLoading(true);

//       const payload = new FormData();

//       payload.append("role", "vendor");
//       payload.append("vendorType", formData.vendorType);
//       payload.append("firstName", formData.firstName);
//       payload.append("lastName", formData.lastName);
//       payload.append("email", formData.email);
//       payload.append("phone", formData.phone);

//       // BIO FIELDS
//       payload.append("bioTitle", formData.bioTitle);
//       payload.append("bioSubtitle", formData.bioSubtitle);
//       payload.append("bioDescription", formData.bioDescription);

//       const storeName =
//         formData.vendorType === "individual"
//           ? formData.fullName
//           : formData.storeName;
//       payload.append("storeName", storeName);

//       payload.append("storeAddress[street]", formData.storeAddress.street);
//       payload.append("storeAddress[city]", formData.storeAddress.city);
//       payload.append("storeAddress[state]", formData.storeAddress.state);
//       payload.append("storeAddress[zipCode]", formData.storeAddress.zipCode);
//       payload.append("storeAddress[fullAddress]", formData.storeAddress.fullAddress);

//       payload.append("latitude", formData.latitude);
//       payload.append("longitude", formData.longitude);

//       payload.append("module", formData.module);
//       payload.append("zone", formData.zone);

//       payload.append("ownerFirstName", formData.ownerFirstName);
//       payload.append("ownerLastName", formData.ownerLastName);
//       payload.append("ownerPhone", formData.ownerPhone);
//       payload.append("ownerEmail", formData.ownerEmail);

//       if (files.logo) payload.append("logo", files.logo);
//       if (files.coverImage) payload.append("coverImage", files.coverImage);

//       // Change the URL and method based on edit mode
//       const url = isEditMode 
//         ? `${API_BASE_URL}/users/${id}` 
//         : `${API_BASE_URL}/auth/register`;
      
//       const method = isEditMode ? 'PUT' : 'POST';

//       const res = await fetch(url, {
//         method: method,
//         body: payload,
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         showAlert(result.message, "error");
//       } else {
//         showAlert(
//           isEditMode 
//             ? 'Provider updated successfully!' 
//             : 'Provider added successfully!', 
//           'success'
//         );
//         console.log("Response:", result);
        
//         if (!isEditMode) {
//           handleReset();
//         } else {
//           // Optionally navigate back to the list after update
//           setTimeout(() => {
//             navigate('/makeup/CateringProvider');
//           }, 2000);
//         }
//       }
//     } catch (error) {
//       showAlert("Error saving provider", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----------------------------------------------------
//   // RESET FORM
//   // ----------------------------------------------------
//   const handleReset = () => {
//     setFormData({
//       vendorType: "individual",
//       fullName: "",
//       storeName: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       bioTitle: "",
//       bioSubtitle: "",
//       bioDescription: "",
//       storeAddress: {
//         street: "",
//         city: "",
//         state: "",
//         zipCode: "",
//         fullAddress: "",
//       },
//       zone: "",
//       module: activeModuleId || "",
//       latitude: "",
//       longitude: "",
//       ownerFirstName: "",
//       ownerLastName: "",
//       ownerPhone: "",
//       ownerEmail: "",
//       status: "pending",
//       isActive: true,
//     });

//     setSelectedZone("");
//     setLogoPreview(null);
//     setCoverPreview(null);
//     setFiles({ logo: null, coverImage: null });
    
//     if (markerRef.current) {
//       markerRef.current.setMap(null);
//       markerRef.current = null;
//     }
//   };

//   const showAlert = (msg, severity = "success") => {
//     setAlertMessage(msg);
//     setAlertSeverity(severity);
//     setOpen(true);
//   };

//   const getSelectedModuleName = () => {
//     if (!formData.module) return "No module selected";
//     const mod = allModules.find((m) => m._id === formData.module);
//     return mod ? mod.title : "Unknown module";
//   };

//   // ----------------------------------------------------
//   // UI RENDER
//   // ----------------------------------------------------
//   return (
//     <Box sx={{ p: 3, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
//       <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
//         {isEditMode ? 'Edit Provider' : 'Add Provider'}
//       </Typography>

//       {/* Vendor Type Selection */}
//       <Box
//         sx={{
//           mb: 3,
//           p: 2,
//           backgroundColor: "#fff",
//           borderRadius: 1,
//           border: "1px solid #e0e0e0",
//         }}
//       >
//         <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
//           Vendor Type
//         </Typography>

//         <RadioGroup
//           row
//           value={formData.vendorType}
//           onChange={handleVendorTypeChange}
//         >
//           <FormControlLabel
//             value="individual"
//             control={<Radio />}
//             label="Individual"
//           />
//           <FormControlLabel
//             value="company"
//             control={<Radio />}
//             label="Company"
//           />
//         </RadioGroup>
//       </Box>

//       {/* Store Info */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
//           Store Information
//         </Typography>

//         {formData.vendorType === "individual" ? (
//           <TextField
//             fullWidth
//             label="Full Name *"
//             value={formData.fullName}
//             onChange={handleInputChange("fullName")}
//             sx={{ mb: 2 }}
//           />
//         ) : (
//           <TextField
//             fullWidth
//             label="Store Name *"
//             value={formData.storeName}
//             onChange={handleInputChange("storeName")}
//             sx={{ mb: 2 }}
//           />
//         )}
//       </Box>

//       {/* Logo */}
//       {logoPreview && (
//         <Box sx={{ mb: 2 }}>
//           <Typography variant="subtitle2">Selected Logo:</Typography>
//           <img src={logoPreview} alt="Logo" style={{ width: 100 }} />
//         </Box>
//       )}
//       <Box sx={{ border: "1px dashed grey", p: 2, mb: 2 }}>
//         <Button
//           variant="outlined"
//           fullWidth
//           component="label"
//           startIcon={<CloudUploadIcon />}
//         >
//           {logoPreview ? 'Change Logo' : 'Upload Logo'}
//           <input
//             hidden
//             type="file"
//             accept="image/*"
//             onChange={(e) => handleImageUpload(e, "logo")}
//           />
//         </Button>
//       </Box>

//       {/* Cover */}
//       {coverPreview && (
//         <Box sx={{ mb: 2 }}>
//           <Typography variant="subtitle2">Selected Cover:</Typography>
//           <img
//             src={coverPreview}
//             alt="Cover"
//             style={{ width: "100%", maxHeight: 200, objectFit: "cover" }}
//           />
//         </Box>
//       )}
//       <Box sx={{ border: "1px dashed grey", p: 2, mb: 3 }}>
//         <Button
//           variant="outlined"
//           fullWidth
//           component="label"
//           startIcon={<CloudUploadIcon />}
//         >
//           {coverPreview ? 'Change Cover Image' : 'Upload Cover Image'}
//           <input
//             hidden
//             type="file"
//             accept="image/*"
//             onChange={(e) => handleImageUpload(e, "coverImage")}
//           />
//         </Button>
//       </Box>

//       {/* BIO SECTION */}
//       <Box
//         sx={{
//           mb: 3,
//           p: 2,
//           borderRadius: 1,
//           backgroundColor: "#fff",
//           border: "1px solid #e0e0e0",
//         }}
//       >
//         <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
//           Bio
//         </Typography>

//         <TextField
//           fullWidth
//           label="Bio Title"
//           placeholder="e.g. Professional Makeup Artist"
//           value={formData.bioTitle}
//           onChange={handleInputChange("bioTitle")}
//           sx={{ mb: 2 }}
//         />

//         <TextField
//           fullWidth
//           label="Bio Subtitle"
//           placeholder="e.g. Specializing in Bridal Makeup"
//           value={formData.bioSubtitle}
//           onChange={handleInputChange("bioSubtitle")}
//           sx={{ mb: 2 }}
//         />

//         <TextField
//           fullWidth
//           multiline
//           minRows={4}
//           label="Bio Description"
//           placeholder="Tell us about your experience and expertise..."
//           value={formData.bioDescription}
//           onChange={handleInputChange("bioDescription")}
//         />
//       </Box>

//       {/* USER INFORMATION */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
//           User Information
//         </Typography>

//         <Box
//           sx={{
//             display: "flex",
//             gap: 2,
//             mb: 2,
//             flexDirection: { xs: "column", sm: "row" },
//           }}
//         >
//           <TextField
//             fullWidth
//             label="First Name *"
//             value={formData.firstName}
//             onChange={handleInputChange("firstName")}
//           />
//           <TextField
//             fullWidth
//             label="Last Name *"
//             value={formData.lastName}
//             onChange={handleInputChange("lastName")}
//           />
//         </Box>

//         <TextField
//           fullWidth
//           label="Email *"
//           type="email"
//           value={formData.email}
//           onChange={handleInputChange("email")}
//           sx={{ mb: 2 }}
//         />

//         <TextField
//           fullWidth
//           label="Mobile Number"
//           value={formData.phone}
//           onChange={handleInputChange("phone")}
//         />
//       </Box>

//       {/* LOCATION SECTION */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
//           Location
//         </Typography>

//         {/* Module */}
//         <Box sx={{ mb: 2 }}>
//           {modulesLoading ? (
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <CircularProgress size={20} />
//               <Typography variant="body2">Loading modules...</Typography>
//             </Box>
//           ) : modules.length ? (
//             <FormControl fullWidth variant="outlined">
//               <InputLabel id="module-select-label">Module *</InputLabel>
//               <Select
//                 labelId="module-select-label"
//                 value={formData.module}
//                 onChange={handleModuleChange}
//                 label="Module *"
//                 disabled={modules.length === 1}
//               >
//                 {modules.map((m) => (
//                   <MenuItem key={m._id} value={m._id}>
//                     {m.title}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           ) : (
//             <Alert severity="warning">
//               No modules available. Please configure modules first.
//             </Alert>
//           )}
//           {formData.module && (
//             <Box sx={{ mt: 1, p: 1.5, bgcolor: "#e3f2fd", borderRadius: 1 }}>
//               <Typography variant="body2" color="primary">
//                 Selected Module: <strong>{getSelectedModuleName()}</strong>
//               </Typography>
//             </Box>
//           )}
//         </Box>

//         {/* Zone */}
//         <Box sx={{ mb: 2 }}>
//           {zonesLoading ? (
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <CircularProgress size={20} />
//               <Typography variant="body2">Loading zones...</Typography>
//             </Box>
//           ) : zones.length ? (
//             <FormControl fullWidth variant="outlined">
//               <InputLabel id="zone-select-label">Zone</InputLabel>
//               <Select
//                 labelId="zone-select-label"
//                 value={selectedZone}
//                 onChange={handleZoneChange}
//                 label="Zone"
//               >
//                 <MenuItem value="">
//                   <em>Select Zone</em>
//                 </MenuItem>
//                 {zones.map((z) => (
//                   <MenuItem key={z._id} value={z._id}>
//                     {z.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           ) : (
//             <Alert severity="info">No zones available</Alert>
//           )}
//         </Box>

//         {/* Address fields */}
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: { xs: "column", sm: "row" },
//             gap: 2,
//             mb: 2,
//           }}
//         >
//           <TextField
//             fullWidth
//             label="Street"
//             variant="outlined"
//             value={formData.storeAddress.street}
//             onChange={handleAddressChange("street")}
//           />
//           <TextField
//             fullWidth
//             label="City"
//             variant="outlined"
//             value={formData.storeAddress.city}
//             onChange={handleAddressChange("city")}
//           />
//         </Box>
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: { xs: "column", sm: "row" },
//             gap: 2,
//             mb: 2,
//           }}
//         >
//           <TextField
//             fullWidth
//             label="State"
//             variant="outlined"
//             value={formData.storeAddress.state}
//             onChange={handleAddressChange("state")}
//           />
//           <TextField
//             fullWidth
//             label="Zip Code"
//             variant="outlined"
//             value={formData.storeAddress.zipCode}
//             onChange={handleAddressChange("zipCode")}
//           />
//         </Box>
//         <TextField
//           fullWidth
//           label="Full Address"
//           variant="outlined"
//           value={formData.storeAddress.fullAddress}
//           onChange={handleAddressChange("fullAddress")}
//           sx={{ mb: 2 }}
//         />

//         {/* Search Location */}
//         <TextField
//           fullWidth
//           label="Search Location"
//           inputRef={searchInputRef}
//           variant="outlined"
//           placeholder="Enter a location"
//           sx={{ mb: 2 }}
//         />

//         {/* Google Map */}
//         {mapsLoaded && GOOGLE_MAPS_API_KEY ? (
//           <>
//             <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//               Click on the map below to select a location
//             </Typography>
//             <Box
//               ref={mapRef}
//               sx={{
//                 height: 300,
//                 width: "100%",
//                 borderRadius: 1,
//                 border: "1px solid #ddd",
//                 mb: 2,
//               }}
//             />
//           </>
//         ) : (
//           <Box
//             sx={{
//               height: 300,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               border: "1px solid #ddd",
//               borderRadius: 1,
//               mb: 2,
//             }}
//           >
//             <Typography variant="body2" color="text.secondary">
//               Map loading...
//             </Typography>
//           </Box>
//         )}

//         {/* Latitude & Longitude */}
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: { xs: "column", sm: "row" },
//             gap: 2,
//             mb: 2,
//           }}
//         >
//           <TextField
//             fullWidth
//             label="Latitude"
//             type="number"
//             inputProps={{ step: "0.0001" }}
//             value={formData.latitude}
//             onChange={handleInputChange("latitude")}
//           />
//           <TextField
//             fullWidth
//             label="Longitude"
//             type="number"
//             inputProps={{ step: "0.0001" }}
//             value={formData.longitude}
//             onChange={handleInputChange("longitude")}
//           />
//         </Box>
//       </Box>

//       {/* OWNER INFO */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
//           Owner Information
//         </Typography>

//         <Box
//           sx={{
//             display: "flex",
//             gap: 2,
//             mb: 2,
//             flexDirection: { xs: "column", sm: "row" },
//           }}
//         >
//           <TextField
//             fullWidth
//             label="Owner First Name *"
//             value={formData.ownerFirstName}
//             onChange={handleInputChange("ownerFirstName")}
//           />
//           <TextField
//             fullWidth
//             label="Owner Last Name *"
//             value={formData.ownerLastName}
//             onChange={handleInputChange("ownerLastName")}
//           />
//         </Box>

//         <TextField
//           fullWidth
//           label="Owner Email *"
//           type="email"
//           value={formData.ownerEmail}
//           onChange={handleInputChange("ownerEmail")}
//           sx={{ mb: 2 }}
//         />

//         <TextField
//           fullWidth
//           label="Owner Phone"
//           value={formData.ownerPhone}
//           onChange={handleInputChange("ownerPhone")}
//         />
//       </Box>

//       {/* SUBMIT BUTTONS */}
//       <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
//         <Button variant="outlined" onClick={handleReset} disabled={loading}>
//           Reset
//         </Button>
//         <Button
//           variant="contained"
//           onClick={handleSubmit}
//           disabled={loading}
//           startIcon={loading ? <CircularProgress size={20} /> : null}
//         >
//           {loading ? "Submitting..." : isEditMode ? "Update" : "Submit"}
//         </Button>
//       </Box>

//       <Snackbar
//         open={open}
//         autoHideDuration={5000}
//         onClose={() => setOpen(false)}
//       >
//         <Alert severity={alertSeverity}>{alertMessage}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }

// export default AddAuditorium;





import React, { useState, useEffect, useCallback, useRef } from "react";
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
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useParams, useNavigate } from "react-router-dom";

function AddAuditorium() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);

  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);

  const activeModuleId = localStorage.getItem("moduleDbId");

  // Subscription states
  const [plans, setPlans] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [isFreeTrial, setIsFreeTrial] = useState(false);

  // Google Maps refs and states
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [map, setMap] = useState(null);

  const GOOGLE_MAPS_API_KEY = "AIzaSyAfLUm1kPmeMkHh1Hr5nbgNpQJOsNa7B78";

  const [formData, setFormData] = useState({
    vendorType: "individual",
    fullName: "",
    storeName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bioTitle: "",
    bioSubtitle: "",
    bioDescription: "",
    storeAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      fullAddress: "",
    },
    zone: "",
    module: activeModuleId || "",
    latitude: "",
    longitude: "",
    ownerFirstName: "",
    ownerLastName: "",
    ownerPhone: "",
    ownerEmail: "",
    status: "pending",
    isActive: true,
  });

  const [zones, setZones] = useState([]);
  const [modules, setModules] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [files, setFiles] = useState({
    logo: null,
    coverImage: null,
  });

  const API_BASE_URL =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "https://api.bookmyevent.ae/api";

  // ==================== EDIT MODE: FETCH EXISTING VENDOR ====================
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchVendorData(id);
    }
  }, [id]);

  const fetchVendorData = async (vendorId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${vendorId}`);
      if (!response.ok) throw new Error("Failed to fetch vendor");
      const data = await response.json();
      const vendor = data.user || data;

      const fullName =
        vendor.storeName ||
        `${vendor.firstName || ""} ${vendor.lastName || ""}`.trim();

      setFormData({
        vendorType: vendor.vendorType || "individual",
        fullName: fullName,
        storeName: vendor.storeName || fullName,
        firstName: vendor.firstName || "",
        lastName: vendor.lastName || "",
        email: vendor.email || "",
        phone: vendor.phone || vendor.mobile || "",
        bioTitle: vendor.bioTitle || vendor.bio?.title || "",
        bioSubtitle: vendor.bioSubtitle || vendor.bio?.subtitle || "",
        bioDescription: vendor.bioDescription || vendor.bio?.description || "",
        storeAddress: {
          street: vendor.storeAddress?.street || vendor.address?.street || "",
          city: vendor.storeAddress?.city || vendor.address?.city || "",
          state: vendor.storeAddress?.state || vendor.address?.state || "",
          zipCode: vendor.storeAddress?.zipCode || vendor.address?.zipCode || "",
          fullAddress: vendor.storeAddress?.fullAddress || vendor.address?.fullAddress || "",
        },
        zone: vendor.zone?._id || vendor.zone || "",
        module: vendor.module?._id || vendor.module || activeModuleId || "",
        latitude: vendor.latitude || vendor.location?.latitude || "",
        longitude: vendor.longitude || vendor.location?.longitude || "",
        ownerFirstName: vendor.ownerFirstName || vendor.owner?.firstName || "",
        ownerLastName: vendor.ownerLastName || vendor.owner?.lastName || "",
        ownerPhone: vendor.ownerPhone || vendor.owner?.phone || "",
        ownerEmail: vendor.ownerEmail || vendor.owner?.email || "",
        status: vendor.status || "pending",
        isActive: vendor.isActive !== undefined ? vendor.isActive : true,
      });

      setSelectedZone(vendor.zone?._id || vendor.zone || "");
      if (vendor.logo) setLogoPreview(vendor.logo);
      if (vendor.coverImage) setCoverPreview(vendor.coverImage);

      showAlert("Vendor data loaded successfully", "success");
    } catch (err) {
      console.error(err);
      showAlert("Failed to load vendor data", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==================== FETCH SUBSCRIPTION PLANS ====================
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
        const planList = data.plans || data.data || data || [];
        setPlans(planList);
      } catch (err) {
        console.error("Error fetching subscription plans:", err);
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, [formData.module, API_BASE_URL]);

  // ==================== GOOGLE MAPS SETUP ====================
  useEffect(() => {
    if (window.google?.maps) {
      setMapsLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [GOOGLE_MAPS_API_KEY]);

  useEffect(() => {
    if (mapsLoaded && window.google?.maps) initMap();
  }, [mapsLoaded]);

  const initMap = useCallback(() => {
    if (!window.google || !mapRef.current || !mapsLoaded) return;

    const centerLat = formData.latitude ? parseFloat(formData.latitude) : 25.2048;
    const centerLng = formData.longitude ? parseFloat(formData.longitude) : 55.2708;
    const center = { lat: centerLat, lng: centerLng };

    const newMap = new window.google.maps.Map(mapRef.current, { zoom: 12, center });

    newMap.addListener("click", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setFormData((prev) => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));

      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new window.google.maps.Marker({ position: { lat, lng }, map: newMap });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          const address = results[0].address_components || [];
          const get = (type) => {
            const item = address.find((a) => a.types.includes(type));
            return item ? item.long_name : "";
          };

          setFormData((prev) => ({
            ...prev,
            storeAddress: {
              street: get("route"),
              city: get("locality") || get("administrative_area_level_2"),
              state: get("administrative_area_level_1"),
              zipCode: get("postal_code"),
              fullAddress: results[0].formatted_address,
            },
          }));
          showAlert("Location set and address auto-filled!", "success");
        }
      });
    });

    setMap(newMap);
  }, [mapsLoaded, formData.latitude, formData.longitude]);

  // Autocomplete
  useEffect(() => {
    if (!mapsLoaded || !map || !searchInputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ["geometry", "formatted_address", "address_components"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      const loc = place.geometry.location;
      map.setCenter(loc);
      map.setZoom(17);

      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new window.google.maps.Marker({ position: loc, map });

      const address = place.address_components || [];
      const get = (type) => {
        const item = address.find((a) => a.types.includes(type));
        return item ? item.long_name : "";
      };

      setFormData((prev) => ({
        ...prev,
        latitude: loc.lat().toString(),
        longitude: loc.lng().toString(),
        storeAddress: {
          street: get("route"),
          city: get("locality") || get("administrative_area_level_2"),
          state: get("administrative_area_level_1"),
          zipCode: get("postal_code"),
          fullAddress: place.formatted_address,
        },
      }));
      showAlert("Location selected!", "success");
    });
  }, [mapsLoaded, map]);

  // Update marker on lat/lng change
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

  // ==================== FETCH ZONES & MODULES ====================
  useEffect(() => {
    fetchZones();
    fetchModules();
  }, []);

  const fetchZones = async () => {
    try {
      setZonesLoading(true);
      const res = await fetch(`${API_BASE_URL}/zones`);
      const data = await res.json();
      setZones(data.data || []);
    } catch (err) {
      showAlert("Error fetching zones", "error");
    } finally {
      setZonesLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      setModulesLoading(true);
      const res = await fetch(`${API_BASE_URL}/modules`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setAllModules(list);
      const filtered = activeModuleId ? list.filter((m) => m._id === activeModuleId) : list;
      setModules(filtered);
      if (activeModuleId && filtered.length) {
        setFormData((prev) => ({ ...prev, module: activeModuleId }));
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
    } finally {
      setModulesLoading(false);
    }
  };

  // ==================== HANDLERS ====================
  const showAlert = (msg, severity = "success") => {
    setAlertMessage(msg);
    setAlertSeverity(severity);
    setOpen(true);
  };

  const handleInputChange = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleAddressChange = (field) => (e) =>
    setFormData({
      ...formData,
      storeAddress: { ...formData.storeAddress, [field]: e.target.value },
    });

  const handleZoneChange = (e) => {
    setSelectedZone(e.target.value);
    setFormData({ ...formData, zone: e.target.value });
  };

  const handleModuleChange = (e) => setFormData({ ...formData, module: e.target.value });

  const handleVendorTypeChange = (e) =>
    setFormData({ ...formData, vendorType: e.target.value, fullName: "", storeName: "" });

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles((prev) => ({ ...prev, [type]: file }));
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (type === "logo") setLogoPreview(ev.target.result);
      if (type === "coverImage") setCoverPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  // ==================== VALIDATION ====================
  const validateForm = () => {
    const errors = [];
    if (formData.vendorType === "individual" && !formData.fullName.trim())
      errors.push("Full name is required");
    if (formData.vendorType === "company" && !formData.storeName.trim())
      errors.push("Store name is required");
    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.module) errors.push("Module is required");
    if (!isFreeTrial && !subscriptionPlan)
      errors.push("Select a subscription plan or enable Free Trial");
    return errors;
  };

  // ==================== SUBMIT HANDLER ====================
  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length) {
      showAlert(errors.join(", "), "error");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();

      payload.append("role", "vendor");
      payload.append("vendorType", formData.vendorType);
      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);

      const storeName =
        formData.vendorType === "individual" ? formData.fullName.trim() : formData.storeName.trim();
      payload.append("storeName", storeName);

      payload.append("bioTitle", formData.bioTitle);
      payload.append("bioSubtitle", formData.bioSubtitle);
      payload.append("bioDescription", formData.bioDescription);

      payload.append("storeAddress[street]", formData.storeAddress.street);
      payload.append("storeAddress[city]", formData.storeAddress.city);
      payload.append("storeAddress[state]", formData.storeAddress.state);
      payload.append("storeAddress[zipCode]", formData.storeAddress.zipCode);
      payload.append("storeAddress[fullAddress]", formData.storeAddress.fullAddress);

      payload.append("latitude", formData.latitude);
      payload.append("longitude", formData.longitude);
      payload.append("module", formData.module);
      payload.append("zone", formData.zone);

      payload.append("ownerFirstName", formData.ownerFirstName);
      payload.append("ownerLastName", formData.ownerLastName);
      payload.append("ownerPhone", formData.ownerPhone);
      payload.append("ownerEmail", formData.ownerEmail);

      payload.append("isFreeTrial", isFreeTrial);
      if (!isFreeTrial && subscriptionPlan) payload.append("subscriptionPlan", subscriptionPlan);

      if (files.logo) payload.append("logo", files.logo);
      if (files.coverImage) payload.append("coverImage", files.coverImage);

      const url = isEditMode ? `${API_BASE_URL}/users/${id}` : `${API_BASE_URL}/auth/register`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, { method, body: payload });
      let result;
      try {
        result = await res.json();
      } catch {
        showAlert("Invalid server response", "error");
        return;
      }

      if (!res.ok) {
        showAlert(result.message || "Operation failed", "error");
        setLoading(false);
        return;
      }

      // Extract provider ID
      const providerId =
        result.providerId ||
        result._id ||
        result.userId ||
        result.id ||
        (result.data?._id) ||
        (result.user?._id);

      if (isEditMode) {
        showAlert("Provider updated successfully!", "success");
        setTimeout(() => navigate("/makeup/CateringProvider"), 2000);
        setLoading(false);
        return;
      }

      if (isFreeTrial) {
        showAlert("Provider added successfully with Free Trial!", "success");
        handleReset();
        setLoading(false);
        return;
      }

      // Paid plan: create payment session
      if (!providerId) {
        showAlert("Provider created but ID not found", "error");
        setLoading(false);
        return;
      }

      const selectedPlan = plans.find((p) => (p._id || p.id) === subscriptionPlan);
      const amount = selectedPlan ? selectedPlan.price || selectedPlan.amount || 0 : 0;

      const paymentRes = await fetch(`${API_BASE_URL}/payment/create-subscription-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          planId: subscriptionPlan,
          amount,
          customerEmail: formData.email,
          customerPhone: formData.phone || "0000000000",
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        showAlert("Payment session failed: " + (paymentData.message || "Error"), "error");
        setLoading(false);
        return;
      }

      if (paymentData.success && paymentData.payment_links?.web) {
        showAlert("Redirecting to payment page...", "info");
        localStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            providerId,
            planId: subscriptionPlan,
            orderId: paymentData.order_id,
            sessionId: paymentData.id,
          })
        );
        setTimeout(() => {
          window.location.href = paymentData.payment_links.web;
        }, 1500);
      } else {
        showAlert("Payment link not available", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      vendorType: "individual",
      fullName: "",
      storeName: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bioTitle: "",
      bioSubtitle: "",
      bioDescription: "",
      storeAddress: { street: "", city: "", state: "", zipCode: "", fullAddress: "" },
      zone: "",
      module: activeModuleId || "",
      latitude: "",
      longitude: "",
      ownerFirstName: "",
      ownerLastName: "",
      ownerPhone: "",
      ownerEmail: "",
      status: "pending",
      isActive: true,
    });
    setSelectedZone("");
    setLogoPreview(null);
    setCoverPreview(null);
    setFiles({ logo: null, coverImage: null });
    setSubscriptionPlan("");
    setIsFreeTrial(false);
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  };

  const getSelectedModuleName = () => {
    if (!formData.module) return "No module selected";
    const mod = allModules.find((m) => m._id === formData.module);
    return mod ? mod.title : "Unknown module";
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        {isEditMode ? "Edit Provider" : "Add Provider"}
      </Typography>

      {/* Vendor Type */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: "#fff", borderRadius: 1, border: "1px solid #e0e0e0" }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Vendor Type</Typography>
        <RadioGroup row value={formData.vendorType} onChange={handleVendorTypeChange}>
          <FormControlLabel value="individual" control={<Radio />} label="Individual" />
          <FormControlLabel value="company" control={<Radio />} label="Company" />
        </RadioGroup>
      </Box>

      {/* Store Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Store Information</Typography>
        {formData.vendorType === "individual" ? (
          <TextField fullWidth label="Full Name *" value={formData.fullName} onChange={handleInputChange("fullName")} sx={{ mb: 2 }} />
        ) : (
          <TextField fullWidth label="Store Name *" value={formData.storeName} onChange={handleInputChange("storeName")} sx={{ mb: 2 }} />
        )}
      </Box>

      {/* Logo Upload */}
      {logoPreview && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Selected Logo:</Typography>
          <img src={logoPreview} alt="Logo" style={{ width: 100, height: 100, objectFit: "contain" }} />
        </Box>
      )}
      <Box sx={{ border: "1px dashed grey", p: 2, mb: 3, textAlign: "center" }}>
        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth>
          {logoPreview ? "Change Logo" : "Upload Logo"}
          <input hidden type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "logo")} />
        </Button>
      </Box>

      {/* Cover Upload */}
      {coverPreview && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Selected Cover:</Typography>
          <img src={coverPreview} alt="Cover" style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
        </Box>
      )}
      <Box sx={{ border: "1px dashed grey", p: 2, mb: 3, textAlign: "center" }}>
        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth>
          {coverPreview ? "Change Cover" : "Upload Cover Image"}
          <input hidden type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "coverImage")} />
        </Button>
      </Box>

      {/* Bio Section */}
      <Box sx={{ mb: 3, p: 2, borderRadius: 1, backgroundColor: "#fff", border: "1px solid #e0e0e0" }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Bio</Typography>
        <TextField fullWidth label="Bio Title" placeholder="e.g. Professional Makeup Artist" value={formData.bioTitle} onChange={handleInputChange("bioTitle")} sx={{ mb: 2 }} />
        <TextField fullWidth label="Bio Subtitle" placeholder="e.g. Specializing in Bridal Makeup" value={formData.bioSubtitle} onChange={handleInputChange("bioSubtitle")} sx={{ mb: 2 }} />
        <TextField fullWidth multiline minRows={4} label="Bio Description" value={formData.bioDescription} onChange={handleInputChange("bioDescription")} />
      </Box>

      {/* User Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>User Information</Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField fullWidth label="First Name *" value={formData.firstName} onChange={handleInputChange("firstName")} />
          <TextField fullWidth label="Last Name *" value={formData.lastName} onChange={handleInputChange("lastName")} />
        </Box>
        <TextField fullWidth label="Email *" type="email" value={formData.email} onChange={handleInputChange("email")} sx={{ mb: 2 }} />
        <TextField fullWidth label="Mobile Number" value={formData.phone} onChange={handleInputChange("phone")} />
      </Box>

      {/* Location Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Location</Typography>

        {/* Module */}
        <Box sx={{ mb: 2 }}>
          {modulesLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} /> <Typography>Loading modules...</Typography>
            </Box>
          ) : modules.length ? (
            <FormControl fullWidth>
              <InputLabel>Module *</InputLabel>
              <Select value={formData.module} onChange={handleModuleChange} label="Module *" disabled={modules.length === 1}>
                {modules.map((m) => (
                  <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Alert severity="warning">No modules available</Alert>
          )}
          {formData.module && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: "#e3f2fd", borderRadius: 1 }}>
              <Typography variant="body2" color="primary">
                Selected Module: <strong>{getSelectedModuleName()}</strong>
              </Typography>
            </Box>
          )}
        </Box>

        {/* Zone */}
        <Box sx={{ mb: 2 }}>
          {zonesLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} /> <Typography>Loading zones...</Typography>
            </Box>
          ) : zones.length ? (
            <FormControl fullWidth>
              <InputLabel>Zone</InputLabel>
              <Select value={selectedZone} onChange={handleZoneChange} label="Zone">
                <MenuItem value=""><em>Select Zone</em></MenuItem>
                {zones.map((z) => (
                  <MenuItem key={z._id} value={z._id}>{z.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Alert severity="info">No zones available</Alert>
          )}
        </Box>

        {/* Address Fields */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField fullWidth label="Street" value={formData.storeAddress.street} onChange={handleAddressChange("street")} />
          <TextField fullWidth label="City" value={formData.storeAddress.city} onChange={handleAddressChange("city")} />
        </Box>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField fullWidth label="State" value={formData.storeAddress.state} onChange={handleAddressChange("state")} />
          <TextField fullWidth label="Zip Code" value={formData.storeAddress.zipCode} onChange={handleAddressChange("zipCode")} />
        </Box>
        <TextField fullWidth label="Full Address" value={formData.storeAddress.fullAddress} onChange={handleAddressChange("fullAddress")} sx={{ mb: 2 }} />

        {/* Search Location */}
        <TextField fullWidth label="Search Location" inputRef={searchInputRef} placeholder="Enter a location" sx={{ mb: 2 }} />

        {/* Map */}
        {mapsLoaded ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Click on the map to select location
            </Typography>
            <Box ref={mapRef} sx={{ height: 300, width: "100%", borderRadius: 1, border: "1px solid #ddd", mb: 2 }} />
          </>
        ) : (
          <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ddd" }}>
            <Typography>Map loading...</Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField fullWidth label="Latitude" type="number" value={formData.latitude} onChange={handleInputChange("latitude")} inputProps={{ step: "0.0001" }} />
          <TextField fullWidth label="Longitude" type="number" value={formData.longitude} onChange={handleInputChange("longitude")} inputProps={{ step: "0.0001" }} />
        </Box>
      </Box>

      {/* Owner Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Owner Information</Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField fullWidth label="Owner First Name *" value={formData.ownerFirstName} onChange={handleInputChange("ownerFirstName")} />
          <TextField fullWidth label="Owner Last Name *" value={formData.ownerLastName} onChange={handleInputChange("ownerLastName")} />
        </Box>
        <TextField fullWidth label="Owner Email *" type="email" value={formData.ownerEmail} onChange={handleInputChange("ownerEmail")} sx={{ mb: 2 }} />
        <TextField fullWidth label="Owner Phone" value={formData.ownerPhone} onChange={handleInputChange("ownerPhone")} />
      </Box>

      {/* Subscription Section */}
      <Box sx={{ mb: 4, p: 3, borderRadius: 2, border: "1px solid #ddd", backgroundColor: "#fafafa" }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Subscription Information</Typography>

        <MuiFormControlLabel
          control={
            <Checkbox
              checked={isFreeTrial}
              onChange={(e) => {
                setIsFreeTrial(e.target.checked);
                if (e.target.checked) setSubscriptionPlan("");
              }}
            />
          }
          label="Enable Free Trial (No Payment Required)"
        />

        {!isFreeTrial && (
          <>
            {plansLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                <CircularProgress size={20} />
                <Typography>Loading plans...</Typography>
              </Box>
            ) : plans.length > 0 ? (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Subscription Plan *</InputLabel>
                <Select
                  value={subscriptionPlan}
                  onChange={(e) => setSubscriptionPlan(e.target.value)}
                  label="Subscription Plan *"
                >
                  <MenuItem value=""><em>Select Plan</em></MenuItem>
                  {plans.map((p) => (
                    <MenuItem key={p._id || p.id} value={p._id || p.id}>
                      <Box>
                        <Typography fontWeight="bold">{p.name || p.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ₹{p.price || p.amount || 0} / {p.duration || "month"}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>No plans available for this module</Alert>
            )}
          </>
        )}

        {isFreeTrial && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Free trial enabled – provider will have limited access until subscription purchase.
          </Alert>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={handleReset} disabled={loading}>Reset</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading
            ? "Processing..."
            : isEditMode
            ? "Update Provider"
            : isFreeTrial
            ? "Submit"
            : "Proceed to Payment"}
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setOpen(false)} severity={alertSeverity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AddAuditorium;
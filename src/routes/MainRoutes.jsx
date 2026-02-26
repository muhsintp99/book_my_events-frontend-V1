import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import CateringList from '../catering/Cateringlist';
// import Createnew from '../views/Createnew';
// import Completed from '../views/Completed';
// import AllTrips from '../views/Alltrips';

// Pages
const DashboardDefault = Loadable(lazy(() => import('views/dashboard')));
const Statistics = Loadable(lazy(() => import('../views/statistics')));
const PageNotFound = Loadable(lazy(() => import('../views/PageNotFound')));
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// Promotions
const Banners = Loadable(lazy(() => import('../views/RentalBanner')));
const Coupons = Loadable(lazy(() => import('../views/Coupons')));
const PushNotification = Loadable(lazy(() => import('../views/Pushnotifications')));

// Providers
const NewProvider = Loadable(lazy(() => import('../views/Newprovider')));
const AddProvider = Loadable(lazy(() => import('../views/Addprovider')));
const ProviderList = Loadable(lazy(() => import('../views/ProviderList')));
const EditList = Loadable(lazy(() => import('../views/Editlist')));
const KycVerification = Loadable(lazy(() => import('../views/KycVerification')));


// Vehicles - Category
const Category = Loadable(lazy(() => import('../views/Category')));
const AllTrips = Loadable(lazy(() => import('../views/Alltrips')));
const Scheduled = Loadable(lazy(() => import('../views/Scheduled')));
const Pending = Loadable(lazy(() => import('../views/Pending')));
const Confirmed = Loadable(lazy(() => import('../views/Confirmed')));
const Ongoing = Loadable(lazy(() => import('../views/Ongoing')));
const Completed = Loadable(lazy(() => import('../views/Completed')));
const Cancelled = Loadable(lazy(() => import('../views/Cancelled')));
const Paymentfailed = Loadable(lazy(() => import('../views/Paymentfailed')));
const Createnew = Loadable(lazy(() => import('../views/Createnew')));
const Vehiclelist = Loadable(lazy(() => import('../views/Vehiclelist')));
const Vehicleattributes = Loadable(lazy(() => import('../views/Vehicleattributes')));
const Vehiclevendorlist = Loadable(lazy(() => import('../views/Providerslist')));


const AddModule = Loadable(lazy(() => import('../views/AddModule')));

const Brands = Loadable(lazy(() => import('../views/Brands')));

// Bookings
const Allbookings = Loadable(lazy(() => import('../audiviews/Allbookings')));
const Scheduledbookings = Loadable(lazy(() => import('../audiviews/Scheduledbookings')));
const Pendingbookings = Loadable(lazy(() => import('../audiviews/Pendingbookings')));
const Confirmedbookings = Loadable(lazy(() => import('../audiviews/Confirmedbookings')));
const Ongoingbookings = Loadable(lazy(() => import('../audiviews/Ongoingbookings')));
const Completedbookings = Loadable(lazy(() => import('../audiviews/Completedbookings')));
const Cancelledbookings = Loadable(lazy(() => import('../audiviews/Cancelledbookings')));
const Paymentfailedbookings = Loadable(lazy(() => import('../audiviews/Paymentfailedbookings')));

// Auditorium Components (using your audiviews folder)
const AuditoriumDashboard = Loadable(lazy(() => import('../audiviews/dashboard/index')));
const Auditoriumcoupons = Loadable(lazy(() => import('../audiviews/Coupons')));
const Auditoriumbanner = Loadable(lazy(() => import('../audiviews/Banner')));
const AuditoriumPushnotifications = Loadable(lazy(() => import('../audiviews/Pushnotifications')));
const Auditoriumcategory = Loadable(lazy(() => import('../audiviews/Audicategory')));
const Auditoriumnewprovidersrequest = ProviderList;
const Auditoriumaddprovider = Loadable(lazy(() => import('../audiviews/Addprovider')));
const Auditoriumlist = Loadable(lazy(() => import('../audiviews/Auditoriumlist')));
const Createauditorium = Loadable(lazy(() => import('../audiviews/Createauditorium')));
const Venuelist = Loadable(lazy(() => import('../audiviews/Venuelist')));
const Auditoriumbrands = Loadable(lazy(() => import('../audiviews/Auditoriumbrands')));
const Auditoppicks = Loadable(lazy(() => import('../audiviews/TopPicks')));
const EditVenuePage = Loadable(lazy(() => import('../audiviews/EditVenuePage')));
//Settings
const ZoneSetup = Loadable(lazy(() => import('../views/ZoneSetup')));
const ModuleSetup = Loadable(lazy(() => import('../views/ModuleSetup')));
const SecondModuleSetup = Loadable(lazy(() => import('../views/SecondmoduleSetup')));

const PincodeSetup = Loadable(lazy(() => import('../views/Pincodesetup')));


const SubscriptionList = Loadable(lazy(() => import('../views/SubscriptionList')));
const Addpackage = Loadable(lazy(() => import('../views/Addpackage')));
const SubscribedStore = Loadable(lazy(() => import('../views/SubscribedStore')));
const SubscriptionRequests = Loadable(lazy(() => import('../views/SubscriptionRequests')));
const VendorRegistrations = Loadable(lazy(() => import('../views/settings/VendorRegistrations')));
const VendorRegistrationDetail = Loadable(lazy(() => import('../views/settings/VendorRegistrations/VendorDetailView')));

// catering///////////////
// const cateringDashboard = Loadable(lazy(() => import('../catering/')));
const Cateringaddprovider = Loadable(lazy(() => import('../catering/AddProvider')));
const Cateringcategory = Loadable(lazy(() => import('../catering/Category')));
// const CateringList = Loadable(lazy(() => import('../catering/Cateringlist')));
const Cateringprovider = ProviderList;
const Cateringdashboard = Loadable(lazy(() => import('../catering/dashboard')));
const CateringCoupon = Loadable(lazy(() => import('../catering/CateringCoupon')));

// makeup/////////////////////
const Makeupdashboard = Loadable(lazy(() => import('../makeup/dashboard')));
const Makeupaddprovider = Loadable(lazy(() => import('../makeup/MakeupProvider')));
const Makeupproviders = ProviderList;
const Makeupcategory = Loadable(lazy(() => import('../makeup/Category')));
const MakeupList = Loadable(lazy(() => import('../makeup/MakeupList')));
const Makeupprovider = ProviderList;
const MakeupCoupon = Loadable(lazy(() => import('../makeup/MakeupCoupon')));
const Makeuptypes = Loadable(lazy(() => import('../makeup/Makeuptypes')));
// const Makeupportfolio = Loadable(lazy(() => import('../makeup/Portfolio')));

// photography/////////////

const Photographydashboard = Loadable(lazy(() => import('../photography/dashboard')));
const Photographyaddprovider = Loadable(lazy(() => import('../photography/PhotoProvider')));
const Photographyvendorslist = ProviderList;

const Photographycategory = Loadable(lazy(() => import('../photography/Photocategory')));
const PhotographyList = Loadable(lazy(() => import('../photography/PhotoList')));
const Photographyprovider = ProviderList;
const PhotographyCoupon = Loadable(lazy(() => import('../photography/PhotoCoupon')));
// const PhotographyPortfolio = Loadable(lazy(() => import('../photography/PhotoPortfolio')));


// cakes////////////////////////////////
const Cakedashboard = Loadable(lazy(() => import('../cakes/dashboard')));
const Cakeaddprovider = Loadable(lazy(() => import('../cakes/Cakeprovider')));
const Cakevendorslist = ProviderList;

const Cakecategory = Loadable(lazy(() => import('../cakes/category')));
const CakeList = Loadable(lazy(() => import('../cakes/cakelist')));
const Cakeprovider = ProviderList;
const CakeCoupon = Loadable(lazy(() => import('../cakes/Cakecoupons')));

// ornaments////////////////////////////////
const Ornamentsdashboard = Loadable(lazy(() => import('../ornaments/dashboard')));
const Ornamentsaddprovider = Loadable(lazy(() => import('../ornaments/AddProvider')));
const Ornamentsvendorslist = ProviderList;
const Ornamentscategory = Loadable(lazy(() => import('../ornaments/Category')));
const OrnamentsList = Loadable(lazy(() => import('../ornaments/OrnamentsList')));
const Ornamentsprovider = ProviderList;
const OrnamentsCoupon = Loadable(lazy(() => import('../ornaments/OrnamentsCoupon')));





// boutiquee////////////////////////////////
const Boutiquedashboard = Loadable(lazy(() => import('../Boutique/dashboard')));
const Boutiqueaddprovider = Loadable(lazy(() => import('../Boutique/Addprovider')));
const Boutiquevendorslist = ProviderList;
const Boutiquecategory = Loadable(lazy(() => import('../Boutique/Category')));
const Boutiqueattributes = Loadable(lazy(() => import('../Boutique/Attributes')));

const BoutiqueList = Loadable(lazy(() => import('../Boutique/Boutiquelist')));
const Boutiqueprovider = ProviderList;
const BoutiqueCoupon = Loadable(lazy(() => import('../Boutique/BoutiqueCoupon')));


// mehandi///////////////////////////
const Mehandidashboard = Loadable(lazy(() => import('../mehandi/dashboard')));
const Mehandiaddprovider = Loadable(lazy(() => import('../mehandi/AddProvider')));
const Mehandivendorslist = ProviderList;
const Mehandicategory = Loadable(lazy(() => import('../mehandi/Category')));
const MehandiList = Loadable(lazy(() => import('../mehandi/MehandiList')));
const Mehandiprovider = ProviderList;
const MehandiCoupon = Loadable(lazy(() => import('../mehandi/MehandiCoupon')));
const ProviderDetailsView = Loadable(lazy(() => import('../views/ProviderDetailsView')));
const Unauthorized = Loadable(lazy(() => import('../views/Unauthorized')));


const Invitationdashboard = Loadable(lazy(() => import('../invitation&printing/dashboard')));

const Invitationaddprovider = Loadable(lazy(() => import('../invitation&printing/AddProvider')));

const Invitationcategory = Loadable(lazy(() => import('../invitation&printing/Category')));

const InvitationList = Loadable(lazy(() => import('../invitation&printing/Invitationlist')));

const InvitationCoupon = Loadable(lazy(() => import('../invitation&printing/Invitationcoupon')));

const Invitationprovider = ProviderList;




const Flouristdashboard = Loadable(lazy(() => import('../Flourist&stage/dashboard')));

const Flouristaddprovider = Loadable(lazy(() => import('../Flourist&stage/AddProvider')));

const Flouristcategory = Loadable(lazy(() => import('../Flourist&stage/Category')));

const FlouristList = Loadable(lazy(() => import('../Flourist&stage/Flouriststagelist')));

const FlouristCoupon = Loadable(lazy(() => import('../Flourist&stage/flouriststagecoupon')));

const Flouristprovider = ProviderList;


const Lightdashboard = Loadable(lazy(() => import('../Light&Sounds/dashboard')));
const Lightaddprovider = Loadable(lazy(() => import('../Light&Sounds/AddProvider')));
const Lightcategory = Loadable(lazy(() => import('../Light&Sounds/Category')));
const LightList = Loadable(lazy(() => import('../Light&Sounds/lightlist')));
const LightCoupon = Loadable(lazy(() => import('../Light&Sounds/lightcoupon')));
const Lightprovider = ProviderList;


const Bouncerdashboard = Loadable(lazy(() => import('../Bouncers&Security/dashboard')));
const Bounceraddprovider = Loadable(lazy(() => import('../Bouncers&Security/AddProvider')));
const Bouncercategory = Loadable(lazy(() => import('../Bouncers&Security/Category')));
const BouncerListComp = Loadable(lazy(() => import('../Bouncers&Security/bouncerlist')));
const BouncerCouponComp = Loadable(lazy(() => import('../Bouncers&Security/bouncercoupon')));
const Bouncerprovider = ProviderList;


const Emceedashboard = Loadable(lazy(() => import('../Emcee/dashboard')));
const Emceeaddprovider = Loadable(lazy(() => import('../Emcee/AddProvider')));
const Emceecategory = Loadable(lazy(() => import('../Emcee/Category')));
const EmceeListComp = Loadable(lazy(() => import('../Emcee/emceelist')));
const EmceeCouponComp = Loadable(lazy(() => import('../Emcee/emceecoupon')));
const Emceeprovider = ProviderList;


// Panthal & Decorations
const Panthaldashboard = Loadable(lazy(() => import('../Panthal&Decorations/dashboard')));
const Panthaladdprovider = Loadable(lazy(() => import('../Panthal&Decorations/AddProvider')));
const Panthalcategory = Loadable(lazy(() => import('../Panthal&Decorations/Category')));
const PanthalListComp = Loadable(lazy(() => import('../Panthal&Decorations/panthallist')));
const PanthalCouponComp = Loadable(lazy(() => import('../Panthal&Decorations/panthalcoupon')));
const Panthalprovider = ProviderList;


// Event Professionals
const Professionaldashboard = Loadable(lazy(() => import('../EventProfessionals/dashboard')));
const Professionaladdprovider = Loadable(lazy(() => import('../EventProfessionals/AddProvider')));
const Professionalcategory = Loadable(lazy(() => import('../EventProfessionals/Category')));
const ProfessionalListComp = Loadable(lazy(() => import('../EventProfessionals/professionallist')));
const ProfessionalCouponComp = Loadable(lazy(() => import('../EventProfessionals/professionalcoupon')));
const Professionalprovider = ProviderList;


import ProtectedRoute from './ProtectedRoute';

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  ),
  children: [
    { path: '/', element: <DashboardDefault /> },
    { path: '*', element: <PageNotFound /> },
    { path: 'dashboard', element: <DashboardDefault /> },
    { path: 'unauthorized', element: <Unauthorized /> },
    { path: 'statistics', element: <Statistics /> },
    { path: 'typography', element: <UtilsTypography /> },
    { path: 'color', element: <UtilsColor /> },
    { path: 'shadow', element: <UtilsShadow /> },
    { path: 'sample-page', element: <SamplePage /> },

    // Provider Details
    { path: 'provider/:providerId/details', element: <ProviderDetailsView /> },

    // Promotions
    { path: 'promotions/RentalBanners', element: <Banners /> },
    { path: 'promotions/Coupons', element: <Coupons /> },
    { path: 'promotions/PushNotification', element: <PushNotification /> },

    // Providers
    { path: 'providers/new', element: <NewProvider /> },
    { path: 'providers/add', element: <AddProvider /> },
    { path: 'providers/list', element: <ProviderList /> },
    { path: 'settings/kyc-verification', element: <KycVerification /> },
    // { path: 'providers/edit', element: <EditList /> },


    // Trips

    { path: 'trips/alltrips', element: <AllTrips /> },
    { path: 'trips/scheduled', element: <Scheduled /> },
    { path: 'trips/pending', element: <Pending /> },
    { path: 'trips/confirmed', element: <Confirmed /> },
    { path: 'trips/ongoing', element: <Ongoing /> },
    { path: 'trips/completed', element: <Completed /> },
    { path: 'trips/cancelled', element: <Cancelled /> },
    { path: 'trips/paymentfailed', element: <Paymentfailed /> },

    // { path: '/vehicles/create', element: <Createnew /> },
    //setting
    { path: 'settings/zone-setup', element: <ZoneSetup /> },
    { path: '/settings/module-setup', element: <ModuleSetup /> },
    { path: '/settings/pincode-setup', element: <PincodeSetup /> },

    { path: '/settings/secondery-module-setup', element: <SecondModuleSetup /> },

    { path: '/settings/sub/list', element: <SubscriptionList /> },
    { path: '/settings/sub/add', element: <Addpackage /> },
    { path: '/settings/sub/add/:id', element: <Addpackage /> },

    { path: '/settings/sub/store', element: <SubscribedStore /> },
    { path: '/settings/sub/requests', element: <SubscriptionRequests /> },
    { path: '/settings/vendor-registrations', element: <VendorRegistrations /> },
    { path: '/settings/vendor-registrations/:id', element: <VendorRegistrationDetail /> },

    // Bookingssss

    { path: 'bookings/all', element: <Allbookings /> },
    { path: 'bookings/scheduled', element: <Scheduledbookings /> },
    { path: 'bookings/Pending', element: <Pendingbookings /> },
    { path: 'bookings/confirmed', element: <Confirmedbookings /> },
    { path: 'bookings/ongoing', element: <Ongoingbookings /> },
    { path: 'bookings/completed', element: <Completedbookings /> },
    { path: 'bookings/cancelled', element: <Cancelledbookings /> },
    { path: 'bookings/paymentfailedbookings', element: <Paymentfailedbookings /> },

    // Vehicles - Category
    { path: 'vehicles/create', element: <Createnew /> },
    { path: 'vehicles/list', element: <Vehiclelist /> },
    { path: 'vehicles/brands', element: <Brands /> },
    { path: '/vehicles/Attributes', element: <Vehicleattributes /> },
    { path: '/providers/vehiclevendorlist', element: <ProviderList /> },
    // Vehicles - Category
    { path: 'vehicles/category', element: <Category /> },
    { path: 'vehicles/category/edit/:id', element: <Category /> },


    // Auditorium Routes
    { path: 'auditorium/dashboard', element: <AuditoriumDashboard /> },
    { path: 'auditorium/banner', element: <Auditoriumbanner /> },
    { path: 'auditorium/coupons', element: <Auditoriumcoupons /> },
    { path: 'auditorium/pushnotifications', element: <AuditoriumPushnotifications /> },
    { path: 'auditorium/category', element: <Auditoriumcategory /> },
    { path: 'auditorium/provider', element: <Auditoriumnewprovidersrequest /> },
    { path: 'auditorium/addprovider', element: <Auditoriumaddprovider /> },
    { path: 'auditorium/addprovider/:id', element: <Auditoriumaddprovider /> },
    { path: 'auditorium/auditoriumlist', element: <Auditoriumlist /> },
    { path: 'auditorium/create', element: <Createauditorium /> },
    { path: 'auditorium/venuelist', element: <Venuelist /> },
    { path: 'auditorium/venues/edit/:id', element: <EditVenuePage /> },
    { path: 'auditorium/brands', element: <Auditoriumbrands /> },
    { path: '/auditorium/Toppicks', element: <Auditoppicks /> },

    { path: 'rental/dashboard', element: <DashboardDefault /> },

    { path: 'events/dashboard', element: <DashboardDefault /> },

    //module
    { path: 'module/add', element: <AddModule /> },

    // cateringgggg///////////////////
    { path: 'catering/dashboard', element: <Cateringdashboard /> },
    { path: '/catering/cateringprovider', element: <Cateringprovider /> },

    { path: 'catering/addprovider', element: <Cateringaddprovider /> },
    { path: 'catering/addprovider/:id', element: <Cateringaddprovider /> },
    { path: 'catering/Category', element: <Cateringcategory /> },
    { path: 'catering/Cateringlist', element: <CateringList /> },
    { path: '/catering/provider', element: <Cateringprovider /> },
    { path: '/catering/Coupons', element: <CateringCoupon /> },

    // makeup/////////////////////////////////

    { path: '/makeup/dashboard', element: <Makeupdashboard /> },
    { path: 'makeup/AddProvider', element: <Makeupaddprovider /> },
    { path: 'makeup/category', element: <Makeupcategory /> },
    { path: 'makeup/AddProvider/:id', element: <Makeupaddprovider /> }, // Add this line for edit
    { path: '/providers/makeupprovider', element: <Makeupproviders /> },

    { path: 'makeup/makeuplist', element: <MakeupList /> },
    { path: '/makeup/provider', element: <Makeupprovider /> },
    { path: '/makeup/Coupons', element: <MakeupCoupon /> },
    { path: 'makeup/types', element: <Makeuptypes /> },
    // { path: '/makeup/portfolio', element: <Makeupportfolio /> },


    // photographyyyy///////////////////////

    { path: '/photography/dashboard', element: <Photographydashboard /> },
    { path: '/photography/provider', element: <Photographyaddprovider /> },
    { path: '/photography/provider', element: <Photographyaddprovider /> },
    { path: '/photography/photographyvendors', element: <Photographyvendorslist /> },



    { path: '/photography/category', element: <Photographycategory /> },
    { path: '/photography/photographylist', element: <PhotographyList /> },
    { path: '/photography/AddProvider', element: <Photographyaddprovider /> },
    { path: '/photography/AddProvider/:id', element: <Photographyaddprovider /> },
    { path: '/photography/Coupons', element: <PhotographyCoupon /> },
    // { path: '/photography/portfolio', element: <PhotographyPortfolio /> }


    //  cakes///////////////////////
    { path: '/cake/dashboard', element: <Cakedashboard /> },
    { path: '/cake/AddProvider', element: <Cakeaddprovider /> },
    { path: '/cake/AddProvider/:id', element: <Cakeaddprovider /> },
    { path: '/cake/cakevendors', element: <Cakevendorslist /> },



    { path: '/cake/category', element: <Cakecategory /> },
    { path: '/cake/cakelist', element: <CakeList /> },
    { path: '/providers/cakeprovider', element: <Cakeprovider /> },
    { path: '/cake/Coupons', element: <CakeCoupon /> },

    // ornaments///////////////////////
    { path: '/ornaments/dashboard', element: <Ornamentsdashboard /> },
    { path: '/ornaments/AddProvider', element: <Ornamentsaddprovider /> },
    { path: '/ornaments/AddProvider/:id', element: <Ornamentsaddprovider /> },
    { path: '/ornaments/ornamentsvendors', element: <Ornamentsvendorslist /> },
    { path: '/ornaments/category', element: <Ornamentscategory /> },
    { path: '/ornaments/ornamentslist', element: <OrnamentsList /> },
    { path: '/ornaments/ornamentsprovider', element: <Ornamentsprovider /> },
    { path: '/ornaments/coupons', element: <OrnamentsCoupon /> },


    // boutiqueee///////////////////////
    { path: '/boutique/dashboard', element: <Boutiquedashboard /> },
    { path: '/boutique/AddProvider', element: <Boutiqueaddprovider /> },
    { path: '/boutique/AddProvider/:id', element: <Boutiqueaddprovider /> },
    { path: '/boutique/ornamentsvendors', element: <Boutiquevendorslist /> },
    { path: '/boutique/category', element: <Boutiquecategory /> },
    { path: '/boutique/attributes', element: <Boutiqueattributes /> },

    { path: '/boutique/boutiqueList', element: <BoutiqueList /> },
    { path: '/boutique/boutiqueprovider', element: <Boutiqueprovider /> },
    { path: '/boutique/coupons', element: <BoutiqueCoupon /> },

    // mehandi///////////////////////
    { path: '/mehandi/dashboard', element: <Mehandidashboard /> },
    { path: '/mehandi/AddProvider', element: <Mehandiaddprovider /> },
    { path: '/mehandi/AddProvider/:id', element: <Mehandiaddprovider /> },
    { path: '/mehandi/mehandivendors', element: <Mehandivendorslist /> },
    { path: '/mehandi/category', element: <Mehandicategory /> },
    { path: '/mehandi/mehandiList', element: <MehandiList /> },
    { path: '/mehandi/mehandiprovider', element: <Mehandiprovider /> },
    { path: '/mehandi/coupons', element: <MehandiCoupon /> },


    // ===============================
    // Invitation & Printing Routes
    // ===============================
    { path: 'invitation/dashboard', element: <Invitationdashboard /> },
    { path: 'invitation/AddProvider', element: <Invitationaddprovider /> },
    { path: 'invitation/AddProvider/:id', element: <Invitationaddprovider /> },
    { path: 'invitation/category', element: <Invitationcategory /> },
    { path: 'invitation/invitationList', element: <InvitationList /> },
    { path: 'invitation/invitationprovider', element: <Invitationprovider /> },
    { path: 'invitation/coupons', element: <InvitationCoupon /> },



    // ===============================
    // Florist & stage Routes
    // ===============================
    { path: 'florist/dashboard', element: <Flouristdashboard /> },
    { path: 'florist/AddProvider', element: <Flouristaddprovider /> },
    { path: 'florist/AddProvider/:id', element: <Flouristaddprovider /> },
    { path: 'florist/category', element: <Flouristcategory /> },
    { path: 'florist/floristList', element: <FlouristList /> },
    { path: 'florist/floristprovider', element: <Flouristprovider /> },
    { path: 'florist/coupons', element: <FlouristCoupon /> },


    // ===============================
    // Light & Sounds Routes
    // ===============================
    { path: 'lights/dashboard', element: <Lightdashboard /> },
    { path: 'lights/AddProvider', element: <Lightaddprovider /> },
    { path: 'lights/AddProvider/:id', element: <Lightaddprovider /> },
    { path: 'lights/category', element: <Lightcategory /> },
    { path: 'lights/lightList', element: <LightList /> },
    { path: 'lights/lightprovider', element: <Lightprovider /> },
    { path: 'lights/coupons', element: <LightCoupon /> },


    // ===============================
    // Bouncers & Security Routes
    // ===============================
    { path: 'bouncers/dashboard', element: <Bouncerdashboard /> },
    { path: 'bouncers/AddProvider', element: <Bounceraddprovider /> },
    { path: 'bouncers/AddProvider/:id', element: <Bounceraddprovider /> },
    { path: 'bouncers/category', element: <Bouncercategory /> },
    { path: 'bouncers/bouncerList', element: <BouncerListComp /> },
    { path: 'bouncers/bouncerprovider', element: <Bouncerprovider /> },
    { path: 'bouncers/coupons', element: <BouncerCouponComp /> },


    // ===============================
    // Emcee Routes
    // ===============================
    { path: 'emcee/dashboard', element: <Emceedashboard /> },
    { path: 'emcee/AddProvider', element: <Emceeaddprovider /> },
    { path: 'emcee/AddProvider/:id', element: <Emceeaddprovider /> },
    { path: 'emcee/category', element: <Emceecategory /> },
    { path: 'emcee/emceeList', element: <EmceeListComp /> },
    { path: 'emcee/emceeprovider', element: <Emceeprovider /> },
    { path: 'emcee/coupons', element: <EmceeCouponComp /> },


    // ===============================
    // Panthal & Decorations Routes
    // ===============================
    { path: 'panthal/dashboard', element: <Panthaldashboard /> },
    { path: 'panthal/AddProvider', element: <Panthaladdprovider /> },
    { path: 'panthal/AddProvider/:id', element: <Panthaladdprovider /> },
    { path: 'panthal/category', element: <Panthalcategory /> },
    { path: 'panthal/panthalList', element: <PanthalListComp /> },
    { path: 'panthal/panthalprovider', element: <Panthalprovider /> },
    { path: 'panthal/coupons', element: <PanthalCouponComp /> },


    // ===============================
    // Event Professionals Routes
    // ===============================
    { path: 'eventprofessionals/dashboard', element: <Professionaldashboard /> },
    { path: 'eventprofessionals/AddProvider', element: <Professionaladdprovider /> },
    { path: 'eventprofessionals/AddProvider/:id', element: <Professionaladdprovider /> },
    { path: 'eventprofessionals/category', element: <Professionalcategory /> },
    { path: 'eventprofessionals/professionalList', element: <ProfessionalListComp /> },
    { path: 'eventprofessionals/professionalprovider', element: <Professionalprovider /> },
    { path: 'eventprofessionals/coupons', element: <ProfessionalCouponComp /> },
  ]
};

export default MainRoutes;

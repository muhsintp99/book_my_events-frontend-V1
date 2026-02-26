// import dashboard from './auditorium/dashboard';
// import Promotionmgt from './CRM/promotionmanagement';
// import Providermgt from './CRM/Providermanagement';
// import tripmanagemet from './CRM/tripmanagment';
// import vehiclemgt from './CRM/vehiclemanagement';
// import pages from './pages';


// const menuItems = {
//   items: [dashboard, tripmanagemet,Promotionmgt,vehiclemgt,Providermgt,pages]
// };

// export default menuItems;
// Import all your menu modules
import dashboard from './auditorium/dashboard';
import Promotionmgt from './CRM/promotionmanagement';
import Providermgt from './CRM/Providermanagement';
import tripmanagemet from './CRM/tripmanagment';
import vehiclemgt from './CRM/vehiclemanagement';
import pages from './pages';
// import utilities from './utilities';
// import other from './other';
import auditoriummanagement from './auditorium/auditoriummanagement';
import customers from './auditorium/auditoriummanagement';
import bookings from './auditorium/vehiclemanagement';
import Providermanagement from './auditorium/providermanagement';
import management from './auditorium/management';
import auditoriumsections from './auditorium/auditoriumsections';
import zonemanagement from './settings-items/zonemanagement';
import modulemanagement from './settings-items/modulemanagement';// ==============================|| DYNAMIC MENU ITEMS ||============================== //
import subscriptionmanagement from './settings-items/subscriptionmanage';
import taxmanagement from './settings-items/taxmanagement';
import employeemanagement from './settings-items/employeemanage';
import kycmanagement from './settings-items/kycmanagement';
import cateringmanagement from './catering/cateringmanagement';

import cateringsections from './catering/cateringsections';
import CateringProvidermanagement from './catering/cateringprovidermanagement';
import makeupsections from './makeup/makeupsections';
import makeupmanangement from './makeup/makeupmanagement';
import MakeupProvidermanagement from './makeup/makeupprovidermanagement';
import photographymanangement from './Photography/photographymanagement';
import photographysections from './Photography/photographysections';
import PhotographyProvidermanagement from './Photography/providermanagement';
import cakemanagement from './cakes/cakemanagement';
import cakesections from './cakes/cakesections';
import CakeProvidermanagement from './cakes/providermanagement';

import ornamentsmanagement from './ornaments/ornamentsmanagement';
import ornamentssections from './ornaments/ornamentssections';
import OrnamentsProvidermanagement from './ornaments/ornamentsprovidermanagement';

import boutiquemanagement from './boutique/boutiquemanagement';
import boutiquesections from './boutique/boutiquesections';
import BoutiqueProvidermanagement from './boutique/boutiqueprovidermanagement';
import pincodemanagement from './settings-items/pincodemanagment';
import vendorregistrations from './settings-items/vendorregistrations';
import mehandimanagement from './mehandi/mehandimanagement';
import mehandisections from './mehandi/mehandisections';
import MehandiProvidermanagement from './mehandi/mehandiprovidermanagement';
import InvitationProvidermanagement from './invitation&management/invitationprovidermanagement';
import invitationsections from './invitation&management/invitationsections';
import invitationmanagement from './invitation&management/invitationmanagement';
import BoutiqProvidermanagement from './florist&stage/floristprovidermanagement';
import FloristProvidermanagement from './florist&stage/floristprovidermanagement';
import floristsections from './florist&stage/floristsections';
import floristmanagement from './florist&stage/floristmanagement';
import floristdashboard from './florist&stage/floristdashboard';
import mehandidashboard from './mehandi/mehandidashboard';
import invitationdashboard from './invitation&management/invitationdashboard';
import cateringdashboard from './catering/dashboard';
import makeupdashboard from './makeup/dashboard';
import photographydashboard from './Photography/dashboard';
import cakedashboard from './cakes/dashboard';
import ornamentsdashboard from './ornaments/dashboard';
import boutiquedashboard from './boutique/dashboard';
import rentaldashboard from './CRM/rentaldashboard';

// Define menu items for each module
const moduleMenuItems = {
  crm: {
    items: [rentaldashboard, Promotionmgt, vehiclemgt, Providermgt]
  },

  rental: {
    items: [rentaldashboard, Promotionmgt, vehiclemgt, Providermgt]
  },

  events: {
    items: [tripmanagemet, Promotionmgt, vehiclemgt, Providermgt]
  },

  auditorium: {
    items: [dashboard, auditoriummanagement, auditoriumsections, Providermanagement]
  },
  catering: {
    items: [cateringdashboard, cateringmanagement, cateringsections, CateringProvidermanagement]
  },
  makeup: {
    items: [makeupdashboard, makeupmanangement, makeupsections, MakeupProvidermanagement]
  },
  photography: {
    items: [photographydashboard, photographymanangement, photographysections, PhotographyProvidermanagement]
  },
  cake: {
    items: [cakedashboard, cakemanagement, cakesections, CakeProvidermanagement]
  },
  ornaments: {
    items: [ornamentsdashboard, ornamentsmanagement, ornamentssections, OrnamentsProvidermanagement]
  },

  boutique: {
    items: [boutiquedashboard, boutiquemanagement, boutiquesections, BoutiqueProvidermanagement]
  },

  mehandi: {
    items: [mehandidashboard, mehandimanagement, mehandisections, MehandiProvidermanagement]
  },
  invitationprinting: {
    items: [invitationdashboard, invitationmanagement, invitationsections, InvitationProvidermanagement]
  },
  floriststage: {
    items: [floristdashboard, floristmanagement, floristsections, FloristProvidermanagement]
  },
  setting: {
    // items: [zonemanagement, modulemanagement, subscriptionmanagement, taxmanagement, employeemanagement, kycmanagement]
    items: [zonemanagement, pincodemanagement, modulemanagement, subscriptionmanagement, kycmanagement, vendorregistrations]

  }

};

// Function to get menu items based on active module
export const getMenuItemsByModule = (moduleType = 'crm') => {
  return moduleMenuItems[moduleType] || moduleMenuItems.crm;
};

// Function to get current active module from localStorage
// export const getCurrentModule = () => {
//   return localStorage.getItem('activeModule') || 'crm';
// };

export const getCurrentModule = () => {
  const module = localStorage.getItem('activeModule');

  if (!module) return 'crm';

  return module
    .toLowerCase()
    .replace(/\s+/g, '')  // remove spaces
    .replace(/&/g, '')    // remove &
    .trim();
};

// Default export for backward compatibility
const menuItems = getMenuItemsByModule(getCurrentModule());

export default menuItems;
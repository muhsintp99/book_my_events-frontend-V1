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

// Define menu items for each module
const moduleMenuItems = {
  crm: {
    items: [dashboard, Promotionmgt, vehiclemgt, Providermgt]
  },

  rental: {
    items: [dashboard, Promotionmgt, vehiclemgt, Providermgt]
  },

  events: {
    items: [tripmanagemet, Promotionmgt, vehiclemgt, Providermgt]
  },

  auditorium: {
    items: [dashboard, auditoriummanagement, auditoriumsections, Providermanagement]
  },
  catering: {
    items: [dashboard, cateringmanagement, cateringsections, CateringProvidermanagement]
  },
  makeup: {
    items: [dashboard, makeupmanangement, makeupsections, MakeupProvidermanagement]
  },
  photography: {
    items: [dashboard, photographymanangement, photographysections, PhotographyProvidermanagement]
  },
  cake: {
    items: [dashboard, cakemanagement, cakesections, CakeProvidermanagement]
  },
  ornaments: {
    items: [dashboard, ornamentsmanagement, ornamentssections, OrnamentsProvidermanagement]
  },

  boutique: {
    items: [dashboard, boutiquemanagement, boutiquesections, BoutiqueProvidermanagement]
  },

  mehandi: {
    items: [dashboard, mehandimanagement, mehandisections, MehandiProvidermanagement]
  },
  invitationprinting:{
    items: [dashboard, invitationmanagement, invitationsections, InvitationProvidermanagement]
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
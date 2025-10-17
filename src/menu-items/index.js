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
    items: [dashboard,auditoriummanagement,auditoriumsections,Providermanagement] 
  },

  setting:{
    items: [zonemanagement,modulemanagement,subscriptionmanagement,taxmanagement,employeemanagement]
  }
};

// Function to get menu items based on active module
export const getMenuItemsByModule = (moduleType = 'crm') => {
  return moduleMenuItems[moduleType] || moduleMenuItems.crm;
};

// Function to get current active module from localStorage
export const getCurrentModule = () => {
  return localStorage.getItem('activeModule') || 'crm';
};

// Default export for backward compatibility
const menuItems = getMenuItemsByModule(getCurrentModule());

export default menuItems;
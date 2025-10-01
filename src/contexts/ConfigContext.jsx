// import PropTypes from 'prop-types';
// import { createContext } from 'react';

// // project imports
// import defaultConfig from 'config';
// import useLocalStorage from 'hooks/useLocalStorage';

// // initial state
// const initialState = {
//   ...defaultConfig,
//   onChangeFontFamily: () => {},
//   onChangeBorderRadius: () => {},
//   onReset: () => {}
// };

// // ==============================|| CONFIG CONTEXT & PROVIDER ||============================== //

// const ConfigContext = createContext(initialState);

// function ConfigProvider({ children }) {
//   const [config, setConfig] = useLocalStorage('berry-config-vite-ts', {
//     fontFamily: initialState.fontFamily,
//     borderRadius: initialState.borderRadius
//   });

//   const onChangeFontFamily = (fontFamily) => {
//     setConfig({
//       ...config,
//       fontFamily
//     });
//   };

//   const onChangeBorderRadius = (event, newValue) => {
//     setConfig({
//       ...config,
//       borderRadius: newValue
//     });
//   };

//   const onReset = () => {
//     setConfig({ ...defaultConfig });
//   };

//   return (
//     <ConfigContext.Provider
//       value={{
//         ...config,
//         onChangeFontFamily,
//         onChangeBorderRadius,
//         onReset
//       }}
//     >
//       {children}
//     </ConfigContext.Provider>
//   );
// }

// export { ConfigProvider, ConfigContext };

// ConfigProvider.propTypes = { children: PropTypes.node };



import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ConfigContext = createContext(null);

const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    borderRadius: 8,
    fontFamily: 'Roboto, sans-serif',
    mode: localStorage.getItem('themeMode') || 
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'light'),
          // (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    outlinedFilled: true,
    presetColor: 'default'
  });

  useEffect(() => {
    const handler = (e) => {
      if (!localStorage.getItem('themeMode')) {
        setConfig((prev) => ({ ...prev, mode: e.matches ? 'light' : 'light' }));
        // setConfig((prev) => ({ ...prev, mode: e.matches ? 'dark' : 'light' }));
      }
    };
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handler);
  }, []);

  const onChangeMode = (newMode) => {
    setConfig((prev) => ({ ...prev, mode: newMode }));
    localStorage.setItem('themeMode', newMode);
  };

  const resetMode = () => {
    setConfig((prev) => ({ ...prev, mode: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'light' }));
    // setConfig((prev) => ({ ...prev, mode: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' }));
    localStorage.removeItem('themeMode');
  };

  return (
    <ConfigContext.Provider value={{ ...config, onChangeMode, resetMode }}>
      {children}
    </ConfigContext.Provider>
  );
};

ConfigProvider.propTypes = {
  children: PropTypes.node
};

const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export { ConfigProvider, useConfig };
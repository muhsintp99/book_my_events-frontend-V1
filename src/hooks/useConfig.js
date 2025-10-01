// import { useContext } from 'react';
// import { ConfigContext } from 'contexts/ConfigContext';

// // ==============================|| CONFIG - HOOKS ||============================== //

// export default function useConfig() {
//   return useContext(ConfigContext);
// }



import { useState, useEffect } from 'react';

const useConfig = () => {
  const [config, setConfig] = useState({
    borderRadius: 8,
    fontFamily: 'Roboto, sans-serif',
    mode: localStorage.getItem('themeMode') || 
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    outlinedFilled: true,
    presetColor: 'default'
  });

  useEffect(() => {
    const handler = (e) => {
      if (!localStorage.getItem('themeMode')) {
        setConfig((prev) => ({ ...prev, mode: e.matches ? 'dark' : 'light' }));
      }
    };
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handler);
  }, []);

  const onChangeMode = (newMode) => {
    setConfig((prev) => ({ ...prev, mode: newMode }));
    localStorage.setItem('themeMode', newMode);
  };

  return { ...config, onChangeMode };
};

export default useConfig;
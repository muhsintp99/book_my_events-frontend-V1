// import { RouterProvider } from 'react-router-dom';

// // routing
// import router from 'routes';

// // project imports
// import NavigationScroll from 'layout/NavigationScroll';

// import ThemeCustomization from 'themes';

// // auth provider

// // ==============================|| APP ||============================== //

// export default function App() {
//   return (
//     <ThemeCustomization>
//       <NavigationScroll>
//         <>
//           <RouterProvider router={router} />
//         </>
//       </NavigationScroll>
//     </ThemeCustomization>
//   );
// }


// --------------------------------------------------------------------


import { RouterProvider } from 'react-router-dom';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

// ==============================|| APP ||============================== //
export default function App() {
  return (
    <NavigationScroll>
      <RouterProvider router={router} />
    </NavigationScroll>
  );
}

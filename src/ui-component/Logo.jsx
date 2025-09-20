// // material-ui
// import { Box, Typography } from '@mui/material';
// import logo from '../assets/images/blacklogo.png';

// // ==============================|| LOGO COMPONENT ||============================== //

// export default function Logo() {
//   return (
//     <Box display="flex" alignItems="center">
//       <Box
//         component="img"
//         src={logo}
//         alt="Sabka Pro"
//         sx={{
//           height: 39,
//           mr: 1,
//         }}
//       />
//     </Box>
//   );
// }



// material-ui
import { useTheme } from '@mui/material/styles';

import logo from '../assets/images/book.png';
import logoDark from '../assets/images/whitelogo.png';

// ==============================|| LOGO ||============================== //
export default function Logo() {
  const theme = useTheme();

  return (
    <img
      src={theme.palette.mode === 'dark' ? logoDark : logo}
      alt="Sabka Pro"
      width="140"
    />
  );
}


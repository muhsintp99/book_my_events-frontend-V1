// // material-ui
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import CardHeader from '@mui/material/CardHeader';
// import Divider from '@mui/material/Divider';
// import Typography from '@mui/material/Typography';

// // constant
// const headerStyle = {
//   '& .MuiCardHeader-action': { mr: 0 }
// };

// const MainCard = function MainCard({
//   border = false,
//   boxShadow,
//   children,
//   content = true,
//   contentClass = '',
//   contentSX = {},
//   headerSX = {},
//   darkTitle,
//   secondary,
//   shadow,
//   sx = {},
//   title,
//   ref,
//   ...others
// }) {
//   const defaultShadow = '0 2px 14px 0 rgb(32 40 45 / 8%)';

//   return (
//     <Card
//       ref={ref}
//       {...others}
//       sx={{
//         border: border ? '1px solid' : 'none',
//         borderColor: 'divider',
//         ':hover': {
//           boxShadow: boxShadow ? shadow || defaultShadow : 'inherit'
//         },
//         ...sx
//       }}
//     >
//       {/* card header and action */}
//       {!darkTitle && title && <CardHeader sx={{ ...headerStyle, ...headerSX }} title={title} action={secondary} />}
//       {darkTitle && title && (
//         <CardHeader sx={{ ...headerStyle, ...headerSX }} title={<Typography variant="h3">{title}</Typography>} action={secondary} />
//       )}

//       {/* content & header divider */}
//       {title && <Divider />}

//       {/* card content */}
//       {content && (
//         <CardContent sx={contentSX} className={contentClass}>
//           {children}
//         </CardContent>
//       )}
//       {!content && children}
//     </Card>
//   );
// };

// export default MainCard;



import { forwardRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

const headerStyle = {
  '& .MuiCardHeader-action': { mr: 0 }
};

/**
 * MainCard Component
 * A reusable card that adapts to light/dark mode using MUI theme.
 */
const MainCard = forwardRef(({
  border = false,
  boxShadow,
  children,
  content = true,
  contentClass = '',
  contentSX = {},
  headerSX = {},
  darkTitle,
  secondary,
  shadow,
  sx = {},
  title,
  ...others
}, ref) => {
  const theme = useTheme();
  const defaultShadow = theme.customShadows?.z8 || theme.shadows[1];

  return (
    <Card
      ref={ref}
      {...others}
      sx={{
        border: border ? '1px solid' : 'none',
        borderColor: theme.palette.divider,
        ':hover': {
          boxShadow: boxShadow ? shadow || defaultShadow : 'inherit'
        },
        // Let theme decide background in both modes
        backgroundColor: theme.palette.background.paper,
        ...sx
      }}
    >
      {/* Header */}
      {!darkTitle && title && (
        <CardHeader
          sx={{ ...headerStyle, ...headerSX }}
          title={title}
          action={secondary}
        />
      )}

      {darkTitle && title && (
        <CardHeader
          sx={{ ...headerStyle, ...headerSX }}
          title={<Typography variant="h3">{title}</Typography>}
          action={secondary}
        />
      )}

      {/* Divider if title exists */}
      {title && <Divider />}

      {/* Content */}
      {content ? (
        <CardContent sx={contentSX} className={contentClass}>
          {children}
        </CardContent>
      ) : children}
    </Card>
  );
});

export default MainCard;

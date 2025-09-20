  import React, { useState, useEffect } from 'react';
  import { 
    Box, 
    Typography, 
    Button, 
    Container,
    useTheme,
    keyframes,
    styled,
  } from '@mui/material';
  import { Link as RouterLink } from 'react-router-dom';
  import { IconHome, IconArrowLeft } from '@tabler/icons-react';

  // Keyframe animations
  const float = keyframes`
    0%, 100% { 
      transform: translateY(0px) rotate(0deg); 
    }
    50% { 
      transform: translateY(-20px) rotate(180deg); 
    }
  `;

  const fadeInUp = keyframes`
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  const glitch = keyframes`
    0%, 100% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
  `;

  const pulse = keyframes`
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  `;

  const spinSlow = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `;

  // Styled components
  const BackgroundBox = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, rgba(156, 39, 176, 0.3) 0%, rgba(63, 81, 181, 0.3) 100%)',
      zIndex: 1,
    }
  }));

  const FloatingParticle = styled(Box)(({ size, top, left, delay }) => ({
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '50%',
    top: `${top}%`,
    left: `${left}%`,
    animation: `${float} ${3 + Math.random() * 2}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    zIndex: 1,
  }));

  const GlitchText = styled(Typography)(({ theme }) => ({
    fontFamily: 'monospace',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)',
    backgroundSize: '300% 300%',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    position: 'relative',
    display: 'inline-block',
    animation: `${glitch} 2s infinite`,
    textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
    '&::before': {
      content: '"404"',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animation: `${pulse} 1.5s infinite`,
      transform: 'translate(-2px, -2px)',
      zIndex: -1,
    },
    '&::after': {
      content: '"404"',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(45deg, #45b7d1, #96ceb4)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animation: `${pulse} 1.5s infinite`,
      animationDelay: '0.1s',
      transform: 'translate(2px, 2px)',
      zIndex: -2,
    }
  }));

  const AnimatedBox = styled(Box)(({ delay = 0 }) => ({
    animation: `${fadeInUp} 0.8s ease-out forwards`,
    animationDelay: `${delay}s`,
    opacity: 0,
  }));

  const GradientButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
    borderRadius: '50px',
    padding: '12px 32px',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    ...(buttonVariant === 'primary' ? {
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)',
        background: 'linear-gradient(45deg, #764ba2 0%, #667eea 100%)',
      }
    } : {
      background: 'transparent',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.8)',
      '&:hover': {
        transform: 'translateY(-2px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'white',
        boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)',
      }
    }),
    '& .MuiButton-startIcon': {
      transition: 'transform 0.3s ease',
    },
    '&:hover .MuiButton-startIcon': {
      transform: 'translateX(-4px)',
    }
  }));

  const PageNotFound = () => {
    const theme = useTheme();
    const [particles, setParticles] = useState([]);

    useEffect(() => {
      // Generate floating particles
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 2,
      }));
      setParticles(newParticles);
    }, []);

    return (
      <BackgroundBox>
        {/* Floating Particles */}
        {particles.map((particle) => (
          <FloatingParticle
            key={particle.id}
            size={particle.size}
            top={particle.top}
            left={particle.left}
            delay={particle.delay}
          />
        ))}

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              minHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            {/* Main 404 Text */}
            <AnimatedBox>
              <GlitchText
                variant="h1"
                sx={{
                  fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
                  mb: 2
                }}
              >
                404
              </GlitchText>
            </AnimatedBox>

            {/* Subtitle */}
            <AnimatedBox delay={0.2}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  color: 'white',
                  mb: 2,
                  fontWeight: 300,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  background: 'linear-gradient(45deg, #ffffff 0%, #f0f0f0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Page Not Found
              </Typography>
            </AnimatedBox>

            {/* Description */}
            <AnimatedBox delay={0.4}>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 6,
                  maxWidth: '600px',
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  fontWeight: 300,
                }}
              >
                The page you're looking for seems to have drifted into the digital void. 
                Don't worry though, even the best explorers sometimes take a wrong turn.
              </Typography>
            </AnimatedBox>

            {/* Buttons */}
            <AnimatedBox delay={0.6}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  mb: 8,
                  alignItems: 'center'
                }}
              >
                <GradientButton
                  variant="primary"
                  size="large"
                  startIcon={<IconArrowLeft size={20} />}
                  onClick={() => window.history.back()}
                >
                  Go Back
                </GradientButton>
                
                <GradientButton
                  variant="secondary"
                  size="large"
                  startIcon={<IconHome size={20} />}
                  component={RouterLink}
                  to="/dashboard"
                >
                  Home
                </GradientButton>
              </Box>
            </AnimatedBox>
          </Box>
        </Container>
      </BackgroundBox>
    );
  };

  export default PageNotFound;
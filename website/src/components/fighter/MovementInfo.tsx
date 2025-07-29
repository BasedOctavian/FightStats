import React from 'react';
import { Paper, Typography, Grid, Box, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Fighter } from '../../types/firestore';

interface MovementInfoProps {
  fighter: Fighter;
  weightClassAvgData?: any;
}

const MovementInfo: React.FC<MovementInfoProps> = ({ fighter, weightClassAvgData }): JSX.Element => {
  // State for managing collapsed sections
  const [collapsedSections, setCollapsedSections] = React.useState({
    location: false,
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate Center Octagon Control Percentage
  const centerOctagonControlPercentage = React.useMemo(() => {
    const centerOctagon = fighter.CenterOctagon || 0;
    const pushedBackToCage = fighter.PushedBackToCage || 0;
    const pushingAgainstCage = fighter.PushingAgainstCage || 0;
    const totalCageTime = centerOctagon + pushedBackToCage + pushingAgainstCage;
    
    if (totalCageTime === 0) return 0;
    return (centerOctagon / totalCageTime) * 100;
  }, [fighter.CenterOctagon, fighter.PushedBackToCage, fighter.PushingAgainstCage]);

  // Calculate Cage Pushing Percentage
  const cagePushingPercentage = React.useMemo(() => {
    const centerOctagon = fighter.CenterOctagon || 0;
    const pushedBackToCage = fighter.PushedBackToCage || 0;
    const pushingAgainstCage = fighter.PushingAgainstCage || 0;
    const totalCageTime = centerOctagon + pushedBackToCage + pushingAgainstCage;
    
    if (totalCageTime === 0) return 0;
    return (pushingAgainstCage / totalCageTime) * 100;
  }, [fighter.CenterOctagon, fighter.PushedBackToCage, fighter.PushingAgainstCage]);

  // Calculate Pushed Back Percentage
  const pushedBackPercentage = React.useMemo(() => {
    const centerOctagon = fighter.CenterOctagon || 0;
    const pushedBackToCage = fighter.PushedBackToCage || 0;
    const pushingAgainstCage = fighter.PushingAgainstCage || 0;
    const totalCageTime = centerOctagon + pushedBackToCage + pushingAgainstCage;
    
    if (totalCageTime === 0) return 0;
    return (pushedBackToCage / totalCageTime) * 100;
  }, [fighter.CenterOctagon, fighter.PushedBackToCage, fighter.PushingAgainstCage]);

  // Calculate weight class center octagon control percentage
  const weightClassCenterOctagonControlPercentage = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassCenterOctagon = weightClassAvgData.CenterOctagon || 0;
    const weightClassPushedBackToCage = weightClassAvgData.PushedBackToCage || 0;
    const weightClassPushingAgainstCage = weightClassAvgData.PushingAgainstCage || 0;
    const weightClassTotalCageTime = weightClassCenterOctagon + weightClassPushedBackToCage + weightClassPushingAgainstCage;
    
    if (weightClassTotalCageTime === 0) return 0;
    return (weightClassCenterOctagon / weightClassTotalCageTime) * 100;
  }, [weightClassAvgData]);

  // Calculate weight class cage pushing percentage
  const weightClassCagePushingPercentage = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassCenterOctagon = weightClassAvgData.CenterOctagon || 0;
    const weightClassPushedBackToCage = weightClassAvgData.PushedBackToCage || 0;
    const weightClassPushingAgainstCage = weightClassAvgData.PushingAgainstCage || 0;
    const weightClassTotalCageTime = weightClassCenterOctagon + weightClassPushedBackToCage + weightClassPushingAgainstCage;
    
    if (weightClassTotalCageTime === 0) return 0;
    return (weightClassPushingAgainstCage / weightClassTotalCageTime) * 100;
  }, [weightClassAvgData]);

  // Calculate weight class pushed back percentage
  const weightClassPushedBackPercentage = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassCenterOctagon = weightClassAvgData.CenterOctagon || 0;
    const weightClassPushedBackToCage = weightClassAvgData.PushedBackToCage || 0;
    const weightClassPushingAgainstCage = weightClassAvgData.PushingAgainstCage || 0;
    const weightClassTotalCageTime = weightClassCenterOctagon + weightClassPushedBackToCage + weightClassPushingAgainstCage;
    
    if (weightClassTotalCageTime === 0) return 0;
    return (weightClassPushedBackToCage / weightClassTotalCageTime) * 100;
  }, [weightClassAvgData]);

  // Calculate location control rating from 1-99
  const locationControlRating = React.useMemo(() => {
    // Helper function to normalize values to 1-99 scale
    const normalizeValue = (fighterValue: number, weightClassValue: number) => {
      if (weightClassValue === 0) {
        // If no weight class data, use simple normalization
        const maxValue = Math.max(fighterValue, 1);
        return Math.min(99, Math.max(1, (fighterValue / maxValue) * 99));
      }
      
      // Calculate percentage relative to weight class average
      const percentage = (fighterValue / weightClassValue) * 100;
      
      // Convert to 1-99 scale
      // 50% = 25 rating (below average)
      // 100% = 50 rating (average)
      // 150% = 75 rating (above average)
      // 200%+ = 99 rating (exceptional)
      let rating = 50 + (percentage - 100) * 0.5;
      
      // Cap between 1 and 99
      return Math.min(99, Math.max(1, rating));
    };

    // Calculate individual component ratings
    // Pushing forward is positive, center is slightly positive, being pushed back is negative
    const pushingRating = normalizeValue(cagePushingPercentage, weightClassCagePushingPercentage);
    const centerRating = normalizeValue(centerOctagonControlPercentage, weightClassCenterOctagonControlPercentage);
    const pushedBackRating = 99 - normalizeValue(pushedBackPercentage, weightClassPushedBackPercentage); // Invert so lower is better
    
    // Combine ratings with weights
    // Pushing forward is most important (40%), center control is good (35%), avoiding being pushed back is important (25%)
    const overallRating = (pushingRating * 0.4) + (centerRating * 0.35) + (pushedBackRating * 0.25);
    
    return overallRating;
  }, [cagePushingPercentage, centerOctagonControlPercentage, pushedBackPercentage, weightClassCagePushingPercentage, weightClassCenterOctagonControlPercentage, weightClassPushedBackPercentage]);

  // Styles object
  const styles = {
    // Main container
    container: {
      p: { xs: 2, sm: 3, md: 4 },
      mb: 3,
      bgcolor: 'transparent',
      borderRadius: '12px',
      position: 'relative' as const,
      overflow: 'hidden',
      border: '1px solid rgba(0, 240, 255, 0.1)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
      }
    },

    // Collapsible section styles
    collapsibleSection: {
      bgcolor: 'rgba(10, 14, 23, 0.4)',
      borderRadius: '12px',
      border: '1px solid rgba(0, 240, 255, 0.15)',
      overflow: 'hidden',
      mb: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        border: '1px solid rgba(0, 240, 255, 0.3)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
          opacity: 0.5,
        }
      },
    },

    sectionHeader: {
      p: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: 'rgba(0, 240, 255, 0.05)',
      }
    },

    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    },

    expandIcon: {
      color: '#00F0FF',
      transition: 'transform 0.3s ease',
      '&.expanded': {
        transform: 'rotate(180deg)',
      }
    },

    // Main card container
    card: {
      p: 3,
      borderRadius: '12px',
      bgcolor: 'rgba(10, 14, 23, 0.4)',
      border: '1px solid rgba(0, 240, 255, 0.15)',
      height: '100%',
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: 'rgba(10, 14, 23, 0.6)',
        transform: 'translateY(-2px)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        '& .rating-icon': {
          transform: 'scale(1.1)',
        },
        '& .rating-progress': {
          transform: 'scale(1.05)',
        }
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
        opacity: 0.5,
      }
    },

    // Header section
    header: {
      display: 'flex',
      alignItems: 'center',
      mb: 2,
      gap: 1.5,
    },

    // Icon container
    icon: {
      width: 40,
      height: 40,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.9), rgba(10, 14, 23, 0.7))',
      border: '1px solid rgba(0, 240, 255, 0.2)',
      transition: 'transform 0.3s ease',
    },

    // Title styling
    title: {
      color: '#fff',
      fontWeight: 600,
      fontSize: '1.1rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },

    // Overall rating specific styles
    overallCard: {
      background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
      border: '2px solid rgba(0, 150, 255, 0.3)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
      '&:hover': {
        border: '2px solid rgba(0, 150, 255, 0.5)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 150, 255, 0.25), 0 0 80px rgba(0, 150, 255, 0.15)',
      }
    },

    overallValue: {
      fontSize: { xs: '3.5rem', sm: '4rem' },
      fontWeight: 900,
      background: 'linear-gradient(135deg, #FFFFFF 0%, #00F0FF 30%, #0096FF 70%, #0066FF 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 40px rgba(255, 255, 255, 0.6)',
      fontFamily: '"Orbitron", "Roboto", sans-serif',
      letterSpacing: '0.15em',
      mb: 1,
    },

    overallLabel: {
      color: '#FFFFFF',
      fontSize: '1rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.2em',
      textAlign: 'center' as const,
      textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
    },

    // Description
    description: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '0.9rem',
      mb: 2,
      fontStyle: 'italic',
    },
  };

  return (
    <Paper elevation={0} sx={styles.container}>
      {/* Header Section */}
      <Box sx={{ mb: 6, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            component="img"
            src="/icon.png"
            alt="Movement Analysis Icon"
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.3))',
            }}
          />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: '#fff',
              fontSize: { xs: '1.75rem', sm: '2rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
            }}
          >
            Movement Analysis
          </Typography>
        </Box>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            position: 'relative',
            pl: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '3px',
              height: '20px',
              background: 'linear-gradient(180deg, #00F0FF, #0066FF)',
              borderRadius: '2px',
            }
          }}
        >
          Comprehensive analysis of fighter movement patterns, positioning, and spatial control within the octagon
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Location Section */}
        <Grid item xs={12}>
          <Box sx={styles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={styles.sectionHeader}
              onClick={() => toggleSection('location')}
            >
              <Box sx={styles.sectionTitle}>
                <Box 
                  className="rating-icon"
                  sx={{
                    ...styles.icon,
                    width: 45,
                    height: 45,
                  }}
                >
                  <Box sx={{
                    width: '28px',
                    height: '28px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#00F0FF',
                      boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '2px solid #00F0FF',
                      opacity: 0.3,
                    }
                  }}/>
                </Box>
                <Typography sx={{
                  ...styles.title,
                  fontSize: '1.3rem',
                }}>
                  Location Control
                </Typography>
              </Box>
              <IconButton
                sx={styles.expandIcon}
                className={collapsedSections.location ? '' : 'expanded'}
              >
                {collapsedSections.location ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.location}>
              <Box sx={{ p: 4 }}>
                {/* Location Control Grade Display */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  p: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                  border: '2px solid rgba(0, 150, 255, 0.3)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                    opacity: 0.5,
                  }
                }}>
                  <Typography sx={{
                    color: '#FFFFFF',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                  }}>
                    Location Control Grade
                  </Typography>
                  
                  {/* Rating Circle */}
                  <Box sx={{ 
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                    border: '2px solid rgba(0, 240, 255, 0.2)',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 240, 255, 0.1)',
                    mb: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (locationControlRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (locationControlRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
                      zIndex: 1,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: 'rgba(10, 14, 23, 0.95)',
                      border: '1px solid rgba(0, 240, 255, 0.15)',
                      zIndex: 2,
                    }
                  }}>
                    <Box sx={{
                      position: 'relative',
                      zIndex: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Typography
                        sx={{
                          fontSize: '2.2rem',
                          fontWeight: 800,
                          color: '#00F0FF',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          lineHeight: 1,
                          textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                        }}
                      >
                        {locationControlRating.toFixed(0)}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          marginTop: '-2px',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        }}
                      >
                        Grade
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    maxWidth: '400px',
                    mx: 'auto',
                  }}>
                    Based on cage pushing effectiveness, center control, and defensive positioning
                  </Typography>
                </Box>

                <Grid container spacing={4}>
                  {/* Center Octagon Control Percentage */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(0, 240, 255, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 240, 255, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (centerOctagonControlPercentage * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (centerOctagonControlPercentage * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
                          zIndex: 1,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'rgba(10, 14, 23, 0.95)',
                          border: '1px solid rgba(0, 240, 255, 0.15)',
                          zIndex: 2,
                        }
                      }}>
                        <Box sx={{
                          position: 'relative',
                          zIndex: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Typography
                            sx={{
                              fontSize: '1.8rem',
                              fontWeight: 800,
                              color: '#00F0FF',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                            }}
                          >
                            {centerOctagonControlPercentage.toFixed(1)}%
                          </Typography>
                          <Typography
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.15em',
                              marginTop: '-2px',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                            }}
                          >
                            Center Control
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs {weightClassCenterOctagonControlPercentage.toFixed(1)}% avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Cage Pushing Percentage */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(0, 212, 170, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 212, 170, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #00D4AA 0deg, #00D4AA ' + (cagePushingPercentage * 3.6) + 'deg, rgba(0, 212, 170, 0.1) ' + (cagePushingPercentage * 3.6) + 'deg, rgba(0, 212, 170, 0.1) 360deg)',
                          zIndex: 1,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'rgba(10, 14, 23, 0.95)',
                          border: '1px solid rgba(0, 212, 170, 0.15)',
                          zIndex: 2,
                        }
                      }}>
                        <Box sx={{
                          position: 'relative',
                          zIndex: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Typography
                            sx={{
                              fontSize: '1.8rem',
                              fontWeight: 800,
                              color: '#00D4AA',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(0, 212, 170, 0.5)',
                            }}
                          >
                            {cagePushingPercentage.toFixed(1)}%
                          </Typography>
                          <Typography
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.15em',
                              marginTop: '-2px',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                            }}
                          >
                            Cage Pushing
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs {weightClassCagePushingPercentage.toFixed(1)}% avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Pushed Back Percentage */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(255, 56, 100, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 56, 100, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #FF3864 0deg, #FF3864 ' + (pushedBackPercentage * 3.6) + 'deg, rgba(255, 56, 100, 0.1) ' + (pushedBackPercentage * 3.6) + 'deg, rgba(255, 56, 100, 0.1) 360deg)',
                          zIndex: 1,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'rgba(10, 14, 23, 0.95)',
                          border: '1px solid rgba(255, 56, 100, 0.15)',
                          zIndex: 2,
                        }
                      }}>
                        <Box sx={{
                          position: 'relative',
                          zIndex: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Typography
                            sx={{
                              fontSize: '1.8rem',
                              fontWeight: 800,
                              color: '#FF3864',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(255, 56, 100, 0.5)',
                            }}
                          >
                            {pushedBackPercentage.toFixed(1)}%
                          </Typography>
                          <Typography
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.15em',
                              marginTop: '-2px',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                            }}
                          >
                            Pushed Back
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs {weightClassPushedBackPercentage.toFixed(1)}% avg
                      </Typography>
                    </Box>
                  </Grid>


                </Grid>
              </Box>
            </Collapse>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MovementInfo; 
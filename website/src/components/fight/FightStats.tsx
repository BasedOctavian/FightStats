import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface FightStatsProps {
  fightStats: {
    fighterAName: string;
    fighterBName: string;
    weightClass: string;
    methodOfFinish: string;
    // Fighter A stats
    ajabs: number;
    astraights: number;
    ahooks: number;
    auppercuts: number;
    aoverhands: number;
    abodykick: number;
    aheadkick: number;
    alegkick: number;
    anumofknockdowns: number;
    anumofstuns: number;
    astance: string;
    atdattempt: number;
    atdmake: number;
    atdrate: string;
    asubattempt: number;
    AHighImpact: number;
    Around1StrikesLanded: number;
    Around2StrikesLanded: number;
    Around3StrikesLanded: number;
    Around4StrikesLanded: number;
    Around5StrikesLanded: number;
    // Fighter B stats
    bjabs: number;
    bstraights: number;
    bhooks: number;
    buppercuts: number;
    boverhands: number;
    bbodykick: number;
    bheadkick: number;
    blegkick: number;
    bnumofknockdowns: number;
    bnumofstuns: number;
    bstance: string;
    btdattempt: number;
    btdmake: number;
    btdrate: string;
    bsubattempt: number;
    BHighImpact: number;
    Bround1StrikesLanded: number;
    Bround2StrikesLanded: number;
    Bround3StrikesLanded: number;
    Bround4StrikesLanded: number;
    Bround5StrikesLanded: number;
    // Fight info
    Rounds: number;
    Time: string;
  };
}

// Common styles
const cardStyle = {
  p: 4,
  bgcolor: 'rgba(10, 14, 23, 0.8)',
  borderRadius: '12px',
  border: '1px solid rgba(0, 240, 255, 0.15)',
  height: '100%',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    bgcolor: 'rgba(10, 14, 23, 0.9)',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    '& .glow-effect': {
      opacity: 1,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, rgba(0, 240, 255, 0), rgba(0, 240, 255, 0.5), rgba(0, 240, 255, 0))',
  }
};

const glowEffect = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.1), transparent 70%)',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out',
  pointerEvents: 'none',
};

const FightStats: React.FC<FightStatsProps> = ({ fightStats }) => {
  // Calculate total strikes for each fighter
  const calculateTotalStrikes = (fighter: 'a' | 'b') => {
    const prefix = fighter;
    const values = [
      `${prefix}jabs`,
      `${prefix}straights`,
      `${prefix}hooks`,
      `${prefix}uppercuts`,
      `${prefix}overhands`,
      `${prefix}bodykick`,
      `${prefix}headkick`,
      `${prefix}legkick`
    ] as const;

    return values.reduce((total, key) => {
      const value = Number(fightStats[key as keyof typeof fightStats]);
      return total + (isNaN(value) ? 0 : value);
    }, 0);
  };

  const fighterATotalStrikes = calculateTotalStrikes('a');
  const fighterBTotalStrikes = calculateTotalStrikes('b');

  // Add context information for each stat type
  const statDescriptions = {
    strikes: "Total number of significant strikes landed",
    highImpact: "Strikes that visibly rocked or hurt the opponent",
    knockdowns: "Times opponent was knocked down to the canvas",
    stuns: "Moments where opponent was visibly stunned but remained standing",
    tdSuccess: "Success rate of takedown attempts",
  };

  // Add tooltips for strike types
  const strikeDescriptions = {
    Jabs: "Quick, straight punches thrown with the lead hand",
    Straights: "Power punches thrown straight with the rear hand",
    Hooks: "Circular punches thrown from the side",
    Uppercuts: "Upward vertical punches",
    Overhands: "Looping punches thrown over the top",
    "Body Kicks": "Kicks targeting the opponent's torso",
    "Head Kicks": "High kicks targeting the opponent's head",
    "Leg Kicks": "Low kicks targeting the opponent's legs",
  };

  // Calculate fight duration in minutes and seconds
  const [minutes, seconds] = fightStats.Time.split(':').map(Number);
  const totalSeconds = (minutes * 60) + seconds;
  const strikesPerMinute = {
    [fightStats.fighterAName]: (fighterATotalStrikes / (totalSeconds / 60)).toFixed(1),
    [fightStats.fighterBName]: (fighterBTotalStrikes / (totalSeconds / 60)).toFixed(1),
  };

  // Prepare data for strike distribution chart
  const prepareStrikeDistributionData = () => {
    return [
      {
        name: 'Jabs',
        [fightStats.fighterAName]: fightStats.ajabs,
        [fightStats.fighterBName]: fightStats.bjabs,
        description: strikeDescriptions.Jabs,
      },
      {
        name: 'Straights',
        [fightStats.fighterAName]: fightStats.astraights,
        [fightStats.fighterBName]: fightStats.bstraights,
        description: strikeDescriptions.Straights,
      },
      {
        name: 'Hooks',
        [fightStats.fighterAName]: fightStats.ahooks,
        [fightStats.fighterBName]: fightStats.bhooks,
        description: strikeDescriptions.Hooks,
      },
      {
        name: 'Uppercuts',
        [fightStats.fighterAName]: fightStats.auppercuts,
        [fightStats.fighterBName]: fightStats.buppercuts,
        description: strikeDescriptions.Uppercuts,
      },
      {
        name: 'Overhands',
        [fightStats.fighterAName]: fightStats.aoverhands,
        [fightStats.fighterBName]: fightStats.boverhands,
        description: strikeDescriptions.Overhands,
      },
      {
        name: 'Body Kicks',
        [fightStats.fighterAName]: fightStats.abodykick,
        [fightStats.fighterBName]: fightStats.bbodykick,
        description: strikeDescriptions["Body Kicks"],
      },
      {
        name: 'Head Kicks',
        [fightStats.fighterAName]: fightStats.aheadkick,
        [fightStats.fighterBName]: fightStats.bheadkick,
        description: strikeDescriptions["Head Kicks"],
      },
      {
        name: 'Leg Kicks',
        [fightStats.fighterAName]: fightStats.alegkick,
        [fightStats.fighterBName]: fightStats.blegkick,
        description: strikeDescriptions["Leg Kicks"],
      },
    ];
  };

  // Prepare data for round-by-round analysis
  const prepareRoundData = () => {
    return Array.from({ length: fightStats.Rounds }, (_, i) => ({
      round: i + 1,
      [fightStats.fighterAName]: fightStats[`Around${i + 1}StrikesLanded` as keyof typeof fightStats] as number,
      [fightStats.fighterBName]: fightStats[`Bround${i + 1}StrikesLanded` as keyof typeof fightStats] as number,
    }));
  };

  // Prepare data for fighter comparison radar chart
  const prepareFighterComparisonData = () => {
    const getStrikeEfficiency = (total: number, landed: number) => 
      total > 0 ? (landed / total) * 100 : 0;

    return [
      {
        attribute: 'Strike Volume',
        [fightStats.fighterAName]: fighterATotalStrikes,
        [fightStats.fighterBName]: fighterBTotalStrikes,
      },
      {
        attribute: 'High Impact',
        [fightStats.fighterAName]: fightStats.AHighImpact,
        [fightStats.fighterBName]: fightStats.BHighImpact,
      },
      {
        attribute: 'Knockdowns',
        [fightStats.fighterAName]: fightStats.anumofknockdowns * 100,
        [fightStats.fighterBName]: fightStats.bnumofknockdowns * 100,
      },
      {
        attribute: 'Stuns',
        [fightStats.fighterAName]: fightStats.anumofstuns * 100,
        [fightStats.fighterBName]: fightStats.bnumofstuns * 100,
      },
      {
        attribute: 'TD Success',
        [fightStats.fighterAName]: getStrikeEfficiency(fightStats.atdattempt, fightStats.atdmake),
        [fightStats.fighterBName]: getStrikeEfficiency(fightStats.btdattempt, fightStats.btdmake),
      },
    ];
  };

  // Calculate fight momentum
  const calculateMomentum = () => {
    const rounds = Array.from({ length: fightStats.Rounds }, (_, i) => i + 1);
    let aStrikes = 0;
    let bStrikes = 0;
    
    return rounds.map(round => {
      aStrikes += fightStats[`Around${round}StrikesLanded` as keyof typeof fightStats] as number;
      bStrikes += fightStats[`Bround${round}StrikesLanded` as keyof typeof fightStats] as number;
      
      return {
        round,
        [fightStats.fighterAName]: aStrikes,
        [fightStats.fighterBName]: bStrikes,
      };
    });
  };

  return (
    <Box sx={{ mt: 6 }}>
      {/* Fight Overview Section */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 2,
            textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
          }}
        >
          Fight Analysis
        </Typography>
        <Typography 
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
              width: '4px',
              height: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(180deg, #00F0FF, transparent)',
              borderRadius: '2px',
            }
          }}
        >
          Comprehensive breakdown of striking performance and fight dynamics
        </Typography>
      </Box>

      {/* Fight Context Information */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ ...cardStyle, p: 2 }}>
            <Typography variant="subtitle2" color="rgba(255, 255, 255, 0.7)">
              Weight Class
            </Typography>
            <Typography variant="h6" color="#fff">
              {fightStats.weightClass}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ ...cardStyle, p: 2 }}>
            <Typography variant="subtitle2" color="rgba(255, 255, 255, 0.7)">
              Duration
            </Typography>
            <Typography variant="h6" color="#fff">
              {fightStats.Rounds} Rounds ({fightStats.Time})
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ ...cardStyle, p: 2 }}>
            <Typography variant="subtitle2" color="rgba(255, 255, 255, 0.7)">
              Method of Finish
            </Typography>
            <Typography variant="h6" color="#fff">
              {fightStats.methodOfFinish}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Strike Rate Information */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...cardStyle, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color="#00F0FF">
                {fightStats.fighterAName}
              </Typography>
              <Typography variant="h5" color="#00F0FF">
                {strikesPerMinute[fightStats.fighterAName]} 
                <Typography component="span" variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ ml: 1 }}>
                  strikes/min
                </Typography>
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...cardStyle, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color="#FF3864">
                {fightStats.fighterBName}
              </Typography>
              <Typography variant="h5" color="#FF3864">
                {strikesPerMinute[fightStats.fighterBName]}
                <Typography component="span" variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ ml: 1 }}>
                  strikes/min
                </Typography>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Strike Distribution Chart */}
        <Grid item xs={12}>
          <Paper sx={cardStyle}>
            <Box className="glow-effect" sx={glowEffect} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#fff', flex: 1 }}>
                Strike Distribution
              </Typography>
              <Tooltip title="Breakdown of different strike types landed by each fighter">
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  ℹ️ Hover over bars for details
                </Typography>
              </Tooltip>
            </Box>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer>
                <BarChart
                  data={prepareStrikeDistributionData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255, 255, 255, 0.7)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.7)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.8)', p: 2, borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="#fff">
                              {label}
                            </Typography>
                            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 1 }}>
                              {strikeDescriptions[label as keyof typeof strikeDescriptions]}
                            </Typography>
                            {payload.map((entry) => (
                              <Typography 
                                key={entry.name}
                                variant="body2"
                                color={entry.color}
                              >
                                {entry.name}: {entry.value}
                              </Typography>
                            ))}
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey={fightStats.fighterAName} 
                    fill="#00F0FF" 
                    opacity={0.8}
                  />
                  <Bar 
                    dataKey={fightStats.fighterBName} 
                    fill="#FF3864" 
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Fighter Comparison Radar - Enhanced with tooltips */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Box className="glow-effect" sx={glowEffect} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#fff', flex: 1 }}>
                Fighter Comparison
              </Typography>
              <Tooltip title="Overall performance metrics comparison">
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  ℹ️ Hover for metric details
                </Typography>
              </Tooltip>
            </Box>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer>
                <RadarChart data={prepareFighterComparisonData()}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                  <PolarAngleAxis 
                    dataKey="attribute"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                  />
                  <PolarRadiusAxis stroke="rgba(255, 255, 255, 0.1)" />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const attribute = payload[0].payload.attribute;
                        return (
                          <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.8)', p: 2, borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="#fff">
                              {attribute}
                            </Typography>
                            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 1 }}>
                              {statDescriptions[attribute.toLowerCase().replace(/\s+/g, '') as keyof typeof statDescriptions]}
                            </Typography>
                            {payload.map((entry) => (
                              <Typography 
                                key={entry.name}
                                variant="body2"
                                color={entry.color}
                              >
                                {entry.name}: {entry.value.toFixed(1)}
                              </Typography>
                            ))}
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                  <Radar
                    name={fightStats.fighterAName}
                    dataKey={fightStats.fighterAName}
                    stroke="#00F0FF"
                    fill="#00F0FF"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name={fightStats.fighterBName}
                    dataKey={fightStats.fighterBName}
                    stroke="#FF3864"
                    fill="#FF3864"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Round-by-Round Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Box className="glow-effect" sx={glowEffect} />
            <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
              Round-by-Round Analysis
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer>
                <BarChart
                  data={prepareRoundData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="round" 
                    stroke="rgba(255, 255, 255, 0.7)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.7)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey={fightStats.fighterAName} 
                    fill="#00F0FF" 
                    opacity={0.8}
                  />
                  <Bar 
                    dataKey={fightStats.fighterBName} 
                    fill="#FF3864" 
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Fight Momentum Chart */}
        <Grid item xs={12}>
          <Paper sx={cardStyle}>
            <Box className="glow-effect" sx={glowEffect} />
            <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
              Fight Momentum
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer>
                <BarChart
                  data={calculateMomentum()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="round" 
                    stroke="rgba(255, 255, 255, 0.7)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.7)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey={fightStats.fighterAName} 
                    fill="#00F0FF" 
                    opacity={0.8}
                  />
                  <Bar 
                    dataKey={fightStats.fighterBName} 
                    fill="#FF3864" 
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Fighter Stats Cards */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Box className="glow-effect" sx={glowEffect} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#00F0FF', flex: 1 }}>
                {fightStats.fighterAName}
              </Typography>
              <Chip 
                label={fightStats.astance}
                sx={{ 
                  bgcolor: 'rgba(0, 240, 255, 0.1)',
                  color: '#00F0FF',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                }}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  Total Strikes
                </Typography>
                <Typography variant="h4" sx={{ color: '#00F0FF', mb: 2 }}>
                  {fighterATotalStrikes}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  High Impact
                </Typography>
                <Typography variant="h4" sx={{ color: '#00F0FF', mb: 2 }}>
                  {fightStats.AHighImpact}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  Takedown Success
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ color: '#00F0FF' }}>
                    {fightStats.atdmake}/{fightStats.atdattempt}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    ({fightStats.atdrate})
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Box className="glow-effect" sx={glowEffect} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#FF3864', flex: 1 }}>
                {fightStats.fighterBName}
              </Typography>
              <Chip 
                label={fightStats.bstance}
                sx={{ 
                  bgcolor: 'rgba(255, 56, 100, 0.1)',
                  color: '#FF3864',
                  border: '1px solid rgba(255, 56, 100, 0.2)',
                }}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  Total Strikes
                </Typography>
                <Typography variant="h4" sx={{ color: '#FF3864', mb: 2 }}>
                  {fighterBTotalStrikes}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  High Impact
                </Typography>
                <Typography variant="h4" sx={{ color: '#FF3864', mb: 2 }}>
                  {fightStats.BHighImpact}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  Takedown Success
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ color: '#FF3864' }}>
                    {fightStats.btdmake}/{fightStats.btdattempt}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    ({fightStats.btdrate})
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FightStats; 
import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  useTheme,
  Fade,
  Button,
  ButtonGroup,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
  SportsMartialArts as SportsMartialArtsIcon,
  EmojiEvents as EmojiEventsIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  MyLocation as TargetIcon,
  FitnessCenter as FitnessCenterIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, ZAxis } from 'recharts';
import { useFighterTotalsWithFilters, FilterOptions, useStrikeEfficiency, usePunchEfficiency, useKickEfficiency } from '../hooks/useFighterTotals';

// Enhanced visualization types
type VisualizationType = 
  | 'strikeEfficiency' 
  | 'punchEfficiency' 
  | 'kickEfficiency'
  | 'volumeVsAccuracy'
  | 'clinchVsGround'
  | 'takedownVsSubmission'
  | 'cageControl'
  | 'strikingDiversity'
  | 'experienceVsSuccess'
  | 'defensiveVsOffensive';

type BubbleSizeType = 'minutesTracked' | 'fightsTracked' | 'totalStrikesThrown' | 'wins' | 'winPercentage';

// Interface for chart data point
interface ChartDataPoint {
  index: number;
  fighterName: string;
  xValue: number;
  yValue: number;
  bubbleSize: number;
  // Additional data for tooltips
  accuracy?: number;
  strikesLanded?: number;
  strikesThrown?: number;
  punchesLanded?: number;
  punchesThrown?: number;
  kicksLanded?: number;
  kicksThrown?: number;
  minutesTracked: number;
  wins: number;
  losses: number;
  winPercentage: number;
  titleFightWins: number;
  titleFightLosses: number;
  // New fields for enhanced visualizations
  clinchStrikesLanded?: number;
  clinchStrikesThrown?: number;
  groundStrikesLanded?: number;
  groundStrikesThrown?: number;
  takedownAttempts?: number;
  takedownSuccess?: number;
  submissionAttempts?: number;
  submissionWins?: number;
  centerOctagon?: number;
  pushedBackToCage?: number;
  pushingAgainstCage?: number;
  jabsThrown?: number;
  hooksThrown?: number;
  straightsThrown?: number;
  uppercutsThrown?: number;
  bodyKicksThrown?: number;
  legKicksThrown?: number;
  highKicksThrown?: number;
  elbowsThrown?: number;
  fightsTracked?: number;
  roundsTracked?: number;
}

const VisualizePage: React.FC = () => {
  const theme = useTheme();
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('strikeEfficiency');
  const [bubbleSizeType, setBubbleSizeType] = useState<BubbleSizeType>('minutesTracked');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    limit: 50,
    sortBy: 'accuracy',
    sortOrder: 'desc'
  });

  // Experience filters
  const [minMinutesTracked, setMinMinutesTracked] = useState<number>(20);
  const [minFightsTracked, setMinFightsTracked] = useState<number>(0);
  const [minRoundsTracked, setMinRoundsTracked] = useState<number>(0);

  // Strike volume filters
  const [minStrikesThrown, setMinStrikesThrown] = useState<number>(0);
  const [minStrikesLanded, setMinStrikesLanded] = useState<number>(0);
  const [minPunchesThrown, setMinPunchesThrown] = useState<number>(0);
  const [minKicksThrown, setMinKicksThrown] = useState<number>(0);

  // Fight outcome filters
  const [minWins, setMinWins] = useState<number>(0);
  const [maxLosses, setMaxLosses] = useState<number>(100);
  const [minWinPercentage, setMinWinPercentage] = useState<number>(0);
  const [hasTitleFightWins, setHasTitleFightWins] = useState<boolean>(false);
  const [hasTitleFightLosses, setHasTitleFightLosses] = useState<boolean>(false);

  // Striking style filters
  const [minJabsThrown, setMinJabsThrown] = useState<number>(0);
  const [minHooksThrown, setMinHooksThrown] = useState<number>(0);
  const [minStraightsThrown, setMinStraightsThrown] = useState<number>(0);
  const [minUppercutsThrown, setMinUppercutsThrown] = useState<number>(0);
  const [minBodyKicksThrown, setMinBodyKicksThrown] = useState<number>(0);
  const [minLegKicksThrown, setMinLegKicksThrown] = useState<number>(0);
  const [minHighKicksThrown, setMinHighKicksThrown] = useState<number>(0);
  const [minElbowsThrown, setMinElbowsThrown] = useState<number>(0);

  // Accuracy filters
  const [minStrikeAccuracy, setMinStrikeAccuracy] = useState<number>(0);
  const [maxStrikeAccuracy, setMaxStrikeAccuracy] = useState<number>(100);
  const [minPunchAccuracy, setMinPunchAccuracy] = useState<number>(0);
  const [maxPunchAccuracy, setMaxPunchAccuracy] = useState<number>(100);
  const [minKickAccuracy, setMinKickAccuracy] = useState<number>(0);
  const [maxKickAccuracy, setMaxKickAccuracy] = useState<number>(100);

  // Memoize the filter options to prevent infinite re-renders
  const filterOptions = useMemo(() => ({
    ...filters,
    minMinutesTracked,
    minFightsTracked,
    minRoundsTracked,
    minStrikesThrown,
    minStrikesLanded,
    minPunchesThrown,
    minKicksThrown,
    minWins,
    maxLosses,
    minWinPercentage,
    hasTitleFightWins,
    hasTitleFightLosses,
    minJabsThrown,
    minHooksThrown,
    minStraightsThrown,
    minUppercutsThrown,
    minBodyKicksThrown,
    minLegKicksThrown,
    minHighKicksThrown,
    minElbowsThrown,
    minStrikeAccuracy,
    maxStrikeAccuracy,
    minPunchAccuracy,
    maxPunchAccuracy,
    minKickAccuracy,
    maxKickAccuracy,
  }), [
    filters,
    minMinutesTracked,
    minFightsTracked,
    minRoundsTracked,
    minStrikesThrown,
    minStrikesLanded,
    minPunchesThrown,
    minKicksThrown,
    minWins,
    maxLosses,
    minWinPercentage,
    hasTitleFightWins,
    hasTitleFightLosses,
    minJabsThrown,
    minHooksThrown,
    minStraightsThrown,
    minUppercutsThrown,
    minBodyKicksThrown,
    minLegKicksThrown,
    minHighKicksThrown,
    minElbowsThrown,
    minStrikeAccuracy,
    maxStrikeAccuracy,
    minPunchAccuracy,
    maxPunchAccuracy,
    minKickAccuracy,
    maxKickAccuracy,
  ]);

  // Get fighter totals data with filters
  const { fighterTotals: currentData, loading: currentLoading, error: currentError } = useFighterTotalsWithFilters(filterOptions);

  // Fallback to original hooks if no data
  const { fighterTotals: strikeData, loading: strikeLoading, error: strikeError } = useStrikeEfficiency();
  const { fighterTotals: punchData, loading: punchLoading, error: punchError } = usePunchEfficiency();
  const { fighterTotals: kickData, loading: kickLoading, error: kickError } = useKickEfficiency();

  // Use fallback data if current data is empty
  const fallbackData = visualizationType === 'strikeEfficiency' ? strikeData : 
                      visualizationType === 'punchEfficiency' ? punchData : 
                      visualizationType === 'kickEfficiency' ? kickData : currentData;
  const fallbackLoading = visualizationType === 'strikeEfficiency' ? strikeLoading : 
                         visualizationType === 'punchEfficiency' ? punchLoading : 
                         visualizationType === 'kickEfficiency' ? kickLoading : false;
  const fallbackError = visualizationType === 'strikeEfficiency' ? strikeError : 
                       visualizationType === 'punchEfficiency' ? punchError : 
                       visualizationType === 'kickEfficiency' ? kickError : null;

  const finalData = currentData.length > 0 ? currentData : fallbackData;
  const finalLoading = currentLoading || fallbackLoading;
  const finalError = currentError || fallbackError;

  // Prepare chart data based on visualization type
  const chartData: ChartDataPoint[] = useMemo(() => {
    return finalData.map((fighter, index) => {
      const baseData = {
        index,
        fighterName: fighter.fighterName,
        minutesTracked: fighter.minutesTracked,
        wins: fighter.wins || 0,
        losses: fighter.losses || 0,
        winPercentage: fighter.winPercentage || 0,
        titleFightWins: fighter.titleFightWins || 0,
        titleFightLosses: fighter.titleFightLosses || 0,
        punchesLanded: fighter.totalPunchesLanded,
        punchesThrown: fighter.totalPunchesThrown,
        kicksLanded: fighter.totalKicksLanded,
        kicksThrown: fighter.totalKicksThrown,
        strikesLanded: fighter.totalStrikesLanded,
        strikesThrown: fighter.totalStrikesThrown,
        fightsTracked: fighter.fightsTracked || 0,
        roundsTracked: fighter.roundsTracked || 0,
        jabsThrown: fighter.totalJabsThrown || 0,
        hooksThrown: fighter.totalHooksThrown || 0,
        straightsThrown: fighter.totalStraightsThrown || 0,
        uppercutsThrown: fighter.totalUppercutsThrown || 0,
        bodyKicksThrown: fighter.totalBodyKicksThrown || 0,
        legKicksThrown: fighter.totalLegKicksThrown || 0,
        highKicksThrown: fighter.totalHighKicksThrown || 0,
        elbowsThrown: fighter.totalElbowsThrown || 0,
        // Enhanced visualization data
        clinchStrikesLanded: fighter.clinchStrikesLanded || 0,
        clinchStrikesThrown: fighter.clinchStrikesThrown || 0,
        groundStrikesLanded: fighter.groundStrikesLanded || 0,
        groundStrikesThrown: fighter.groundStrikesThrown || 0,
        takedownAttempts: fighter.takedownAttempts || 0,
        takedownSuccess: fighter.takedownSuccess || 0,
        submissionAttempts: fighter.submissionAttempts || 0,
        submissionWins: fighter.submissionWins || 0,
        centerOctagon: fighter.centerOctagon || 0,
        pushedBackToCage: fighter.pushedBackToCage || 0,
        pushingAgainstCage: fighter.pushingAgainstCage || 0,
        clinchStrikesPerMinute: fighter.clinchStrikesPerMinute || 0,
        groundStrikesPerMinute: fighter.groundStrikesPerMinute || 0,
        takedownSuccessRate: fighter.takedownSuccessRate || 0,
        submissionSuccessRate: fighter.submissionSuccessRate || 0,
      };

      // Calculate bubble size based on selected type
      let bubbleSize = 0;
      switch (bubbleSizeType) {
        case 'minutesTracked':
          bubbleSize = fighter.minutesTracked;
          break;
        case 'fightsTracked':
          bubbleSize = fighter.fightsTracked || 0;
          break;
        case 'totalStrikesThrown':
          bubbleSize = fighter.totalStrikesThrown;
          break;
        case 'wins':
          bubbleSize = fighter.wins || 0;
          break;
        case 'winPercentage':
          bubbleSize = fighter.winPercentage || 0;
          break;
      }

      // Calculate X and Y values based on visualization type
      let xValue = 0;
      let yValue = 0;
      let accuracy = 0;

      switch (visualizationType) {
        case 'strikeEfficiency':
          xValue = fighter.strikesLandedPerMinute;
          yValue = fighter.strikeAccuracyPercentage;
          accuracy = fighter.strikeAccuracyPercentage;
          break;
        case 'punchEfficiency':
          xValue = fighter.punchesLandedPerMinute;
          yValue = fighter.punchAccuracyPercentage;
          accuracy = fighter.punchAccuracyPercentage;
          break;
        case 'kickEfficiency':
          xValue = fighter.kicksLandedPerMinute;
          yValue = fighter.kickAccuracyPercentage;
          accuracy = fighter.kickAccuracyPercentage;
          break;
        case 'volumeVsAccuracy':
          xValue = fighter.totalStrikesThrown;
          yValue = fighter.strikeAccuracyPercentage;
          accuracy = fighter.strikeAccuracyPercentage;
          break;
        case 'clinchVsGround':
          xValue = fighter.clinchStrikesPerMinute || 0;
          yValue = fighter.groundStrikesPerMinute || 0;
          accuracy = fighter.strikeAccuracyPercentage;
          break;
        case 'takedownVsSubmission':
          xValue = fighter.takedownSuccessRate || 0;
          yValue = fighter.submissionSuccessRate || 0;
          accuracy = fighter.strikeAccuracyPercentage;
          break;
        case 'cageControl':
          // Calculate cage control percentages
          const totalCagePositions = (fighter.centerOctagon || 0) + (fighter.pushedBackToCage || 0) + (fighter.pushingAgainstCage || 0);
          const centerOctagonPercentage = totalCagePositions > 0 ? ((fighter.centerOctagon || 0) / totalCagePositions) * 100 : 0;
          const pushingPercentage = totalCagePositions > 0 ? ((fighter.pushingAgainstCage || 0) / totalCagePositions) * 100 : 0;
          xValue = centerOctagonPercentage;
          yValue = pushingPercentage;
          accuracy = fighter.strikeAccuracyPercentage;
          break;
        case 'strikingDiversity':
          // Calculate diversity score based on variety of strikes used
          const totalStrikes = fighter.totalStrikesThrown;
          const diversityScore = totalStrikes > 0 ? 
            ((fighter.totalJabsThrown || 0) + (fighter.totalHooksThrown || 0) + 
             (fighter.totalStraightsThrown || 0) + (fighter.totalUppercutsThrown || 0) +
             (fighter.totalBodyKicksThrown || 0) + (fighter.totalLegKicksThrown || 0) +
             (fighter.totalHighKicksThrown || 0) + (fighter.totalElbowsThrown || 0)) / totalStrikes * 100 : 0;
          xValue = fighter.strikesLandedPerMinute;
          yValue = diversityScore;
          accuracy = fighter.strikeAccuracyPercentage;
          break;
        case 'experienceVsSuccess':
          xValue = fighter.minutesTracked;
          yValue = fighter.winPercentage || 0;
          accuracy = fighter.strikeAccuracyPercentage;
          break;
        case 'defensiveVsOffensive':
          // Calculate defensive vs offensive ratio
          const offensiveStrikes = fighter.totalStrikesLanded;
          const defensiveStrikes = 0; // Would need to be extracted from defensive stats
          const ratio = offensiveStrikes > 0 ? offensiveStrikes / (offensiveStrikes + defensiveStrikes) * 100 : 0;
          xValue = fighter.strikesLandedPerMinute;
          yValue = ratio;
          accuracy = fighter.strikeAccuracyPercentage;
          break;
      }

      return {
        ...baseData,
        xValue,
        yValue,
        bubbleSize,
        accuracy,
      };
    });
  }, [finalData, visualizationType, bubbleSizeType]);

  // Get visualization labels
  const getVisualizationLabels = () => {
    switch (visualizationType) {
      case 'strikeEfficiency':
        return {
          title: 'Strike Efficiency Analysis',
          xLabel: 'Strikes Landed per Minute',
          yLabel: 'Strike Accuracy (%)',
          description: 'Relationship between strike volume and accuracy. Higher accuracy with higher volume indicates efficient striking.'
        };
      case 'punchEfficiency':
        return {
          title: 'Punch Efficiency Analysis',
          xLabel: 'Punches Landed per Minute',
          yLabel: 'Punch Accuracy (%)',
          description: 'Relationship between punch volume and accuracy. Shows punching efficiency patterns.'
        };
      case 'kickEfficiency':
        return {
          title: 'Kick Efficiency Analysis',
          xLabel: 'Kicks Landed per Minute',
          yLabel: 'Kick Accuracy (%)',
          description: 'Relationship between kick volume and accuracy. Reveals kicking effectiveness.'
        };
      case 'volumeVsAccuracy':
        return {
          title: 'Volume vs Accuracy Analysis',
          xLabel: 'Total Strikes Thrown',
          yLabel: 'Strike Accuracy (%)',
          description: 'Shows if fighters maintain accuracy as volume increases. High volume + high accuracy = elite strikers.'
        };
      case 'clinchVsGround':
        return {
          title: 'Clinch vs Ground Fighting',
          xLabel: 'Clinch Strikes per Minute',
          yLabel: 'Ground Strikes per Minute',
          description: 'Compares clinch and ground fighting effectiveness. Shows fighting style preferences.'
        };
      case 'takedownVsSubmission':
        return {
          title: 'Takedown vs Submission Success',
          xLabel: 'Takedown Success Rate (%)',
          yLabel: 'Submission Success Rate (%)',
          description: 'Grappling effectiveness comparison. High values in both indicate elite grapplers.'
        };
      case 'cageControl':
        return {
          title: 'Cage Control Analysis',
          xLabel: 'Center Octagon Time (%)',
          yLabel: 'Pushing Against Cage (%)',
          description: 'Shows positional dominance. High center time + high pushing = dominant cage control.'
        };
      case 'strikingDiversity':
        return {
          title: 'Striking Diversity vs Volume',
          xLabel: 'Strikes Landed per Minute',
          yLabel: 'Striking Diversity Score (%)',
          description: 'Shows if fighters use diverse striking while maintaining volume. High diversity = unpredictable.'
        };
      case 'experienceVsSuccess':
        return {
          title: 'Experience vs Success Rate',
          xLabel: 'Minutes Tracked',
          yLabel: 'Win Percentage (%)',
          description: 'Shows if experience correlates with success. Reveals learning curves and veteran advantages.'
        };
      case 'defensiveVsOffensive':
        return {
          title: 'Offensive vs Defensive Ratio',
          xLabel: 'Strikes Landed per Minute',
          yLabel: 'Offensive Ratio (%)',
          description: 'Shows offensive vs defensive fighting style. High offensive ratio = aggressive fighters.'
        };
    }
  };

  const labels = getVisualizationLabels();

  // Get bubble size label
  const getBubbleSizeLabel = () => {
    switch (bubbleSizeType) {
      case 'minutesTracked':
        return 'Minutes Tracked';
      case 'fightsTracked':
        return 'Fights Tracked';
      case 'totalStrikesThrown':
        return 'Total Strikes Thrown';
      case 'wins':
        return 'Total Wins';
      case 'winPercentage':
        return 'Win Percentage';
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setMinMinutesTracked(20);
    setMinFightsTracked(0);
    setMinRoundsTracked(0);
    setMinStrikesThrown(0);
    setMinStrikesLanded(0);
    setMinPunchesThrown(0);
    setMinKicksThrown(0);
    setMinWins(0);
    setMaxLosses(100);
    setMinWinPercentage(0);
    setHasTitleFightWins(false);
    setHasTitleFightLosses(false);
    setMinJabsThrown(0);
    setMinHooksThrown(0);
    setMinStraightsThrown(0);
    setMinUppercutsThrown(0);
    setMinBodyKicksThrown(0);
    setMinLegKicksThrown(0);
    setMinHighKicksThrown(0);
    setMinElbowsThrown(0);
    setMinStrikeAccuracy(0);
    setMaxStrikeAccuracy(100);
    setMinPunchAccuracy(0);
    setMaxPunchAccuracy(100);
    setMinKickAccuracy(0);
    setMaxKickAccuracy(100);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (minMinutesTracked > 20) count++;
    if (minFightsTracked > 0) count++;
    if (minRoundsTracked > 0) count++;
    if (minStrikesThrown > 0) count++;
    if (minStrikesLanded > 0) count++;
    if (minPunchesThrown > 0) count++;
    if (minKicksThrown > 0) count++;
    if (minWins > 0) count++;
    if (maxLosses < 100) count++;
    if (minWinPercentage > 0) count++;
    if (hasTitleFightWins) count++;
    if (hasTitleFightLosses) count++;
    if (minJabsThrown > 0) count++;
    if (minHooksThrown > 0) count++;
    if (minStraightsThrown > 0) count++;
    if (minUppercutsThrown > 0) count++;
    if (minBodyKicksThrown > 0) count++;
    if (minLegKicksThrown > 0) count++;
    if (minHighKicksThrown > 0) count++;
    if (minElbowsThrown > 0) count++;
    if (minStrikeAccuracy > 0) count++;
    if (maxStrikeAccuracy < 100) count++;
    if (minPunchAccuracy > 0) count++;
    if (maxPunchAccuracy < 100) count++;
    if (minKickAccuracy > 0) count++;
    if (maxKickAccuracy < 100) count++;
    return count;
  };

  // Common styles matching BasicInfo
  const sectionHeaderStyle = {
    mb: 3,
    color: '#fff',
    fontWeight: 600,
    fontSize: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    position: 'relative',
    display: 'inline-block',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: 0,
      width: '60%',
      height: '2px',
      background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.7), transparent)',
    }
  };

  // Card styles matching BasicInfo
  const cardStyles = {
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
  };

  // Button styles
  const buttonStyles = {
    bgcolor: 'rgba(10, 14, 23, 0.6)',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    color: '#fff',
    px: 3,
    py: 1.5,
    fontSize: '0.9rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: 'rgba(0, 240, 255, 0.2)',
      border: '1px solid rgba(0, 240, 255, 0.6)',
      transform: 'translateY(-1px)',
    },
    '&.Mui-selected': {
      bgcolor: 'rgba(0, 240, 255, 0.3)',
      border: '1px solid rgba(0, 240, 255, 0.8)',
      color: '#00F0FF',
    }
  };

  // Filter styles
  const filterStyles = {
    bgcolor: 'rgba(10, 14, 23, 0.8)',
    border: '1px solid rgba(0, 240, 255, 0.2)',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    '& .MuiAccordionSummary-root': {
      bgcolor: 'rgba(0, 240, 255, 0.1)',
      borderRadius: '6px',
      mb: 1,
    },
    '& .MuiAccordionDetails-root': {
      pt: 2,
    },
    '& .MuiTextField-root': {
      '& .MuiOutlinedInput-root': {
        color: '#fff',
        '& fieldset': {
          borderColor: 'rgba(0, 240, 255, 0.3)',
        },
        '&:hover fieldset': {
          borderColor: 'rgba(0, 240, 255, 0.5)',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#00F0FF',
        },
      },
      '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        '&.Mui-focused': {
          color: '#00F0FF',
        },
      },
    },
    '& .MuiSlider-root': {
      color: '#00F0FF',
      '& .MuiSlider-thumb': {
        boxShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
      },
      '& .MuiSlider-track': {
        background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
      },
    },
    '& .MuiFormControl-root': {
      '& .MuiOutlinedInput-root': {
        color: '#fff',
        '& fieldset': {
          borderColor: 'rgba(0, 240, 255, 0.3)',
        },
        '&:hover fieldset': {
          borderColor: 'rgba(0, 240, 255, 0.5)',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#00F0FF',
        },
      },
      '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        '&.Mui-focused': {
          color: '#00F0FF',
        },
      },
      '& .MuiSelect-icon': {
        color: 'rgba(255, 255, 255, 0.7)',
      },
    },
    '& .MuiSwitch-root': {
      '& .MuiSwitch-switchBase': {
        color: 'rgba(255, 255, 255, 0.3)',
        '&.Mui-checked': {
          color: '#00F0FF',
        },
      },
      '& .MuiSwitch-track': {
        bgcolor: 'rgba(255, 255, 255, 0.1)',
        '&.Mui-checked': {
          bgcolor: 'rgba(0, 240, 255, 0.3)',
        },
      },
    },
  };

  return (
    <Fade in={true} timeout={800}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3,
          bgcolor: 'transparent',
          borderRadius: '12px',
          position: 'relative',
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
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 6, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              component="img"
              src="/icon.png"
              alt="Fighter Analytics Icon"
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
              Data Visualization
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
                width: '4px',
                height: '50%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(180deg, #00F0FF, transparent)',
                borderRadius: '2px',
              }
            }}
          >
            Interactive analytics and performance trend analysis for fighter data
          </Typography>
        </Box>

        {/* Filter Controls Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
              endIcon={getActiveFilterCount() > 0 ? <Chip label={getActiveFilterCount()} size="small" sx={{ bgcolor: 'rgba(0, 240, 255, 0.3)', color: '#00F0FF' }} /> : null}
              sx={{
                ...buttonStyles,
                bgcolor: showFilters ? 'rgba(0, 240, 255, 0.3)' : 'rgba(10, 14, 23, 0.6)',
                border: showFilters ? '1px solid rgba(0, 240, 255, 0.8)' : '1px solid rgba(0, 240, 255, 0.3)',
                color: showFilters ? '#00F0FF' : '#fff',
              }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Clear all filters">
                <IconButton
                  onClick={clearFilters}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    '&:hover': {
                      color: '#00F0FF',
                      border: '1px solid rgba(0, 240, 255, 0.6)',
                    }
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Filter Accordion */}
          {showFilters && (
            <Box sx={filterStyles}>
              <Accordion defaultExpanded sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00F0FF' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimerIcon sx={{ color: '#00F0FF' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>Experience & Volume</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, fontSize: '0.9rem' }}>
                        Minimum Minutes Tracked: {minMinutesTracked}
                      </Typography>
                      <Slider
                        value={minMinutesTracked}
                        onChange={(_, value) => setMinMinutesTracked(value as number)}
                        min={20}
                        max={200}
                        step={5}
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min Fights Tracked"
                        type="number"
                        value={minFightsTracked}
                        onChange={(e) => setMinFightsTracked(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min Rounds Tracked"
                        type="number"
                        value={minRoundsTracked}
                        onChange={(e) => setMinRoundsTracked(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    
                    <Box>
                      <TextField
                        label="Min Strikes Thrown"
                        type="number"
                        value={minStrikesThrown}
                        onChange={(e) => setMinStrikesThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min Strikes Landed"
                        type="number"
                        value={minStrikesLanded}
                        onChange={(e) => setMinStrikesLanded(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min Punches Thrown"
                        type="number"
                        value={minPunchesThrown}
                        onChange={(e) => setMinPunchesThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min Kicks Thrown"
                        type="number"
                        value={minKicksThrown}
                        onChange={(e) => setMinKicksThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00F0FF' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon sx={{ color: '#00F0FF' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>Fight Outcomes</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <TextField
                        label="Min Wins"
                        type="number"
                        value={minWins}
                        onChange={(e) => setMinWins(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Max Losses"
                        type="number"
                        value={maxLosses}
                        onChange={(e) => setMaxLosses(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, fontSize: '0.9rem' }}>
                        Min Win Percentage: {minWinPercentage}%
                      </Typography>
                      <Slider
                        value={minWinPercentage}
                        onChange={(_, value) => setMinWinPercentage(value as number)}
                        min={0}
                        max={100}
                        step={5}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hasTitleFightWins}
                            onChange={(e) => setHasTitleFightWins(e.target.checked)}
                          />
                        }
                        label="Has Title Fight Wins"
                        sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hasTitleFightLosses}
                            onChange={(e) => setHasTitleFightLosses(e.target.checked)}
                          />
                        }
                        label="Has Title Fight Losses"
                        sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}
                      />
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00F0FF' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsMartialArtsIcon sx={{ color: '#00F0FF' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>Striking Styles</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <TextField
                        label="Min Jabs Thrown"
                        type="number"
                        value={minJabsThrown}
                        onChange={(e) => setMinJabsThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min Hooks Thrown"
                        type="number"
                        value={minHooksThrown}
                        onChange={(e) => setMinHooksThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min Straights Thrown"
                        type="number"
                        value={minStraightsThrown}
                        onChange={(e) => setMinStraightsThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min Uppercuts Thrown"
                        type="number"
                        value={minUppercutsThrown}
                        onChange={(e) => setMinUppercutsThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    
                    <Box>
                      <TextField
                        label="Min Body Kicks Thrown"
                        type="number"
                        value={minBodyKicksThrown}
                        onChange={(e) => setMinBodyKicksThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min Leg Kicks Thrown"
                        type="number"
                        value={minLegKicksThrown}
                        onChange={(e) => setMinLegKicksThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min High Kicks Thrown"
                        type="number"
                        value={minHighKicksThrown}
                        onChange={(e) => setMinHighKicksThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        label="Min Elbows Thrown"
                        type="number"
                        value={minElbowsThrown}
                        onChange={(e) => setMinElbowsThrown(Number(e.target.value))}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00F0FF' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon sx={{ color: '#00F0FF' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>Accuracy Ranges</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, fontSize: '0.9rem' }}>
                        Strike Accuracy: {minStrikeAccuracy}% - {maxStrikeAccuracy}%
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Slider
                          value={[minStrikeAccuracy, maxStrikeAccuracy]}
                          onChange={(_, value) => {
                            const [min, max] = value as number[];
                            setMinStrikeAccuracy(min);
                            setMaxStrikeAccuracy(max);
                          }}
                          min={0}
                          max={100}
                          step={5}
                          sx={{ flex: 1 }}
                        />
                      </Box>
                      
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, fontSize: '0.9rem' }}>
                        Punch Accuracy: {minPunchAccuracy}% - {maxPunchAccuracy}%
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Slider
                          value={[minPunchAccuracy, maxPunchAccuracy]}
                          onChange={(_, value) => {
                            const [min, max] = value as number[];
                            setMinPunchAccuracy(min);
                            setMaxPunchAccuracy(max);
                          }}
                          min={0}
                          max={100}
                          step={5}
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, fontSize: '0.9rem' }}>
                        Kick Accuracy: {minKickAccuracy}% - {maxKickAccuracy}%
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Slider
                          value={[minKickAccuracy, maxKickAccuracy]}
                          onChange={(_, value) => {
                            const [min, max] = value as number[];
                            setMinKickAccuracy(min);
                            setMaxKickAccuracy(max);
                          }}
                          min={0}
                          max={100}
                          step={5}
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </Box>

        {/* Visualization Type Selection */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#fff', 
              fontWeight: 600, 
              mb: 2, 
              textAlign: 'center',
              fontSize: '1.1rem'
            }}
          >
            Select Visualization Type
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Primary Visualization Types */}
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Button
                onClick={() => setVisualizationType('strikeEfficiency')}
                startIcon={<TargetIcon />}
                sx={{
                  ...buttonStyles,
                  ...(visualizationType === 'strikeEfficiency' && {
                    bgcolor: 'rgba(0, 240, 255, 0.3)',
                    border: '1px solid rgba(0, 240, 255, 0.8)',
                    color: '#00F0FF',
                  })
                }}
              >
                Strike Efficiency
              </Button>
              <Button
                onClick={() => setVisualizationType('punchEfficiency')}
                startIcon={<SportsMartialArtsIcon />}
                sx={{
                  ...buttonStyles,
                  ...(visualizationType === 'punchEfficiency' && {
                    bgcolor: 'rgba(0, 240, 255, 0.3)',
                    border: '1px solid rgba(0, 240, 255, 0.8)',
                    color: '#00F0FF',
                  })
                }}
              >
                Punch Efficiency
              </Button>
              <Button
                onClick={() => setVisualizationType('kickEfficiency')}
                startIcon={<SportsMartialArtsIcon />}
                sx={{
                  ...buttonStyles,
                  ...(visualizationType === 'kickEfficiency' && {
                    bgcolor: 'rgba(0, 240, 255, 0.3)',
                    border: '1px solid rgba(0, 240, 255, 0.8)',
                    color: '#00F0FF',
                  })
                }}
              >
                Kick Efficiency
              </Button>
              <Button
                onClick={() => setVisualizationType('volumeVsAccuracy')}
                startIcon={<TrendingUpIcon />}
                sx={{
                  ...buttonStyles,
                  ...(visualizationType === 'volumeVsAccuracy' && {
                    bgcolor: 'rgba(0, 240, 255, 0.3)',
                    border: '1px solid rgba(0, 240, 255, 0.8)',
                    color: '#00F0FF',
                  })
                }}
              >
                Volume vs Accuracy
              </Button>
            </Box>

            {/* Advanced Visualization Types */}
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Button
                onClick={() => setVisualizationType('strikingDiversity')}
                startIcon={<SpeedIcon />}
                sx={{
                  ...buttonStyles,
                  ...(visualizationType === 'strikingDiversity' && {
                    bgcolor: 'rgba(0, 240, 255, 0.3)',
                    border: '1px solid rgba(0, 240, 255, 0.8)',
                    color: '#00F0FF',
                  })
                }}
              >
                Striking Diversity
              </Button>
              <Button
                onClick={() => setVisualizationType('experienceVsSuccess')}
                startIcon={<TimerIcon />}
                sx={{
                  ...buttonStyles,
                  ...(visualizationType === 'experienceVsSuccess' && {
                    bgcolor: 'rgba(0, 240, 255, 0.3)',
                    border: '1px solid rgba(0, 240, 255, 0.8)',
                    color: '#00F0FF',
                  })
                }}
              >
                Experience vs Success
              </Button>
              <Button
                onClick={() => setVisualizationType('clinchVsGround')}
                startIcon={<FitnessCenterIcon />}
                sx={{
                  ...buttonStyles,
                  ...(visualizationType === 'clinchVsGround' && {
                    bgcolor: 'rgba(0, 240, 255, 0.3)',
                    border: '1px solid rgba(0, 240, 255, 0.8)',
                    color: '#00F0FF',
                  })
                }}
              >
                Clinch vs Ground
              </Button>
              <Button
                onClick={() => setVisualizationType('cageControl')}
                startIcon={<LocationOnIcon />}
                sx={{
                  ...buttonStyles,
                  ...(visualizationType === 'cageControl' && {
                    bgcolor: 'rgba(0, 240, 255, 0.3)',
                    border: '1px solid rgba(0, 240, 255, 0.8)',
                    color: '#00F0FF',
                  })
                }}
              >
                Cage Control
              </Button>
            </Box>

            {/* Bubble Size Selection */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                Bubble Size:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={bubbleSizeType}
                  onChange={(e) => setBubbleSizeType(e.target.value as BubbleSizeType)}
                  sx={{
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 240, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 240, 255, 0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#00F0FF',
                    },
                  }}
                >
                  <MenuItem value="minutesTracked">Minutes Tracked</MenuItem>
                  <MenuItem value="fightsTracked">Fights Tracked</MenuItem>
                  <MenuItem value="totalStrikesThrown">Total Strikes</MenuItem>
                  <MenuItem value="wins">Total Wins</MenuItem>
                  <MenuItem value="winPercentage">Win Percentage</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* Results Summary */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
            Showing {chartData.length} fighters
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              label="Sort By"
            >
              <MenuItem value="accuracy">Accuracy</MenuItem>
              <MenuItem value="strikesLanded">Strikes Landed</MenuItem>
              <MenuItem value="strikesThrown">Strikes Thrown</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="minutesTracked">Minutes Tracked</MenuItem>
              <MenuItem value="wins">Wins</MenuItem>
              <MenuItem value="winPercentage">Win %</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Strike Accuracy vs Volume Chart Section */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h6" 
            sx={sectionHeaderStyle}
          >
            {labels.title}
          </Typography>
          <Typography 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 4,
              fontSize: '0.9rem',
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
            {labels.description}
          </Typography>
          
          <Box sx={{
            ...cardStyles,
            height: '500px',
            background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.95) 0%, rgba(10, 14, 23, 0.8) 100%)',
          }}>
            {finalLoading ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem'
              }}>
                <Typography>Loading fighter data...</Typography>
              </Box>
            ) : finalError ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem'
              }}>
                <Typography>Error loading data: {finalError}</Typography>
              </Box>
            ) : chartData.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem'
              }}>
                <Typography>No fighters match the current filters</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 60 }}
                >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(0, 240, 255, 0.1)"
                />
                <XAxis 
                  dataKey="xValue" 
                  type="number"
                  tick={{ fill: '#FFFFFF', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(0, 240, 255, 0.3)' }}
                  tickLine={{ stroke: 'rgba(0, 240, 255, 0.3)' }}
                  label={{ 
                    value: labels.xLabel, 
                    position: 'bottom',
                    style: { textAnchor: 'middle', fill: '#FFFFFF', fontSize: 12 }
                  }}
                />
                <YAxis 
                  dataKey="yValue"
                  type="number"
                  domain={visualizationType === 'experienceVsSuccess' || visualizationType === 'takedownVsSubmission' || visualizationType === 'cageControl' ? [0, 100] : [0, 'dataMax + 5']}
                  tick={{ fill: '#FFFFFF', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(0, 240, 255, 0.3)' }}
                  tickLine={{ stroke: 'rgba(0, 240, 255, 0.3)' }}
                  label={{ 
                    value: labels.yLabel, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#FFFFFF', fontSize: 12 }
                  }}
                />
                <ZAxis 
                  dataKey="bubbleSize"
                  type="number"
                  range={[20, 200]}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <Box
                          sx={{
                            bgcolor: 'rgba(10, 14, 23, 0.95)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            p: 2,
                            borderRadius: '6px',
                            backdropFilter: 'blur(10px)',
                            maxWidth: 320,
                            boxShadow: '0 4px 12px rgba(0, 240, 255, 0.1)',
                          }}
                        >
                          <Typography sx={{ color: '#00F0FF', fontWeight: 600, mb: 1 }}>
                            {data.fighterName}
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                            {labels.xLabel}: {data.xValue.toFixed(2)}
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                            {labels.yLabel}: {data.yValue.toFixed(2)}
                            {visualizationType === 'strikeEfficiency' || visualizationType === 'punchEfficiency' || 
                             visualizationType === 'kickEfficiency' || visualizationType === 'volumeVsAccuracy' ? '%' : ''}
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                            {getBubbleSizeLabel()}: {data.bubbleSize.toLocaleString()}
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                            Record: {data.wins}W-{data.losses}L ({data.winPercentage}%)
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                            Minutes Tracked: {data.minutesTracked}
                          </Typography>
                          {visualizationType === 'strikingDiversity' && (
                            <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                              Striking Diversity: {data.yValue.toFixed(1)}%
                            </Typography>
                          )}
                          {visualizationType === 'experienceVsSuccess' && (
                            <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                              Experience: {data.xValue} minutes
                            </Typography>
                          )}
                          {visualizationType === 'clinchVsGround' && (
                            <>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                                Clinch Strikes: {data.clinchStrikesLanded.toLocaleString()}/{data.clinchStrikesThrown.toLocaleString()}
                              </Typography>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                                Ground Strikes: {data.groundStrikesLanded.toLocaleString()}/{data.groundStrikesThrown.toLocaleString()}
                              </Typography>
                            </>
                          )}
                          {visualizationType === 'takedownVsSubmission' && (
                            <>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                                Takedowns: {data.takedownSuccess}/{data.takedownAttempts} ({data.takedownSuccessRate.toFixed(1)}%)
                              </Typography>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                                Submissions: {data.submissionWins}/{data.submissionAttempts} ({data.submissionSuccessRate.toFixed(1)}%)
                              </Typography>
                            </>
                          )}
                          {visualizationType === 'cageControl' && (
                            <>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                                Center Octagon: {data.centerOctagon} times
                              </Typography>
                              <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                                Pushing Against Cage: {data.pushingAgainstCage} times
                              </Typography>
                            </>
                          )}
                          <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                            Total Strikes: {data.strikesLanded.toLocaleString()}/{data.strikesThrown.toLocaleString()}
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                            Punches: {data.punchesLanded.toLocaleString()}/{data.punchesThrown.toLocaleString()}
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
                            Kicks: {data.kicksLanded.toLocaleString()}/{data.kicksThrown.toLocaleString()}
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  data={chartData}
                  fill="rgba(0, 240, 255, 0.8)"
                  stroke="rgba(0, 240, 255, 1)"
                  strokeWidth={1}
                />
              </ScatterChart>
            </ResponsiveContainer>
            )}
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default VisualizePage; 
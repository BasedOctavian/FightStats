import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { Star as RatingIcon } from '@mui/icons-material';
import { useDifficultyScore } from '../hooks/useDifficultyScore';
import { Fighter } from '../types/firestore';

interface DifficultyScoreProps {
  opponent: Fighter;
  weightClassData: any;
  methodOfFinish: string;
  actualRounds: number;
  isWinner: boolean;
}

const DifficultyScore: React.FC<DifficultyScoreProps> = ({
  opponent,
  weightClassData,
  methodOfFinish,
  actualRounds,
  isWinner
}) => {
  const {
    score,
    description,
    baseRating,
    methodMultiplier,
    roundMultiplier,
    archetype
  } = useDifficultyScore({
    opponent,
    weightClassData,
    methodOfFinish,
    actualRounds,
    isWinner
  });

  // Console logging for debugging
  console.log(`DifficultyScore for ${opponent.fighterName || opponent.name}:`, {
    opponent: opponent.fighterName || opponent.name,
    baseRating,
    methodOfFinish,
    methodMultiplier,
    actualRounds,
    roundMultiplier,
    finalScore: score,
    archetype
  });

  return (
    <Tooltip 
      title={
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {opponent.fighterName || opponent.name}: Difficulty Analysis
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            Base Rating: {baseRating} ({archetype})
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            Finish Method: {methodOfFinish} (×{methodMultiplier})
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            Round Efficiency: R{actualRounds} (×{roundMultiplier})
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
            Difficulty Score: {score} ({description})
          </Typography>
        </Box>
      }
      placement="top"
      arrow
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5,
        bgcolor: 'rgba(0, 240, 255, 0.08)',
        px: 1.5,
        py: 0.5,
        borderRadius: '8px',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(5px)',
        '&:hover': {
          bgcolor: 'rgba(0, 240, 255, 0.12)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0, 240, 255, 0.15)',
        }
      }}>
        <RatingIcon sx={{ 
          color: '#00F0FF', 
          fontSize: 16,
          filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.5))',
        }} />
        <Typography sx={{ 
          color: '#00F0FF',
          fontSize: '0.85rem',
          fontWeight: 700,
          fontFamily: '"Orbitron", "Roboto Mono", monospace',
          letterSpacing: '0.05em',
          textShadow: '0 0 8px rgba(0, 240, 255, 0.3)',
        }}>
          {score}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default DifficultyScore; 
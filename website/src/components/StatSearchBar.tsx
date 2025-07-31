import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Paper,
  useTheme,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Fighter } from '../types/firestore';
import { getQuantifiableStats, StatOption } from '../utils/fighterStats';

interface StatSearchBarProps {
  onFighterSelect?: (fighter: Fighter) => void;
  onStatSelect?: (statKey: string, statLabel: string) => void;
  selectedFighter?: Fighter | null;
  selectedStat?: string | null;
}

const StatSearchBar: React.FC<StatSearchBarProps> = ({ 
  onFighterSelect, 
  onStatSelect, 
  selectedFighter, 
  selectedStat 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [filteredFighters, setFilteredFighters] = useState<Fighter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [availableStats, setAvailableStats] = useState<StatOption[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchFighters = async () => {
      try {
        const fighterCollection = collection(db, 'fighterData');
        const snapshot = await getDocs(fighterCollection);
        
        const fighterData: Fighter[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Fighter));
        
        setFighters(fighterData);
        setFilteredFighters(fighterData);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error fetching fighters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFighters();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Show top 10 fighters by MinutesTracked when search is empty
      const sortedFighters = [...fighters]
        .filter(fighter => fighter.MinutesTracked && fighter.MinutesTracked > 0)
        .sort((a, b) => (b.MinutesTracked || 0) - (a.MinutesTracked || 0))
        .slice(0, 10);
      setFilteredFighters(sortedFighters);
    } else {
      const filtered = fighters.filter(fighter =>
        fighter.fighterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fighter.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFighters(filtered);
    }
  }, [searchTerm, fighters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedFighter) {
      const stats = getQuantifiableStats(selectedFighter);
      setAvailableStats(stats);
    } else {
      setAvailableStats([]);
    }
  }, [selectedFighter]);

  const handleFighterClick = (fighter: Fighter) => {
    if (onFighterSelect) {
      onFighterSelect(fighter);
    }
    setShowDropdown(false);
    setSearchTerm(fighter.fighterName || fighter.name || '');
  };

  const handleStatChange = (event: any, newValue: StatOption | null) => {
    if (newValue && onStatSelect) {
      onStatSelect(newValue.key, newValue.label);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Fighter Search Section */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            color: '#fff',
            fontWeight: 600,
            fontSize: '1.1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Select Fighter
        </Typography>
        <Box ref={searchRef} sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search fighters..."
            variant="outlined"
            InputProps={{
              endAdornment: isLoading ? (
                <CircularProgress size={20} sx={{ color: 'secondary.main' }} />
              ) : null,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: 'secondary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'secondary.main',
                },
              },
            }}
          />
          
          {showDropdown && !isLoading && filteredFighters.length > 0 && (
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                zIndex: 1000,
                width: '100%',
                mt: 1,
                maxHeight: 400,
                overflow: 'auto',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <List sx={{ p: 0 }}>
                {filteredFighters.slice(0, 10).map((fighter) => (
                  <ListItem
                    key={fighter.id}
                    onClick={() => handleFighterClick(fighter)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {fighter.fighterName || fighter.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          {fighter.weightClass && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {fighter.weightClass}
                            </Typography>
                          )}
                          {fighter.MinutesTracked && (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                              {fighter.MinutesTracked} minutes tracked
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {filteredFighters.length > 10 && (
                  <ListItem sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                    <ListItemText>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          textAlign: 'center',
                          fontStyle: 'italic'
                        }}
                      >
                        {searchTerm.trim() === '' 
                          ? 'Showing top 10 fighters by minutes tracked. Type to search for specific fighters.'
                          : 'Showing first 10 results. Type more to narrow search.'
                        }
                      </Typography>
                    </ListItemText>
                  </ListItem>
                )}
              </List>
            </Paper>
          )}
          
          {showDropdown && searchTerm && filteredFighters.length === 0 && !isLoading && (
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                zIndex: 1000,
                width: '100%',
                mt: 1,
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No fighters found
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Stat Selection Section */}
      {selectedFighter && (
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              color: '#fff',
              fontWeight: 600,
              fontSize: '1.1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Select Stat to Visualize
          </Typography>
          <Autocomplete
            options={availableStats}
            getOptionLabel={(option) => `${option.label} (${option.category})`}
            value={availableStats.find(stat => stat.key === selectedStat) || null}
            onChange={handleStatChange}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search for a stat..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'secondary.main',
                    },
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {option.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    {option.description}
                  </Typography>
                  <Chip 
                    label={option.category} 
                    size="small" 
                    sx={{ 
                      mt: 0.5, 
                      fontSize: '0.7rem',
                      height: '20px',
                      bgcolor: 'secondary.main',
                      color: 'white'
                    }} 
                  />
                </Box>
              </Box>
            )}
            groupBy={(option) => option.category}
            sx={{ width: '100%' }}
          />
        </Box>
      )}
    </Box>
  );
};

export default StatSearchBar; 
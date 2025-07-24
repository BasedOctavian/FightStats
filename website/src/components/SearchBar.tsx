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
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Fighter } from '../types/firestore';

interface SearchBarProps {
  onFighterSelect?: (fighter: Fighter) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onFighterSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [filteredFighters, setFilteredFighters] = useState<Fighter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
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
      setFilteredFighters(fighters);
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

  const handleFighterClick = (fighter: Fighter) => {
    if (onFighterSelect) {
      onFighterSelect(fighter);
    }
    setShowDropdown(false);
    setSearchTerm(fighter.fighterName || fighter.name || '');
  };

  return (
    <Box ref={searchRef} sx={{ position: 'relative', maxWidth: 600, mx: 'auto' }}>
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
      
      {showDropdown && filteredFighters.length > 0 && (
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
                    fighter.weightClass && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {fighter.weightClass}
                      </Typography>
                    )
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
                    Showing first 10 results. Type more to narrow search.
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
  );
};

export default SearchBar; 
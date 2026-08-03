import React, { createContext, useContext, useState, useEffect } from 'react';
import { Region, User } from '../types';
import { reverseGeocodeCoords, getEstimatedLocationCoords } from '../data/indiaLocations';

export const DEFAULT_REGION: Region = {
  country: 'India',
  state: 'Haryana',
  district: 'Yamunanagar',
  taluka: 'Jagadhri',
  block: 'Jagadhri Block',
  village: 'Mandebari',
  pincode: '135001',
  lat: 30.1290,
  lng: 77.2952
};

interface RegionContextType {
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  detectLocation: () => Promise<Region>;
  isRegionModalOpen: boolean;
  openRegionModal: () => void;
  closeRegionModal: () => void;
  isDetecting: boolean;
  detectionError: string | null;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{
  user: User | null;
  children: React.ReactNode;
}> = ({ user, children }) => {
  const [selectedRegion, setSelectedRegionState] = useState<Region>(() => {
    const saved = localStorage.getItem('treemarket_region');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved region:', e);
      }
    }
    return DEFAULT_REGION;
  });

  const [isRegionModalOpen, setIsRegionModalOpen] = useState<boolean>(() => {
    // Show region modal automatically on first visit if user hasn't saved region yet
    const saved = localStorage.getItem('treemarket_region');
    return !saved;
  });

  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  // Sync with user profile if logged in and user profile has location details
  useEffect(() => {
    if (user && (user.state || user.district)) {
      const coords = getEstimatedLocationCoords(user.state, user.district);
      const userRegion: Region = {
        country: 'India',
        state: user.state || selectedRegion.state,
        district: user.district || selectedRegion.district,
        taluka: selectedRegion.taluka,
        village: selectedRegion.village,
        pincode: user.pincode || selectedRegion.pincode,
        lat: coords.lat,
        lng: coords.lng
      };
      setSelectedRegionState(userRegion);
      localStorage.setItem('treemarket_region', JSON.stringify(userRegion));
    }
  }, [user]);

  const setSelectedRegion = (region: Region) => {
    setSelectedRegionState(region);
    localStorage.setItem('treemarket_region', JSON.stringify(region));

    // Optionally sync with backend if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          state: region.state,
          district: region.district,
          pincode: region.pincode
        })
      }).catch(err => console.warn('Could not sync user region with server:', err));
    }
  };

  const detectLocation = async (): Promise<Region> => {
    setIsDetecting(true);
    setDetectionError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = 'GPS Geolocation is not supported by your browser.';
        setDetectionError(errorMsg);
        setIsDetecting(false);
        resolve(selectedRegion);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const detected = reverseGeocodeCoords(lat, lng);
          setSelectedRegion(detected);
          setIsDetecting(false);
          resolve(detected);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to current region with simulated GPS coords
          const fallback = reverseGeocodeCoords(26.8467, 80.9462); // Lucknow, UP fallback
          setSelectedRegion(fallback);
          setDetectionError('Unable to fetch precise GPS. Defaulted to regional hub.');
          setIsDetecting(false);
          resolve(fallback);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  return (
    <RegionContext.Provider
      value={{
        selectedRegion,
        setSelectedRegion,
        detectLocation,
        isRegionModalOpen,
        openRegionModal: () => setIsRegionModalOpen(true),
        closeRegionModal: () => setIsRegionModalOpen(false),
        isDetecting,
        detectionError
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};

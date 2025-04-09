/**
 * PlayerUI.tsx
 * 
 * This component renders the player's heads-up display (HUD) interface:
 * 
 * Key functionality:
 * - Displays player health and mana bars with visual indicators
 * - Implements damage feedback effects (screen flash when damaged)
 * - Shows player status information (name, health/mana values)
 * - Tracks health changes to trigger visual feedback
 * 
 * Props:
 * - playerData: Contains player state information including health, mana, and username
 * 
 * Technical implementation:
 * - Uses React state to track health changes and trigger animations
 * - Implements CSS-based visual effects for damage feedback
 * - Calculates health/mana percentages for bar visualization
 * - Conditionally renders elements based on player state
 * 
 * Related files:
 * - App.tsx: Parent component that provides player data
 * - Player.tsx: Character component that relates to this UI
 * - common.css: Contains animation definitions for damage flash
 */

import React, { useState, useEffect } from 'react';
import { PlayerData } from '../generated';

interface PlayerUIProps {
  playerData: PlayerData | null;
}

export const PlayerUI: React.FC<PlayerUIProps> = ({ playerData }) => {
  const [showDamageFlash, setShowDamageFlash] = useState(false);
  const [lastHealth, setLastHealth] = useState(playerData?.health || 0);
  
  // Check for damage taken and trigger damage flash effect
  useEffect(() => {
    if (!playerData) return;
    
    const currentHealth = playerData.health;
    
    // If health decreased, show damage flash
    if (currentHealth < lastHealth) {
      setShowDamageFlash(true);
      
      // Remove flash after animation completes
      const timer = setTimeout(() => {
        setShowDamageFlash(false);
      }, 300); // Match CSS animation duration
      
      return () => clearTimeout(timer);
    }
    
    // Update last health value
    setLastHealth(currentHealth);
  }, [playerData?.health, lastHealth]);
  
  // Don't render if no player data
  if (!playerData) return null;
  
  // Calculate health and mana percentages
  const healthPercent = (playerData.health / playerData.maxHealth) * 100;
  const manaPercent = (playerData.mana / playerData.maxMana) * 100;
  
  return (
    <>
      {/* Health and mana bars */}
      <div className="health-bar-container">
        <div 
          className="health-bar"
          style={{ width: `${healthPercent}%` }}
        />
      </div>
      
      <div className="mana-bar-container">
        <div 
          className="mana-bar"
          style={{ width: `${manaPercent}%` }}
        />
      </div>
      
      {/* Damage flash overlay */}
      {showDamageFlash && (
        <div className="damage-overlay damage-flash" />
      )}
      
      {/* Player status text */}
      <div className="player-status">
        <div className="player-name">{playerData.username}</div>
        <div className="player-health">HP: {playerData.health}/{playerData.maxHealth}</div>
        <div className="player-mana">MP: {playerData.mana}/{playerData.maxMana}</div>
      </div>
    </>
  );
}; 
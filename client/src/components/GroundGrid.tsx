import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

interface GroundGridProps {
  size?: number;         // Size of each square
  gap?: number;          // Gap between squares
  rows?: number;         // Number of rows
  columns?: number;      // Number of columns
  centerGrid?: boolean;  // Whether to center the grid at origin
  color?: string;        // Default color of squares
  alternateColors?: boolean; // Whether to use alternating colors
  secondColor?: string;  // Second color for alternating pattern
  elevation?: number;    // Height off the ground
  height?: number;       // Height of each raised square
  textureUrl?: string;   // Optional texture URL
  roughness?: number;    // Material roughness
  metalness?: number;    // Material metalness
  opacity?: number;      // Material opacity
  selectedColor?: string; // Color for selected squares
}

export const GroundGrid: React.FC<GroundGridProps> = ({
  size = 2,              // Default square size - roughly player size
  gap = 0.2,             // Small gap between squares
  rows = 20,             // 20x20 grid by default
  columns = 20,
  centerGrid = true,     // Center the grid at origin by default
  color = '#1a5fb4',     // Default color
  alternateColors = true,
  secondColor = '#99c1f1',
  elevation = 0,         // At ground level by default
  height = 0.05,         // Default raised height
  textureUrl,
  roughness = 0.7,       // Default roughness (less reflective)
  metalness = 0.1,       // Default metalness (slightly metallic)
  opacity = 1.0,         // Fully opaque by default
  selectedColor = '#ffcc00' // Yellow color for selected squares
}) => {
  // State to track which squares have been clicked
  const [selectedSquares, setSelectedSquares] = useState<Set<string>>(new Set());
  
  // Load texture if provided
  const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
  
  // Calculate total grid dimensions
  const totalWidth = columns * size + (columns - 1) * gap;
  const totalDepth = rows * size + (rows - 1) * gap;
  
  // Calculate offset to center the grid if needed
  const offsetX = centerGrid ? -totalWidth / 2 : 0;
  const offsetZ = centerGrid ? -totalDepth / 2 : 0;
  
  // Handle click on a square
  const handleClick = (key: string) => {
    setSelectedSquares(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
      return newSelected;
    });
  };
  
  // Generate squares
  const squares = useMemo(() => {
    const squaresArray = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Calculate position - y coordinate is now elevation + half of height
        const x = offsetX + col * (size + gap) + size / 2;
        const y = elevation + height / 2; // Position at half the height for box geometry
        const z = offsetZ + row * (size + gap) + size / 2;
        
        // Determine color (alternating pattern if enabled)
        const isAlternate = (row + col) % 2 === 1;
        const squareColor = alternateColors && isAlternate ? secondColor : color;
        const key = `square-${row}-${col}`;
        
        squaresArray.push({
          position: [x, y, z],
          color: squareColor,
          key
        });
      }
    }
    
    return squaresArray;
  }, [rows, columns, size, gap, offsetX, offsetZ, color, secondColor, alternateColors, elevation, height]);
  
  return (
    <group>
      {squares.map((square) => (
        <mesh 
          key={square.key} 
          position={square.position as [number, number, number]} 
          castShadow  // Cast shadows
          receiveShadow // Enable shadow receiving
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopPropagation();
            e.nativeEvent.preventDefault();
            // Prevent camera controls from being activated
            e.delta = 0; // Reset any movement delta
            handleClick(square.key);
          }}
          onPointerDown={(e) => {
            // Capture pointer to prevent camera controls
            e.stopPropagation();
          }}
        >
          <boxGeometry args={[size, height, size]} />
          {texture ? (
            <meshStandardMaterial 
              map={texture} 
              color={selectedSquares.has(square.key) ? selectedColor : square.color} 
              roughness={roughness}
              metalness={metalness}
              opacity={opacity}
              transparent={opacity < 1}
            />
          ) : (
            <meshStandardMaterial 
              color={selectedSquares.has(square.key) ? selectedColor : square.color} 
              roughness={roughness}
              metalness={metalness}
              opacity={opacity}
              transparent={opacity < 1}
            />
          )}
        </mesh>
      ))}
    </group>
  );
}; 
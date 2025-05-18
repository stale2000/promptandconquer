import React, { useMemo } from 'react';
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
  textureUrl?: string;   // Optional texture URL
  roughness?: number;    // Material roughness
  metalness?: number;    // Material metalness
  opacity?: number;      // Material opacity
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
  textureUrl,
  roughness = 0.7,       // Default roughness (less reflective)
  metalness = 0.1,       // Default metalness (slightly metallic)
  opacity = 1.0          // Fully opaque by default
}) => {
  // Load texture if provided
  const texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
  
  // Calculate total grid dimensions
  const totalWidth = columns * size + (columns - 1) * gap;
  const totalDepth = rows * size + (rows - 1) * gap;
  
  // Calculate offset to center the grid if needed
  const offsetX = centerGrid ? -totalWidth / 2 : 0;
  const offsetZ = centerGrid ? -totalDepth / 2 : 0;
  
  // Generate squares
  const squares = useMemo(() => {
    const squaresArray = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Calculate position
        const x = offsetX + col * (size + gap) + size / 2;
        const z = offsetZ + row * (size + gap) + size / 2;
        
        // Determine color (alternating pattern if enabled)
        const isAlternate = (row + col) % 2 === 1;
        const squareColor = alternateColors && isAlternate ? secondColor : color;
        
        squaresArray.push({
          position: [x, elevation, z],
          color: squareColor,
          key: `square-${row}-${col}`
        });
      }
    }
    
    return squaresArray;
  }, [rows, columns, size, gap, offsetX, offsetZ, color, secondColor, alternateColors, elevation]);
  
  return (
    <group>
      {squares.map((square) => (
        <mesh 
          key={square.key} 
          position={square.position as [number, number, number]} 
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to lay flat on ground
          receiveShadow // Enable shadow receiving
        >
          <planeGeometry args={[size, size]} />
          {texture ? (
            <meshStandardMaterial 
              map={texture} 
              color={square.color} 
              roughness={roughness}
              metalness={metalness}
              opacity={opacity}
              transparent={opacity < 1}
              side={THREE.DoubleSide} // Visible from both sides
            />
          ) : (
            <meshStandardMaterial 
              color={square.color} 
              roughness={roughness}
              metalness={metalness}
              opacity={opacity}
              transparent={opacity < 1}
              side={THREE.DoubleSide} // Visible from both sides
            />
          )}
        </mesh>
      ))}
    </group>
  );
}; 
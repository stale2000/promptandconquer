# 3D Models and Assets Setup for Vibe Coding Starter Pack: 3D Multiplayer

This document explains how to use the 3D models for the Vibe Coding Starter Pack.

## Model Requirements

The player component uses FBX format models for the characters, which have been copied from the legacy codebase.

### Required Models

The models have been placed in the `public/models/` directory:

#### Wizard Character
- `/public/models/wizard/wizard.fbx` - Main character model
- Animation files (separate FBX files for each animation):
  - `/public/models/wizard/wizard-standing-idle.fbx`
  - `/public/models/wizard/wizard-standing-walk-forward.fbx`
  - And other animation files...

#### Paladin Character
- `/public/models/paladin/paladin.fbx` - Main character model
- Animation files (separate FBX files for each animation):
  - `/public/models/paladin/paladin-idle.fbx`
  - `/public/models/paladin/paladin-walk-forward.fbx`
  - And other animation files...

## Animation Names

The following animation names are used in the Player component and must match exactly:

```
idle
walk-forward
walk-back
walk-left
walk-right
run-forward
run-back
run-left
run-right
jump
attack1
cast
damage
death
```

## Character Scale

The Player component handles scaling automatically:
- Wizard: Scale factor of 0.02 (same as original)
- Paladin: Scale factor of 1.0 (same as original)

## Integration Notes

1. The models are loaded in the Player component using the Three.js FBXLoader:
   ```typescript
   import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
   
   // In component:
   const loader = new FBXLoader();
   loader.load('/models/wizard/wizard.fbx', (fbx) => {
     // Process model...
   });
   ```

2. Animation loading is handled separately by loading each animation FBX file and extracting the animation clip.

3. The makeAnimationInPlace function removes root motion to ensure animations play in place.

4. Character rotation is synchronized with the server using the rotation callback system.

5. Name tags are positioned above characters using the custom `Html` component.

## Troubleshooting

If models don't appear:
1. Check browser console for errors
2. Verify file paths are correct
3. Make sure all animation FBX files are accessible
4. If there are issues with animation names, check that the mapping in the loadAnimation function matches the actual filenames 
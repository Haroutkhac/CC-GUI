import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../game/engine.js';

export default function GameCanvas({ projects, sessions, onNPCInteract, onTableInteract, onDismissNPC, inputPaused }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clean up any prior engine (StrictMode double-mount protection)
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    engine.onInteract = (sessionId) => {
      if (onNPCInteract) onNPCInteract(sessionId);
    };

    engine.onTableInteract = (projectId) => {
      if (onTableInteract) onTableInteract(projectId);
    };

    engine.onDismissNPC = (sessionId, name) => {
      if (onDismissNPC) onDismissNPC(sessionId, name);
    };

    engine.start();

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      engine.destroy();
      engineRef.current = null;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update callbacks
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.onInteract = (sessionId) => {
        if (onNPCInteract) onNPCInteract(sessionId);
      };
      engineRef.current.onTableInteract = (projectId) => {
        if (onTableInteract) onTableInteract(projectId);
      };
      engineRef.current.onDismissNPC = (sessionId, name) => {
        if (onDismissNPC) onDismissNPC(sessionId, name);
      };
    }
  }, [onNPCInteract, onTableInteract, onDismissNPC]);

  // Update world when projects/sessions change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateWorld(projects, sessions);
    }
  }, [projects, sessions]);

  // Pause input when overlays are open
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.inputPaused = !!inputPaused;
      if (inputPaused) {
        // Clear held keys and click target when pausing
        engineRef.current.keys = {};
        engineRef.current._clickTarget = null;
      }
    }
  }, [inputPaused]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        imageRendering: 'pixelated',
        cursor: 'pointer',
      }}
    />
  );
}

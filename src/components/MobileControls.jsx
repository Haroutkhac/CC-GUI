import { useEffect } from 'react';

export default function MobileControls() {
  useEffect(() => {
    if (!('ontouchstart' in window)) return;

    // Create mobile controls outside React's reconciliation
    const container = document.createElement('div');
    container.className = 'mobile-controls';

    const press = (key, down) => {
      window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key }));
    };

    const makeBtn = (cls, key, label) => {
      const btn = document.createElement('button');
      btn.className = cls;
      btn.textContent = label;
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); press(key, true); }, { passive: false });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); press(key, false); });
      return btn;
    };

    const dpad = document.createElement('div');
    dpad.className = 'dpad';
    dpad.appendChild(makeBtn('dpad-btn dpad-up', 'ArrowUp', '\u25B2'));
    dpad.appendChild(makeBtn('dpad-btn dpad-left', 'ArrowLeft', '\u25C0'));
    dpad.appendChild(makeBtn('dpad-btn dpad-right', 'ArrowRight', '\u25B6'));
    dpad.appendChild(makeBtn('dpad-btn dpad-down', 'ArrowDown', '\u25BC'));
    container.appendChild(dpad);

    container.appendChild(makeBtn('dpad-action', 'Enter', 'A'));

    document.body.appendChild(container);

    return () => {
      container.remove();
    };
  }, []);

  return null;
}

// Pokemon-authentic pixel art sprites
// Targeting Pokemon FireRed/LeafGreen GBA aesthetic

// === REGIONS & STARTERS (re-exported from shared) ===
export { REGIONS } from '../../shared/constants.js';

// === POKEMON DRAWING FUNCTIONS ===

function drawBulbasaur(ctx, x, y, s) {
  // Bulb (rows 0-3, dark green, prominent)
  ctx.fillStyle = '#2D6B4A';
  ctx.fillRect(x+5*s, y+0*s, 6*s, 1*s);
  ctx.fillRect(x+4*s, y+1*s, 8*s, 2*s);
  ctx.fillRect(x+5*s, y+3*s, 6*s, 1*s);
  // Bulb highlight
  ctx.fillStyle = '#3B8C5E';
  ctx.fillRect(x+6*s, y+0*s, 3*s, 1*s);
  ctx.fillRect(x+5*s, y+1*s, 3*s, 1*s);
  ctx.fillRect(x+6*s, y+2*s, 2*s, 1*s);
  // Body (rows 4-10, compact)
  ctx.fillStyle = '#5DB894';
  ctx.fillRect(x+4*s, y+4*s, 8*s, 1*s);
  ctx.fillRect(x+3*s, y+5*s, 10*s, 4*s);
  ctx.fillRect(x+4*s, y+9*s, 8*s, 2*s);
  // Darker underside
  ctx.fillStyle = '#4A9B7C';
  ctx.fillRect(x+4*s, y+9*s, 8*s, 1*s);
  // Spots
  ctx.fillStyle = '#48A080';
  ctx.fillRect(x+3*s, y+7*s, 2*s, 1*s);
  ctx.fillRect(x+11*s, y+7*s, 2*s, 1*s);
  // Eyes
  ctx.fillStyle = '#D04040';
  ctx.fillRect(x+4*s, y+5*s, 2*s, 2*s);
  ctx.fillRect(x+10*s, y+5*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+4*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+5*s, 1*s, 1*s);
  // Mouth
  ctx.fillStyle = '#3A7A5A';
  ctx.fillRect(x+6*s, y+8*s, 4*s, 1*s);
  // Legs (four, compact)
  ctx.fillStyle = '#5DB894';
  ctx.fillRect(x+4*s, y+11*s, 2*s, 3*s);
  ctx.fillRect(x+10*s, y+11*s, 2*s, 3*s);
  ctx.fillStyle = '#4A9B7C';
  ctx.fillRect(x+4*s, y+13*s, 2*s, 1*s);
  ctx.fillRect(x+10*s, y+13*s, 2*s, 1*s);
}

function drawCharmander(ctx, x, y, s) {
  // Tail flame (back layer)
  ctx.fillStyle = '#F8A030'; ctx.fillRect(x+12*s, y+9*s, 2*s, 3*s);
  ctx.fillStyle = '#F8A030'; ctx.fillRect(x+13*s, y+7*s, 2*s, 4*s);
  ctx.fillStyle = '#F85030'; ctx.fillRect(x+14*s, y+5*s, 2*s, 3*s);
  ctx.fillStyle = '#F8D030'; ctx.fillRect(x+14*s, y+4*s, 1*s, 2*s);
  ctx.fillStyle = '#F85030'; ctx.fillRect(x+13*s, y+5*s, 1*s, 2*s);
  // Body
  ctx.fillStyle = '#E87840'; ctx.fillRect(x+4*s, y+6*s, 8*s, 7*s);
  ctx.fillRect(x+5*s, y+5*s, 6*s, 1*s);
  // Belly
  ctx.fillStyle = '#F8D878'; ctx.fillRect(x+5*s, y+7*s, 5*s, 5*s);
  ctx.fillRect(x+6*s, y+6*s, 3*s, 1*s);
  // Head
  ctx.fillStyle = '#E87840'; ctx.fillRect(x+4*s, y+0*s, 8*s, 6*s);
  ctx.fillRect(x+3*s, y+1*s, 1*s, 4*s);
  ctx.fillRect(x+12*s, y+1*s, 1*s, 4*s);
  // Eyes
  ctx.fillStyle = '#40A0C0'; ctx.fillRect(x+5*s, y+2*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+2*s, 2*s, 2*s);
  ctx.fillStyle = '#000'; ctx.fillRect(x+6*s, y+2*s, 1*s, 2*s);
  ctx.fillRect(x+10*s, y+2*s, 1*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+5*s, y+2*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+2*s, 1*s, 1*s);
  // Mouth
  ctx.fillStyle = '#C06030'; ctx.fillRect(x+6*s, y+5*s, 4*s, 1*s);
  // Arms
  ctx.fillStyle = '#E87840'; ctx.fillRect(x+2*s, y+7*s, 2*s, 3*s);
  // Legs
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
  // Feet claws
  ctx.fillStyle = '#D06830';
  ctx.fillRect(x+3*s, y+14*s, 1*s, 1*s);
  ctx.fillRect(x+12*s, y+14*s, 1*s, 1*s);
}

function drawSquirtle(ctx, x, y, s) {
  // Shell (brown outer)
  ctx.fillStyle = '#A06830';
  ctx.fillRect(x+3*s, y+6*s, 10*s, 7*s);
  ctx.fillRect(x+4*s, y+5*s, 8*s, 1*s);
  // Shell inner detail
  ctx.fillStyle = '#805020';
  ctx.fillRect(x+5*s, y+8*s, 6*s, 1*s);
  ctx.fillRect(x+5*s, y+11*s, 6*s, 1*s);
  ctx.fillRect(x+7*s, y+6*s, 2*s, 7*s);
  // Tail
  ctx.fillStyle = '#68B8D8';
  ctx.fillRect(x+12*s, y+10*s, 2*s, 2*s);
  ctx.fillRect(x+13*s, y+9*s, 2*s, 2*s);
  ctx.fillRect(x+14*s, y+8*s, 2*s, 2*s);
  ctx.fillStyle = '#4898A8';
  ctx.fillRect(x+14*s, y+7*s, 1*s, 1*s);
  // Legs
  ctx.fillStyle = '#68B8D8';
  ctx.fillRect(x+4*s, y+12*s, 2*s, 3*s);
  ctx.fillRect(x+10*s, y+12*s, 2*s, 3*s);
  // Body (light blue)
  ctx.fillStyle = '#68B8D8';
  ctx.fillRect(x+4*s, y+6*s, 8*s, 7*s);
  ctx.fillRect(x+5*s, y+5*s, 6*s, 1*s);
  // Belly
  ctx.fillStyle = '#F8F0C8';
  ctx.fillRect(x+5*s, y+7*s, 6*s, 5*s);
  ctx.fillRect(x+6*s, y+6*s, 4*s, 1*s);
  // Arms
  ctx.fillStyle = '#68B8D8';
  ctx.fillRect(x+2*s, y+7*s, 2*s, 3*s);
  ctx.fillRect(x+12*s, y+7*s, 2*s, 3*s);
  // Head
  ctx.fillStyle = '#68B8D8';
  ctx.fillRect(x+4*s, y+1*s, 8*s, 5*s);
  ctx.fillRect(x+3*s, y+2*s, 10*s, 3*s);
  ctx.fillRect(x+5*s, y+0*s, 6*s, 1*s);
  // Eyes
  ctx.fillStyle = '#C04040';
  ctx.fillRect(x+5*s, y+2*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+2*s, 2*s, 2*s);
  ctx.fillStyle = '#802020';
  ctx.fillRect(x+6*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+3*s, 1*s, 1*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+2*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+2*s, 1*s, 1*s);
  // Mouth
  ctx.fillStyle = '#4898A8';
  ctx.fillRect(x+7*s, y+5*s, 2*s, 1*s);
}

function drawChikorita(ctx, x, y, s) {
  // Large leaf on head (angled, prominent)
  ctx.fillStyle = '#2E8B2E';
  ctx.fillRect(x+8*s, y+0*s, 3*s, 1*s);
  ctx.fillRect(x+7*s, y+1*s, 4*s, 1*s);
  ctx.fillRect(x+6*s, y+2*s, 4*s, 1*s);
  ctx.fillRect(x+5*s, y+3*s, 3*s, 1*s);
  // Leaf vein
  ctx.fillStyle = '#48C048';
  ctx.fillRect(x+9*s, y+0*s, 1*s, 1*s);
  ctx.fillRect(x+8*s, y+1*s, 1*s, 1*s);
  ctx.fillRect(x+7*s, y+2*s, 1*s, 1*s);
  // Head (large, round — biggest part of Chikorita)
  ctx.fillStyle = '#A8D8A0';
  ctx.fillRect(x+5*s, y+3*s, 6*s, 1*s);
  ctx.fillRect(x+4*s, y+4*s, 8*s, 3*s);
  ctx.fillRect(x+5*s, y+7*s, 6*s, 1*s);
  // Eyes
  ctx.fillStyle = '#C83030';
  ctx.fillRect(x+5*s, y+5*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+5*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+5*s, 1*s, 1*s);
  // Mouth
  ctx.fillStyle = '#80B878';
  ctx.fillRect(x+7*s, y+7*s, 2*s, 1*s);
  // Neck buds (small dots around neck, not a thick band)
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+4*s, y+8*s, 1*s, 1*s);
  ctx.fillRect(x+6*s, y+8*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+8*s, 1*s, 1*s);
  ctx.fillRect(x+11*s, y+8*s, 1*s, 1*s);
  // Body (slender, same width or narrower than head)
  ctx.fillStyle = '#A8D8A0';
  ctx.fillRect(x+5*s, y+8*s, 6*s, 1*s);
  ctx.fillRect(x+5*s, y+9*s, 6*s, 3*s);
  ctx.fillRect(x+6*s, y+12*s, 4*s, 1*s);
  // Belly highlight
  ctx.fillStyle = '#B8E8B0';
  ctx.fillRect(x+6*s, y+10*s, 4*s, 2*s);
  // Four legs (two front, two back peeking)
  ctx.fillStyle = '#A8D8A0';
  ctx.fillRect(x+5*s, y+12*s, 2*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 2*s, 3*s);
  // Toes
  ctx.fillStyle = '#90C088';
  ctx.fillRect(x+5*s, y+14*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+14*s, 2*s, 1*s);
  // Tail stub
  ctx.fillRect(x+11*s, y+10*s, 1*s, 2*s);
}

function drawCyndaquil(ctx, x, y, s) {
  // Flames erupting from back (rows 0-3, behind body)
  ctx.fillStyle = '#F85030';
  ctx.fillRect(x+4*s, y+1*s, 2*s, 2*s);
  ctx.fillRect(x+7*s, y+0*s, 2*s, 3*s);
  ctx.fillRect(x+10*s, y+1*s, 2*s, 2*s);
  ctx.fillStyle = '#F8D030';
  ctx.fillRect(x+5*s, y+0*s, 1*s, 2*s);
  ctx.fillRect(x+8*s, y+0*s, 1*s, 1*s);
  ctx.fillRect(x+11*s, y+0*s, 1*s, 2*s);
  // Dark navy back dome (rows 3-6)
  ctx.fillStyle = '#1E3050';
  ctx.fillRect(x+4*s, y+3*s, 8*s, 2*s);
  ctx.fillRect(x+3*s, y+4*s, 10*s, 3*s);
  ctx.fillRect(x+4*s, y+7*s, 8*s, 1*s);
  // Cream face (front-facing, rows 5-9)
  ctx.fillStyle = '#E8D8A8';
  ctx.fillRect(x+5*s, y+5*s, 6*s, 2*s);
  ctx.fillRect(x+4*s, y+6*s, 8*s, 3*s);
  ctx.fillRect(x+5*s, y+9*s, 6*s, 1*s);
  // Squinting eyes (thin horizontal lines)
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+6*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+6*s, 2*s, 1*s);
  // Nose
  ctx.fillStyle = '#C06030';
  ctx.fillRect(x+7*s, y+8*s, 2*s, 1*s);
  // Cream belly (rows 9-12)
  ctx.fillStyle = '#E8D8A8';
  ctx.fillRect(x+5*s, y+9*s, 6*s, 3*s);
  ctx.fillRect(x+4*s, y+10*s, 8*s, 2*s);
  // Legs (short, stubby)
  ctx.fillStyle = '#E8D8A8';
  ctx.fillRect(x+4*s, y+12*s, 3*s, 2*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 2*s);
  // Feet darker
  ctx.fillStyle = '#D0C090';
  ctx.fillRect(x+4*s, y+13*s, 3*s, 1*s);
  ctx.fillRect(x+9*s, y+13*s, 3*s, 1*s);
}

function drawTotodile(ctx, x, y, s) {
  // Tail (behind body, left side)
  ctx.fillStyle = '#50A0D0';
  ctx.fillRect(x+1*s, y+9*s, 2*s, 2*s);
  ctx.fillRect(x+0*s, y+8*s, 2*s, 2*s);
  // Red spiky crest (rows 0-1, connected ridge)
  ctx.fillStyle = '#D04040';
  ctx.fillRect(x+5*s, y+0*s, 6*s, 1*s);
  ctx.fillRect(x+6*s, y+1*s, 4*s, 1*s);
  // Crest spike tips
  ctx.fillRect(x+5*s, y+0*s, 1*s, 1*s);
  ctx.fillRect(x+7*s, y+0*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+0*s, 1*s, 1*s);
  // Head (rows 2-5, blue, round)
  ctx.fillStyle = '#50A0D0';
  ctx.fillRect(x+4*s, y+2*s, 8*s, 4*s);
  ctx.fillRect(x+3*s, y+3*s, 10*s, 2*s);
  // Eyes (red with white highlight)
  ctx.fillStyle = '#C04040';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  // Jaw - upper teeth line (zigzag)
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+4*s, y+6*s, 8*s, 1*s);
  ctx.fillStyle = '#50A0D0';
  ctx.fillRect(x+5*s, y+6*s, 1*s, 1*s);
  ctx.fillRect(x+7*s, y+6*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+6*s, 1*s, 1*s);
  ctx.fillRect(x+11*s, y+6*s, 1*s, 1*s);
  // Jaw lower (cream)
  ctx.fillStyle = '#F8F0C8';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 1*s);
  // Body (rows 8-12, blue)
  ctx.fillStyle = '#50A0D0';
  ctx.fillRect(x+4*s, y+8*s, 8*s, 5*s);
  ctx.fillRect(x+3*s, y+9*s, 10*s, 3*s);
  // Cream belly with red V
  ctx.fillStyle = '#F8F0C8';
  ctx.fillRect(x+5*s, y+8*s, 6*s, 4*s);
  ctx.fillStyle = '#D04040';
  ctx.fillRect(x+7*s, y+8*s, 2*s, 1*s);
  ctx.fillRect(x+6*s, y+9*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+9*s, 1*s, 1*s);
  // Arms
  ctx.fillStyle = '#50A0D0';
  ctx.fillRect(x+2*s, y+9*s, 2*s, 3*s);
  ctx.fillRect(x+12*s, y+9*s, 2*s, 3*s);
  // Legs
  ctx.fillRect(x+5*s, y+13*s, 3*s, 2*s);
  ctx.fillRect(x+9*s, y+13*s, 3*s, 2*s);
}

function drawTreecko(ctx, x, y, s) {
  // Tail - thick, curving up-right (drawn first, behind body)
  ctx.fillStyle = '#3A9A3A';
  ctx.fillRect(x+11*s, y+9*s, 2*s, 3*s);
  ctx.fillRect(x+12*s, y+7*s, 2*s, 3*s);
  ctx.fillRect(x+13*s, y+5*s, 2*s, 3*s);
  ctx.fillStyle = '#2D8C3C';
  ctx.fillRect(x+14*s, y+3*s, 2*s, 3*s);
  ctx.fillRect(x+15*s, y+2*s, 1*s, 2*s);
  // Tail highlight edge
  ctx.fillStyle = '#4CB84C';
  ctx.fillRect(x+11*s, y+9*s, 1*s, 2*s);
  ctx.fillRect(x+12*s, y+7*s, 1*s, 2*s);
  // Dark green head ridge (rows 0-1, within bounds)
  ctx.fillStyle = '#2D8C3C';
  ctx.fillRect(x+5*s, y+0*s, 5*s, 1*s);
  ctx.fillRect(x+6*s, y+1*s, 3*s, 1*s);
  // Head - green (rows 2-7)
  ctx.fillStyle = '#4CB84C';
  ctx.fillRect(x+3*s, y+2*s, 9*s, 5*s);
  ctx.fillRect(x+2*s, y+3*s, 11*s, 3*s);
  // Forehead highlight
  ctx.fillStyle = '#60D060';
  ctx.fillRect(x+5*s, y+2*s, 3*s, 1*s);
  // Eyes - large yellow with slit pupils (3x2)
  ctx.fillStyle = '#F8D830';
  ctx.fillRect(x+3*s, y+3*s, 3*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 3*s, 2*s);
  // Eye bottom shadow
  ctx.fillStyle = '#D8B020';
  ctx.fillRect(x+3*s, y+4*s, 3*s, 1*s);
  ctx.fillRect(x+9*s, y+4*s, 3*s, 1*s);
  // Slit pupils
  ctx.fillStyle = '#000';
  ctx.fillRect(x+4*s, y+3*s, 1*s, 2*s);
  ctx.fillRect(x+10*s, y+3*s, 1*s, 2*s);
  // Eye highlights
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+3*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  // Lip / smirk
  ctx.fillStyle = '#C84848';
  ctx.fillRect(x+5*s, y+6*s, 4*s, 1*s);
  // Body - slender (rows 7-12)
  ctx.fillStyle = '#4CB84C';
  ctx.fillRect(x+5*s, y+7*s, 6*s, 6*s);
  ctx.fillRect(x+4*s, y+8*s, 7*s, 4*s);
  // Red belly (smaller, centered)
  ctx.fillStyle = '#D04848';
  ctx.fillRect(x+6*s, y+8*s, 3*s, 3*s);
  ctx.fillStyle = '#B03838';
  ctx.fillRect(x+6*s, y+10*s, 3*s, 1*s);
  // Arms
  ctx.fillStyle = '#4CB84C';
  ctx.fillRect(x+2*s, y+8*s, 2*s, 2*s);
  ctx.fillRect(x+11*s, y+8*s, 2*s, 2*s);
  // Three fingers each hand
  ctx.fillStyle = '#3A9A3A';
  ctx.fillRect(x+1*s, y+10*s, 1*s, 1*s);
  ctx.fillRect(x+2*s, y+10*s, 1*s, 1*s);
  ctx.fillRect(x+3*s, y+10*s, 1*s, 1*s);
  ctx.fillRect(x+11*s, y+10*s, 1*s, 1*s);
  ctx.fillRect(x+12*s, y+10*s, 1*s, 1*s);
  ctx.fillRect(x+13*s, y+10*s, 1*s, 1*s);
  // Legs
  ctx.fillStyle = '#4CB84C';
  ctx.fillRect(x+5*s, y+13*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+13*s, 2*s, 2*s);
  // Spread toes
  ctx.fillStyle = '#3A9A3A';
  ctx.fillRect(x+4*s, y+15*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+15*s, 2*s, 1*s);
}

function drawTorchic(ctx, x, y, s) {
  // Head crest - 3 feather tufts, centered, all within bounds
  ctx.fillStyle = '#E87020';
  ctx.fillRect(x+5*s, y+0*s, 2*s, 2*s);   // left tuft
  ctx.fillRect(x+7*s, y+0*s, 2*s, 2*s);   // center tuft
  ctx.fillRect(x+9*s, y+0*s, 2*s, 2*s);   // right tuft
  ctx.fillStyle = '#D06018';
  ctx.fillRect(x+7*s, y+0*s, 2*s, 1*s);   // center tuft darker tip
  // Head - round, orange
  ctx.fillStyle = '#F08030';
  ctx.fillRect(x+5*s, y+2*s, 6*s, 1*s);
  ctx.fillRect(x+4*s, y+3*s, 8*s, 3*s);
  ctx.fillRect(x+5*s, y+6*s, 6*s, 1*s);
  // Head highlight
  ctx.fillStyle = '#F8A050';
  ctx.fillRect(x+5*s, y+2*s, 4*s, 1*s);
  // Eyes
  ctx.fillStyle = '#181818';
  ctx.fillRect(x+5*s, y+4*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+4*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+4*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+4*s, 1*s, 1*s);
  // Beak - small, two-tone
  ctx.fillStyle = '#F8D848';
  ctx.fillRect(x+7*s, y+6*s, 2*s, 1*s);
  ctx.fillStyle = '#D8A028';
  ctx.fillRect(x+7*s, y+7*s, 2*s, 1*s);
  // Body - fluffy yellow, round
  ctx.fillStyle = '#F8E070';
  ctx.fillRect(x+5*s, y+7*s, 6*s, 1*s);
  ctx.fillRect(x+4*s, y+8*s, 8*s, 1*s);
  ctx.fillRect(x+3*s, y+9*s, 10*s, 2*s);
  ctx.fillRect(x+4*s, y+11*s, 8*s, 1*s);
  // Body highlight
  ctx.fillStyle = '#F8E8A0';
  ctx.fillRect(x+5*s, y+9*s, 6*s, 2*s);
  // Wings
  ctx.fillStyle = '#F08030';
  ctx.fillRect(x+2*s, y+9*s, 2*s, 2*s);
  ctx.fillRect(x+12*s, y+9*s, 2*s, 2*s);
  ctx.fillStyle = '#D87028';
  ctx.fillRect(x+1*s, y+10*s, 1*s, 1*s);
  ctx.fillRect(x+14*s, y+10*s, 1*s, 1*s);
  // Feet - orange with spread toes
  ctx.fillStyle = '#E08030';
  ctx.fillRect(x+5*s, y+12*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+12*s, 2*s, 1*s);
  ctx.fillStyle = '#D07028';
  ctx.fillRect(x+4*s, y+13*s, 4*s, 1*s);
  ctx.fillRect(x+8*s, y+13*s, 4*s, 1*s);
  // Talon toes
  ctx.fillStyle = '#C06020';
  ctx.fillRect(x+3*s, y+14*s, 1*s, 1*s);
  ctx.fillRect(x+5*s, y+14*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+14*s, 1*s, 1*s);
  ctx.fillRect(x+12*s, y+14*s, 1*s, 1*s);
}

function drawMudkip(ctx, x, y, s) {
  // Tail fin
  ctx.fillStyle = '#4090C8';
  ctx.fillRect(x+12*s, y+10*s, 2*s, 2*s);
  ctx.fillRect(x+13*s, y+9*s, 2*s, 4*s);
  ctx.fillRect(x+14*s, y+8*s, 2*s, 2*s);
  ctx.fillRect(x+14*s, y+12*s, 2*s, 2*s);
  ctx.fillStyle = '#58A8D8'; ctx.fillRect(x+14*s, y+10*s, 1*s, 2*s);
  // Head fin (within 16x16 bounds)
  ctx.fillStyle = '#4090C8';
  ctx.fillRect(x+7*s, y+0*s, 2*s, 3*s);
  ctx.fillRect(x+6*s, y+2*s, 4*s, 1*s);
  // Head
  ctx.fillStyle = '#58A8D8';
  ctx.fillRect(x+3*s, y+2*s, 10*s, 6*s);
  ctx.fillRect(x+2*s, y+3*s, 12*s, 4*s);
  ctx.fillRect(x+4*s, y+1*s, 8*s, 2*s);
  // Cheek gills
  ctx.fillStyle = '#F8A050';
  ctx.fillRect(x+1*s, y+4*s, 2*s, 1*s);
  ctx.fillRect(x+0*s, y+3*s, 2*s, 1*s);
  ctx.fillRect(x+0*s, y+5*s, 2*s, 1*s);
  ctx.fillRect(x+13*s, y+4*s, 2*s, 1*s);
  ctx.fillRect(x+14*s, y+3*s, 2*s, 1*s);
  ctx.fillRect(x+14*s, y+5*s, 2*s, 1*s);
  // Eyes
  ctx.fillStyle = '#000'; ctx.fillRect(x+4*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+10*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+4*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+3*s, 1*s, 1*s);
  // Mouth
  ctx.fillStyle = '#3878A0'; ctx.fillRect(x+5*s, y+6*s, 6*s, 1*s);
  ctx.fillStyle = '#306890'; ctx.fillRect(x+6*s, y+7*s, 4*s, 1*s);
  // Body
  ctx.fillStyle = '#58A8D8'; ctx.fillRect(x+5*s, y+8*s, 6*s, 4*s);
  ctx.fillRect(x+4*s, y+9*s, 8*s, 3*s);
  // Belly
  ctx.fillStyle = '#B8D8F0'; ctx.fillRect(x+6*s, y+9*s, 4*s, 3*s);
  // Legs
  ctx.fillStyle = '#58A8D8';
  ctx.fillRect(x+4*s, y+12*s, 2*s, 2*s);
  ctx.fillRect(x+10*s, y+12*s, 2*s, 2*s);
  ctx.fillRect(x+3*s, y+13*s, 2*s, 2*s);
  ctx.fillRect(x+11*s, y+13*s, 2*s, 2*s);
}

function drawTurtwig(ctx, x, y, s) {
  // Back legs
  ctx.fillStyle = '#4A8A3A';
  ctx.fillRect(x+2*s, y+11*s, 3*s, 4*s);
  ctx.fillRect(x+11*s, y+11*s, 3*s, 4*s);
  ctx.fillStyle = '#3D7A30';
  ctx.fillRect(x+1*s, y+14*s, 3*s, 1*s);
  ctx.fillRect(x+12*s, y+14*s, 3*s, 1*s);
  // Shell
  ctx.fillStyle = '#A07828';
  ctx.fillRect(x+3*s, y+6*s, 10*s, 7*s);
  ctx.fillRect(x+4*s, y+5*s, 8*s, 9*s);
  ctx.fillStyle = '#8B6514';
  ctx.fillRect(x+4*s, y+6*s, 8*s, 7*s);
  ctx.fillRect(x+5*s, y+5*s, 6*s, 8*s);
  ctx.fillStyle = '#5C4210';
  ctx.fillRect(x+5*s, y+7*s, 6*s, 4*s);
  ctx.fillRect(x+6*s, y+6*s, 4*s, 6*s);
  // Shell pattern
  ctx.fillStyle = '#6B4F12';
  ctx.fillRect(x+5*s, y+9*s, 6*s, 1*s);
  ctx.fillRect(x+8*s, y+7*s, 1*s, 4*s);
  // Front legs
  ctx.fillStyle = '#58A848';
  ctx.fillRect(x+3*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+10*s, y+12*s, 3*s, 3*s);
  ctx.fillStyle = '#4A9A3A';
  ctx.fillRect(x+2*s, y+14*s, 3*s, 1*s);
  ctx.fillRect(x+10*s, y+14*s, 3*s, 1*s);
  // Twig
  ctx.fillStyle = '#6B4F12';
  ctx.fillRect(x+7*s, y+0*s, 2*s, 4*s);
  // Leaves
  ctx.fillStyle = '#2E8B2E';
  ctx.fillRect(x+4*s, y+0*s, 3*s, 2*s);
  ctx.fillRect(x+9*s, y+0*s, 3*s, 2*s);
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+5*s, y+0*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+0*s, 2*s, 1*s);
  // Head
  ctx.fillStyle = '#68B858';
  ctx.fillRect(x+4*s, y+2*s, 8*s, 6*s);
  ctx.fillRect(x+3*s, y+3*s, 10*s, 4*s);
  ctx.fillRect(x+5*s, y+1*s, 6*s, 2*s);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+4*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+4*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+4*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+4*s, 1*s, 1*s);
  // Yellow jaw
  ctx.fillStyle = '#E8D880';
  ctx.fillRect(x+5*s, y+6*s, 6*s, 2*s);
  ctx.fillRect(x+4*s, y+7*s, 8*s, 1*s);
  ctx.fillStyle = '#C8B860';
  ctx.fillRect(x+6*s, y+7*s, 4*s, 1*s);
}

function drawChimchar(ctx, x, y, s) {
  // Flame (back layer)
  ctx.fillStyle = '#F8C030'; ctx.fillRect(x+11*s, y+9*s, 4*s, 3*s);
  ctx.fillStyle = '#F85030'; ctx.fillRect(x+12*s, y+8*s, 3*s, 3*s);
  ctx.fillStyle = '#F8E850'; ctx.fillRect(x+12*s, y+9*s, 2*s, 2*s);
  ctx.fillStyle = '#F85030'; ctx.fillRect(x+13*s, y+7*s, 2*s, 2*s);
  // Ears
  ctx.fillStyle = '#704028'; ctx.fillRect(x+2*s, y+2*s, 3*s, 3*s);
  ctx.fillRect(x+11*s, y+2*s, 3*s, 3*s);
  ctx.fillStyle = '#C07848'; ctx.fillRect(x+3*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+12*s, y+3*s, 1*s, 1*s);
  // Head
  ctx.fillStyle = '#E08840'; ctx.fillRect(x+4*s, y+0*s, 8*s, 2*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 6*s);
  ctx.fillRect(x+4*s, y+6*s, 8*s, 1*s);
  // Face - cream heart shape
  ctx.fillStyle = '#F8E0B0'; ctx.fillRect(x+5*s, y+2*s, 6*s, 4*s);
  ctx.fillRect(x+6*s, y+1*s, 2*s, 1*s);
  ctx.fillRect(x+8*s, y+1*s, 2*s, 1*s);
  ctx.fillRect(x+6*s, y+6*s, 4*s, 1*s);
  ctx.fillStyle = '#E08840'; ctx.fillRect(x+7*s, y+1*s, 2*s, 1*s);
  // Eyes
  ctx.fillStyle = '#181818'; ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  // Nose
  ctx.fillStyle = '#804030'; ctx.fillRect(x+7*s, y+5*s, 2*s, 1*s);
  // Body
  ctx.fillStyle = '#E08840'; ctx.fillRect(x+4*s, y+7*s, 8*s, 5*s);
  ctx.fillRect(x+5*s, y+7*s, 6*s, 6*s);
  // Belly
  ctx.fillStyle = '#F8E0B0'; ctx.fillRect(x+6*s, y+8*s, 4*s, 4*s);
  ctx.fillRect(x+7*s, y+7*s, 2*s, 1*s);
  // Arms
  ctx.fillStyle = '#E08840'; ctx.fillRect(x+2*s, y+7*s, 2*s, 2*s);
  ctx.fillRect(x+1*s, y+9*s, 2*s, 2*s);
  ctx.fillRect(x+12*s, y+7*s, 2*s, 2*s);
  // Legs
  ctx.fillRect(x+5*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+8*s, y+12*s, 3*s, 3*s);
  // Feet
  ctx.fillStyle = '#C07848';
  ctx.fillRect(x+4*s, y+14*s, 3*s, 1*s);
  ctx.fillRect(x+9*s, y+14*s, 3*s, 1*s);
}

function drawPiplup(ctx, x, y, s) {
  // Cape/back
  ctx.fillStyle = '#1E50A0';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 5*s);
  ctx.fillRect(x+5*s, y+6*s, 6*s, 1*s);
  // Crown points
  ctx.fillRect(x+5*s, y+0*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+0*s, 2*s, 2*s);
  // Head
  ctx.fillStyle = '#3B8ACD';
  ctx.fillRect(x+5*s, y+1*s, 6*s, 2*s);
  ctx.fillRect(x+4*s, y+2*s, 8*s, 2*s);
  ctx.fillRect(x+3*s, y+3*s, 10*s, 3*s);
  ctx.fillRect(x+4*s, y+6*s, 8*s, 1*s);
  // White face
  ctx.fillStyle = '#F8F8F8';
  ctx.fillRect(x+5*s, y+3*s, 6*s, 3*s);
  ctx.fillRect(x+6*s, y+2*s, 4*s, 1*s);
  // Eyes
  ctx.fillStyle = '#102040'; ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  // Beak
  ctx.fillStyle = '#F0C030'; ctx.fillRect(x+7*s, y+5*s, 2*s, 1*s);
  ctx.fillStyle = '#D8A020'; ctx.fillRect(x+7*s, y+6*s, 2*s, 1*s);
  // Body
  ctx.fillStyle = '#3B8ACD'; ctx.fillRect(x+4*s, y+7*s, 8*s, 5*s);
  ctx.fillRect(x+5*s, y+12*s, 6*s, 1*s);
  // White belly
  ctx.fillStyle = '#F0F8FF';
  ctx.fillRect(x+6*s, y+7*s, 4*s, 1*s);
  ctx.fillRect(x+5*s, y+8*s, 6*s, 3*s);
  // Flipper wings
  ctx.fillStyle = '#1E50A0';
  ctx.fillRect(x+2*s, y+8*s, 2*s, 3*s);
  ctx.fillRect(x+12*s, y+8*s, 2*s, 3*s);
  // Feet
  ctx.fillStyle = '#F0C030';
  ctx.fillRect(x+4*s, y+13*s, 3*s, 1*s);
  ctx.fillRect(x+3*s, y+14*s, 4*s, 1*s);
  ctx.fillRect(x+9*s, y+13*s, 3*s, 1*s);
  ctx.fillRect(x+9*s, y+14*s, 4*s, 1*s);
}

function drawSnivy(ctx, x, y, s) {
  // Leaf tail
  ctx.fillStyle = '#48A048'; ctx.fillRect(x+11*s, y+11*s, 2*s, 1*s);
  ctx.fillRect(x+12*s, y+10*s, 2*s, 2*s);
  ctx.fillRect(x+13*s, y+9*s, 2*s, 2*s);
  ctx.fillStyle = '#68B858'; ctx.fillRect(x+14*s, y+8*s, 2*s, 2*s);
  // Head leaf extensions
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+4*s, y+0*s, 2*s, 2*s);
  ctx.fillRect(x+3*s, y+0*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+0*s, 2*s, 2*s);
  ctx.fillRect(x+12*s, y+0*s, 1*s, 1*s);
  ctx.fillStyle = '#68B858'; ctx.fillRect(x+5*s, y+1*s, 6*s, 2*s);
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+4*s, y+1*s, 1*s, 2*s);
  ctx.fillRect(x+11*s, y+1*s, 1*s, 2*s);
  // Head
  ctx.fillStyle = '#68B858'; ctx.fillRect(x+5*s, y+2*s, 6*s, 5*s);
  ctx.fillRect(x+6*s, y+1*s, 4*s, 1*s);
  // Eyes - smug red
  ctx.fillStyle = '#C83030'; ctx.fillRect(x+6*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+6*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+3*s, 1*s, 1*s);
  // Mouth
  ctx.fillStyle = '#408030'; ctx.fillRect(x+7*s, y+6*s, 3*s, 1*s);
  // Yellow collar
  ctx.fillStyle = '#F0D840'; ctx.fillRect(x+5*s, y+7*s, 6*s, 1*s);
  // Body
  ctx.fillStyle = '#68B858'; ctx.fillRect(x+6*s, y+8*s, 4*s, 4*s);
  // Cream belly
  ctx.fillStyle = '#F0F0C8'; ctx.fillRect(x+7*s, y+8*s, 2*s, 3*s);
  // Arms
  ctx.fillStyle = '#68B858';
  ctx.fillRect(x+4*s, y+8*s, 2*s, 1*s);
  ctx.fillRect(x+3*s, y+9*s, 2*s, 1*s);
  ctx.fillRect(x+10*s, y+8*s, 2*s, 1*s);
  ctx.fillRect(x+11*s, y+9*s, 2*s, 1*s);
  // Legs
  ctx.fillRect(x+6*s, y+12*s, 2*s, 2*s);
  ctx.fillRect(x+8*s, y+12*s, 2*s, 2*s);
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+5*s, y+14*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+14*s, 2*s, 1*s);
}

function drawTepig(ctx, x, y, s) {
  // Curly tail with flame
  ctx.fillStyle = '#E07040'; ctx.fillRect(x+12*s, y+7*s, 1*s, 1*s);
  ctx.fillRect(x+13*s, y+6*s, 1*s, 1*s);
  ctx.fillRect(x+13*s, y+8*s, 1*s, 1*s);
  ctx.fillRect(x+14*s, y+7*s, 1*s, 1*s);
  ctx.fillStyle = '#F83820'; ctx.fillRect(x+14*s, y+6*s, 1*s, 1*s);
  ctx.fillStyle = '#FFAA30'; ctx.fillRect(x+15*s, y+6*s, 1*s, 1*s);
  // Body
  ctx.fillStyle = '#E88050'; ctx.fillRect(x+4*s, y+8*s, 8*s, 4*s);
  ctx.fillRect(x+3*s, y+9*s, 10*s, 2*s);
  // Black band
  ctx.fillStyle = '#2C2C2C'; ctx.fillRect(x+3*s, y+8*s, 9*s, 1*s);
  // Legs
  ctx.fillStyle = '#2C2C2C'; ctx.fillRect(x+4*s, y+12*s, 2*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 2*s, 3*s);
  ctx.fillStyle = '#1A1A1A'; ctx.fillRect(x+4*s, y+14*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+14*s, 2*s, 1*s);
  // Head
  ctx.fillStyle = '#E88050'; ctx.fillRect(x+3*s, y+1*s, 10*s, 7*s);
  ctx.fillRect(x+2*s, y+2*s, 12*s, 5*s);
  ctx.fillRect(x+4*s, y+0*s, 8*s, 1*s);
  // Black top
  ctx.fillStyle = '#2C2C2C'; ctx.fillRect(x+4*s, y+0*s, 8*s, 1*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 2*s);
  // Ears
  ctx.fillRect(x+2*s, y+0*s, 2*s, 2*s);
  ctx.fillRect(x+12*s, y+0*s, 2*s, 2*s);
  ctx.fillStyle = '#C06040'; ctx.fillRect(x+3*s, y+1*s, 1*s, 1*s);
  ctx.fillRect(x+12*s, y+1*s, 1*s, 1*s);
  // Eyes
  ctx.fillStyle = '#000'; ctx.fillRect(x+4*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+10*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+4*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+3*s, 1*s, 1*s);
  // Snout
  ctx.fillStyle = '#F0CCA0'; ctx.fillRect(x+5*s, y+5*s, 6*s, 3*s);
  ctx.fillRect(x+4*s, y+5*s, 8*s, 2*s);
  // Nostrils
  ctx.fillStyle = '#8B5030'; ctx.fillRect(x+6*s, y+6*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+6*s, 1*s, 1*s);
  // Belly
  ctx.fillStyle = '#F0CCA0'; ctx.fillRect(x+6*s, y+9*s, 4*s, 3*s);
}

function drawOshawott(ctx, x, y, s) {
  // Head
  ctx.fillStyle = '#68B0D0'; ctx.fillRect(x+3*s, y+1*s, 10*s, 6*s);
  ctx.fillRect(x+4*s, y+0*s, 8*s, 1*s);
  ctx.fillRect(x+4*s, y+7*s, 8*s, 1*s);
  // White face
  ctx.fillStyle = '#F8F8F0'; ctx.fillRect(x+4*s, y+3*s, 8*s, 4*s);
  ctx.fillRect(x+5*s, y+2*s, 6*s, 1*s);
  // Dark V-shape scalp
  ctx.fillStyle = '#1E3A5C'; ctx.fillRect(x+4*s, y+0*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+0*s, 3*s, 3*s);
  ctx.fillRect(x+6*s, y+1*s, 1*s, 2*s);
  ctx.fillRect(x+9*s, y+1*s, 1*s, 2*s);
  ctx.fillRect(x+7*s, y+1*s, 2*s, 1*s);
  // Eyes
  ctx.fillStyle = '#1A1A2E'; ctx.fillRect(x+5*s, y+4*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+4*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+5*s, y+4*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+4*s, 1*s, 1*s);
  // Nose
  ctx.fillStyle = '#8B5A3C'; ctx.fillRect(x+7*s, y+5*s, 2*s, 1*s);
  // Freckles
  ctx.fillStyle = '#E8955A'; ctx.fillRect(x+4*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+11*s, y+5*s, 1*s, 1*s);
  // Body
  ctx.fillStyle = '#68B0D0'; ctx.fillRect(x+4*s, y+8*s, 8*s, 4*s);
  ctx.fillRect(x+5*s, y+7*s, 6*s, 1*s);
  // White belly
  ctx.fillStyle = '#F8F8F0'; ctx.fillRect(x+5*s, y+8*s, 6*s, 4*s);
  // Scalchop
  ctx.fillStyle = '#90D8F0'; ctx.fillRect(x+6*s, y+9*s, 4*s, 2*s);
  ctx.fillStyle = '#4A9AB8'; ctx.fillRect(x+6*s, y+9*s, 4*s, 1*s);
  ctx.fillRect(x+6*s, y+9*s, 1*s, 2*s);
  ctx.fillRect(x+9*s, y+9*s, 1*s, 2*s);
  ctx.fillStyle = '#B0E8F8'; ctx.fillRect(x+7*s, y+10*s, 2*s, 1*s);
  // Arms
  ctx.fillStyle = '#5098B8'; ctx.fillRect(x+3*s, y+8*s, 2*s, 3*s);
  ctx.fillRect(x+11*s, y+8*s, 2*s, 3*s);
  // Legs
  ctx.fillStyle = '#68B0D0';
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
  ctx.fillStyle = '#5098B8';
  ctx.fillRect(x+4*s, y+14*s, 3*s, 1*s);
  ctx.fillRect(x+9*s, y+14*s, 3*s, 1*s);
}

// Generic fallback starters for regions 6-8
function drawGenericGrass(ctx, x, y, s) { drawBulbasaur(ctx, x, y, s); }
function drawGenericFire(ctx, x, y, s) { drawCharmander(ctx, x, y, s); }
function drawGenericWater(ctx, x, y, s) { drawSquirtle(ctx, x, y, s); }

function drawChespin(ctx, x, y, s) {
  // Quill hood (brown)
  ctx.fillStyle = '#8B6834';
  ctx.fillRect(x+4*s, y+0*s, 8*s, 1*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 2*s);
  ctx.fillRect(x+4*s, y+3*s, 8*s, 2*s);
  // Green spike tips (at very top, within bounds)
  ctx.fillStyle = '#5B9830';
  ctx.fillRect(x+3*s, y+0*s, 2*s, 1*s);
  ctx.fillRect(x+7*s, y+0*s, 2*s, 1*s);
  ctx.fillRect(x+11*s, y+0*s, 2*s, 1*s);
  // Green body
  ctx.fillStyle = '#68A848';
  ctx.fillRect(x+4*s, y+8*s, 8*s, 1*s);
  ctx.fillRect(x+3*s, y+9*s, 10*s, 3*s);
  ctx.fillRect(x+5*s, y+12*s, 6*s, 1*s);
  // Arms
  ctx.fillRect(x+1*s, y+9*s, 2*s, 2*s);
  ctx.fillRect(x+13*s, y+9*s, 2*s, 2*s);
  // Tan belly
  ctx.fillStyle = '#E8D8A0';
  ctx.fillRect(x+5*s, y+9*s, 6*s, 2*s);
  // Face
  ctx.fillStyle = '#F0E0B0';
  ctx.fillRect(x+4*s, y+4*s, 8*s, 4*s);
  // Eyes
  ctx.fillStyle = '#282828'; ctx.fillRect(x+5*s, y+5*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+5*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+5*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+5*s, 1*s, 1*s);
  // Buck teeth/smile
  ctx.fillStyle = '#A07848'; ctx.fillRect(x+6*s, y+7*s, 4*s, 1*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+7*s, y+7*s, 1*s, 1*s);
  ctx.fillRect(x+8*s, y+7*s, 1*s, 1*s);
  // Legs
  ctx.fillStyle = '#68A848'; ctx.fillRect(x+4*s, y+13*s, 3*s, 1*s);
  ctx.fillRect(x+9*s, y+13*s, 3*s, 1*s);
  ctx.fillStyle = '#5B9830'; ctx.fillRect(x+4*s, y+14*s, 3*s, 1*s);
  ctx.fillRect(x+9*s, y+14*s, 3*s, 1*s);
}

function drawFennekin(ctx, x, y, s) {
  // Tail - bushy, behind body
  ctx.fillStyle = '#E87830'; ctx.fillRect(x+11*s, y+4*s, 4*s, 3*s);
  ctx.fillRect(x+12*s, y+3*s, 3*s, 1*s);
  ctx.fillRect(x+12*s, y+7*s, 3*s, 1*s);
  ctx.fillStyle = '#F0C848'; ctx.fillRect(x+9*s, y+5*s, 3*s, 2*s);
  ctx.fillRect(x+10*s, y+4*s, 2*s, 4*s);
  // Legs
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x+3*s, y+12*s, 1*s, 3*s);
  ctx.fillRect(x+5*s, y+12*s, 1*s, 3*s);
  ctx.fillRect(x+7*s, y+12*s, 1*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 1*s, 3*s);
  // Body
  ctx.fillStyle = '#F0C848'; ctx.fillRect(x+4*s, y+8*s, 6*s, 4*s);
  ctx.fillRect(x+3*s, y+9*s, 1*s, 3*s);
  // Chest fluff
  ctx.fillStyle = '#F8F0D8'; ctx.fillRect(x+4*s, y+8*s, 4*s, 2*s);
  // Ears
  ctx.fillStyle = '#F0C848';
  ctx.fillRect(x+2*s, y+0*s, 2*s, 5*s);
  ctx.fillRect(x+1*s, y+0*s, 1*s, 3*s);
  ctx.fillRect(x+9*s, y+0*s, 2*s, 5*s);
  ctx.fillRect(x+11*s, y+0*s, 1*s, 3*s);
  // Ear inner tufts
  ctx.fillStyle = '#E07038';
  ctx.fillRect(x+2*s, y+1*s, 1*s, 3*s);
  ctx.fillRect(x+3*s, y+2*s, 1*s, 2*s);
  ctx.fillRect(x+10*s, y+1*s, 1*s, 3*s);
  ctx.fillRect(x+9*s, y+2*s, 1*s, 2*s);
  // Head
  ctx.fillStyle = '#F0C848'; ctx.fillRect(x+3*s, y+4*s, 7*s, 5*s);
  ctx.fillRect(x+2*s, y+5*s, 1*s, 3*s);
  // Face
  ctx.fillStyle = '#F8F0D8'; ctx.fillRect(x+4*s, y+5*s, 5*s, 3*s);
  ctx.fillRect(x+5*s, y+4*s, 3*s, 1*s);
  // Eyes
  ctx.fillStyle = '#2C2C2C'; ctx.fillRect(x+4*s, y+5*s, 2*s, 2*s);
  ctx.fillRect(x+7*s, y+5*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+4*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+7*s, y+5*s, 1*s, 1*s);
  // Nose
  ctx.fillStyle = '#2C2C2C'; ctx.fillRect(x+6*s, y+7*s, 1*s, 1*s);
}

function drawFroakie(ctx, x, y, s) {
  // Back legs
  ctx.fillStyle = '#2858A0';
  ctx.fillRect(x+2*s, y+13*s, 3*s, 2*s);
  ctx.fillRect(x+11*s, y+13*s, 3*s, 2*s);
  ctx.fillRect(x+3*s, y+11*s, 2*s, 2*s);
  ctx.fillRect(x+11*s, y+11*s, 2*s, 2*s);
  // Body
  ctx.fillStyle = '#3070B8';
  ctx.fillRect(x+4*s, y+8*s, 8*s, 4*s);
  ctx.fillRect(x+5*s, y+7*s, 6*s, 1*s);
  // Belly
  ctx.fillStyle = '#90C8E8'; ctx.fillRect(x+6*s, y+9*s, 4*s, 3*s);
  // Arms
  ctx.fillStyle = '#3070B8';
  ctx.fillRect(x+2*s, y+9*s, 2*s, 2*s);
  ctx.fillRect(x+12*s, y+9*s, 2*s, 2*s);
  // Foam collar
  ctx.fillStyle = '#F0F0F8';
  ctx.fillRect(x+3*s, y+6*s, 10*s, 2*s);
  ctx.fillRect(x+4*s, y+5*s, 8*s, 1*s);
  // Head
  ctx.fillStyle = '#3070B8';
  ctx.fillRect(x+3*s, y+2*s, 10*s, 4*s);
  ctx.fillRect(x+4*s, y+1*s, 8*s, 1*s);
  // Foam glasses on face
  ctx.fillStyle = '#F0F0F8';
  ctx.fillRect(x+3*s, y+3*s, 1*s, 3*s);
  ctx.fillRect(x+12*s, y+3*s, 1*s, 3*s);
  ctx.fillRect(x+3*s, y+2*s, 2*s, 1*s);
  ctx.fillRect(x+11*s, y+2*s, 2*s, 1*s);
  // Eyes
  ctx.fillStyle = '#F8D030';
  ctx.fillRect(x+4*s, y+3*s, 3*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 3*s, 2*s);
  ctx.fillStyle = '#181818';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+10*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#F8F8F8';
  ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+3*s, 1*s, 1*s);
  // Nostrils
  ctx.fillStyle = '#2858A0';
  ctx.fillRect(x+7*s, y+4*s, 1*s, 1*s);
  ctx.fillRect(x+8*s, y+4*s, 1*s, 1*s);
}

function drawRowlet(ctx, x, y, s) {
  // Feet
  ctx.fillStyle = '#D08030'; ctx.fillRect(x+3*s, y+14*s, 3*s, 1*s);
  ctx.fillRect(x+10*s, y+14*s, 3*s, 1*s);
  // Body - brown/beige upper
  ctx.fillStyle = '#B89870';
  ctx.fillRect(x+5*s, y+0*s, 6*s, 1*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 2*s);
  ctx.fillRect(x+2*s, y+3*s, 12*s, 5*s);
  ctx.fillRect(x+1*s, y+4*s, 14*s, 4*s);
  // White face disc
  ctx.fillStyle = '#F8F8F0';
  ctx.fillRect(x+4*s, y+3*s, 8*s, 1*s);
  ctx.fillRect(x+3*s, y+4*s, 10*s, 4*s);
  // Eyes
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x+4*s, y+4*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+4*s, 3*s, 3*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+4*s, y+4*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+4*s, 1*s, 1*s);
  // Beak
  ctx.fillStyle = '#E89840'; ctx.fillRect(x+7*s, y+6*s, 2*s, 1*s);
  ctx.fillStyle = '#D08030'; ctx.fillRect(x+7*s, y+7*s, 2*s, 1*s);
  // Leaf bowtie
  ctx.fillStyle = '#48A848';
  ctx.fillRect(x+4*s, y+8*s, 3*s, 1*s);
  ctx.fillRect(x+9*s, y+8*s, 3*s, 1*s);
  ctx.fillStyle = '#3C8838'; ctx.fillRect(x+7*s, y+8*s, 2*s, 1*s);
  // Green underside
  ctx.fillStyle = '#78B858'; ctx.fillRect(x+3*s, y+9*s, 10*s, 1*s);
  ctx.fillStyle = '#68A848';
  ctx.fillRect(x+3*s, y+10*s, 10*s, 2*s);
  ctx.fillStyle = '#5C9838'; ctx.fillRect(x+3*s, y+12*s, 10*s, 1*s);
  ctx.fillRect(x+4*s, y+13*s, 8*s, 1*s);
  // Wing tips
  ctx.fillStyle = '#8C7050';
  ctx.fillRect(x+0*s, y+9*s, 1*s, 2*s);
  ctx.fillRect(x+15*s, y+9*s, 1*s, 2*s);
  ctx.fillStyle = '#A08060';
  ctx.fillRect(x+1*s, y+9*s, 2*s, 2*s);
  ctx.fillRect(x+13*s, y+9*s, 2*s, 2*s);
}

function drawLitten(ctx, x, y, s) {
  // Tail (upright)
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(x+12*s, y+4*s, 2*s, 1*s);
  ctx.fillRect(x+13*s, y+5*s, 2*s, 1*s);
  ctx.fillRect(x+14*s, y+6*s, 1*s, 3*s);
  ctx.fillStyle = '#C83030'; ctx.fillRect(x+12*s, y+3*s, 2*s, 1*s);
  // Body
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(x+4*s, y+7*s, 9*s, 5*s);
  ctx.fillRect(x+5*s, y+6*s, 7*s, 1*s);
  // Red markings
  ctx.fillStyle = '#C83030'; ctx.fillRect(x+6*s, y+7*s, 5*s, 1*s);
  ctx.fillRect(x+7*s, y+8*s, 3*s, 1*s);
  // Legs
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(x+5*s, y+12*s, 2*s, 3*s);
  ctx.fillRect(x+10*s, y+12*s, 2*s, 3*s);
  ctx.fillStyle = '#C83030';
  ctx.fillRect(x+5*s, y+12*s, 2*s, 1*s);
  ctx.fillRect(x+10*s, y+12*s, 2*s, 1*s);
  // Head
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(x+3*s, y+3*s, 8*s, 4*s);
  ctx.fillRect(x+4*s, y+2*s, 6*s, 1*s);
  // Ears
  ctx.fillRect(x+3*s, y+1*s, 2*s, 2*s);
  ctx.fillRect(x+3*s, y+0*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+1*s, 2*s, 2*s);
  ctx.fillRect(x+10*s, y+0*s, 1*s, 1*s);
  ctx.fillStyle = '#C83030'; ctx.fillRect(x+4*s, y+2*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+2*s, 1*s, 1*s);
  // Forehead marking
  ctx.fillStyle = '#E04040'; ctx.fillRect(x+5*s, y+2*s, 4*s, 1*s);
  ctx.fillRect(x+6*s, y+3*s, 2*s, 1*s);
  // Eyes
  ctx.fillStyle = '#F8D030';
  ctx.fillRect(x+4*s, y+4*s, 2*s, 2*s);
  ctx.fillRect(x+8*s, y+4*s, 2*s, 2*s);
  ctx.fillStyle = '#C83030';
  ctx.fillRect(x+5*s, y+4*s, 1*s, 2*s);
  ctx.fillRect(x+9*s, y+4*s, 1*s, 2*s);
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+5*s, 1*s, 1*s);
  // Nose
  ctx.fillStyle = '#E04040'; ctx.fillRect(x+7*s, y+5*s, 1*s, 1*s);
  // Whiskers
  ctx.fillStyle = '#444';
  ctx.fillRect(x+2*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+11*s, y+5*s, 1*s, 1*s);
}

function drawPopplio(ctx, x, y, s) {
  // Tail fin
  ctx.fillStyle = '#3870A8';
  ctx.fillRect(x+4*s, y+14*s, 8*s, 2*s);
  ctx.fillStyle = '#4888C0'; ctx.fillRect(x+6*s, y+13*s, 4*s, 2*s);
  // Body (tapered seal shape)
  ctx.fillStyle = '#4888C0';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 2*s);
  ctx.fillRect(x+5*s, y+9*s, 6*s, 2*s);
  ctx.fillRect(x+6*s, y+11*s, 4*s, 2*s);
  // Belly
  ctx.fillStyle = '#78C8F0';
  ctx.fillRect(x+6*s, y+8*s, 4*s, 1*s);
  ctx.fillRect(x+6*s, y+9*s, 4*s, 2*s);
  // Flippers
  ctx.fillStyle = '#3870A8';
  ctx.fillRect(x+2*s, y+8*s, 2*s, 1*s);
  ctx.fillRect(x+1*s, y+9*s, 3*s, 2*s);
  ctx.fillRect(x+12*s, y+8*s, 2*s, 1*s);
  ctx.fillRect(x+12*s, y+9*s, 3*s, 2*s);
  // Frilly collar
  ctx.fillStyle = '#F0F0F8';
  ctx.fillRect(x+3*s, y+5*s, 10*s, 1*s);
  ctx.fillRect(x+2*s, y+6*s, 12*s, 1*s);
  ctx.fillRect(x+3*s, y+7*s, 2*s, 1*s);
  ctx.fillRect(x+11*s, y+7*s, 2*s, 1*s);
  ctx.fillStyle = '#D8D8E8';
  ctx.fillRect(x+3*s, y+6*s, 1*s, 1*s);
  ctx.fillRect(x+5*s, y+6*s, 1*s, 1*s);
  ctx.fillRect(x+7*s, y+6*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+6*s, 1*s, 1*s);
  ctx.fillRect(x+12*s, y+6*s, 1*s, 1*s);
  // Head
  ctx.fillStyle = '#4888C0';
  ctx.fillRect(x+5*s, y+0*s, 6*s, 1*s);
  ctx.fillRect(x+4*s, y+1*s, 8*s, 1*s);
  ctx.fillRect(x+3*s, y+2*s, 10*s, 2*s);
  ctx.fillRect(x+4*s, y+4*s, 8*s, 2*s);
  // White muzzle
  ctx.fillStyle = '#F8F0E8';
  ctx.fillRect(x+5*s, y+3*s, 6*s, 2*s);
  // Eyes
  ctx.fillStyle = '#182038'; ctx.fillRect(x+4*s, y+2*s, 3*s, 2*s);
  ctx.fillRect(x+9*s, y+2*s, 3*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+4*s, y+2*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+2*s, 1*s, 1*s);
  // Pink nose
  ctx.fillStyle = '#E86880'; ctx.fillRect(x+7*s, y+4*s, 2*s, 1*s);
}

function drawGrookey(ctx, x, y, s) {
  // Brown tail
  ctx.fillStyle = '#8B5E3C';
  ctx.fillRect(x+12*s, y+10*s, 1*s, 1*s);
  ctx.fillRect(x+13*s, y+11*s, 1*s, 2*s);
  ctx.fillRect(x+12*s, y+13*s, 1*s, 1*s);
  // Stick on head
  ctx.fillStyle = '#8B5E3C';
  ctx.fillRect(x+4*s, y+1*s, 2*s, 1*s);
  ctx.fillRect(x+6*s, y+2*s, 2*s, 1*s);
  ctx.fillRect(x+8*s, y+3*s, 2*s, 1*s);
  ctx.fillRect(x+10*s, y+2*s, 1*s, 1*s);
  ctx.fillStyle = '#6B4226'; ctx.fillRect(x+3*s, y+0*s, 2*s, 1*s);
  ctx.fillRect(x+3*s, y+1*s, 1*s, 1*s);
  // Leaf tuft
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(x+6*s, y+0*s, 2*s, 1*s);
  ctx.fillRect(x+5*s, y+1*s, 4*s, 1*s);
  ctx.fillRect(x+6*s, y+2*s, 3*s, 1*s);
  ctx.fillStyle = '#388E3C'; ctx.fillRect(x+7*s, y+0*s, 1*s, 1*s);
  // Head
  ctx.fillStyle = '#5CBF5C';
  ctx.fillRect(x+4*s, y+3*s, 7*s, 1*s);
  ctx.fillRect(x+3*s, y+4*s, 9*s, 4*s);
  ctx.fillRect(x+4*s, y+8*s, 7*s, 1*s);
  ctx.fillRect(x+5*s, y+9*s, 5*s, 1*s);
  // Ears
  ctx.fillRect(x+2*s, y+5*s, 1*s, 2*s);
  ctx.fillRect(x+12*s, y+5*s, 1*s, 2*s);
  // Orange face
  ctx.fillStyle = '#F5A623';
  ctx.fillRect(x+5*s, y+5*s, 5*s, 1*s);
  ctx.fillRect(x+4*s, y+6*s, 7*s, 2*s);
  ctx.fillRect(x+5*s, y+8*s, 5*s, 1*s);
  ctx.fillStyle = '#FCCB7E'; ctx.fillRect(x+6*s, y+7*s, 3*s, 2*s);
  // Eyes
  ctx.fillStyle = '#2C2C2C'; ctx.fillRect(x+4*s, y+5*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+5*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+4*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+5*s, 1*s, 1*s);
  // Smile
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(x+6*s, y+8*s, 3*s, 1*s);
  ctx.fillRect(x+5*s, y+7*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+7*s, 1*s, 1*s);
  // Nose
  ctx.fillRect(x+7*s, y+7*s, 1*s, 1*s);
  // Body
  ctx.fillStyle = '#5CBF5C';
  ctx.fillRect(x+5*s, y+9*s, 5*s, 3*s);
  ctx.fillRect(x+6*s, y+12*s, 3*s, 1*s);
  // Orange belly
  ctx.fillStyle = '#F5A623'; ctx.fillRect(x+6*s, y+10*s, 3*s, 2*s);
  // Arms
  ctx.fillStyle = '#4DA64D';
  ctx.fillRect(x+3*s, y+10*s, 2*s, 1*s);
  ctx.fillRect(x+2*s, y+11*s, 2*s, 1*s);
  ctx.fillRect(x+10*s, y+9*s, 2*s, 1*s);
  ctx.fillRect(x+11*s, y+10*s, 2*s, 1*s);
  // Legs
  ctx.fillRect(x+5*s, y+13*s, 2*s, 1*s);
  ctx.fillRect(x+8*s, y+13*s, 2*s, 1*s);
  ctx.fillStyle = '#388E3C'; ctx.fillRect(x+4*s, y+14*s, 3*s, 1*s);
  ctx.fillRect(x+8*s, y+14*s, 3*s, 1*s);
}
function drawScorbunny(ctx, x, y, s) {
  // Ears - tall white with orange inner (within bounds)
  ctx.fillStyle = '#F0F0F0';
  ctx.fillRect(x+3*s, y+0*s, 2*s, 4*s);
  ctx.fillRect(x+11*s, y+0*s, 2*s, 4*s);
  ctx.fillStyle = '#F0A030';
  ctx.fillRect(x+4*s, y+0*s, 1*s, 3*s);
  ctx.fillRect(x+11*s, y+0*s, 1*s, 3*s);
  // Head
  ctx.fillStyle = '#F0F0F0';
  ctx.fillRect(x+4*s, y+1*s, 8*s, 6*s);
  ctx.fillRect(x+3*s, y+2*s, 10*s, 4*s);
  // Orange nose patch
  ctx.fillStyle = '#F0A030';
  ctx.fillRect(x+6*s, y+2*s, 4*s, 2*s);
  ctx.fillRect(x+7*s, y+1*s, 2*s, 1*s);
  // Eyes - red
  ctx.fillStyle = '#D03030'; ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  // Nose
  ctx.fillStyle = '#C08020'; ctx.fillRect(x+7*s, y+5*s, 2*s, 1*s);
  // Mouth
  ctx.fillStyle = '#D0D0D0'; ctx.fillRect(x+7*s, y+6*s, 2*s, 1*s);
  // Body
  ctx.fillStyle = '#F0F0F0';
  ctx.fillRect(x+5*s, y+7*s, 6*s, 5*s);
  ctx.fillRect(x+6*s, y+6*s, 4*s, 1*s);
  // Belly
  ctx.fillStyle = '#E0E0E0'; ctx.fillRect(x+6*s, y+8*s, 4*s, 3*s);
  // Arms
  ctx.fillStyle = '#F0F0F0';
  ctx.fillRect(x+3*s, y+8*s, 2*s, 3*s);
  ctx.fillRect(x+11*s, y+8*s, 2*s, 3*s);
  // Legs
  ctx.fillRect(x+5*s, y+12*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+12*s, 2*s, 1*s);
  // Feet - orange/yellow bandage markings
  ctx.fillStyle = '#F0A030';
  ctx.fillRect(x+4*s, y+13*s, 3*s, 1*s);
  ctx.fillRect(x+9*s, y+13*s, 3*s, 1*s);
  // Red foot pads
  ctx.fillStyle = '#D04040';
  ctx.fillRect(x+4*s, y+14*s, 3*s, 1*s);
  ctx.fillRect(x+9*s, y+14*s, 3*s, 1*s);
  // Cotton tail
  ctx.fillStyle = '#F8F8F8'; ctx.fillRect(x+12*s, y+10*s, 2*s, 2*s);
}
function drawSobble(ctx, x, y, s) {
  // Curled tail
  ctx.fillStyle = '#58A8D8';
  ctx.fillRect(x+12*s, y+10*s, 1*s, 2*s);
  ctx.fillRect(x+13*s, y+9*s, 1*s, 2*s);
  ctx.fillRect(x+14*s, y+8*s, 1*s, 2*s);
  ctx.fillRect(x+14*s, y+10*s, 1*s, 1*s);
  ctx.fillStyle = '#4090C8'; ctx.fillRect(x+13*s, y+8*s, 1*s, 1*s);
  // Fin crest on head (within bounds)
  ctx.fillStyle = '#4090C8';
  ctx.fillRect(x+7*s, y+0*s, 2*s, 1*s);
  ctx.fillRect(x+6*s, y+1*s, 4*s, 1*s);
  // Head
  ctx.fillStyle = '#58A8D8';
  ctx.fillRect(x+4*s, y+0*s, 8*s, 7*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 5*s);
  // Darker head markings
  ctx.fillStyle = '#4090C8';
  ctx.fillRect(x+4*s, y+0*s, 3*s, 2*s);
  ctx.fillRect(x+9*s, y+0*s, 3*s, 2*s);
  ctx.fillRect(x+5*s, y+1*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+1*s, 2*s, 1*s);
  // Eyes - large yellow, teary
  ctx.fillStyle = '#F8D830';
  ctx.fillRect(x+4*s, y+3*s, 3*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 3*s, 2*s);
  ctx.fillStyle = '#4090C8';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+10*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF'; ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+3*s, 1*s, 1*s);
  // Mouth
  ctx.fillStyle = '#4888A0'; ctx.fillRect(x+7*s, y+6*s, 2*s, 1*s);
  // Body
  ctx.fillStyle = '#58A8D8';
  ctx.fillRect(x+5*s, y+7*s, 6*s, 5*s);
  ctx.fillRect(x+6*s, y+6*s, 4*s, 1*s);
  // Cream belly
  ctx.fillStyle = '#D0E8F0';
  ctx.fillRect(x+6*s, y+8*s, 4*s, 3*s);
  ctx.fillRect(x+7*s, y+7*s, 2*s, 1*s);
  // Arms
  ctx.fillStyle = '#58A8D8';
  ctx.fillRect(x+3*s, y+8*s, 2*s, 2*s);
  ctx.fillRect(x+11*s, y+8*s, 2*s, 2*s);
  // Legs
  ctx.fillRect(x+5*s, y+12*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+12*s, 2*s, 2*s);
  ctx.fillStyle = '#4090C8';
  ctx.fillRect(x+5*s, y+14*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+14*s, 2*s, 1*s);
}

// Map of starter names to draw functions
const STARTER_DRAWERS = {
  bulbasaur: drawBulbasaur,
  charmander: drawCharmander,
  squirtle: drawSquirtle,
  chikorita: drawChikorita,
  cyndaquil: drawCyndaquil,
  totodile: drawTotodile,
  treecko: drawTreecko,
  torchic: drawTorchic,
  mudkip: drawMudkip,
  turtwig: drawTurtwig,
  chimchar: drawChimchar,
  piplup: drawPiplup,
  snivy: drawSnivy,
  tepig: drawTepig,
  oshawott: drawOshawott,
  chespin: drawChespin,
  fennekin: drawFennekin,
  froakie: drawFroakie,
  rowlet: drawRowlet,
  litten: drawLitten,
  popplio: drawPopplio,
  grookey: drawGrookey,
  scorbunny: drawScorbunny,
  sobble: drawSobble,
};

// === AUTO-OUTLINE + CACHING SYSTEM ===
// Draws each Pokemon at 1x on an offscreen canvas, auto-generates
// a 1px dark outline around the sprite (GBA style), then caches the
// result at the target scale. This gives every Pokemon a clean outline
// without having to manually draw borders.

const _pokemonSpriteCache = new Map();
const MAX_CACHE = 100;

function getPokemonSprite(name, scale) {
  const key = name + ':' + scale;
  let cached = _pokemonSpriteCache.get(key);
  if (cached) return cached;

  // LRU eviction
  if (_pokemonSpriteCache.size >= MAX_CACHE) {
    const firstKey = _pokemonSpriteCache.keys().next().value;
    _pokemonSpriteCache.delete(firstKey);
  }

  // Step 1: Draw at 1x scale on a 16x16 canvas
  const raw = document.createElement('canvas');
  raw.width = 16; raw.height = 16;
  const rawCtx = raw.getContext('2d');
  rawCtx.imageSmoothingEnabled = false;
  const drawer = STARTER_DRAWERS[name] || STARTER_DRAWERS.bulbasaur;
  drawer(rawCtx, 0, 0, 1);

  // Step 2: Read pixel data, generate outline
  const imgData = rawCtx.getImageData(0, 0, 16, 16);
  const px = imgData.data;

  const result = document.createElement('canvas');
  result.width = 16 * scale; result.height = 16 * scale;
  const ctx = result.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Draw outline pixels: for each transparent pixel adjacent to opaque
  ctx.fillStyle = '#181818';
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const i = (y * 16 + x) * 4;
      if (px[i + 3] === 0) {
        // Check 4 neighbors
        for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < 16 && ny >= 0 && ny < 16) {
            if (px[(ny * 16 + nx) * 4 + 3] > 0) {
              ctx.fillRect(x * scale, y * scale, scale, scale);
              break;
            }
          }
        }
      }
    }
  }

  // Draw the sprite on top of the outline
  ctx.drawImage(raw, 0, 0, 16, 16, 0, 0, 16 * scale, 16 * scale);

  _pokemonSpriteCache.set(key, result);
  return result;
}

// === PUBLIC API ===

export function drawPokemon(ctx, x, y, starterName, scale = 1) {
  ctx.imageSmoothingEnabled = false;
  const sprite = getPokemonSprite(starterName, scale);
  ctx.drawImage(sprite, Math.round(x), Math.round(y));
}

export function drawPokemonWithStatus(ctx, x, y, starterName, status, scale = 1, npcId = '') {
  ctx.imageSmoothingEnabled = false;

  const now = Date.now();
  // Per-NPC phase offset so they don't all animate in sync
  let phase = 0;
  for (let i = 0; i < npcId.length; i++) {
    phase = ((phase << 5) - phase + npcId.charCodeAt(i)) | 0;
  }
  phase = Math.abs(phase) % 10000;

  // --- Tamagotchi-style idle bounce animation ---
  let offsetY = 0;
  let offsetX = 0;
  let squashX = 1;
  let squashY = 1;

  switch (status) {
    case 'idle': {
      // Slow sleepy bob — they're bored/dozing
      const t = Math.sin((now + phase) / 1200);
      offsetY = t * 1.5 * scale;
      break;
    }
    case 'working': {
      // Happy gentle bounce — they're loved and productive
      const t = Math.sin((now + phase) / 500);
      offsetY = Math.abs(t) * -2 * scale;
      // Subtle squash-stretch: wider at bottom, taller at peak
      squashX = 1 + t * 0.03;
      squashY = 1 - t * 0.03;
      break;
    }
    case 'waiting': {
      // Urgent rapid hop — FEED ME! attention needed
      const t = Math.sin((now + phase) / 180);
      offsetY = Math.abs(t) * -4 * scale;
      // Exaggerated squash-stretch for urgency
      squashX = 1 + t * 0.06;
      squashY = 1 - t * 0.06;
      break;
    }
    case 'completed': {
      // Proud slight float with gentle sway
      const t = Math.sin((now + phase) / 800);
      offsetY = t * scale - 1.5 * scale;
      offsetX = Math.sin((now + phase) / 1400) * 0.5 * scale;
      break;
    }
    case 'exited': {
      // Sad wobble — they fainted
      offsetX = Math.sin((now + phase) / 350) * 1.5 * scale;
      offsetY = 1 * scale; // drooped down
      break;
    }
  }

  const ax = x + offsetX;
  const ay = y + offsetY;

  // Status glow (at animated position)
  if (status === 'waiting') {
    const pulse = 0.2 + Math.abs(Math.sin((now + phase) / 250)) * 0.15;
    ctx.fillStyle = `rgba(241, 196, 15, ${pulse})`;
    ctx.beginPath();
    ctx.ellipse(ax + 8 * scale, ay + 8 * scale, 12 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (status === 'working') {
    ctx.fillStyle = 'rgba(46, 204, 113, 0.15)';
    ctx.beginPath();
    ctx.ellipse(ax + 8 * scale, ay + 8 * scale, 12 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (status === 'completed') {
    ctx.fillStyle = 'rgba(46, 204, 113, 0.25)';
    ctx.beginPath();
    ctx.ellipse(ax + 8 * scale, ay + 8 * scale, 12 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow stays grounded at original position, squash when bouncing
  const shadowStretch = 1 + Math.abs(offsetY) / (8 * scale) * 0.3;
  const shadowAlpha = 0.18 - Math.abs(offsetY) / (8 * scale) * 0.06;
  ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(x + 8 * scale, y + 15.5 * scale, 6 * scale * shadowStretch, 1.5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw pokemon with squash-stretch transform
  if (squashX !== 1 || squashY !== 1) {
    const cx = ax + 8 * scale;
    const bottom = ay + 16 * scale;
    ctx.save();
    ctx.translate(cx, bottom);
    ctx.scale(squashX, squashY);
    ctx.translate(-cx, -bottom);
    drawPokemon(ctx, ax, ay, starterName, scale);
    ctx.restore();
  } else {
    drawPokemon(ctx, ax, ay, starterName, scale);
  }

  // --- Tamagotchi mood indicators ---
  if (status === 'idle') {
    drawZzzBubble(ctx, ax, ay, scale, phase);
  } else if (status === 'working') {
    drawMoodHeart(ctx, ax, ay, scale, phase);
  } else if (status === 'waiting') {
    drawUrgentBubble(ctx, ax, ay, scale, phase);
  } else if (status === 'completed') {
    drawSparkles(ctx, ax, ay, scale, phase);
  } else if (status === 'exited') {
    drawSadBubble(ctx, ax, ay, scale, phase);
  }
}

// --- Tamagotchi mood bubble helpers ---

function drawZzzBubble(ctx, x, y, s, phase) {
  // Floating Z's that drift up and fade — classic tamagotchi sleep
  const now = Date.now();
  for (let i = 0; i < 3; i++) {
    const cycle = ((now + phase) / 2000 + i * 0.33) % 1; // 0→1, staggered
    const zy = y - 4 * s - cycle * 14 * s;
    const zx = x + 10 * s + Math.sin(cycle * Math.PI * 2) * 2 * s + i * 2 * s;
    const alpha = (1 - cycle) * 0.7;
    const size = (2 + i * 0.8) * s;

    ctx.save();
    ctx.font = `bold ${size}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(120, 160, 220, ${alpha})`;
    ctx.fillText('z', zx, zy);
    ctx.restore();
  }
}

function drawMoodHeart(ctx, x, y, s, phase) {
  // Pixel heart that gently pulses above the pokemon — they're happy!
  const now = Date.now();
  const pulse = 1 + Math.sin((now + phase) / 500) * 0.12;
  const bounce = Math.sin((now + phase) / 600) * 1.5 * s;
  const hx = Math.round(x + 5 * s);
  const hy = Math.round(y - 8 * s + bounce);
  const p = s * pulse;

  ctx.fillStyle = '#E8587A';
  //  ## ##
  // #######
  //  #####
  //   ###
  //    #
  ctx.fillRect(hx + 1*p, hy,       2*p, p);
  ctx.fillRect(hx + 5*p, hy,       2*p, p);
  ctx.fillRect(hx,       hy + p,   8*p, p);
  ctx.fillRect(hx + 1*p, hy + 2*p, 6*p, p);
  ctx.fillRect(hx + 2*p, hy + 3*p, 4*p, p);
  ctx.fillRect(hx + 3*p, hy + 4*p, 2*p, p);

  // Highlight pixel for shine
  ctx.fillStyle = '#FFB0C0';
  ctx.fillRect(hx + 2*p, hy + p, p, p);
}

function drawUrgentBubble(ctx, x, y, s, phase) {
  // Aggressively bouncing ! in a bubble — tamagotchi "FEED ME!" urgency
  const now = Date.now();
  // Fast bounce + scale pulse
  const bounce = Math.sin((now + phase) / 150) * 3 * s;
  const scalePulse = 1 + Math.sin((now + phase) / 200) * 0.1;
  const bx = Math.round(x + 4 * s);
  const by = Math.round(y - 12 * s + bounce);
  const w = 10 * s * scalePulse;
  const h = 10 * s * scalePulse;

  // Bubble background
  ctx.fillStyle = '#FFF8E0';
  ctx.fillRect(bx, by, w, h);
  // Border
  ctx.fillStyle = '#D4A017';
  ctx.fillRect(bx, by, w, s);
  ctx.fillRect(bx, by + h - s, w, s);
  ctx.fillRect(bx, by, s, h);
  ctx.fillRect(bx + w - s, by, s, h);
  // Pointer
  ctx.fillStyle = '#FFF8E0';
  ctx.fillRect(bx + 4 * s, by + h, 2 * s, s);
  ctx.fillRect(bx + 4.5 * s, by + h + s, s, s);
  // Exclamation mark
  ctx.fillStyle = '#E8A000';
  const cx = bx + 4 * s * scalePulse;
  const cy = by + 2 * s * scalePulse;
  ctx.fillRect(cx, cy, 2 * s, 4 * s);
  ctx.fillRect(cx, cy + 5 * s, 2 * s, s);

  // Radiating urgency lines around bubble
  const lineAlpha = 0.3 + Math.sin((now + phase) / 120) * 0.3;
  ctx.fillStyle = `rgba(241, 196, 15, ${lineAlpha})`;
  // Left line
  ctx.fillRect(bx - 3 * s, by + h / 2 - s / 2, 2 * s, s);
  // Right line
  ctx.fillRect(bx + w + s, by + h / 2 - s / 2, 2 * s, s);
  // Top line
  ctx.fillRect(bx + w / 2 - s / 2, by - 3 * s, s, 2 * s);
}

function drawSparkles(ctx, x, y, s, phase) {
  // Sparkle particles around the pokemon — they did great!
  const now = Date.now();
  const sparklePositions = [
    { dx: 0, dy: -6, speed: 700 },
    { dx: 12, dy: -3, speed: 900 },
    { dx: -2, dy: 2, speed: 1100 },
    { dx: 14, dy: 5, speed: 800 },
  ];

  for (const sp of sparklePositions) {
    const t = ((now + phase) / sp.speed) % 1;
    const alpha = Math.sin(t * Math.PI); // fade in then out
    if (alpha < 0.1) continue;

    const sx = x + sp.dx * s + Math.sin(t * Math.PI * 2) * s;
    const sy = y + sp.dy * s;

    ctx.fillStyle = `rgba(46, 204, 113, ${alpha * 0.9})`;
    // Plus-shaped sparkle
    ctx.fillRect(sx, sy - s, s, 3 * s);      // vertical
    ctx.fillRect(sx - s, sy, 3 * s, s);      // horizontal
  }

  // Checkmark in bubble
  const bounce = Math.sin((now + phase) / 400) * 1 * s;
  const bx = Math.round(x + 4 * s);
  const by = Math.round(y - 10 * s + bounce);
  const w = 10 * s;
  const h = 10 * s;
  ctx.fillStyle = '#E8FFF0';
  ctx.fillRect(bx, by, w, h);
  ctx.fillStyle = '#2ECC71';
  ctx.fillRect(bx, by, w, s);
  ctx.fillRect(bx, by + h - s, w, s);
  ctx.fillRect(bx, by, s, h);
  ctx.fillRect(bx + w - s, by, s, h);
  ctx.fillStyle = '#E8FFF0';
  ctx.fillRect(bx + 4 * s, by + h, 2 * s, s);
  ctx.fillRect(bx + 4.5 * s, by + h + s, s, s);
  // Checkmark
  ctx.fillStyle = '#2ECC71';
  const ccx = bx + 2 * s;
  const ccy = by + 2 * s;
  ctx.fillRect(ccx + 1 * s, ccy + 4 * s, s, s);
  ctx.fillRect(ccx + 2 * s, ccy + 5 * s, s, s);
  ctx.fillRect(ccx + 3 * s, ccy + 4 * s, s, s);
  ctx.fillRect(ccx + 4 * s, ccy + 3 * s, s, s);
  ctx.fillRect(ccx + 5 * s, ccy + 2 * s, s, s);
  ctx.fillRect(ccx + 6 * s, ccy + 1 * s, s, s);
}

function drawSadBubble(ctx, x, y, s, phase) {
  // Sweat drop trickling down — they fainted/crashed
  const now = Date.now();

  // Sweat drop on the side, looping downward
  const dropCycle = ((now + phase) / 1500) % 1;
  const dropAlpha = (1 - dropCycle) * 0.5;
  const dropY = y + 2 * s + dropCycle * 6 * s;
  ctx.fillStyle = `rgba(100, 180, 255, ${dropAlpha})`;
  ctx.fillRect(x + 14 * s, dropY, 2 * s, 3 * s);
  ctx.fillRect(x + 14.5 * s, dropY - s, s, s);

  // Dizzy stars floating above head
  const dizzyBounce = Math.sin((now + phase) / 400) * s;
  const dy = y - 7 * s + dizzyBounce;
  // Two stars orbit around the head
  for (let i = 0; i < 2; i++) {
    const angle = (now + phase) / 600 + i * Math.PI;
    const sx = x + 8 * s + Math.cos(angle) * 6 * s;
    const sy = dy + Math.sin(angle) * 2 * s;
    // Dark outline for visibility on any background
    ctx.fillStyle = '#383838';
    ctx.fillRect(sx - s, sy, 3 * s, s);
    ctx.fillRect(sx, sy - s, s, 3 * s);
    // White/yellow star center
    ctx.fillStyle = '#F8D030';
    ctx.fillRect(sx, sy, s, s);
  }
}

// === PLAYER CHARACTER - Pixel-perfect GBA-style sprite data ===
// Based on Pokemon FireRed/LeafGreen protagonist overworld sprites.
// Each sprite is a 16x16 grid of palette indices, rendered pixel-by-pixel
// exactly like the GBA hardware does it.

const PLAYER_PALETTE = {
  '.': null,           // transparent
  'R': '#D83838',      // red cap
  'r': '#A02828',      // dark red (brim/shadow)
  'w': '#E86060',      // red cap highlight
  'W': '#F8F8F8',      // white (emblem, zipper)
  'H': '#282828',      // black hair
  'S': '#F8C8A0',      // skin
  's': '#E0A878',      // skin shadow
  'M': '#E09880',      // mouth/blush
  'E': '#F8F8F8',      // eye white
  'P': '#282838',      // eye pupil
  'B': '#3868B0',      // blue jacket
  'b': '#284880',      // blue jacket shadow
  'Y': '#E8C028',      // belt/buckle
  'D': '#383850',      // dark pants
  'd': '#282838',      // dark pants shadow
  'K': '#C03030',      // red shoes
  'k': '#902020',      // shoe shadow
  'O': '#181818',      // outline
};

// Down standing - 16 chars per row
const DOWN_0 = [
  '....OwRRRRwO....',
  '...OwRRRRRRwO...',
  '...ORRWWRRRrO...',
  '..OrrrrrrrrrrO..',
  '..OHHSSSSSSHHO..',
  '..OSEPSSSSEPOS..',
  '...OSSSSMSSSSO..',
  '....OSSSSSSO....',
  '...OBBBWWBBbO...',
  '..SOBBBWWBBBOs..',
  '..OSBBBWWBBBsO..',
  '...OBBBYYBBbO...',
  '....ODDDDDDOO...',
  '....ODDDDDDOO...',
  '....OKKOOKKO....',
  '....OKKOOKKO....',
];

// Down walk frame 1 (left foot forward)
const DOWN_1 = [
  '....OwRRRRwO....',
  '...OwRRRRRRwO...',
  '...ORRWWRRRrO...',
  '..OrrrrrrrrrrO..',
  '..OHHSSSSSSHHO..',
  '..OSEPSSSSEPOS..',
  '...OSSSSMSSSSO..',
  '....OSSSSSSO....',
  '...OBBBWWBBbO...',
  '..SOBBBWWBBBOs..',
  '..OSBBBWWBBBsO..',
  '...OBBBYYBBbO...',
  '..ODDDO..ODDOO..',
  '..ODDDO...ODOO..',
  '..OKKO....OKOO..',
  '...OO......OO...',
];

// Down walk frame 2 (right foot forward)
const DOWN_2 = [
  '....OwRRRRwO....',
  '...OwRRRRRRwO...',
  '...ORRWWRRRrO...',
  '..OrrrrrrrrrrO..',
  '..OHHSSSSSSHHO..',
  '..OSEPSSSSEPOS..',
  '...OSSSSMSSSSO..',
  '....OSSSSSSO....',
  '...OBBBWWBBbO...',
  '..SOBBBWWBBBOs..',
  '..OSBBBWWBBBsO..',
  '...OBBBYYBBbO...',
  '..OODDO..ODDDO..',
  '..OODO...ODDDO..',
  '..OOKO....OKKO..',
  '...OO......OO...',
];

// Up standing
const UP_0 = [
  '....OwRRRRwO....',
  '...OwRRRRRRwO...',
  '...OwRRRRRRwO...',
  '..OrrrrrrrrrrO..',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '...OHHHHHHHHHO..',
  '....OHHHHHHO....',
  '...OBBBBBBBbO...',
  '..bOBBBBBBBBOb..',
  '..OBBBBBBBBBBO..',
  '...OBBBYYBBbO...',
  '....ODDDDDDOO...',
  '....ODDDDDDOO...',
  '....OKKOOKKO....',
  '....OKKOOKKO....',
];

// Up walk frame 1
const UP_1 = [
  '....OwRRRRwO....',
  '...OwRRRRRRwO...',
  '...OwRRRRRRwO...',
  '..OrrrrrrrrrrO..',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '...OHHHHHHHHHO..',
  '....OHHHHHHO....',
  '...OBBBBBBBbO...',
  '..bOBBBBBBBBOb..',
  '..OBBBBBBBBBBO..',
  '...OBBBYYBBbO...',
  '..ODDDO..ODDOO..',
  '..ODDDO...ODOO..',
  '..OKKO....OKOO..',
  '...OO......OO...',
];

// Up walk frame 2
const UP_2 = [
  '....OwRRRRwO....',
  '...OwRRRRRRwO...',
  '...OwRRRRRRwO...',
  '..OrrrrrrrrrrO..',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '...OHHHHHHHHHO..',
  '....OHHHHHHO....',
  '...OBBBBBBBbO...',
  '..bOBBBBBBBBOb..',
  '..OBBBBBBBBBBO..',
  '...OBBBYYBBbO...',
  '..OODDO..ODDDO..',
  '..OODO...ODDDO..',
  '..OOKO....OKKO..',
  '...OO......OO...',
];

// Left standing
const LEFT_0 = [
  '.....OwRRRwO....',
  '....OwRRRRRO....',
  '...ORRRRRRRO....',
  '..OrrrrrrrrO....',
  '..OHHSSSSSHOO...',
  '..OHEPSSSSHO....',
  '...OSSSSSSOO....',
  '...OSSSSSOO.....',
  '..OBBBBBBbO.....',
  '..OBBBBBBbO.....',
  '.OsBBBBBBBO.....',
  '..OBBYYBBbO.....',
  '...ODDDDDOO.....',
  '...ODDDDOO......',
  '...OKKKO........',
  '....OOO.........',
];

// Left walk frame 1
const LEFT_1 = [
  '.....OwRRRwO....',
  '....OwRRRRRO....',
  '...ORRRRRRRO....',
  '..OrrrrrrrrO....',
  '..OHHSSSSSHOO...',
  '..OHEPSSSSHO....',
  '...OSSSSSSOO....',
  '...OSSSSSOO.....',
  '..OBBBBBBbO.....',
  '..OBBBBBBbO.....',
  '.OsBBBBBBBO.....',
  '..OBBYYBBbO.....',
  '..ODDDDDOO......',
  '.ODDDO.ODDO.....',
  '.OKKO..OKKO.....',
  '..OO....OO......',
];

// Left walk frame 2
const LEFT_2 = [
  '.....OwRRRwO....',
  '....OwRRRRRO....',
  '...ORRRRRRRO....',
  '..OrrrrrrrrO....',
  '..OHHSSSSSHOO...',
  '..OHEPSSSSHO....',
  '...OSSSSSSOO....',
  '...OSSSSSOO.....',
  '..OBBBBBBbO.....',
  '..OBBBBBBbO.....',
  '.OsBBBBBBBO.....',
  '..OBBYYBBbO.....',
  '..ODDDDDOO......',
  '..ODDO.ODDDO....',
  '..OKKO..OKKO....',
  '...OO....OO.....',
];

// Right standing (mirror of left)
const RIGHT_0 = [
  '....OwRRRwO.....',
  '....ORRRRRwO....',
  '....ORRRRRRRO...',
  '....OrrrrrrrrO..',
  '...OOHSSSSSHHO..',
  '....OHSSSSPEHO..',
  '....OOSSSSSSSO..',
  '.....OOSSSSSSO..',
  '.....OBBBBBBbO..',
  '.....OBBBBBBbO..',
  '.....OBBBBBBsO..',
  '.....OBBYYBBbO..',
  '.....OODDDDDOO..',
  '......OODDDDOO..',
  '........OKKKO...',
  '.........OOO....',
];

// Right walk frame 1
const RIGHT_1 = [
  '....OwRRRwO.....',
  '....ORRRRRwO....',
  '....ORRRRRRRO...',
  '....OrrrrrrrrO..',
  '...OOHSSSSSHHO..',
  '....OHSSSSPEHO..',
  '....OOSSSSSSSO..',
  '.....OOSSSSSSO..',
  '.....OBBBBBBbO..',
  '.....OBBBBBBbO..',
  '.....OBBBBBBsO..',
  '.....OBBYYBBbO..',
  '......OODDDDDOO.',
  '.....ODDO.ODDDO.',
  '.....OKKO..OKKO.',
  '......OO....OO..',
];

// Right walk frame 2
const RIGHT_2 = [
  '....OwRRRwO.....',
  '....ORRRRRwO....',
  '....ORRRRRRRO...',
  '....OrrrrrrrrO..',
  '...OOHSSSSSHHO..',
  '....OHSSSSPEHO..',
  '....OOSSSSSSSO..',
  '.....OOSSSSSSO..',
  '.....OBBBBBBbO..',
  '.....OBBBBBBbO..',
  '.....OBBBBBBsO..',
  '.....OBBYYBBbO..',
  '......OODDDDDOO.',
  '....ODDDO.ODDO..',
  '....OKKO..OKKO..',
  '.....OO....OO...',
];

const PLAYER_SPRITES = {
  down:  [DOWN_0, DOWN_1, DOWN_2],
  up:    [UP_0, UP_1, UP_2],
  left:  [LEFT_0, LEFT_1, LEFT_2],
  right: [RIGHT_0, RIGHT_1, RIGHT_2],
};

// Pre-cache sprite ImageData for performance
const spriteCache = new Map();

function renderSpriteData(ctx, x, y, spriteData, palette, scale) {
  const key = spriteData.join('') + scale;
  let cached = spriteCache.get(key);

  if (!cached) {
    // LRU eviction
    if (spriteCache.size >= MAX_CACHE) {
      const firstKey = spriteCache.keys().next().value;
      spriteCache.delete(firstKey);
    }
    // Create offscreen canvas for this sprite
    const offscreen = document.createElement('canvas');
    offscreen.width = 16 * scale;
    offscreen.height = 16 * scale;
    const offCtx = offscreen.getContext('2d');
    offCtx.imageSmoothingEnabled = false;

    for (let row = 0; row < spriteData.length; row++) {
      const line = spriteData[row];
      for (let col = 0; col < line.length; col++) {
        const ch = line[col];
        const color = palette[ch];
        if (color) {
          offCtx.fillStyle = color;
          offCtx.fillRect(col * scale, row * scale, scale, scale);
        }
      }
    }
    cached = offscreen;
    spriteCache.set(key, cached);
  }

  ctx.drawImage(cached, Math.round(x), Math.round(y));
}

export function drawPlayer(ctx, x, y, direction, frame, scale = 1) {
  ctx.imageSmoothingEnabled = false;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x + 8 * scale, y + 15.5 * scale, 5 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Walk bob - slight bounce on alternating frames
  const bobY = frame === 1 ? -1 * scale : 0;

  const dir = direction || 'down';
  const frames = PLAYER_SPRITES[dir] || PLAYER_SPRITES.down;
  const spriteFrame = frames[frame % frames.length];

  renderSpriteData(ctx, x, y + bobY, spriteFrame, PLAYER_PALETTE, scale);
}

// === TILE DRAWING (Pokemon indoor style) ===

export function drawFloorTile(ctx, x, y, s, variant = 0) {
  // Pokemon-style clean tiled floor
  if (variant === 0) {
    ctx.fillStyle = '#F0E8D8';
    ctx.fillRect(x, y, 16*s, 16*s);
    ctx.fillStyle = '#E8E0D0';
    ctx.fillRect(x, y+15*s, 16*s, 1*s);
    ctx.fillRect(x+15*s, y, 1*s, 16*s);
  } else {
    ctx.fillStyle = '#E8E0D0';
    ctx.fillRect(x, y, 16*s, 16*s);
    ctx.fillStyle = '#E0D8C8';
    ctx.fillRect(x, y+15*s, 16*s, 1*s);
    ctx.fillRect(x+15*s, y, 1*s, 16*s);
  }
}

export function drawWallTile(ctx, x, y, s, isTop = false) {
  if (isTop) {
    // Upper wall - darker with pattern
    ctx.fillStyle = '#706050';
    ctx.fillRect(x, y, 16*s, 16*s);
    ctx.fillStyle = '#807060';
    ctx.fillRect(x+1*s, y+1*s, 14*s, 6*s);
    ctx.fillRect(x+1*s, y+9*s, 14*s, 6*s);
    ctx.fillStyle = '#706050';
    ctx.fillRect(x+8*s, y, 1*s, 8*s);
    ctx.fillRect(x, y+8*s, 16*s, 1*s);
    ctx.fillRect(x+4*s, y+8*s, 1*s, 8*s);
    ctx.fillRect(x+12*s, y+8*s, 1*s, 8*s);
  } else {
    // Lower wall / wainscoting
    ctx.fillStyle = '#A09080';
    ctx.fillRect(x, y, 16*s, 16*s);
    ctx.fillStyle = '#B0A090';
    ctx.fillRect(x+1*s, y+2*s, 6*s, 14*s);
    ctx.fillRect(x+9*s, y+2*s, 6*s, 14*s);
    ctx.fillStyle = '#C0B0A0';
    ctx.fillRect(x, y, 16*s, 2*s); // trim at top
  }
}

export function drawTable(ctx, x, y, s) {
  // Floor underneath
  drawFloorTile(ctx, x, y, s, 0);
  // Table surface
  ctx.fillStyle = '#A07838';
  ctx.fillRect(x+1*s, y+4*s, 14*s, 8*s);
  ctx.fillStyle = '#B88848';
  ctx.fillRect(x+2*s, y+5*s, 12*s, 6*s);
  // Legs
  ctx.fillStyle = '#806020';
  ctx.fillRect(x+2*s, y+12*s, 2*s, 4*s);
  ctx.fillRect(x+12*s, y+12*s, 2*s, 4*s);
  // Laptop/screen
  ctx.fillStyle = '#383838';
  ctx.fillRect(x+4*s, y+2*s, 8*s, 5*s);
  ctx.fillStyle = '#60A0E0';
  ctx.fillRect(x+5*s, y+3*s, 6*s, 3*s);
  // Code lines on screen
  ctx.fillStyle = '#90D090';
  ctx.fillRect(x+6*s, y+3.5*s, 4*s, 0.5*s);
  ctx.fillStyle = '#E0A060';
  ctx.fillRect(x+6*s, y+4.5*s, 3*s, 0.5*s);
  // Keyboard
  ctx.fillStyle = '#484848';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 2*s);
}

export function drawBookshelf(ctx, x, y, s) {
  ctx.fillStyle = '#806020';
  ctx.fillRect(x, y, 16*s, 16*s);
  ctx.fillStyle = '#A07838';
  ctx.fillRect(x+1*s, y+1*s, 14*s, 6*s);
  ctx.fillRect(x+1*s, y+9*s, 14*s, 6*s);
  const colors = ['#D04040', '#4080C0', '#40A048', '#F0A030', '#8060A0', '#D08040'];
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(x+(2+i*2.4)*s, y+1*s, 2*s, 6*s);
  }
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = colors[(i+2)%6];
    ctx.fillRect(x+(2+i*3)*s, y+9*s, 2.5*s, 6*s);
  }
}

export function drawPlant(ctx, x, y, s) {
  drawFloorTile(ctx, x, y, s, 0);
  ctx.fillStyle = '#C06020';
  ctx.fillRect(x+4*s, y+10*s, 8*s, 5*s);
  ctx.fillRect(x+5*s, y+15*s, 6*s, 1*s);
  ctx.fillStyle = '#A05018';
  ctx.fillRect(x+3*s, y+9*s, 10*s, 2*s);
  ctx.fillStyle = '#40A048';
  ctx.fillRect(x+5*s, y+4*s, 6*s, 6*s);
  ctx.fillRect(x+3*s, y+5*s, 3*s, 4*s);
  ctx.fillRect(x+10*s, y+5*s, 3*s, 4*s);
  ctx.fillStyle = '#58C060';
  ctx.fillRect(x+6*s, y+2*s, 4*s, 4*s);
  ctx.fillRect(x+4*s, y+6*s, 2*s, 2*s);
  ctx.fillRect(x+10*s, y+3*s, 2*s, 3*s);
}

export function drawRug(ctx, x, y, s) {
  ctx.fillStyle = '#B83030';
  ctx.fillRect(x, y, 16*s, 16*s);
  ctx.fillStyle = '#C84040';
  ctx.fillRect(x+1*s, y+1*s, 14*s, 14*s);
  ctx.fillStyle = '#D8A020';
  ctx.fillRect(x+2*s, y+2*s, 12*s, 1*s);
  ctx.fillRect(x+2*s, y+13*s, 12*s, 1*s);
  ctx.fillRect(x+2*s, y+2*s, 1*s, 12*s);
  ctx.fillRect(x+13*s, y+2*s, 1*s, 12*s);
}

export function drawDoormat(ctx, x, y, s) {
  ctx.fillStyle = '#908060';
  ctx.fillRect(x, y, 16*s, 16*s);
  ctx.fillStyle = '#A09070';
  ctx.fillRect(x+1*s, y+1*s, 14*s, 14*s);
}

export function drawSign(ctx, x, y, s) {
  drawWallTile(ctx, x, y, s, false);
  ctx.fillStyle = '#F0E8D0';
  ctx.fillRect(x+2*s, y+3*s, 12*s, 8*s);
  ctx.fillStyle = '#806020';
  ctx.fillRect(x+2*s, y+2*s, 12*s, 1*s);
  ctx.fillRect(x+2*s, y+11*s, 12*s, 1*s);
  ctx.fillRect(x+2*s, y+2*s, 1*s, 10*s);
  ctx.fillRect(x+13*s, y+2*s, 1*s, 10*s);
  // "CC" text
  ctx.fillStyle = '#3060A0';
  ctx.font = `${4*s}px "Press Start 2P", monospace`;
  ctx.fillText('CC', x+4*s, y+8*s);
}

// === LABELS ===

export function drawLabel(ctx, x, y, text, scale = 1) {
  ctx.imageSmoothingEnabled = true;
  const fontSize = Math.max(5, 4 * scale);
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;

  // Small subtle label - just text with a slight shadow, no box
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = '#F8F8F0';
  ctx.fillText(text, x, y);
  ctx.textAlign = 'start';
  ctx.imageSmoothingEnabled = false;
}

// Returns { x, y, w, h } bounding box so engine can check overlaps
export function drawPokemonName(ctx, x, y, name, starterName, status, scale = 1) {
  ctx.imageSmoothingEnabled = true;
  const fontSize = Math.max(4, 3.5 * scale);
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;

  const statusColors = {
    idle: '#808080',
    active: '#3060A0',
    working: '#40A048',
    waiting: '#D8A020',
    completed: '#2ECC71',
    exited: '#C04040',
  };

  const color = statusColors[status] || statusColors.idle;
  const displayName = name.length > 7 ? name.slice(0, 6) + '..' : name;
  const metrics = ctx.measureText(displayName);
  const padding = 2 * scale;
  const w = metrics.width + padding * 2 + 6 * scale; // extra room for dot
  const h = fontSize + padding * 2;

  const bx = x - w / 2;
  const by = y;

  // Semi-transparent background
  ctx.fillStyle = 'rgba(248,248,240,0.85)';
  ctx.fillRect(bx, by, w, h);
  ctx.strokeStyle = '#C0B8A0';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, w, h);

  // Status dot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(bx + padding + 2 * scale, by + h / 2, 2 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Text
  ctx.fillStyle = '#505050';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayName, bx + padding + 5 * scale, by + h / 2);
  ctx.textAlign = 'start';
  ctx.imageSmoothingEnabled = false;

  return { x: bx, y: by, w, h };
}

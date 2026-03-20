// Pokemon-authentic pixel art sprites
// Targeting Pokemon FireRed/LeafGreen GBA aesthetic

// === REGIONS & STARTERS ===
export const REGIONS = [
  { name: 'Kanto', starters: ['bulbasaur', 'charmander', 'squirtle'] },
  { name: 'Johto', starters: ['chikorita', 'cyndaquil', 'totodile'] },
  { name: 'Hoenn', starters: ['treecko', 'torchic', 'mudkip'] },
  { name: 'Sinnoh', starters: ['turtwig', 'chimchar', 'piplup'] },
  { name: 'Unova', starters: ['snivy', 'tepig', 'oshawott'] },
  { name: 'Kalos', starters: ['chespin', 'fennekin', 'froakie'] },
  { name: 'Alola', starters: ['rowlet', 'litten', 'popplio'] },
  { name: 'Galar', starters: ['grookey', 'scorbunny', 'sobble'] },
];

// === POKEMON DRAWING FUNCTIONS ===

function drawBulbasaur(ctx, x, y, s) {
  // Bulb
  ctx.fillStyle = '#326B4E';
  ctx.fillRect(x+4*s, y+0*s, 8*s, 4*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 3*s);
  // Body
  ctx.fillStyle = '#5DB894';
  ctx.fillRect(x+2*s, y+4*s, 12*s, 8*s);
  ctx.fillRect(x+3*s, y+3*s, 10*s, 10*s);
  // Spots
  ctx.fillStyle = '#4A9B7C';
  ctx.fillRect(x+4*s, y+6*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+7*s, 2*s, 2*s);
  // Eyes
  ctx.fillStyle = '#E04040';
  ctx.fillRect(x+4*s, y+5*s, 2*s, 2*s);
  ctx.fillRect(x+10*s, y+5*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+4*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+10*s, y+5*s, 1*s, 1*s);
  // Mouth
  ctx.fillStyle = '#326B4E';
  ctx.fillRect(x+6*s, y+9*s, 4*s, 1*s);
  // Legs
  ctx.fillStyle = '#5DB894';
  ctx.fillRect(x+3*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+10*s, y+12*s, 3*s, 3*s);
  ctx.fillStyle = '#4A9B7C';
  ctx.fillRect(x+3*s, y+14*s, 3*s, 1*s);
  ctx.fillRect(x+10*s, y+14*s, 3*s, 1*s);
}

function drawCharmander(ctx, x, y, s) {
  // Head
  ctx.fillStyle = '#E87840';
  ctx.fillRect(x+4*s, y+0*s, 8*s, 7*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 5*s);
  // Belly
  ctx.fillStyle = '#F8D878';
  ctx.fillRect(x+5*s, y+7*s, 6*s, 5*s);
  // Body
  ctx.fillStyle = '#E87840';
  ctx.fillRect(x+3*s, y+6*s, 10*s, 7*s);
  ctx.fillRect(x+5*s, y+7*s, 6*s, 4*s); // belly
  ctx.fillStyle = '#F8D878';
  ctx.fillRect(x+5*s, y+7*s, 6*s, 4*s);
  // Eyes
  ctx.fillStyle = '#40A0C0';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#000';
  ctx.fillRect(x+6*s, y+3*s, 1*s, 2*s);
  ctx.fillRect(x+10*s, y+3*s, 1*s, 2*s);
  // Mouth
  ctx.fillStyle = '#C06030';
  ctx.fillRect(x+6*s, y+6*s, 4*s, 1*s);
  // Arms
  ctx.fillStyle = '#E87840';
  ctx.fillRect(x+2*s, y+7*s, 2*s, 3*s);
  ctx.fillRect(x+12*s, y+7*s, 2*s, 3*s);
  // Legs
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
  // Flame tail
  ctx.fillStyle = '#F8A030';
  ctx.fillRect(x+12*s, y+10*s, 3*s, 2*s);
  ctx.fillStyle = '#F85030';
  ctx.fillRect(x+13*s, y+8*s, 2*s, 3*s);
  ctx.fillStyle = '#F8D030';
  ctx.fillRect(x+14*s, y+8*s, 1*s, 2*s);
}

function drawSquirtle(ctx, x, y, s) {
  // Shell (visible behind)
  ctx.fillStyle = '#A06830';
  ctx.fillRect(x+3*s, y+5*s, 10*s, 8*s);
  // Head
  ctx.fillStyle = '#68B8D8';
  ctx.fillRect(x+4*s, y+0*s, 8*s, 7*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 5*s);
  // Body
  ctx.fillStyle = '#68B8D8';
  ctx.fillRect(x+4*s, y+6*s, 8*s, 7*s);
  // Belly
  ctx.fillStyle = '#F8F0C8';
  ctx.fillRect(x+5*s, y+7*s, 6*s, 5*s);
  // Eyes
  ctx.fillStyle = '#C04040';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  // Mouth
  ctx.fillStyle = '#4898A8';
  ctx.fillRect(x+6*s, y+6*s, 4*s, 1*s);
  // Arms
  ctx.fillStyle = '#68B8D8';
  ctx.fillRect(x+2*s, y+7*s, 2*s, 3*s);
  ctx.fillRect(x+12*s, y+7*s, 2*s, 3*s);
  // Legs
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
  // Tail
  ctx.fillRect(x+12*s, y+11*s, 3*s, 2*s);
  ctx.fillRect(x+14*s, y+10*s, 1*s, 2*s);
}

function drawChikorita(ctx, x, y, s) {
  // Leaf on head
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+6*s, y-2*s, 5*s, 4*s);
  ctx.fillRect(x+8*s, y-3*s, 3*s, 2*s);
  // Head
  ctx.fillStyle = '#A8D8A0';
  ctx.fillRect(x+4*s, y+1*s, 8*s, 6*s);
  ctx.fillRect(x+3*s, y+2*s, 10*s, 4*s);
  // Body
  ctx.fillRect(x+4*s, y+6*s, 8*s, 7*s);
  ctx.fillRect(x+3*s, y+7*s, 10*s, 5*s);
  // Eyes
  ctx.fillStyle = '#C04040';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  // Necklace buds
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+5*s, y+7*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+7*s, 2*s, 1*s);
  // Legs
  ctx.fillStyle = '#A8D8A0';
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

function drawCyndaquil(ctx, x, y, s) {
  // Flames on back
  ctx.fillStyle = '#F85030';
  ctx.fillRect(x+3*s, y+1*s, 2*s, 3*s);
  ctx.fillRect(x+6*s, y+0*s, 2*s, 4*s);
  ctx.fillRect(x+11*s, y+1*s, 2*s, 3*s);
  ctx.fillStyle = '#F8D030';
  ctx.fillRect(x+4*s, y+1*s, 1*s, 2*s);
  ctx.fillRect(x+7*s, y+0*s, 1*s, 2*s);
  ctx.fillRect(x+12*s, y+1*s, 1*s, 2*s);
  // Body top (dark)
  ctx.fillStyle = '#304868';
  ctx.fillRect(x+3*s, y+3*s, 10*s, 5*s);
  ctx.fillRect(x+4*s, y+2*s, 8*s, 2*s);
  // Head/snout
  ctx.fillStyle = '#E8D8A8';
  ctx.fillRect(x+4*s, y+6*s, 8*s, 4*s);
  ctx.fillRect(x+5*s, y+5*s, 6*s, 2*s);
  // Eyes (closed/squinting)
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+6*s, 2*s, 1*s);
  ctx.fillRect(x+9*s, y+6*s, 2*s, 1*s);
  // Nose
  ctx.fillStyle = '#C06030';
  ctx.fillRect(x+7*s, y+8*s, 2*s, 1*s);
  // Body bottom
  ctx.fillStyle = '#E8D8A8';
  ctx.fillRect(x+4*s, y+9*s, 8*s, 4*s);
  // Legs
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

function drawTotodile(ctx, x, y, s) {
  // Head
  ctx.fillStyle = '#50A0D0';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 7*s);
  // Red crest
  ctx.fillStyle = '#D04040';
  ctx.fillRect(x+6*s, y-1*s, 4*s, 2*s);
  // Jaw
  ctx.fillStyle = '#50A0D0';
  ctx.fillRect(x+4*s, y+5*s, 8*s, 3*s);
  ctx.fillStyle = '#F8F0C8';
  ctx.fillRect(x+5*s, y+6*s, 6*s, 2*s);
  // Teeth
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+7*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+5*s, 1*s, 1*s);
  // Eyes
  ctx.fillStyle = '#C04040';
  ctx.fillRect(x+5*s, y+2*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+2*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+2*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+2*s, 1*s, 1*s);
  // Body
  ctx.fillStyle = '#50A0D0';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 5*s);
  ctx.fillStyle = '#F8F0C8';
  ctx.fillRect(x+5*s, y+8*s, 6*s, 3*s);
  // Chest diamond
  ctx.fillStyle = '#D04040';
  ctx.fillRect(x+7*s, y+8*s, 2*s, 2*s);
  // Arms
  ctx.fillStyle = '#50A0D0';
  ctx.fillRect(x+2*s, y+8*s, 2*s, 3*s);
  ctx.fillRect(x+12*s, y+8*s, 2*s, 3*s);
  // Legs
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

function drawTreecko(ctx, x, y, s) {
  // Head
  ctx.fillStyle = '#58B858';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 7*s);
  ctx.fillRect(x+2*s, y+1*s, 12*s, 5*s);
  // Eyes
  ctx.fillStyle = '#F8D830';
  ctx.fillRect(x+4*s, y+2*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+2*s, 3*s, 3*s);
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+10*s, y+3*s, 2*s, 2*s);
  // Mouth
  ctx.fillStyle = '#388838';
  ctx.fillRect(x+6*s, y+6*s, 4*s, 1*s);
  // Body
  ctx.fillStyle = '#58B858';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 5*s);
  // Belly
  ctx.fillStyle = '#C04040';
  ctx.fillRect(x+5*s, y+8*s, 6*s, 3*s);
  // Arms
  ctx.fillStyle = '#58B858';
  ctx.fillRect(x+2*s, y+7*s, 2*s, 3*s);
  ctx.fillRect(x+12*s, y+7*s, 2*s, 3*s);
  // Tail (big)
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+12*s, y+5*s, 4*s, 5*s);
  ctx.fillRect(x+13*s, y+3*s, 3*s, 4*s);
  // Legs
  ctx.fillStyle = '#58B858';
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

function drawTorchic(ctx, x, y, s) {
  // Head feathers
  ctx.fillStyle = '#F8A030';
  ctx.fillRect(x+6*s, y-1*s, 4*s, 3*s);
  ctx.fillRect(x+7*s, y-2*s, 2*s, 2*s);
  // Head
  ctx.fillStyle = '#F8A030';
  ctx.fillRect(x+4*s, y+1*s, 8*s, 6*s);
  ctx.fillRect(x+3*s, y+2*s, 10*s, 4*s);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  // Beak
  ctx.fillStyle = '#D8A030';
  ctx.fillRect(x+6*s, y+5*s, 4*s, 2*s);
  ctx.fillStyle = '#C88020';
  ctx.fillRect(x+6*s, y+6*s, 4*s, 1*s);
  // Body
  ctx.fillStyle = '#F8D858';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 5*s);
  ctx.fillRect(x+5*s, y+6*s, 6*s, 7*s);
  // Wings
  ctx.fillStyle = '#F8A030';
  ctx.fillRect(x+2*s, y+8*s, 3*s, 3*s);
  ctx.fillRect(x+11*s, y+8*s, 3*s, 3*s);
  // Feet
  ctx.fillStyle = '#D88030';
  ctx.fillRect(x+4*s, y+13*s, 3*s, 2*s);
  ctx.fillRect(x+9*s, y+13*s, 3*s, 2*s);
}

function drawMudkip(ctx, x, y, s) {
  // Head fin
  ctx.fillStyle = '#4090C8';
  ctx.fillRect(x+6*s, y-2*s, 4*s, 3*s);
  ctx.fillRect(x+7*s, y-3*s, 2*s, 2*s);
  // Head
  ctx.fillStyle = '#58A8D8';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 7*s);
  ctx.fillRect(x+2*s, y+1*s, 12*s, 5*s);
  // Cheeks
  ctx.fillStyle = '#F8A050';
  ctx.fillRect(x+2*s, y+4*s, 3*s, 2*s);
  ctx.fillRect(x+11*s, y+4*s, 3*s, 2*s);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  // Mouth
  ctx.fillStyle = '#4888A0';
  ctx.fillRect(x+6*s, y+6*s, 4*s, 1*s);
  // Body
  ctx.fillStyle = '#58A8D8';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 5*s);
  // Belly
  ctx.fillStyle = '#B8D8F0';
  ctx.fillRect(x+5*s, y+8*s, 6*s, 3*s);
  // Legs
  ctx.fillStyle = '#58A8D8';
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
  // Tail fin
  ctx.fillStyle = '#4090C8';
  ctx.fillRect(x+12*s, y+9*s, 3*s, 3*s);
  ctx.fillRect(x+14*s, y+8*s, 2*s, 2*s);
}

function drawTurtwig(ctx, x, y, s) {
  // Twig on head
  ctx.fillStyle = '#6B4F12';
  ctx.fillRect(x+7*s, y-3*s, 2*s, 4*s);
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+5*s, y-3*s, 6*s, 3*s);
  // Head
  ctx.fillStyle = '#68B858';
  ctx.fillRect(x+4*s, y+0*s, 8*s, 6*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 4*s);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+2*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+2*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+2*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+2*s, 1*s, 1*s);
  // Jaw
  ctx.fillStyle = '#E8D880';
  ctx.fillRect(x+5*s, y+5*s, 6*s, 2*s);
  // Shell
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(x+3*s, y+6*s, 10*s, 6*s);
  ctx.fillStyle = '#6B4F12';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 4*s);
  // Body
  ctx.fillStyle = '#68B858';
  ctx.fillRect(x+5*s, y+8*s, 6*s, 3*s);
  // Legs
  ctx.fillStyle = '#68B858';
  ctx.fillRect(x+3*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+10*s, y+12*s, 3*s, 3*s);
}

function drawChimchar(ctx, x, y, s) {
  // Head
  ctx.fillStyle = '#E08840';
  ctx.fillRect(x+4*s, y+0*s, 8*s, 7*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 5*s);
  // Face
  ctx.fillStyle = '#F8E0B0';
  ctx.fillRect(x+5*s, y+2*s, 6*s, 5*s);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(x+6*s, y+3*s, 1*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 2*s);
  // Nose
  ctx.fillStyle = '#C06040';
  ctx.fillRect(x+7*s, y+5*s, 2*s, 1*s);
  // Ears
  ctx.fillStyle = '#E08840';
  ctx.fillRect(x+2*s, y+2*s, 2*s, 3*s);
  ctx.fillRect(x+12*s, y+2*s, 2*s, 3*s);
  // Body
  ctx.fillStyle = '#E08840';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 5*s);
  ctx.fillStyle = '#F8E0B0';
  ctx.fillRect(x+5*s, y+8*s, 6*s, 3*s);
  // Arms
  ctx.fillStyle = '#E08840';
  ctx.fillRect(x+2*s, y+7*s, 2*s, 4*s);
  ctx.fillRect(x+12*s, y+7*s, 2*s, 4*s);
  // Legs
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
  // Flame butt
  ctx.fillStyle = '#F85030';
  ctx.fillRect(x+12*s, y+10*s, 2*s, 2*s);
  ctx.fillStyle = '#F8A030';
  ctx.fillRect(x+13*s, y+9*s, 2*s, 2*s);
}

function drawPiplup(ctx, x, y, s) {
  // Head
  ctx.fillStyle = '#3880C0';
  ctx.fillRect(x+4*s, y+0*s, 8*s, 7*s);
  ctx.fillRect(x+3*s, y+1*s, 10*s, 5*s);
  // Crown
  ctx.fillStyle = '#2860A0';
  ctx.fillRect(x+6*s, y-1*s, 4*s, 2*s);
  // Face
  ctx.fillStyle = '#F8F8F8';
  ctx.fillRect(x+5*s, y+3*s, 6*s, 4*s);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(x+6*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+6*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  // Beak
  ctx.fillStyle = '#F8C030';
  ctx.fillRect(x+6*s, y+5*s, 4*s, 2*s);
  // Body
  ctx.fillStyle = '#3880C0';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 5*s);
  // Belly
  ctx.fillStyle = '#B8D8F0';
  ctx.fillRect(x+5*s, y+8*s, 6*s, 3*s);
  // Wings
  ctx.fillStyle = '#3880C0';
  ctx.fillRect(x+2*s, y+8*s, 2*s, 4*s);
  ctx.fillRect(x+12*s, y+8*s, 2*s, 4*s);
  // Feet
  ctx.fillStyle = '#F8C030';
  ctx.fillRect(x+4*s, y+13*s, 3*s, 2*s);
  ctx.fillRect(x+9*s, y+13*s, 3*s, 2*s);
}

function drawSnivy(ctx, x, y, s) {
  // Head leaf
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+6*s, y-2*s, 4*s, 3*s);
  ctx.fillRect(x+4*s, y-1*s, 8*s, 2*s);
  // Head
  ctx.fillStyle = '#68B858';
  ctx.fillRect(x+4*s, y+0*s, 8*s, 7*s);
  ctx.fillRect(x+3*s, y+2*s, 10*s, 4*s);
  // Eyes
  ctx.fillStyle = '#C04040';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  // Nose/mouth
  ctx.fillStyle = '#488838';
  ctx.fillRect(x+7*s, y+5*s, 2*s, 1*s);
  // Collar
  ctx.fillStyle = '#F8F0A0';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 1*s);
  // Body
  ctx.fillStyle = '#68B858';
  ctx.fillRect(x+5*s, y+7*s, 6*s, 5*s);
  // Belly
  ctx.fillStyle = '#E8F0B8';
  ctx.fillRect(x+6*s, y+8*s, 4*s, 3*s);
  // Arms
  ctx.fillStyle = '#68B858';
  ctx.fillRect(x+3*s, y+8*s, 2*s, 3*s);
  ctx.fillRect(x+11*s, y+8*s, 2*s, 3*s);
  // Legs
  ctx.fillRect(x+5*s, y+12*s, 2*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 2*s, 3*s);
  // Tail
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+12*s, y+10*s, 3*s, 2*s);
  ctx.fillRect(x+14*s, y+9*s, 2*s, 3*s);
}

function drawTepig(ctx, x, y, s) {
  // Head
  ctx.fillStyle = '#E07040';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 7*s);
  // Dark top
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 3*s);
  // Snout
  ctx.fillStyle = '#E8B880';
  ctx.fillRect(x+5*s, y+4*s, 6*s, 3*s);
  // Nose
  ctx.fillStyle = '#D07050';
  ctx.fillRect(x+6*s, y+5*s, 4*s, 2*s);
  ctx.fillStyle = '#C06040';
  ctx.fillRect(x+7*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+5*s, 1*s, 1*s);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+2*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+2*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+2*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+2*s, 1*s, 1*s);
  // Body
  ctx.fillStyle = '#E07040';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 4*s);
  // Band
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 1*s);
  // Legs
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x+4*s, y+11*s, 3*s, 4*s);
  ctx.fillRect(x+9*s, y+11*s, 3*s, 4*s);
  // Tail
  ctx.fillStyle = '#E07040';
  ctx.fillRect(x+12*s, y+9*s, 2*s, 2*s);
  ctx.fillStyle = '#F85030';
  ctx.fillRect(x+14*s, y+9*s, 1*s, 1*s);
}

function drawOshawott(ctx, x, y, s) {
  // Head
  ctx.fillStyle = '#68B0D0';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 7*s);
  // Face
  ctx.fillStyle = '#F8F8F0';
  ctx.fillRect(x+4*s, y+3*s, 8*s, 4*s);
  // Dark triangle on head
  ctx.fillStyle = '#305878';
  ctx.fillRect(x+5*s, y+0*s, 6*s, 3*s);
  ctx.fillRect(x+6*s, y+0*s, 4*s, 4*s);
  // Eyes
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x+5*s, y+4*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+4*s, 2*s, 2*s);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x+5*s, y+4*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+4*s, 1*s, 1*s);
  // Nose
  ctx.fillStyle = '#C06040';
  ctx.fillRect(x+7*s, y+5*s, 2*s, 1*s);
  // Freckles
  ctx.fillStyle = '#F0C090';
  ctx.fillRect(x+4*s, y+5*s, 1*s, 1*s);
  ctx.fillRect(x+11*s, y+5*s, 1*s, 1*s);
  // Body
  ctx.fillStyle = '#68B0D0';
  ctx.fillRect(x+4*s, y+7*s, 8*s, 5*s);
  // Belly
  ctx.fillStyle = '#F8F8F0';
  ctx.fillRect(x+5*s, y+8*s, 6*s, 3*s);
  // Shell on belly
  ctx.fillStyle = '#78C8E0';
  ctx.fillRect(x+6*s, y+9*s, 4*s, 2*s);
  // Legs/feet
  ctx.fillStyle = '#68B0D0';
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

// Generic fallback starters for regions 6-8
function drawGenericGrass(ctx, x, y, s) { drawBulbasaur(ctx, x, y, s); }
function drawGenericFire(ctx, x, y, s) { drawCharmander(ctx, x, y, s); }
function drawGenericWater(ctx, x, y, s) { drawSquirtle(ctx, x, y, s); }

function drawChespin(ctx, x, y, s) {
  ctx.fillStyle = '#68A848';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 14*s);
  ctx.fillStyle = '#D8B870';
  ctx.fillRect(x+5*s, y+4*s, 6*s, 5*s);
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+5*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+5*s, 2*s, 2*s);
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+5*s, y-2*s, 6*s, 3*s);
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

function drawFennekin(ctx, x, y, s) {
  ctx.fillStyle = '#F0C868';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 14*s);
  // Ears
  ctx.fillRect(x+2*s, y-2*s, 3*s, 4*s);
  ctx.fillRect(x+11*s, y-2*s, 3*s, 4*s);
  ctx.fillStyle = '#E07040';
  ctx.fillRect(x+2*s, y-2*s, 2*s, 2*s);
  ctx.fillRect(x+12*s, y-2*s, 2*s, 2*s);
  ctx.fillStyle = '#F8F0E0';
  ctx.fillRect(x+5*s, y+4*s, 6*s, 5*s);
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x+5*s, y+5*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+5*s, 2*s, 2*s);
  ctx.fillRect(x+7*s, y+7*s, 2*s, 1*s);
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

function drawFroakie(ctx, x, y, s) {
  ctx.fillStyle = '#5898C0';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 14*s);
  // Bubble scarf
  ctx.fillStyle = '#F8F8F8';
  ctx.fillRect(x+3*s, y+6*s, 10*s, 3*s);
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#F8C030';
  ctx.fillRect(x+5*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+9*s, y+3*s, 1*s, 1*s);
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

function drawRowlet(ctx, x, y, s) {
  ctx.fillStyle = '#B8A878';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 6*s);
  ctx.fillStyle = '#68A048';
  ctx.fillRect(x+3*s, y+5*s, 10*s, 8*s);
  ctx.fillStyle = '#F8F8F0';
  ctx.fillRect(x+4*s, y+2*s, 8*s, 5*s);
  // Bowtie
  ctx.fillStyle = '#48A048';
  ctx.fillRect(x+6*s, y+6*s, 4*s, 2*s);
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#C08030';
  ctx.fillRect(x+7*s, y+5*s, 2*s, 1*s);
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

function drawLitten(ctx, x, y, s) {
  ctx.fillStyle = '#2C2C2C';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 14*s);
  ctx.fillStyle = '#E04040';
  ctx.fillRect(x+4*s, y+1*s, 8*s, 4*s);
  ctx.fillRect(x+4*s, y+8*s, 8*s, 2*s);
  ctx.fillStyle = '#F8C030';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  ctx.fillStyle = '#000';
  ctx.fillRect(x+6*s, y+3*s, 1*s, 2*s);
  ctx.fillRect(x+10*s, y+3*s, 1*s, 2*s);
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

function drawPopplio(ctx, x, y, s) {
  ctx.fillStyle = '#4888C0';
  ctx.fillRect(x+3*s, y+0*s, 10*s, 14*s);
  ctx.fillStyle = '#F8F0E8';
  ctx.fillRect(x+4*s, y+3*s, 8*s, 5*s);
  // Nose
  ctx.fillStyle = '#E86880';
  ctx.fillRect(x+6*s, y+5*s, 4*s, 3*s);
  ctx.fillStyle = '#000';
  ctx.fillRect(x+5*s, y+3*s, 2*s, 2*s);
  ctx.fillRect(x+9*s, y+3*s, 2*s, 2*s);
  // Collar
  ctx.fillStyle = '#78C0E8';
  ctx.fillRect(x+3*s, y+8*s, 10*s, 2*s);
  ctx.fillRect(x+4*s, y+12*s, 3*s, 3*s);
  ctx.fillRect(x+9*s, y+12*s, 3*s, 3*s);
}

function drawGrookey(ctx, x, y, s) { drawChespin(ctx, x, y, s); }
function drawScorbunny(ctx, x, y, s) { drawTorchic(ctx, x, y, s); }
function drawSobble(ctx, x, y, s) { drawFroakie(ctx, x, y, s); }

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

export function drawPokemonWithStatus(ctx, x, y, starterName, status, scale = 1) {
  ctx.imageSmoothingEnabled = false;

  // Status glow
  if (status === 'waiting') {
    ctx.fillStyle = 'rgba(241, 196, 15, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 8 * scale, y + 8 * scale, 12 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (status === 'working') {
    ctx.fillStyle = 'rgba(46, 204, 113, 0.15)';
    ctx.beginPath();
    ctx.ellipse(x + 8 * scale, y + 8 * scale, 12 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (status === 'completed') {
    ctx.fillStyle = 'rgba(46, 204, 113, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 8 * scale, y + 8 * scale, 12 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x + 8 * scale, y + 15.5 * scale, 6 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  drawPokemon(ctx, x, y, starterName, scale);

  // Status indicator
  if (status === 'waiting') {
    drawStatusBubble(ctx, x + 4 * scale, y - 10 * scale, '!', '#F1C40F', scale);
  } else if (status === 'working') {
    drawStatusDots(ctx, x + 3 * scale, y - 8 * scale, scale);
  } else if (status === 'completed') {
    drawStatusBubble(ctx, x + 4 * scale, y - 10 * scale, '✓', '#2ECC71', scale);
  } else if (status === 'exited') {
    drawStatusBubble(ctx, x + 4 * scale, y - 10 * scale, 'X', '#E74C3C', scale);
  }
}

function drawStatusBubble(ctx, x, y, char, color, s) {
  const bounce = Math.sin(Date.now() / 300) * 1.5 * s;
  const bx = Math.round(x);
  const by = Math.round(y + bounce);
  const w = 10 * s;
  const h = 10 * s;
  // Bubble background
  ctx.fillStyle = '#FFF';
  ctx.fillRect(bx, by, w, h);
  // Border (pixel-art: draw 4 edges individually for crisp 1px look)
  ctx.fillStyle = '#383838';
  ctx.fillRect(bx, by, w, s);           // top
  ctx.fillRect(bx, by + h - s, w, s);   // bottom
  ctx.fillRect(bx, by, s, h);           // left
  ctx.fillRect(bx + w - s, by, s, h);   // right
  // Pointer triangle (two stacked pixels)
  ctx.fillStyle = '#FFF';
  ctx.fillRect(bx + 4 * s, by + h, 2 * s, s);
  ctx.fillRect(bx + 4.5 * s, by + h + s, s, s);
  // Character — draw as pixel block instead of font
  if (char === '!') {
    ctx.fillStyle = color;
    // Exclamation mark: 2px wide vertical bar + dot
    const cx = bx + 4 * s;
    const cy = by + 2 * s;
    ctx.fillRect(cx, cy, 2 * s, 4 * s);           // vertical bar
    ctx.fillRect(cx, cy + 5 * s, 2 * s, s);       // dot
  } else if (char === '✓') {
    ctx.fillStyle = color;
    // Checkmark: short descending stroke then long ascending stroke
    const cx = bx + 2 * s;
    const cy = by + 2 * s;
    ctx.fillRect(cx + 1 * s, cy + 4 * s, s, s);   // start of short stroke
    ctx.fillRect(cx + 2 * s, cy + 5 * s, s, s);   // bottom of check
    ctx.fillRect(cx + 3 * s, cy + 4 * s, s, s);   // ascending
    ctx.fillRect(cx + 4 * s, cy + 3 * s, s, s);
    ctx.fillRect(cx + 5 * s, cy + 2 * s, s, s);
    ctx.fillRect(cx + 6 * s, cy + 1 * s, s, s);   // top of long stroke
  } else if (char === 'X') {
    ctx.fillStyle = color;
    const cx = bx + 3 * s;
    const cy = by + 2.5 * s;
    // Simple X shape
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(cx + i * s, cy + i * s, s, s);
      ctx.fillRect(cx + (3 - i) * s, cy + i * s, s, s);
    }
  } else {
    ctx.fillStyle = color;
    ctx.font = `bold ${6 * s}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(char, bx + w / 2, by + 7.5 * s);
    ctx.textAlign = 'start';
  }
}

function drawStatusDots(ctx, x, y, s) {
  const t = Date.now() / 400;
  for (let i = 0; i < 3; i++) {
    const alpha = ((Math.sin(t + i * 1.2) + 1) / 2);
    ctx.fillStyle = `rgba(46, 204, 113, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x + (3 + i * 4) * s, y, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// === PLAYER CHARACTER - Pixel-perfect GBA-style sprite data ===
// Based on Pokemon FireRed/LeafGreen protagonist overworld sprites.
// Each sprite is a 16x16 grid of palette indices, rendered pixel-by-pixel
// exactly like the GBA hardware does it.

const PLAYER_PALETTE = {
  '.': null,           // transparent
  'R': '#D03030',      // red cap
  'r': '#A02020',      // dark red (brim/shadow)
  'W': '#F8F8F8',      // white (emblem, zipper)
  'H': '#181818',      // black hair
  'S': '#F8C8A0',      // skin
  's': '#E0A878',      // skin shadow
  'E': '#F8F8F8',      // eye white
  'P': '#282838',      // eye pupil
  'B': '#3868B0',      // blue jacket
  'b': '#284880',      // blue jacket shadow
  'D': '#383850',      // dark pants
  'd': '#282838',      // dark pants shadow
  'K': '#C03030',      // red shoes
  'k': '#902020',      // shoe shadow
  'O': '#181818',      // outline
};

// Down standing - 16 chars per row
const DOWN_0 = [
  '....ORRRRRRO....',
  '...ORRRRRRRRO...',
  '...ORRWWRRRRO...',
  '..OrrrrrrrrrrO..',
  '..OHHSSSSSSHHO..',
  '..OSEPSSSSEPOS..',
  '...OSSSSSSSSSO..',
  '....OSSSSSSO....',
  '...OBBBWWBBbO...',
  '..SOBBBWWBBBOs..',
  '..OSBBBWWBBBsO..',
  '...OBBBWWBBbO...',
  '....ODDDDDDOO...',
  '....ODDDDDDOO...',
  '....OKKOOKKO....',
  '....OKKOOKKO....',
];

// Down walk frame 1 (left foot forward)
const DOWN_1 = [
  '....ORRRRRRO....',
  '...ORRRRRRRRO...',
  '...ORRWWRRRRO...',
  '..OrrrrrrrrrrO..',
  '..OHHSSSSSSHHO..',
  '..OSEPSSSSEPOS..',
  '...OSSSSSSSSSO..',
  '....OSSSSSSO....',
  '...OBBBWWBBbO...',
  '..SOBBBWWBBBOs..',
  '..OSBBBWWBBBsO..',
  '...OBBBWWBBbO...',
  '..ODDDO..ODDOO..',
  '..ODDDO...ODOO..',
  '..OKKO....OKOO..',
  '...OO......OO...',
];

// Down walk frame 2 (right foot forward)
const DOWN_2 = [
  '....ORRRRRRO....',
  '...ORRRRRRRRO...',
  '...ORRWWRRRRO...',
  '..OrrrrrrrrrrO..',
  '..OHHSSSSSSHHO..',
  '..OSEPSSSSEPOS..',
  '...OSSSSSSSSSO..',
  '....OSSSSSSO....',
  '...OBBBWWBBbO...',
  '..SOBBBWWBBBOs..',
  '..OSBBBWWBBBsO..',
  '...OBBBWWBBbO...',
  '..OODDO..ODDDO..',
  '..OODO...ODDDO..',
  '..OOKO....OKKO..',
  '...OO......OO...',
];

// Up standing
const UP_0 = [
  '....ORRRRRRO....',
  '...ORRRRRRRRO...',
  '...ORRRRRRRRO...',
  '..OrrrrrrrrrrO..',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '...OHHHHHHHHHO..',
  '....OHHHHHHO....',
  '...OBBBBBBBbO...',
  '..bOBBBBBBBBOb..',
  '..OBBBBBBBBBBO..',
  '...OBBBBBBBbO...',
  '....ODDDDDDOO...',
  '....ODDDDDDOO...',
  '....OKKOOKKO....',
  '....OKKOOKKO....',
];

// Up walk frame 1
const UP_1 = [
  '....ORRRRRRO....',
  '...ORRRRRRRRO...',
  '...ORRRRRRRRO...',
  '..OrrrrrrrrrrO..',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '...OHHHHHHHHHO..',
  '....OHHHHHHO....',
  '...OBBBBBBBbO...',
  '..bOBBBBBBBBOb..',
  '..OBBBBBBBBBBO..',
  '...OBBBBBBBbO...',
  '..ODDDO..ODDOO..',
  '..ODDDO...ODOO..',
  '..OKKO....OKOO..',
  '...OO......OO...',
];

// Up walk frame 2
const UP_2 = [
  '....ORRRRRRO....',
  '...ORRRRRRRRO...',
  '...ORRRRRRRRO...',
  '..OrrrrrrrrrrO..',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '...OHHHHHHHHHO..',
  '....OHHHHHHO....',
  '...OBBBBBBBbO...',
  '..bOBBBBBBBBOb..',
  '..OBBBBBBBBBBO..',
  '...OBBBBBBBbO...',
  '..OODDO..ODDDO..',
  '..OODO...ODDDO..',
  '..OOKO....OKKO..',
  '...OO......OO...',
];

// Left standing
const LEFT_0 = [
  '.....ORRRRRO....',
  '....ORRRRRRO....',
  '...ORRRRRRRO....',
  '..OrrrrrrrrO....',
  '..OHHSSSSSHOO...',
  '..OHEPSSSSHO....',
  '...OSSSSSSOO....',
  '...OSSSSSOO.....',
  '..OBBBBBBbO.....',
  '..OBBBBBBbO.....',
  '.OsBBBBBBBO.....',
  '..OBBBBBBbO.....',
  '...ODDDDDOO.....',
  '...ODDDDOO......',
  '...OKKKO........',
  '....OOO.........',
];

// Left walk frame 1
const LEFT_1 = [
  '.....ORRRRRO....',
  '....ORRRRRRO....',
  '...ORRRRRRRO....',
  '..OrrrrrrrrO....',
  '..OHHSSSSSHOO...',
  '..OHEPSSSSHO....',
  '...OSSSSSSOO....',
  '...OSSSSSOO.....',
  '..OBBBBBBbO.....',
  '..OBBBBBBbO.....',
  '.OsBBBBBBBO.....',
  '..OBBBBBBbO.....',
  '..ODDDDDOO......',
  '.ODDDO.ODDO.....',
  '.OKKO..OKKO.....',
  '..OO....OO......',
];

// Right standing (mirror of left)
const RIGHT_0 = [
  '....ORRRRRO.....',
  '....ORRRRRRO....',
  '....ORRRRRRRO...',
  '....OrrrrrrrrO..',
  '...OOHSSSSSHHO..',
  '....OHSSSSPEHO..',
  '....OOSSSSSSSO..',
  '.....OOSSSSSSO..',
  '.....OBBBBBBbO..',
  '.....OBBBBBBbO..',
  '.....OBBBBBBsO..',
  '.....OBBBBBBbO..',
  '.....OODDDDDOO..',
  '......OODDDDOO..',
  '........OKKKO...',
  '.........OOO....',
];

// Right walk frame 1
const RIGHT_1 = [
  '....ORRRRRO.....',
  '....ORRRRRRO....',
  '....ORRRRRRRO...',
  '....OrrrrrrrrO..',
  '...OOHSSSSSHHO..',
  '....OHSSSSPEHO..',
  '....OOSSSSSSSO..',
  '.....OOSSSSSSO..',
  '.....OBBBBBBbO..',
  '.....OBBBBBBbO..',
  '.....OBBBBBBsO..',
  '.....OBBBBBBbO..',
  '......OODDDDDOO.',
  '.....ODDO.ODDDO.',
  '.....OKKO..OKKO.',
  '......OO....OO..',
];

const PLAYER_SPRITES = {
  down:  [DOWN_0, DOWN_1, DOWN_0, DOWN_2],
  up:    [UP_0, UP_1, UP_0, UP_2],
  left:  [LEFT_0, LEFT_1, LEFT_0, LEFT_1],
  right: [RIGHT_0, RIGHT_1, RIGHT_0, RIGHT_1],
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

  const dir = direction || 'down';
  const frames = PLAYER_SPRITES[dir] || PLAYER_SPRITES.down;
  const spriteFrame = frames[frame % frames.length];

  renderSpriteData(ctx, x, y, spriteFrame, PLAYER_PALETTE, scale);
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

// Pokemon-authentic pixel art sprites
// Targeting Pokemon FireRed/LeafGreen GBA aesthetic

// === REGIONS & STARTERS (re-exported from shared) ===
export { REGIONS } from '../../shared/constants.js';

// === POKEMON SPRITE DATA ===
// Each sprite is a 16x16 grid of palette indices.
// palette: array of hex colors used by this sprite
// grid: 16 rows of up to 16 values; undefined = transparent, number = palette index

const SPRITE_DATA = {
  bulbasaur: {
    palette: ['#326B4E', '#5DB894', '#FFF', '#E04040', '#4A9B7C'],
    grid: [
      [,,,,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,1,1,1,1,1,1,1,1,1,1],
      [,,1,1,1,1,1,1,1,1,1,1,1,1],
      [,,1,1,2,3,1,1,1,1,2,3,1,1],
      [,,1,1,3,3,1,1,1,1,3,3,1,1],
      [,,1,1,4,4,1,1,1,4,4,1,1,1],
      [,,1,1,1,1,1,1,1,4,4,1,1,1],
      [,,1,1,1,1,0,0,0,0,1,1,1,1],
      [,,1,1,1,1,1,1,1,1,1,1,1,1],
      [,,1,1,1,1,1,1,1,1,1,1,1,1],
      [,,,1,1,1,1,1,1,1,1,1,1],
      [,,,1,1,1,,,,,1,1,1],
      [,,,4,4,4,,,,,4,4,4],
      [],
    ],
  },
  charmander: {
    palette: ['#E87840', '#40A0C0', '#000', '#C06030', '#F8D878', '#F85030', '#F8D030', '#F8A030'],
    grid: [
      [,,,,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,1,2,0,0,1,2,0,0],
      [,,,0,0,1,2,0,0,1,2,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,3,3,3,3,0,0,0],
      [,,0,0,0,4,4,4,4,4,4,0,0,0],
      [,,0,0,0,4,4,4,4,4,4,0,0,5,6],
      [,,0,0,0,4,4,4,4,4,4,0,0,5,6],
      [,,,0,0,4,4,4,4,4,4,0,7,5,5],
      [,,,0,0,0,0,0,0,0,0,0,7,7,7],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [],
    ],
  },
  squirtle: {
    palette: ['#68B8D8', '#FFF', '#C04040', '#A06830', '#4898A8', '#F8F0C8'],
    grid: [
      [,,,,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,1,2,0,0,1,2,0,0],
      [,,,0,0,2,2,0,0,2,2,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,3,0,0,4,4,4,4,0,0,3],
      [,,0,0,0,5,5,5,5,5,5,0,0,0],
      [,,0,0,0,5,5,5,5,5,5,0,0,0],
      [,,0,0,0,5,5,5,5,5,5,0,0,0],
      [,,,3,0,5,5,5,5,5,5,0,3,,0],
      [,,,3,0,5,5,5,5,5,5,0,0,0,0],
      [,,,3,0,0,0,0,0,0,0,0,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [],
    ],
  },
  chikorita: {
    palette: ['#48A048', '#A8D8A0', '#FFF', '#C04040'],
    grid: [
      [,,,,,,0,0,0,0,0],
      [,,,,1,1,1,1,1,1,1,1],
      [,,,1,1,1,1,1,1,1,1,1,1],
      [,,,1,1,2,3,1,1,2,3,1,1],
      [,,,1,1,3,3,1,1,3,3,1,1],
      [,,,1,1,1,1,1,1,1,1,1,1],
      [,,,,1,1,1,1,1,1,1,1],
      [,,,1,1,0,0,1,1,0,0,1,1],
      [,,,1,1,1,1,1,1,1,1,1,1],
      [,,,1,1,1,1,1,1,1,1,1,1],
      [,,,1,1,1,1,1,1,1,1,1,1],
      [,,,1,1,1,1,1,1,1,1,1,1],
      [,,,,1,1,1,1,1,1,1,1],
      [,,,,1,1,1,,,1,1,1],
      [,,,,1,1,1,,,1,1,1],
      [],
    ],
  },
  cyndaquil: {
    palette: ['#F85030', '#F8D030', '#304868', '#E8D8A8', '#000', '#C06030'],
    grid: [
      [,,,,,,0,1],
      [,,,0,1,,0,1,,,,0,1],
      [,,,0,2,2,2,2,2,2,2,2,1],
      [,,,2,2,2,2,2,2,2,2,2,2],
      [,,,2,2,2,2,2,2,2,2,2,2],
      [,,,2,2,3,3,3,3,3,3,2,2],
      [,,,2,3,4,4,3,3,4,4,3,2],
      [,,,2,3,3,3,3,3,3,3,3,2],
      [,,,,3,3,3,5,5,3,3,3],
      [,,,,3,3,3,3,3,3,3,3],
      [,,,,3,3,3,3,3,3,3,3],
      [,,,,3,3,3,3,3,3,3,3],
      [,,,,3,3,3,3,3,3,3,3],
      [,,,,3,3,3,,,3,3,3],
      [,,,,3,3,3,,,3,3,3],
      [],
    ],
  },
  totodile: {
    palette: ['#50A0D0', '#D04040', '#FFF', '#C04040', '#F8F0C8'],
    grid: [
      [,,,0,0,0,1,1,1,1,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,2,3,0,0,2,3,0,0],
      [,,,0,0,3,3,0,0,3,3,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,2,0,2,0,2,0,0,0],
      [,,,0,0,4,4,4,4,4,4,0,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,0,0,0,4,4,1,1,4,4,0,0,0],
      [,,0,0,0,4,4,1,1,4,4,0,0,0],
      [,,0,0,0,4,4,4,4,4,4,0,0,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [],
    ],
  },
  treecko: {
    palette: ['#5CC85C', '#6ED86E', '#3A9A3A', '#F8D830', '#FFF', '#000', '#48B048', '#E8C020', '#C84040', '#B03030'],
    grid: [
      [,,,0,1,1,1,1,0,0,0,0,0],
      [,,0,0,0,0,0,0,0,0,0,0,0,0,,2],
      [,,0,3,4,5,3,0,0,3,4,5,3,0,2,2],
      [,,0,3,3,5,3,0,0,3,3,5,3,6,2,2],
      [,,0,7,7,5,7,0,0,7,7,5,7,6,2,2],
      [,,0,0,0,0,0,0,0,0,0,0,0,6,6,6],
      [,,,0,0,0,0,0,0,0,0,0,0,6,6,6],
      [,,0,0,0,0,0,0,0,0,0,0,0,6,6],
      [,,0,0,0,0,8,8,8,8,0,0,6,6,6],
      [,6,6,6,0,0,8,8,8,8,0,0,6,6,6],
      [,,,,0,0,9,9,9,9,0,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,6,6,6,6,,,6,6,6,6],
      [],
    ],
  },
  torchic: {
    palette: ['#F8A030', '#FFF', '#000', '#D8A030', '#F8D858', '#D88030'],
    grid: [
      [,,,,,,0,0,0,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,1,2,0,0,1,2,0,0],
      [,,,0,0,2,2,0,0,2,2,0,0],
      [,,,0,0,0,3,3,3,3,0,0,0],
      [,,,,0,4,4,4,4,4,4,0],
      [,,,,4,4,4,4,4,4,4,4],
      [,,0,0,0,4,4,4,4,4,4,0,0,0],
      [,,0,0,0,4,4,4,4,4,4,0,0,0],
      [,,0,0,0,4,4,4,4,4,4,0,0,0],
      [,,,,4,4,4,4,4,4,4,4],
      [,,,,,4,4,4,4,4,4],
      [,,,,5,5,5,,,5,5,5],
      [,,,,5,5,5,,,5,5,5],
      [],
    ],
  },
  mudkip: {
    palette: ['#58A8D8', '#FFF', '#000', '#F8A050', '#4888A0', '#B8D8F0', '#4090C8'],
    grid: [
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,0,0,0,0,0,0,0,0,0,0,0,0],
      [,,0,0,0,0,0,0,0,0,0,0,0,0],
      [,,0,0,0,1,2,0,0,1,2,0,0,0],
      [,,3,3,3,2,2,0,0,2,2,3,3,3],
      [,,3,3,3,0,0,0,0,0,0,3,3,3],
      [,,,0,0,0,4,4,4,4,0,0,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,,,0,5,5,5,5,5,5,0,,,6,6],
      [,,,,0,5,5,5,5,5,5,0,6,6,6,6],
      [,,,,0,5,5,5,5,5,5,0,6,6,6],
      [,,,,0,0,0,0,0,0,0,0,6,6,6],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [],
    ],
  },
  turtwig: {
    palette: ['#68B858', '#FFF', '#000', '#E8D880', '#8B6914', '#6B4F12'],
    grid: [
      [,,,,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,1,2,0,0,1,2,0,0],
      [,,,0,0,2,2,0,0,2,2,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,,0,3,3,3,3,3,3,0],
      [,,,4,4,4,4,4,4,4,4,4,4],
      [,,,4,5,5,5,5,5,5,5,5,4],
      [,,,4,5,0,0,0,0,0,0,5,4],
      [,,,4,5,0,0,0,0,0,0,5,4],
      [,,,4,5,0,0,0,0,0,0,5,4],
      [,,,4,4,4,4,4,4,4,4,4,4],
      [,,,0,0,0,,,,,0,0,0],
      [,,,0,0,0,,,,,0,0,0],
      [,,,0,0,0,,,,,0,0,0],
      [],
    ],
  },
  chimchar: {
    palette: ['#E08840', '#F8E0B0', '#000', '#C06040', '#F8A030', '#F85030'],
    grid: [
      [,,,,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,0,0,0,1,1,1,1,1,1,0,0,0],
      [,,0,0,0,1,2,1,1,2,1,0,0,0],
      [,,0,0,0,1,2,1,1,2,1,0,0,0],
      [,,,0,0,1,1,3,3,1,1,0,0],
      [,,,,0,1,1,1,1,1,1,0],
      [,,0,0,0,0,0,0,0,0,0,0,0,0],
      [,,0,0,0,1,1,1,1,1,1,0,0,0],
      [,,0,0,0,1,1,1,1,1,1,0,0,4,4],
      [,,0,0,0,1,1,1,1,1,1,0,5,4,4],
      [,,,,0,0,0,0,0,0,0,0,5,5],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [],
    ],
  },
  piplup: {
    palette: ['#3880C0', '#2860A0', '#F8F8F8', '#FFF', '#000', '#F8C030', '#B8D8F0'],
    grid: [
      [,,,,0,0,1,1,1,1,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,2,3,4,2,3,4,0,0],
      [,,,0,0,2,4,4,2,4,4,0,0],
      [,,,0,0,2,5,5,5,5,2,0,0],
      [,,,,0,2,5,5,5,5,2,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,0,0,0,6,6,6,6,6,6,0,0,0],
      [,,0,0,0,6,6,6,6,6,6,0,0,0],
      [,,0,0,0,6,6,6,6,6,6,0,0,0],
      [,,0,0,0,0,0,0,0,0,0,0,0,0],
      [],
      [,,,,5,5,5,,,5,5,5],
      [,,,,5,5,5,,,5,5,5],
      [],
    ],
  },
  snivy: {
    palette: ['#68B858', '#C04040', '#488838', '#F8F0A0', '#E8F0B8', '#48A048'],
    grid: [
      [,,,,0,0,0,0,0,0,0,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,1,1,0,0,1,1,0,0],
      [,,,0,0,1,1,0,0,1,1,0,0],
      [,,,0,0,0,0,2,2,0,0,0,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,,,3,0,0,0,0,0,0,3],
      [,,,0,0,0,4,4,4,4,0,0,0],
      [,,,0,0,0,4,4,4,4,0,0,0,,5,5],
      [,,,0,0,0,4,4,4,4,0,0,5,5,5,5],
      [,,,,,0,0,0,0,0,0,,5,5,5,5],
      [,,,,,0,0,,,0,0],
      [,,,,,0,0,,,0,0],
      [,,,,,0,0,,,0,0],
      [],
    ],
  },
  tepig: {
    palette: ['#2C2C2C', '#FFF', '#000', '#E07040', '#E8B880', '#D07050', '#C06040', '#F85030'],
    grid: [
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,1,2,0,0,1,2,0,0],
      [,,,3,3,2,2,3,3,2,2,3,3],
      [,,,3,3,4,4,4,4,4,4,3,3],
      [,,,3,3,4,5,6,5,6,4,3,3],
      [,,,3,3,4,5,5,5,5,4,3,3],
      [,,,,0,0,0,0,0,0,0,0],
      [,,,,3,3,3,3,3,3,3,3],
      [,,,,3,3,3,3,3,3,3,3,3,3,7],
      [,,,,3,3,3,3,3,3,3,3,3,3],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [],
    ],
  },
  oshawott: {
    palette: ['#68B0D0', '#305878', '#F8F8F0', '#FFF', '#2C2C2C', '#F0C090', '#C06040', '#78C8E0'],
    grid: [
      [,,,0,0,1,1,1,1,1,1,0,0],
      [,,,0,0,1,1,1,1,1,1,0,0],
      [,,,0,0,1,1,1,1,1,1,0,0],
      [,,,0,2,2,1,1,1,1,2,2,0],
      [,,,0,2,3,4,2,2,3,4,2,0],
      [,,,0,5,4,4,6,6,4,4,5,0],
      [,,,0,2,2,2,2,2,2,2,2,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,,,0,2,2,2,2,2,2,0],
      [,,,,0,2,7,7,7,7,2,0],
      [,,,,0,2,7,7,7,7,2,0],
      [,,,,0,0,0,0,0,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [,,,,0,0,0,,,0,0,0],
      [],
    ],
  },
  chespin: {
    palette: ['#68A848', '#48A048', '#D8B870', '#000'],
    grid: [
      [,,,0,0,1,1,1,1,1,1,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,2,2,2,2,2,2,0,0],
      [,,,0,0,3,3,2,2,3,3,0,0],
      [,,,0,0,3,3,2,2,3,3,0,0],
      [,,,0,0,2,2,2,2,2,2,0,0],
      [,,,0,0,2,2,2,2,2,2,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,1,1,1,0,0,1,1,1,0],
      [,,,0,1,1,1,0,0,1,1,1,0],
      [,,,,1,1,1,,,1,1,1],
      [],
    ],
  },
  fennekin: {
    palette: ['#F0C868', '#F8F0E0', '#2C2C2C'],
    grid: [
      [,,0,0,0,0,0,0,0,0,0,0,0,0],
      [,,0,0,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,1,1,1,1,1,1,0,0],
      [,,,0,0,2,2,1,1,2,2,0,0],
      [,,,0,0,2,2,1,1,2,2,0,0],
      [,,,0,0,1,1,2,2,1,1,0,0],
      [,,,0,0,1,1,1,1,1,1,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,2,2,2,0,0,2,2,2,0],
      [,,,0,2,2,2,0,0,2,2,2,0],
      [,,,,2,2,2,,,2,2,2],
      [],
    ],
  },
  froakie: {
    palette: ['#5898C0', '#F8C030', '#000', '#F8F8F8'],
    grid: [
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,1,2,0,0,1,2,0,0],
      [,,,0,0,2,2,0,0,2,2,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,3,3,3,3,3,3,3,3,3,3],
      [,,,3,3,3,3,3,3,3,3,3,3],
      [,,,3,3,3,3,3,3,3,3,3,3],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,1,1,1,0,0,1,1,1,0],
      [,,,0,1,1,1,0,0,1,1,1,0],
      [,,,,1,1,1,,,1,1,1],
      [],
    ],
  },
  rowlet: {
    palette: ['#B8A878', '#F8F8F0', '#2C2C2C', '#68A048', '#C08030', '#48A048'],
    grid: [
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,1,1,1,1,1,1,1,1,0],
      [,,,0,1,2,2,1,1,2,2,1,0],
      [,,,0,1,2,2,1,1,2,2,1,0],
      [,,,3,1,1,1,4,4,1,1,1,3],
      [,,,3,1,1,5,5,5,5,1,1,3],
      [,,,3,3,3,5,5,5,5,3,3,3],
      [,,,3,3,3,3,3,3,3,3,3,3],
      [,,,3,3,3,3,3,3,3,3,3,3],
      [,,,3,3,3,3,3,3,3,3,3,3],
      [,,,3,3,3,3,3,3,3,3,3,3],
      [,,,3,4,4,4,3,3,4,4,4,3],
      [,,,,4,4,4,,,4,4,4],
      [,,,,4,4,4,,,4,4,4],
      [],
    ],
  },
  litten: {
    palette: ['#2C2C2C', '#E04040', '#F8C030', '#000'],
    grid: [
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,1,1,1,1,1,1,1,1,0],
      [,,,0,1,1,1,1,1,1,1,1,0],
      [,,,0,1,2,3,1,1,2,3,1,0],
      [,,,0,1,2,3,1,1,2,3,1,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,1,1,1,1,1,1,1,1,0],
      [,,,0,1,1,1,1,1,1,1,1,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,3,3,3,0,0,3,3,3,0],
      [,,,0,3,3,3,0,0,3,3,3,0],
      [,,,,3,3,3,,,3,3,3],
      [],
    ],
  },
  popplio: {
    palette: ['#4888C0', '#F8F0E8', '#000', '#E86880', '#78C0E8'],
    grid: [
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,1,2,2,1,1,2,2,1,0],
      [,,,0,1,2,2,1,1,2,2,1,0],
      [,,,0,1,1,3,3,3,3,1,1,0],
      [,,,0,1,1,3,3,3,3,1,1,0],
      [,,,0,1,1,3,3,3,3,1,1,0],
      [,,,4,4,4,4,4,4,4,4,4,4],
      [,,,4,4,4,4,4,4,4,4,4,4],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,0,0,0,0,0,0,0,0,0],
      [,,,0,4,4,4,0,0,4,4,4,0],
      [,,,0,4,4,4,0,0,4,4,4,0],
      [,,,,4,4,4,,,4,4,4],
      [],
    ],
  },
};

// === GENERIC SPRITE RENDERER ===

function drawFromData(ctx, x, y, s, data) {
  const { palette, grid } = data;
  for (let row = 0; row < grid.length; row++) {
    const r = grid[row];
    for (let col = 0; col < r.length; col++) {
      const colorIdx = r[col];
      if (colorIdx != null) {
        ctx.fillStyle = palette[colorIdx];
        ctx.fillRect(x + col * s, y + row * s, s, s);
      }
    }
  }
}

// === STARTER DRAWERS (built from data + aliases) ===

const STARTER_DRAWERS = {};
for (const [name, data] of Object.entries(SPRITE_DATA)) {
  STARTER_DRAWERS[name] = (ctx, x, y, s) => drawFromData(ctx, x, y, s, data);
}

// Aliases: these Pokemon reuse another Pokemon's sprite
STARTER_DRAWERS.genericGrass = STARTER_DRAWERS.bulbasaur;
STARTER_DRAWERS.genericFire = STARTER_DRAWERS.charmander;
STARTER_DRAWERS.genericWater = STARTER_DRAWERS.squirtle;
STARTER_DRAWERS.grookey = STARTER_DRAWERS.chespin;
STARTER_DRAWERS.scorbunny = STARTER_DRAWERS.torchic;
STARTER_DRAWERS.sobble = STARTER_DRAWERS.froakie;

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

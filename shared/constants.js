// Shared constants used by both server and client

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

export function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

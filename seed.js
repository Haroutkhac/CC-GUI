// Seed script: creates one project per region with 3 sessions each
// Run: node seed.js

const REGIONS = [
  { name: 'Kanto', starters: ['Bulbasaur', 'Charmander', 'Squirtle'] },
  { name: 'Johto', starters: ['Chikorita', 'Cyndaquil', 'Totodile'] },
  { name: 'Hoenn', starters: ['Treecko', 'Torchic', 'Mudkip'] },
  { name: 'Sinnoh', starters: ['Turtwig', 'Chimchar', 'Piplup'] },
  { name: 'Unova', starters: ['Snivy', 'Tepig', 'Oshawott'] },
  { name: 'Kalos', starters: ['Chespin', 'Fennekin', 'Froakie'] },
  { name: 'Alola', starters: ['Rowlet', 'Litten', 'Popplio'] },
  { name: 'Galar', starters: ['Grookey', 'Scorbunny', 'Sobble'] },
];

const BASE = 'http://localhost:3456';

async function seed() {
  for (const region of REGIONS) {
    console.log(`Creating ${region.name} project...`);
    const res = await fetch(`${BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: region.name, path: process.env.HOME || '/tmp' }),
    });
    const project = await res.json();

    for (const starter of region.starters) {
      console.log(`  Adding ${starter}...`);
      await fetch(`${BASE}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, name: starter, command: 'echo ' + starter }),
      });
    }
  }
  console.log('\nDone! All 8 regions with 24 Pokemon created.');
  console.log('Open http://localhost:5173 to see them.');
}

seed().catch(console.error);

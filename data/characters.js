// data/characters.js
// An array of objects — one per day from Oct 14 to Oct 31.
// Edit fields: day, title, mlNumber, toyhouse, designer, species, traits (array),
// image (path under /images), silhouette (path under /silhouettes), raffleWebhook (set to your deployed Apps Script URL)
window.FAENOIR_CHARACTERS = [
  {
    day: 14,
    title: "One doll of a time",
    mlNumber: "ML-014",
    toyhouse: "https://toyhou.se/35603670.1",
    designer: "Shimura",
    species: "Delerian",
    traits: ["Ears: Mammal [Common]", "Halo: Shaped [Uncommon]", "Horns: Small [Common]"], ["Essence: Man Made (Dice) [Rare]", ["Tail: Axolotl (Other) [Rare]",
    image: "images/day14.png",
    silhouette: "silhouettes/day14.png",
    raffleWebhook: "https://script.google.com/macros/s/AKfycbzK00IQ8SHrOv6JOeqC7MKHXAK2mNgvzRAUnpKpFKvEmJ5Bkv2hqMXj3jtDEPiycbsc/exec" // <-- set your Google Apps Script webhook URL here
  },
  {
    day: 15,
    title: "Spooky Calf #15",
    mlNumber: "ML-015",
    toyhouse: "https://toyhou.se/YYYYY",
    designer: "Captin_Bean",
    species: "Delerian",
    traits: ["Horns: Any horn[common]", "Halo: Circular[common]"], "Tail: Cow [common]"], "Essence: Ghost [rare]"], "Ears: Lamb [common]"],
    image: "images/day15.png",
    silhouette: "silhouettes/day15.png",
    raffleWebhook: "https://script.google.com/macros/s/AKfycbzK00IQ8SHrOv6JOeqC7MKHXAK2mNgvzRAUnpKpFKvEmJ5Bkv2hqMXj3jtDEPiycbsc/exec"
  },
  // ... add objects for day:16 through day:31
];

// Helper: map day => data
window.FAENOIR_BY_DAY = {};
window.FAENOIR_CHARACTERS.forEach(c => window.FAENOIR_BY_DAY[c.day] = c);


// Mirror Mystery — level data.
//
// Each level has two near-identical pictures (imgA / imgB) and a list of
// differences. A difference is a point in picture space: x and y are
// fractions of the picture's width and height (0..1), r is the click radius
// as a fraction of the picture's width. Coordinates were measured from the
// finished art, so every listed difference is real and clickable.

export const LEVELS = [
  {
    id: 1,
    name: 'Sunny Beach Day',
    blurb: 'A calm day at the shore. Six things changed between the two photos.',
    imgA: 'img/level1-a.jpg',
    imgB: 'img/level1-b.jpg',
    timeLimit: 150,
    differences: [
      { x: 0.306, y: 0.327, r: 0.060, label: 'the middle cloud vanished' },
      { x: 0.285, y: 0.618, r: 0.055, label: 'the beach ball turned green' },
      { x: 0.172, y: 0.782, r: 0.052, label: 'the sunglasses disappeared' },
      { x: 0.288, y: 0.880, r: 0.045, label: 'the starfish disappeared' },
      { x: 0.764, y: 0.155, r: 0.050, label: 'the seagull flew away' },
      { x: 0.481, y: 0.640, r: 0.042, label: 'the umbrella pole turned blue' },
    ],
  },
  {
    id: 2,
    name: 'Cozy Kitchen',
    blurb: 'Somebody tidied the kitchen — or did they? Six small changes hide here.',
    imgA: 'img/level2-a.jpg',
    imgB: 'img/level2-b.jpg',
    timeLimit: 120,
    differences: [
      { x: 0.416, y: 0.506, r: 0.055, label: 'the kettle turned green' },
      { x: 0.710, y: 0.538, r: 0.058, label: 'a cup went missing' },
      { x: 0.714, y: 0.320, r: 0.045, label: 'the green jar turned blue' },
      { x: 0.241, y: 0.626, r: 0.050, label: 'the bananas disappeared' },
      { x: 0.883, y: 0.458, r: 0.040, label: 'the heart magnet fell off' },
      { x: 0.585, y: 0.110, r: 0.045, label: 'the clock jumped to nine' },
    ],
  },
  {
    id: 3,
    name: 'Space Adventure',
    blurb: 'Deep space, sharp eyes. The final scene hides its six changes well.',
    imgA: 'img/level3-a.jpg',
    imgB: 'img/level3-b.jpg',
    timeLimit: 100,
    differences: [
      { x: 0.546, y: 0.185, r: 0.085, label: 'the comet turned teal' },
      { x: 0.251, y: 0.276, r: 0.050, label: 'the helmet floated away' },
      { x: 0.548, y: 0.755, r: 0.045, label: 'the moon flag turned blue' },
      { x: 0.094, y: 0.394, r: 0.040, label: 'the rocket lost its window' },
      { x: 0.260, y: 0.800, r: 0.036, label: 'the alien lost an eye' },
      { x: 0.512, y: 0.463, r: 0.034, label: 'the badge fell off the suit' },
    ],
  },
];

// Scoring and penalty constants, shared by the game logic.
export const SCORE = {
  find: 100, // points per difference found
  streakBonus: 20, // extra points per find while the streak timer holds
  streakWindowMs: 8000, // finds closer than this keep the streak alive
  hintCost: 50, // points a hint costs (charged in full; only the displayed score is floored at zero)
  missTimePenalty: 5, // seconds a wrong click costs
  hintsPerLevel: 3,
};

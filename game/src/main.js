// Mirror Mystery — entry point. Builds the game and stages any demo mode
// requested in the URL (?level=N, ?demo=cover|one|win).
import { Game } from './game.js';

const game = new Game();
game.applyDemo();

import { findBestGuesses } from './worker.js'
import { wordlist } from "./words/en.js";

console.log("[")
const words = findBestGuesses(wordlist)
for (const word of words) {
    console.log(`"${word}",`)
}
console.log("]")

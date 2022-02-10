const INVALID_LETTER = 1
const VALID_LETTER = 2
const EXACT_LETTER = 4

function calculateScore(word, guess) {
    const letters = word.split('')
    const result = [INVALID_LETTER, INVALID_LETTER, INVALID_LETTER, INVALID_LETTER, INVALID_LETTER]

    // exact matches
    for (let i = 0; i < 5; ++i) {
        if(word.charAt(i) === guess.charAt(i)) {
            result[i] = EXACT_LETTER
            const index = letters.indexOf(guess.charAt(i))
            letters.splice(index, 1)
        }
    }

    // non-exact matches
    for (let i = 0; i < 5; ++i) {
        if (result[i] === EXACT_LETTER) {
            continue
        }

        const index = letters.indexOf(guess.charAt(i))
        if(index !== -1) {
            result[i] = VALID_LETTER
            letters.splice(index, 1)
        }
    }

    return result
}

function findBestGuesses(words) {
    const guesses = []

    for (const word of words) {
        let score = 0

        for (const guess of words) {
            if (guess === word) {
                continue
            }

            const scores = calculateScore(word, guess)
            let guessScore = 0

            for (const value of scores) {
                switch (value) {
                    case VALID_LETTER:
                        guessScore++
                        break
                    case EXACT_LETTER:
                        guessScore += 6
                }
            }

            score += guessScore
        }

        guesses.push({word, score})
    }

    guesses.sort((a, b) => b.score - a.score)

    return guesses.map(guess => guess.word)
}

onmessage = function (e) {
    if (e.data.action === 'guess') {
        const guesses = findBestGuesses(e.data.words)
        postMessage(guesses)
    }
}

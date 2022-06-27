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

function remainingLetters(words) {
    const letters = {}
    for (const word of words) {
        for (const letter of word) {
            letters[letter] = true
        }
    }
    return Object.keys(letters).length
}

function calculateGuessScore(scores, lettersLeft) {
    let guessScore = 0
    let nonExactCount = 0
    const invalidLetterScore = 1 / lettersLeft
    
    // Exact guesses first
    for (const value of scores) {
        switch (value) {
            case EXACT_LETTER:
                guessScore++
                break
            default:
                nonExactCount++
                break
        }
    }

    // The rest
    for (const value of scores) {
        switch (value) {
            case VALID_LETTER:
                guessScore += (1 / nonExactCount) // % solved varies by number of letter slots available
                break
            case INVALID_LETTER:
                guessScore += invalidLetterScore // % solved varies by number of letters remaining to guess
                break
        }
    }

    return guessScore
}

function findBestGuesses(words) {
    const guesses = []
    const lettersLeft = remainingLetters(words)

    for (const word of words) {
        let score = 0

        for (const guess of words) {
            if (guess === word) {
                continue
            }

            const scores = calculateScore(word, guess)
            score += calculateGuessScore(scores, lettersLeft)
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

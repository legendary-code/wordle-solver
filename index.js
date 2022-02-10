let words = []
let guesses = []
let guessIndex = 0
let count = 0

function showError(message) {
    $('#content').html(`<span class="error">${message}</span>`)
}

function start() {
    const wordsLeft = words.length
    const wordsLeftText = wordsLeft.toLocaleString() + ' word' + (wordsLeft === 1 ? '' : 's') + ' left'
    $('#content').append($(`<div id="word-count">${wordsLeftText}</div>`))

    appendNextWord()
    guesses = words
    receivedGuesses()
}

function findNextGuesses() {
    appendNextWord()

    const worker = new Worker('worker.js')
    worker.onmessage = function (e) {
        guesses = e.data
        guessIndex = 0

        receivedGuesses()

        worker.terminate()
    }

    worker.postMessage({'action': 'guess', 'words': words})
}

function receivedGuesses() {
    if (guesses.length > 1) {
        $('#content').append($(`<div id="submit-guess"><button onclick="submitGuess()">Next Guess</button></div>`))
    } else {
        $('#content').append($(`<div id="reset"><button onclick="reset()">Reset</button></div>`))
    }

    if (guesses.length > 1) {
        updateNextGuess()
    } else {
        $(`#word-${count}`).remove()
    }
}

function prevGuess() {
    if (guessIndex > 0) {
        guessIndex--
        updateNextGuess()
    }
}

function nextGuess() {
    if (guessIndex < guesses.length - 1) {
        guessIndex++
        updateNextGuess()
    }
}

function updateNextGuess() {
    const guess = guesses[guessIndex]

    for (let i = 0; i < 5; ++i) {
        const elem = $(`#letter-${count}-${i}`)
        elem.removeClass('pending')

        if (guesses.length === 1) {
            elem.removeClass('valid')
            elem.addClass('exact')
            elem.removeClass('invalid')
        } else {
            elem.removeClass('valid')
            elem.removeClass('exact')
            elem.addClass('invalid')
        }

        elem.text(guess.charAt(i).toUpperCase())
    }

    const prev = $(`#prev-${count}`)
    if (guessIndex > 0) {
        prev.removeClass('disabled')
        prev.addClass('enabled')
    } else {
        prev.removeClass('enabled')
        prev.addClass('disabled')
    }

    const next = $(`#next-${count}`)
    if (guessIndex < guesses.length - 1) {
        next.removeClass('disabled')
        next.addClass('enabled')
    } else {
        next.removeClass('enabled')
        next.addClass('disabled')
    }

    if (guesses.length === 1) {
        prev.remove()
        next.remove()
    }
}

function countLetter(word, letter) {
    let count = 0
    for (let c of word) {
        if (c === letter) {
            count++
        }
    }
    return count
}

function filterWords() {
    let guess = ''
    const guessScore = []

    for (let i = 0; i < 5; i++) {
        const elem = $(`#letter-${count}-${i}`)
        guess += elem.text().toLowerCase()

        if (elem.hasClass('invalid')) {
            guessScore.push(INVALID_LETTER)
        } else if (elem.hasClass('valid')) {
            guessScore.push(VALID_LETTER)
        } else if (elem.hasClass('exact')) {
            guessScore.push(EXACT_LETTER)
        }
    }

    words = words.filter(word => {
        const score = calculateScore(word, guess)

        for (let i = 0; i < 5; i++) {
            if (score[i] !== guessScore[i]) {
                return false
            }
        }

        return true
    })

    count++
    findNextGuesses()
}

function submitGuess() {
    $(`#prev-${count}`).remove()
    $(`#next-${count}`).remove()
    $(`#submit-guess`).remove()

    filterWords()

    const wordsLeft = words.length
    const wordsLeftText = wordsLeft.toLocaleString() + ' word' + (wordsLeft === 1 ? '' : 's') + ' left'
    $('#word-count').text(wordsLeftText)
}

function toggleGuessLetter(elem) {
    if (elem.hasClass('invalid')) {
        elem.removeClass('invalid')
        elem.addClass('valid')
    } else if (elem.hasClass('valid')) {
        elem.removeClass('valid')
        elem.addClass('exact')
    } else if (elem.hasClass('exact')) {
        elem.removeClass('exact')
        elem.addClass('invalid')
    }
}

function appendNextWord() {
    const frame = $('<div>')

    const wordBox = $(`<div class="word" id="word-${count}">`)
    frame.append(wordBox)

    const prev = $(`<div class="arrows disabled" id="prev-${count}">&larr;</div>`)
    prev.on('click', prevGuess)
    wordBox.append(prev)

    for (let i = 0; i < 5; ++i) {
        const letter = $(`<div class="letter pending" style="animation-delay: ${i/5}s" id="letter-${count}-${i}">?</div>`)
        letter.on('click', () => toggleGuessLetter(letter))
        wordBox.append(letter)
    }

    const next = $(`<div class="arrows disabled" id="next-${count}">&rarr;</div>`)
    next.on('click', nextGuess)
    wordBox.append(next)

    $('#content').append(frame)
}

function reset() {
    $('#content').html('')

    guesses = []
    guessIndex = 0
    count = 0

    const lang = navigator.language.split('-')[0]
    const wordFile = `words/${lang}.js`

    $.getScript(wordFile)
        .done(() => {
            words = wordlist
            start()
        })
        .fail(() => {
            showError(`Language ${lang} not supported!`)
        })
}

$(document).ready(() => {
    reset()
})

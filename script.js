const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
let currentGuess = "";
let currentRow = 0;
let gameOver = false;
const solution = words[Math.floor(Math.random() * words.length)];
console.log("Solution:", solution); // Debug
const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const keyboardState = {}; // Track key colors

const resultModal = document.getElementById("resultModal");
const resultTitle = document.getElementById("resultTitle");
const resultWord = document.getElementById("resultWord").querySelector("span");
const shareOutput = document.getElementById("shareOutput");
const shareBtn = document.getElementById("shareBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const grid = document.getElementById("board");


closeModalBtn.addEventListener("click", () => resultModal.classList.add("hidden"));
playAgainBtn.addEventListener("click", () => location.reload());

shareBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(shareOutput.value).then(() => {
    shareBtn.textContent = "Copied!";
    setTimeout(() => shareBtn.textContent = "Share", 2000);
  });
});


// Build board
for (let i = 0; i < MAX_ATTEMPTS; i++) {
  const row = document.createElement("div");
  row.className = "grid grid-cols-5 gap-1";
  for (let j = 0; j < WORD_LENGTH; j++) {
    const tile = document.createElement("div");
    tile.className =
      "w-14 h-14 border-2 border-gray-800 flex items-center justify-center text-2xl font-bold uppercase bg-gray-900";
    row.appendChild(tile);
  }
  board.appendChild(row);
}
// Keyboard layout
const layout = [
  [..."QWERTYUIOP"],
  [..."ASDFGHJKL"],
  ["Enter", ..."ZXCVBNM", "←"]
];
layout.forEach((row) => {
  const rowDiv = document.createElement("div");
  rowDiv.className = "flex justify-center gap-1";
  row.forEach((key) => {
    const btn = document.createElement("button");
    btn.textContent = key;
    btn.dataset.key = key;
    btn.className =
      "bg-gray-600 text-white font-bold py-2 px-3 rounded text-sm sm:text-base hover:opacity-90";
    btn.addEventListener("click", () => handleKey(key));
    rowDiv.appendChild(btn);
    if (key.length === 1) keyboardState[key] = "default";
  });
  keyboard.appendChild(rowDiv);
});
document.addEventListener("keydown", (e) => {
  if (gameOver) return;
  const key = e.key;
  if (/^[a-zA-Z]$/.test(key)) {
    handleKey(key.toUpperCase());
  } else if (key === "Enter") {
    handleKey("Enter");
  } else if (key === "Backspace") {
    handleKey("←");
  }
});
function handleKey(key) {
  if (gameOver) return;
  if (key === "Enter") {
    submitGuess();
  } else if (key === "←") {
    removeLetter();
  } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
    addLetter(key);
  }
}
function addLetter(letter) {
  const row = board.children[currentRow];
  const tile = row.children[currentGuess.length];
  tile.textContent = letter;
  currentGuess += letter.toLowerCase();
}
function removeLetter() {
  if (currentGuess.length === 0) return;
  const row = board.children[currentRow];
  const tile = row.children[currentGuess.length - 1];
  tile.textContent = "";
  currentGuess = currentGuess.slice(0, -1);
}
function submitGuess() {
  if (currentGuess.length < WORD_LENGTH) return;
  if (!words.includes(currentGuess)) {
    alert("Not in word list!");
    return;
  }
  const row = board.children[currentRow];
  const solutionArray = solution.split("");
  const guessArray = currentGuess.split("");
  const result = Array(WORD_LENGTH).fill("absent");
  // First pass - correct letters
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArray[i] === solutionArray[i]) {
      result[i] = "correct";
      solutionArray[i] = null;
    }
  }
  // Second pass - present letters
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const index = solutionArray.indexOf(guessArray[i]);
    if (index !== -1) {
      result[i] = "present";
      solutionArray[index] = null;
    }
  }
  // Update board
  for (let i = 0; i < WORD_LENGTH; i++) {
    const tile = row.children[i];
    const letter = guessArray[i].toUpperCase();
    setTimeout(() => {
      tile.classList.add("flip");
      tile.classList.remove("bg-gray-900", "border-gray-800");
      if (result[i] === "correct") {
        tile.classList.add("bg-green-600", "text-white");
        updateKeyColor(letter, "correct");
      } else if (result[i] === "present") {
        tile.classList.add("bg-yellow-500", "text-white");
        updateKeyColor(letter, "present");
      } else {
        tile.classList.add("bg-gray-800", "text-white");
        updateKeyColor(letter, "absent");
      }
      tile.addEventListener("animationend", () => {
        tile.classList.remove("flip");
      }, { once: true });
    }, i * 300); // animate one by one
  }
  if (currentGuess === solution) {
    setTimeout(() => {
      showModal(true);
    }, 1500);
    gameOver = true;
  } else if (currentRow === MAX_ATTEMPTS - 1) {
    setTimeout(() => {
      showModal(false);
    }, 100);
    gameOver = true;
  }
  currentRow++;
  currentGuess = "";
}

function showModal(won) {
  resultTitle.textContent = won ? "🎉 You Win!" : "❌ Game Over";
  resultWord.textContent = solution.toUpperCase();
  shareOutput.value = generateShareGrid();
  resultModal.classList.remove("hidden");
}

function generateShareGrid() {
  let output = `Wordle Clone - ${currentRow + 1}/${MAX_ATTEMPTS}\n\n`;

  for (let r = 0; r <= currentRow; r++) {
    const row = grid.children[r];
    const guess = row.textContent;
    const result = getGuessResult(guess.toLowerCase());

    for (let i = 0; i < guess.length; i++) {
      if (result[i] === "correct") {
        output += "🟩";
      } else if (result[i] === "present") {
        output += "🟨";
      } else {
        output += "⬛";
      }
    }
    output += "\n";
  }

  return output;
}

function getGuessResult(guess) {
  const result = Array(5).fill("absent");
  const solutionArray = solution.split("");
  const guessArray = guess.split("");

  // First pass: correct letters
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] === solutionArray[i]) {
      result[i] = "correct";
      solutionArray[i] = null; // Prevent double matching
      guessArray[i] = null;
    }
  }

  // Second pass: present letters
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] && solutionArray.includes(guessArray[i])) {
      result[i] = "present";
      solutionArray[solutionArray.indexOf(guessArray[i])] = null;
    }
  }

  return result;
}


function updateKeyColor(letter, state) {
  const keyButton = document.querySelector(`button[data-key="${letter}"]`);
  const priority = { correct: 3, present: 2, absent: 1, default: 0 };
  if (priority[state] > priority[keyboardState[letter]]) {
    keyboardState[letter] = state;
    keyButton.classList.remove("bg-gray-600", "bg-yellow-500", "bg-green-600", "bg-gray-800");
    if (state === "correct") keyButton.classList.add("bg-green-600");
    else if (state === "present") keyButton.classList.add("bg-yellow-500");
    else if (state === "absent") keyButton.classList.add("bg-gray-800");
  }
}

const restartBtn = document.getElementById("restart");
restartBtn.addEventListener("click", () => {
  location.reload(); // simple reset
});

const themeToggle = document.getElementById("themeToggle");
const soundToggle = document.getElementById("soundToggle");
let isDark = true;
let isSoundOn = true;
// Toggle theme
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("bg-gray-900");
  document.body.classList.toggle("bg-white");
  document.body.classList.toggle("text-white");
  document.body.classList.toggle("text-black");
  document.querySelectorAll(".tile").forEach(tile => {
    tile.classList.toggle("border-gray-800");
    tile.classList.toggle("border-gray-300");
  });
  themeToggle.textContent = isDark ? "Dark Mode" : "Light Mode";
  isDark = !isDark;
});
// Toggle sound
soundToggle.addEventListener("click", () => {
  isSoundOn = !isSoundOn;
  soundToggle.textContent = `Sound: ${isSoundOn ? "On" : "Off"}`;
});
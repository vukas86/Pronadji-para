let startTime = 0;
let timerInterval;
let bestTime = localStorage.getItem("bestTime")
  ? parseFloat(localStorage.getItem("bestTime"))
  : null;
let elapsedTime = 0;

document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("startScreen");
  const gameBoard = document.getElementById("gameBoard");
  const levelButtons = document.querySelectorAll(".level-buttons button");
  const timerElement = document.getElementById("timer"); // Timer element
  const backButton = document.getElementById("backButton");
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let currentLevel = "";

  backButton.style.display = "none"; // Sakrij BACK dugme na početku

  // Function to initialize the game with a specific level
  function initializeGame(level) {
    startScreen.style.display = "none";
    gameBoard.style.display = "block";
    timerElement.style.display = "block";
    backButton.style.display = "block";

    currentLevel = level;
    let cardValues = [];

    switch (level) {
      case "easy":
        cardValues = [
          "img1.png",
          "img2.png",
          "img7.png",
          "img4.png",
          "img1.png",
          "img2.png",
          "img7.png",
          "img4.png",
        ];
        break;
      case "medium":
        cardValues = [
          "img1.png",
          "img2.png",
          "img3.png",
          "img4.png",
          "img5.png",
          "img6.png",
          "img1.png",
          "img2.png",
          "img3.png",
          "img4.png",
          "img5.png",
          "img6.png",
        ];
        break;
      case "hard":
        cardValues = [
          "img1.png",
          "img2.png",
          "img3.png",
          "img4.png",
          "img5.png",
          "img6.png",
          "img7.png",
          "img8.png",
          "img1.png",
          "img2.png",
          "img3.png",
          "img4.png",
          "img5.png",
          "img6.png",
          "img7.png",
          "img8.png",
        ];
        break;
    }

    cards = shuffle(cardValues).map((value) => ({
      value,
      flipped: false,
      matched: false,
    }));
    flippedCards = [];
    matchedPairs = 0;

    startTime = Date.now(); // Start the timer
    elapsedTime = 0;

    clearInterval(timerInterval); // Reset any previous timer
    timerInterval = setInterval(updateTimer, 1000);

    renderCards();
  }

  backButton.addEventListener("click", () => {
    stopTimer();
    gameBoard.style.display = "none";
    startScreen.style.display = "block";
    backButton.style.display = "none"; // Sakrij BACK dugme kada se vrati na početni ekran
    elapsedTime = 0;
    timerElement.textContent = `00:00`;
    timerElement.style.display = `none`;
  });

  // Function to shuffle array (Fisher-Yates shuffle)
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Function to render cards on the game board
  function renderCards() {
    gameBoard.innerHTML = "";
    cards.forEach((card, index) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");
      cardElement.dataset.index = index;

      const cardInner = document.createElement("div");
      cardInner.classList.add("card-inner");

      const cardFront = document.createElement("div");
      cardFront.classList.add("card-front");

      const cardBack = document.createElement("div");
      cardBack.classList.add("card-back");

      // Add image to card-back
      const imgElement = document.createElement("img");
      imgElement.src = `assets/${card.value}`;
      imgElement.alt = `Memory Card`;
      imgElement.style.width = `100%`;
      imgElement.style.height = `100%`;

      cardBack.appendChild(imgElement);
      cardInner.appendChild(cardFront);
      cardInner.appendChild(cardBack);
      cardElement.appendChild(cardInner);

      if (card.flipped) {
        cardElement.classList.add("flipped");
      }
      if (card.matched) {
        cardElement.classList.add("matched");
      }

      cardElement.addEventListener("click", flipCard);
      gameBoard.appendChild(cardElement);
    });
  }

  // Function to handle card flipping
  function flipCard() {
    const cardIndex = this.dataset.index;
    const card = cards[cardIndex];

    if (!card.flipped && flippedCards.length < 2 && !card.matched) {
      card.flipped = true;
      flippedCards.push(cardIndex);
      renderCards();

      if (flippedCards.length === 2) {
        setTimeout(checkMatch, 700);
      }
    }
  }

  // Function to check if the flipped cards match
  function checkMatch() {
    const card1Index = flippedCards[0];
    const card2Index = flippedCards[1];
    const card1 = cards[card1Index];
    const card2 = cards[card2Index];

    if (card1.value === card2.value) {
      card1.matched = true;
      card2.matched = true;
      matchedPairs++;
    } else {
      card1.flipped = false;
      card2.flipped = false;
    }

    flippedCards = [];
    renderCards();

    if (matchedPairs === cards.length / 2) {
      clearInterval(timerInterval); // Zaustavljamo tajmer

      const finalTime = elapsedTime.toFixed(1);
      let message = `Пронашао си парове за ${finalTime} секунди.`;

      if (!bestTime || finalTime < bestTime) {
        bestTime = finalTime;
        localStorage.setItem("bestTime", bestTime);
        message += `<br><strong>НОВИ РЕКОРД!</strong> Најбоље време: ${bestTime} секунди`;
      }

      // Prikazujemo poruku u popup-u
      document.getElementById("popup-message").innerHTML = message;
      document.getElementById("popup").style.display = "flex";

      // Sakrijemo tajmer, dugme "BACK" i prikažemo početni ekran kada se popup zatvori
      document.getElementById("closePopup").onclick = function () {
        document.getElementById("popup").style.display = "none";
        timerElement.style.display = "none";
        startScreen.style.display = "block";
        gameBoard.style.display = "none";
        backButton.style.display = "none";
      };
    }
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  // Event listeners for level buttons
  levelButtons.forEach((button) => {
    button.addEventListener(`click`, function () {
      const level = this.dataset.level;
      initializeGame(level);
    });
  });

  // Event listener for back button
  backButton.addEventListener("click", () => {
    stopTimer(); // Stop the timer
    gameBoard.style.display = "none";
    startScreen.style.display = "block"; // Show the start screen again
    elapsedTime = 0; // Reset elapsed time
    timerElement.textContent = `00:00`; // Reset timer display
    timerElement.style.display = `none`; // Hide timer circle
  });

  // Timer update function
  function updateTimer() {
    elapsedTime += 1; // Povećava vreme

    let minutes = Math.floor(elapsedTime / 60);
    let seconds = elapsedTime % 60;

    // Formatiraj da uvek ima dve cifre (dodaj nulu ispred ako je broj < 10)
    let formattedTime = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

    timerElement.textContent = `Време: ${formattedTime}`;
  }
});

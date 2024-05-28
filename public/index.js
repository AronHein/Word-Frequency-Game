let score = 0;
let pexelsAPIKey = "";

document.addEventListener("DOMContentLoaded", async function () {
  await fetchPexelsApiKey();
  initializeGame();
});

function initializeGame() {
  const higherButton = document.getElementById("higher");
  const lowerButton = document.getElementById("lower");
  higherButton.addEventListener("click", handleButtonClick);
  lowerButton.addEventListener("click", handleButtonClick);

  fetchNewWord("left-side");
  fetchNewWord("right-side");
  fetchNewWord("off-screen");
}

async function fetchPexelsApiKey() {
  try {
    const response = await fetch("/pexelsApiKey");
    const data = await response.json();
    pexelsAPIKey = data.apiKey;
  } catch (error) {
    console.error("Failed to fetch Pexels API Key:", error);
  }
}

function fetchNewWord(side) {
  return fetch("/randomWord")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      return response.json();
    })
    .then((data) => {
      const wordElement = document.querySelector(`.${side} .word`);
      const valueElement = document.querySelector(`.${side} .value`);
      const definitionElement = document.querySelector(`.${side} .definition`);

      wordElement.textContent = '"' + data.word + '"';
      valueElement.textContent = data.value;

      fetchDefinition(data.word)
        .then((definition) => {
          definitionElement.textContent = "Definition: " + definition;
        })
        .catch((error) => {
          console.error(error);
        });

      getImageUrl(data.word)
        .then((imageUrl) => {
          const sideElement = document.querySelector("." + side);
          sideElement.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.50)), url(${imageUrl})`;
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });

      return data;
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

function swapImages() {
  const rightSide = document.querySelector(".right-side");
  const offScreenSide = document.querySelector(".off-screen");
  const higherButton = document.getElementById("higher");
  const lowerButton = document.getElementById("lower");

  const rightWord = document.querySelector(".right-side .word").textContent;
  const rightValue = document.querySelector(".right-side .value").textContent;
  const rightDefinition = document.querySelector(".right-side .definition").textContent;
  const rightImageUrl = document.querySelector(".right-side").style.backgroundImage;

  const offWord = document.querySelector(".off-screen .word").textContent;
  const offValue = document.querySelector(".off-screen .value").textContent;
  const offDefinition = document.querySelector(".off-screen .definition").textContent;
  const offImageUrl = document.querySelector(".off-screen").style.backgroundImage;

  rightSide.classList.add("transitioning");
  offScreenSide.classList.add("transitioning");

  higherButton.style.display = "none";
  lowerButton.style.display = "none";
  rightSide.style.transform = "translateX(-100%)";
  offScreenSide.style.transform = "translateX(-100%)";

  setTimeout(() => {
    rightSide.classList.remove("transitioning");
    offScreenSide.classList.remove("transitioning");
    rightSide.style.transform = "translateX(0)";
    offScreenSide.style.transform = "translateX(0)";
  }, 500);
  setTimeout(() => {
    document.querySelector(".right-side .value").style.display = "none";
    document.querySelector(".left-side .word").textContent = rightWord;
    document.querySelector(".left-side .value").textContent = rightValue;
    document.querySelector(".left-side .definition").textContent = rightDefinition;
    document.querySelector(".left-side").style.backgroundImage = rightImageUrl;

    document.querySelector(".right-side .word").textContent = offWord;
    document.querySelector(".right-side .value").textContent = offValue;
    document.querySelector(".right-side .definition").textContent = offDefinition;
    document.querySelector(".right-side").style.backgroundImage = offImageUrl;

    higherButton.style.display = "block";
    lowerButton.style.display = "block";
    document.getElementById("right-times-per").style.display = "none";

    fetchNewWord("off-screen");
  }, 500);
}

function fetchDefinition(fetchedWord) {
  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${fetchedWord}`;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const definition = data[0]?.meanings[0]?.definitions[0]?.definition;
      if (definition) {
        return definition;
      } else {
        return "Definition not found.";
      }
    })
    .catch(() => {
      return "Definition error.";
    });
}

function getImageUrl(keyword) {
  const url = `https://api.pexels.com/v1/search?query=${keyword}&per_page=1`;

  return fetch(url, {
    headers: {
      Authorization: pexelsAPIKey,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.photos.length === 0) {
        console.log("No image found for the given keyword");
        return "https://sciences.ucf.edu/psychology/wp-content/uploads/sites/2/2019/08/No-Image-Available.png";
      }
      return data.photos[0].src.large;
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

function handleButtonClick(event) {
  document.getElementById("higher").style.display = "none";
  document.getElementById("lower").style.display = "none";
  const rightValue = parseFloat(document.querySelector(".right-side .value").textContent);
  const leftValue = parseFloat(document.querySelector(".left-side .value").textContent);

  const isCorrect =
    (event.target.id === "higher" && rightValue >= leftValue) ||
    (event.target.id === "lower" && rightValue <= leftValue);

  document.querySelector(".right-side .value").style.display = "block";
  document.getElementById("right-times-per").style.display = "block";

  if (isCorrect) {
    score++;

    animateVSIndicator("green");
  } else {
    animateVSIndicator("red");
    setTimeout(function () {
      handleGameOver();
      return;
    }, 1250);
  }
  setTimeout(function () {
    document.getElementById("score").textContent = `Score: ${score}`;
    swapImages();
  }, 1250);
}

function handleGameOver() {
  const gifLowScore = "https://media1.tenor.com/m/3_5u54pgchgAAAAC/zach-galifianakis-funny-laugh.gif";
  const gifMediumScore = "https://media1.tenor.com/m/WuDNxJBDte8AAAAC/eh-meh.gif";
  const gifHighScore = "https://media1.tenor.com/m/J_nTashUkk4AAAAC/jaw-drop-shocked.gif";

  const gifInfo = document.getElementById("gif-info");
  const imagesInfo = document.getElementById("images-info");
  const frequencyInfo = document.getElementById("frequency-info");
  const definitionsInfo = document.getElementById("definitions-info");
  const scoreElement = document.getElementById("score");
  const gameOver = document.querySelector(".game-over");
  const container = document.querySelector(".container");

  gifInfo.style.display = "block";
  imagesInfo.style.display = "none";
  frequencyInfo.style.display = "none";
  definitionsInfo.style.display = "none";
  scoreElement.style.display = "none";

  let gifUrl;
  if (score <= 4) {
    gifUrl = gifLowScore;
  } else if (score <= 9) {
    gifUrl = gifMediumScore;
  } else {
    gifUrl = gifHighScore;
  }

  gameOver.style.display = "block";
  gameOver.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.20), rgba(0, 0, 0, 0.20)), url(${gifUrl})`;
  document.querySelector(".game-over .value").innerHTML = score;
  container.innerHTML = "";

  const playAgainButton = document.getElementById("play-again-button");
  playAgainButton.addEventListener("click", playAgain);
}

function animateVSIndicator(color) {
  const indicator = document.querySelector(".vs-indicator");
  indicator.style.backgroundColor = color;
  indicator.style.transition = "background-color 0.5s ease-in-out";
  indicator.addEventListener("transitionend", () => {
    indicator.style.backgroundColor = "white";
  });
}

function playAgain() {
  location.reload();
}

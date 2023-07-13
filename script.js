        var typedText = "GhosT";
        var isTyping = false;

        function typeWriter(text, i) {
            if (i < text.length) {
                document.getElementById("typing-animation").textContent += text.charAt(i);
                i++;
                setTimeout(function() { typeWriter(text, i); }, 100);
            } else {
                setTimeout(function() { backspaceText(text); }, 3000);
            }
        }

        function backspaceText(text) {
            var typedElement = document.getElementById("typing-animation");
            var typedText = typedElement.textContent;

            if (typedText.length > 0) {
                typedElement.textContent = typedText.substring(0, typedText.length - 1);
                setTimeout(function() { backspaceText(text); }, 100);
            } else {
                setTimeout(function() { typeWriter(text, 0); }, 1000);
            }
        }

        function playBackgroundMusic() {
            var backgroundMusic = document.getElementById("background-music");
            backgroundMusic.play();
            backgroundMusic.volume = 0.05; // Volume

            // Remove the event listener to prevent the music from playing again
            document.removeEventListener("click", playBackgroundMusic);

            // Show the label container
            var labelContainer = document.getElementById("label-container");
            labelContainer.classList.add("show");
        }

        document.addEventListener("click", function() {
            if (!isTyping) {
                //var overlay = document.getElementById("overlay");
                //overlay.style.display = "none";
                var overlay = document.getElementById("overlay");
                overlay.classList.add("hidden");
                playBackgroundMusic();
                document.getElementById("typing-animation").classList.remove("hidden");
                var skyoverlay = document.getElementById("sky-overlay");
                skyoverlay.classList.add("hidden");
                typeWriter(typedText, 0);
                isTyping = true;
            }
        });

        function randomIntFromInterval(min, max) {
          return Math.floor(Math.random() * (max - min + 1) + min);
        }
        // Thanks to Francisc on StackOverflow for this useful function
        // https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript

        function generateRain() {
          document.querySelector(".sky").replaceChildren();
          for (let i = 0; i < 800; i++) {
            let opacity = randomIntFromInterval(25, 50);
            let top = randomIntFromInterval(-100, -20);
            let left = randomIntFromInterval(1, 100);
            let offsetX = randomIntFromInterval(-3, 3);
            let offsetY = randomIntFromInterval(-3, 3);
            let delay = randomIntFromInterval(0, 4000);
           let raindrop = document.createElement("div");
            raindrop.classList.add("raindrop");
            raindrop.style.opacity = `${opacity}%`;
            raindrop.style.top = `${top}%`;
            raindrop.style.left = `${left}%`;
            raindrop.style.transform = `translate(${offsetX}px, ${offsetY}px`;
            raindrop.style.animationDelay = `${delay}ms`;
            document.querySelector(".sky").appendChild(raindrop);
          }
        }

        generateRain();
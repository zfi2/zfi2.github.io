var typedText = "GhosT";
var isTyping = false;

// Script for the typing animation
function typeWriter(text, i) {
    if (i < text.length) {
        document.getElementById("typing-animation").textContent += text.charAt(i);
        i++;
        setTimeout(function() { typeWriter(text, i); }, 100);
    } else {
        setTimeout(function() { backspaceText(text); }, 3000);
    }
}

// Script for gradually removing the text during the typing animation
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

// Hide the "click anywhere to exit" overlay
function hideOverlay() {
    var overlay = document.getElementById("overlay");
    var video = document.getElementById("intro-video");
    overlay.classList.add("fade-out");

    video.pause();
    video.currentTime = 0;

    var bottomLabel = document.getElementById("bottom-label");
    bottomLabel.style.opacity = 0.5;
}

// Script for playing the background music
function playBackgroundMusic() {
    var backgroundMusic = document.getElementById("background-music");
    backgroundMusic.play();
    backgroundMusic.volume = 0.1;

    document.removeEventListener("click", playBackgroundMusic);
}

/*
Hide the overlay and play the background music upon clicking
anywhere on the page, also start the typing animation
*/
document.addEventListener("click", function() {
    if (!isTyping) {
        hideOverlay();
        playBackgroundMusic();
        document.getElementById("typing-animation").classList.remove("hidden");
        typeWriter(typedText, 0);
        isTyping = true;
    }
});
// Hide the "click anywhere to exit" overlay
function hideOverlay() {
    var video = document.getElementById("background-video");
    video.style.opacity = 0.35;

    var overlay = document.getElementById("overlay");
    overlay.classList.add("fade-out");

    // God damn this is a mess...
    var topLabel = document.getElementById("top-label");
    topLabel.style.opacity = 0.5;

    var socialLinks = document.getElementById("social-links");
    socialLinks.style.opacity = 0.5
    socialLinks.style.zIndex = 999;

    var widget = document.getElementById("c_widget");
    widget.style.opacity = 0.5

    video.play();
    video.muted = false;
    video.volume = 0.4;
}

function startSentenceRain() {
    const sentence = "do not worry"; // Your sentence here

    function createSentence() {
        // Create a new sentence element
        const sentenceElement = $("<div class='sentence glitch-effect'></div>").text(sentence);
        
        // Set random initial position
        const startPositionX = Math.random() * $(window).width(); // Random horizontal position
        const startPositionY = -50 - Math.random() * 200; // Random vertical position above viewport
        
        sentenceElement.css({
            top: startPositionY + "px",
            left: startPositionX + "px",
        });
        
        // Append sentence to container
        $(".sentence-rain").append(sentenceElement);
        
        // Animate falling and fading out
        sentenceElement.animate({
            top: $(window).height() + "px", // Falls to the bottom of the viewport
            opacity: 0 // Fades out completely
        }, 5000, "linear", function() {
            $(this).remove(); // Remove the sentence after animation completes
        });
    }

    // Create sentences at intervals for the raining effect
    setInterval(createSentence, 250); // Adjust timing as needed
}


/*
Hide the overlay and play the background music upon clicking
anywhere on the page, also start the typing animation
*/
document.addEventListener("click", function() {
    hideOverlay();
    startSentenceRain();
});



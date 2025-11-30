const nameElement = document.getElementById('name');
const fullName = "Temulen Iveelt"; // Updated to match your name
const internElement = document.getElementById('internships');
const fullInternTxt = "[ Open to Summer 2026 Internships ]";
let i=0;
let j=0;

nameElement.innerText = ""; // Clear it initially
internElement.innerText = "";

function typeWriter() {
    if (i < fullName.length) {
        nameElement.innerText += fullName.charAt(i);
        i++;
        setTimeout(typeWriter, 150); // Speed of typing
    }
}

function typeWriter2() {
    if (j < fullInternTxt.length) {
        internElement.innerText += fullInternTxt.charAt(j);
        j++;
        setTimeout(typeWriter2, 70); // Speed of typing
    }
}

// Start typing after a slight delay
setTimeout(typeWriter, 200);
setTimeout(typeWriter2, 400);

// Music configuration
const music = document.getElementById('music');
const btn = document.getElementById('music-btn');

btn.addEventListener('click', () => {
    if (music.paused) {
        music.play();
        btn.innerHTML = "❚❚ Pause Music"; // Change text to Pause
    } else {
        music.pause();
        btn.innerHTML = "▶ Play Music"; // Change text back to Play
    }
});
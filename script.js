// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image'); // canvas
const context = canvas.getContext('2d'); // canvas context for drawing

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  console.log("load event");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  // if the image is blank, there is no image so clear button is disabled
  if (img.src == "") {
    document.querySelector("[type='reset']").disabled = true;
  // if not, then enable the clear button and draw the image
  } else {
    document.querySelector("[type='reset']").disabled = false;
    // image dimensions generated by helper function
    let dims = getDimensions(canvas.width, canvas.height, img.width, img.height);
    // draw the image
    context.drawImage(img, dims.startX, dims.startY, dims.width, dims.height);
  }
});

// Fires whenever the file input changes value (new image uploaded or file cleared)
document.getElementById("image-input").addEventListener('change', function(e) {
  console.log("input event");
  img.src = URL.createObjectURL(e.target.files[0]);;
});

// Fires whenever the meme generator form is submitted
document.getElementById("generate-meme").addEventListener('submit', function(e) {
  console.log("submit event");
  let toptext = document.getElementById('text-top').value.toUpperCase(); // capitalized top text
  let bottext = document.getElementById('text-bottom').value.toUpperCase(); // capitalized bottom text
  // align and draw text
  let spacing = canvas.height * 0.05; // vertical padding for text
  context.textAlign = "center";
  context.font = "30px Arial"; 
  context.fillText(toptext, canvas.width/2, spacing);
  context.fillText(bottext, canvas.width/2, canvas.height-spacing);
  // toggle relevant buttons
  document.querySelector("[type='submit']").disabled = true;
  document.querySelector("[type='reset']").disabled = false;
  document.querySelector("[type='button']").disabled = false;
  document.getElementById("voice-selection").disabled = false;
});

// Fires whenever the clear button is clicked
document.querySelector("[type='reset']").addEventListener('click', function() {
  console.log("clear event");
  context.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
  // toggle relevant buttons
  document.querySelector("[type='submit']").disabled = false;
  document.querySelector("[type='reset']").disabled = true;
  document.querySelector("[type='button']").disabled = true;
  document.getElementById("voice-selection").disabled = true;
});

// Fires whenever the read text button is clicked
document.querySelector("[type='button']").addEventListener('click', function() {
  
  console.log("read event");
  let toptext = document.getElementById('text-top').value; // top text
  let bottext = document.getElementById('text-bottom').value; // bottom text
  speak(toptext);
  speak(bottext);
});

// Adjusts volume icon depending on the current value of the slider
document.querySelector("[type='range']").addEventListener('input', function(e) {
  console.log("range event");
  let icon = document.querySelector("#volume-group img");
  if (e.target.value >= 67) {
    icon.src = 'icons/volume-level-3.svg';
  } else if (e.target.value < 67 && e.target.value >= 34) {
    icon.src = 'icons/volume-level-2.svg';
  } else if (e.target.value < 34 && e.target.value >= 1) {
    icon.src = 'icons/volume-level-1.svg';
  } else {
    icon.src = 'icons/volume-level-0.svg';
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

// Speech synthesis voice list population function
function populateVoiceList() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }
  var voices = speechSynthesis.getVoices();
  for(let i = 0; i < voices.length; i++) {
    let option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }
    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    document.getElementById("voice-selection").appendChild(option);
  }
}

// Speech synthesis function
function speak(txt) {
  let speech = new SpeechSynthesisUtterance(txt);
  speech.volume = document.querySelector("[type='range']").value.valueAsNumber()/100; // set volume based on value of the slider
  // check which voice to use
  let selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(let i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      speech.voice = voices[i];
    }
  }
  window.speechSynthesis.speak(speech);
}
let hand;
let video;
let hands = [];
let connections;
let running = false;
let modelReady = false;

function gotResult(results) {
  if (running) {
    hands = results;
  }
}

function setup() {
  let canvasWidth, canvasHeight;
    canvasWidth = 640;
    canvasHeight = 480;

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('sketch-holder');

  hand = ml5.handPose({ flipped: true }, () => {
    document.getElementById("status").innerText = "Model loaded.";
    modelReady = true;
  });

  noLoop();
}

function draw() {
  if (!running) return;

  image(video, 0, 0, width, height);

  if (hands.length > 0) {
    let lhand = null;

    // Identify the Left Hand from the hands array
    for (let hand of hands) {
      if (hand.handedness === 'Left') {
        lhand = {
          thumb: hand.keypoints[4],
          index: hand.keypoints[8]
        };
        break;
      }
    }

    if (lhand) {
      let thumb = lhand.thumb;
      let index = lhand.index;

      // Calculate center point and distance
      let centerX = (index.x + thumb.x) * 0.5;
      let centerY = (index.y + thumb.y) * 0.5;
      let d = dist(thumb.x, thumb.y, index.x, index.y);


      if (d < 30) {
        fill(255, 0, 0); 
      } else {
        fill(0, 255, 0);
      }
      circle(centerX, centerY, 15);

      if (typeof updateSynthFromVision === "function") {
        let xNorm = centerX / width;
        let yNorm = 1 - (centerY / height);
        
        let isApart = d > 30; 
        updateSynthFromVision(xNorm, yNorm, isApart);
      }
    }
  } else {
    // If no hands are seen at all, tell the synth to stop
    if (typeof updateSynthFromVision === "function") {
      updateSynthFromVision(0, 0, false); 
    }
  }
}


function startVision() {
  if (!modelReady || running) return;

  video = createCapture(VIDEO, { flipped: true });
  video.size(width, height);
  video.hide();
    
  hand.detectStart(video, gotResult);
  connections = hand.getConnections();

  running = true;
  loop();
}

function stopVision() {
  if (!running) return;

  running = false;
  noLoop();
  hands = [];

  if (video && video.elt && video.elt.srcObject) {
    video.elt.srcObject.getTracks().forEach(track => track.stop());
  }

  clear();
}

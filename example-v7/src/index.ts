import {
  Application,
  Assets,
  Graphics,
  HTMLText,
  HTMLTextStyle,
  Sprite,
  TextStyle,
} from "pixi.js";

const imagePaths = {
  "green_pipe.webp": "green_pipe.webp",
  "blue_pipe.webp": "blue_pipe.webp",
  "gold_moon.webp": "gold_moon.png",
};

async function init(app: Application) {

// Create a Graphics object
const graphics = new Graphics();
app.stage.addChild(graphics);

/**
 * Function to draw a smooth connection between two lines with a rounded corner
 * @param {Object} start - The starting point {x, y}
 * @param {Object} corner - The corner point {x, y}
 * @param {Object} end - The ending point {x, y}
 * @param {number} radius - The border radius for the corner
 * @param {number} lineWidth - The width of the lines
 * @param {number} color - The color of the lines in HEX
 */
function drawSmoothConnection(start, corner, end, radius, lineWidth = 5, color = 0x000000) {
    // Calculate the direction vectors
    const vec1 = { x: start.x - corner.x, y: start.y - corner.y };
    const vec2 = { x: end.x - corner.x, y: end.y - corner.y };

    // Normalize the vectors
    const len1 = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
    const len2 = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);
    const unit1 = { x: vec1.x / len1, y: vec1.y / len1 };
    const unit2 = { x: vec2.x / len2, y: vec2.y / len2 };

    // Calculate the tangent points
    const tangentPoint1 = { 
        x: corner.x + unit1.x * radius, 
        y: corner.y + unit1.y * radius 
    };
    const tangentPoint2 = { 
        x: corner.x + unit2.x * radius, 
        y: corner.y + unit2.y * radius 
    };

    graphics.lineStyle(lineWidth, color, 1);
    graphics.moveTo(start.x, start.y); // Move to the start point
    graphics.lineTo(tangentPoint1.x, tangentPoint1.y); // Draw line to tangent point 1
    
    graphics.arcTo(
        corner.x, corner.y, 
        tangentPoint2.x, tangentPoint2.y, 
        radius
    ); // Draw the arc
    
    graphics.lineTo(end.x, end.y); // Draw line to the end point
}

// Example Usage:

// Define three points
const pointA = { x: 100, y: 100 };
const pointB = { x: 400, y: 300 };
const pointC = { x: 700, y: 100 };

// Define border radius
const borderRadius = 50;

// Draw circles to represent the points (for visualization)
function drawPoint(point, color = 0xFF0000) {
    graphics.beginFill(color);
    graphics.drawCircle(point.x, point.y, 5);
    graphics.endFill();
}

drawPoint(pointA, 0xFF0000); // Red
drawPoint(pointB, 0x00FF00); // Green
drawPoint(pointC, 0x0000FF); // Blue

// Draw the smooth connection
drawSmoothConnection(pointA, pointB, pointC, borderRadius, 4, 0x000000);
}

(async () => {
  const app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x282b30,
    antialias: true,
    view: document.getElementById("pixiCanvas")! as HTMLCanvasElement,
  });

  await Promise.all(
    Object.entries(imagePaths).map(async ([key, path]) => Assets.load(path))
  );


  init(app)
  
})();

import '@pixi/math-extras';
import {
  Application,
  Assets,
  Container,
  Point,
  Texture,
  FederatedPointerEvent,
} from "pixi.js";

import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';

const imagePaths = {
  "placeholder_dash.png": "placeholder_dash.png",
};

async function init(app: Application) {
  // Create a Graphics object
  const graphics = new Graphics();
  app.stage.addChild(graphics);

  // Create a Container to hold the points
  const pointsContainer = new Container();
  app.stage.addChild(pointsContainer);

  // Define three points
  let pointA = { x: 350, y: 100 };
  let pointB = { x: 400, y: 300 };
  let pointC = { x: 550, y: 100 };

  // Define border radius
  const borderRadius = 50;

  // Create draggable points
  const pointACircle = createDraggableCircle(pointA, 0xFF0000);
  const pointBCircle = createDraggableCircle(pointB, 0x00FF00);
  const pointCCircle = createDraggableCircle(pointC, 0x0000FF);

  pointsContainer.addChild(pointACircle, pointBCircle, pointCCircle);

  // Draw the smooth connection
  function drawConnection() {
    graphics.clear();
    drawSmoothConnection(graphics, pointA, pointB, pointC, borderRadius, 4, 0x000000);
  }

  drawConnection();

  // Update the points when they are moved
  pointACircle.on("moved", () => {
    pointA = { x: pointACircle.x, y: pointACircle.y };
    drawConnection();
  });

  pointBCircle.on("moved", () => {
    pointB = { x: pointBCircle.x, y: pointBCircle.y };
    drawConnection();
  });

  pointCCircle.on("moved", () => {
    pointC = { x: pointCCircle.x, y: pointCCircle.y };
    drawConnection();
  });
}

/**
 * Function to draw a smooth connection between two lines with a rounded corner
 * @param {Object} start - The starting point {x, y}
 * @param {Object} corner - The corner point {x, y}
 * @param {Object} end - The ending point {x, y}
 * @param {number} radius - The border radius for the corner
 * @param {number} lineWidth - The width of the lines
 * @param {number} color - The color of the lines in HEX
 */
const drawSmoothConnection = (graphics: Graphics, start, corner, end, radius, lineWidth = 5, color = 0x000000) => {
  // Calculate the direction vectors
  const vec1 = { x: start.x - corner.x, y: start.y - corner.y };
  const vec2 = { x: end.x - corner.x, y: end.y - corner.y };

  // Normalize the vectors
  const len1 = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
  const len2 = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);
  const unit1 = new Point(vec1.x / len1, vec1.y / len1);
  const unit2 = new Point(vec2.x / len2, vec2.y / len2);

  let balancedRadius = radius * (1 - (unit1.dot(unit2) - 0.5));

  console.log(unit1.dot(unit2));
  console.log(`New Radius: ${balancedRadius}`);

  // Calculate the tangent points
  const tangentPoint1 = {
    x: corner.x + unit1.x * balancedRadius,
    y: corner.y + unit1.y * balancedRadius,
  };

  const tangentPoint2 = {
    x: corner.x + unit2.x * balancedRadius,
    y: corner.y + unit2.y * balancedRadius,
  };

  graphics.lineStyle(lineWidth, color, 1);
  graphics.moveTo(start.x, start.y); // Move to the start point
  // graphics.lineTo(tangentPoint1.x, tangentPoint1.y); // Draw line to tangent point 1
  graphics.arcTo(
    corner.x,
    corner.y,
    tangentPoint2.x,
    tangentPoint2.y,
    balancedRadius
  ); // Draw the arc
  // graphics.moveTo(tangentPoint2.x, tangentPoint2.y);
  graphics.lineTo(end.x, end.y); // Draw line to the end point
};

function createDraggableCircle(position, color) {
  const circle = new Graphics();
  circle.interactive = true;
  circle.eventMode = 'dynamic';
  circle.beginFill(color,0.32);
  circle.drawCircle(0, 0, 16);
  circle.endFill();
  circle.x = position.x;
  circle.y = position.y;

  let isDragging = false;
  let previousPosition = new Point();

  circle.addEventListener("pointerdown", (event: FederatedPointerEvent) => {
    isDragging = true;
    previousPosition.copyFrom(event.data.global);
  });

  circle.addEventListener("pointerup", () => {
    isDragging = false;
    circle.emit("moved");
  });

  circle.addEventListener("pointermove", (event: FederatedPointerEvent) => {
    if (isDragging) {
      const newPosition = event.data.global;
      const delta = newPosition.subtract(previousPosition);
      previousPosition.copyFrom(newPosition);
      circle.x += delta.x;
      circle.y += delta.y;
      circle.emit("moved");
    }
  });

  return circle;
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

  init(app);
})();
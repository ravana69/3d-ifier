window.addEventListener('resize', resize, false);

var gridSize = 13;
var prevX, prevY, prevI;
var grids = [];
var voxels;
var yAngle = 0;
var xAngle = .6;
var zoom = 0;
var mouseOverControls = false;
var curChange = true;
var fillTool = false;

window.onload = init;

function init(){
  var controls = document.getElementById("draw-box");
  var html = "";
  var names = ["front", "left", "top"];
  grids = [];
  var dims = 1/gridSize;
  for (var i = 0; i < 3; i++){
    if (i == 2) html += "<br>";
    html += "<div class='grid'>" + names[i] + "<table>";
    grids.push([]);
    for (var x = 0; x < gridSize; x++){
      html += "<tr>";
      grids[i].push([]);
      for (var y = 0; y < gridSize; y++){
        html += "<td>";
        html += "<div id='" + i + "," + x + "," + y + "'class='cell'";
        html += "onmouseover='toggleCell(\"" + i + "\", \"" + x + "\", \"" + y + "\")'";
        html += "onmousedown='toggleCell2(\"" + i + "\", \"" + x + "\", \"" + y + "\")'>";
        html += "</div></td>";
        grids[i][x].push(false);
      }
      html += "</tr>"
    }
    html += "</table></div>"
  }
  initVoxels();
  controls.innerHTML = html;
}

function initVoxels(){
  voxels = [];
  for (var i = 0; i < gridSize; i++){
    voxels.push([]);
    for (var j = 0; j < gridSize; j++){
      voxels[i].push([]);
      for (var k = 0; k < gridSize; k++){
        voxels[i][j].push(false);
      }
    }
  }
}

function toggleCell(i, x, y){
  if (!mouseIsPressed) return;
  if (fillTool) return;
  var cell = document.getElementById(i + "," + x + "," + y);
  grids[i][x][y] = curChange;
  if (grids[i][x][y]) $(cell).css("background", "red");
  else $(cell).css("background", "white");
  updateVoxels();
}

function toggleCell2(i, x, y){
  mouseOverControls = true;
  curChange = (!grids[i][x][y]);
  if (fillTool){
    floodFill(i, x, y);
    return;
  }
  var cell = document.getElementById(i + "," + x + "," + y);
  grids[i][x][y] = curChange;
  if (grids[i][x][y]) $(cell).css("background", "red");
  else $(cell).css("background", "white");
  updateVoxels();
}

function loadPreset(){
  var preset = document.getElementById("presets").value;
  var radius = floor(gridSize/2);
  for (var i = 0; i < 3; i++){
    for (var x = 0; x < gridSize; x++){
      for (var y = 0; y < gridSize; y++){
        grids[i][x][y] = false;
        var cell = document.getElementById(i + "," + x + "," + y);
        if (preset == "circle"){
          if (floor(dist(x, y, floor(gridSize/2), floor(gridSize/2))) == radius ||
              ((x == radius || y == radius) && x != y)){
            grids[i][x][y] = true;
          }
        }
        else if (preset == "sphere"){
          if (floor(dist(x, y, floor(gridSize/2), floor(gridSize/2))) <= radius){
            grids[i][x][y] = true;
          }
        }
        else if (preset == "cube"){
          if (x == 0 || y == 0 || x == gridSize-1 || y == gridSize-1){
            grids[i][x][y] = true;
          }
        }
        else if (preset == "chair"){
          if ((abs(y - radius) <= radius/2 && x == radius) || 
               (i < 2 && y == floor(radius/2)) ||
               (i < 2 && y == floor(radius*1.5) && x >= radius) ||
               (i == 0 && (y >= radius/2 && y <= radius*1.5) && x <= radius) ||
               (i == 2 && (y >= radius/2 && y <= radius*1.5) && (x >= radius/2 && x <= radius*1.5))){
            grids[i][x][y] = true;
          }
        }
        else if (preset == "tree"){
          if (i == 2 && dist(x, y, floor(gridSize/2), floor(gridSize/2)) < radius*.75) grids[i][x][y] = true;
          if (i < 2 &&
              (dist(x, y, floor(gridSize/4), floor(gridSize/2)) < radius*.75 ||
               y == radius || (x == gridSize-2 && abs(y - radius) < radius*.5) ||
               (x == gridSize-1 && abs(y - radius) < radius))){
            grids[i][x][y] = true;
          }
        }
        if (grids[i][x][y]) $(cell).css("background", "red");
        else $(cell).css("background", "white");
      }
    }
  }
  updateVoxels();
}

function isSurrounded(i, j, k){
  if (i <= 0 || j <= 0 || k <= 0 ||
     i >= gridSize-1 || j >= gridSize-1 || k >= gridSize-1) return false;
  return (voxels[i+1][j][k] && voxels[i-1][j][k] &&
          voxels[i][j+1][k] && voxels[i][j-1][k] &&
          voxels[i][j][k+1] && voxels[i][j][k-1]);
}

function toggleFill(){
  fillTool = document.getElementById("paint").checked;
}

function floodFill(i, x, y){
  if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return;
  if (grids[i][x][y] != curChange){
    grids[i][x][y] = curChange;
    
    floodFill(i, x, parseInt(y)-1);
    floodFill(i, x, parseInt(y)+1);
    floodFill(i, parseInt(x)-1, y);
    floodFill(i, parseInt(x)+1, y);
    
    var cell = document.getElementById(i + "," + x + "," + y);
    if (grids[i][x][y]) $(cell).css("background", "red");
    else $(cell).css("background", "white");
  }
  updateVoxels();
}

function updateVoxels(){
  for (var x = 0; x < gridSize; x++){
    for (var y = 0; y < gridSize; y++){
      for (var z = 0; z < gridSize; z++){
        var a, b, c;
        a = grids[0][y][z];
        b = grids[1][y][gridSize - 1 - x];
        c = grids[2][gridSize - 1 - x][z];
        var val = 0;
        if (a) val++;
        if (b) val++;
        if (c) val++;
        voxels[x][y][z] = (a && b && c);
      }
    }
  }
}

function Point(x, y){
  this.x = x;
  this.y = y;
}

function setup(){
  createCanvas(0, 0, WEBGL);
  // colorMode(HSB, 360, 100, 100, 100);
  ellipseMode(CENTER);
  resize();
}

function draw(){
  background(0);
  if (!mouseIsPressed) yAngle += .01;
  pointLight(250, 250, 250, .5, .5, 0);
  ambientMaterial(250, 0, 0);
  var cellSize = 250/gridSize;
  if (!voxels) return;
  for (var x = 0; x < gridSize; x++){
    for (var y = 0; y < gridSize; y++){
      for (var z = 0; z < gridSize; z++){
        if (voxels[x][y][z] && !isSurrounded(x, y, z)){
          push();
          translate(0, 0, zoom);
          rotateX(xAngle);
          rotateY(yAngle);
          translate((x + .5 - gridSize/2)*-cellSize, (-y - .5 +  gridSize/2)*-cellSize, (z + .5 - gridSize/2)*-cellSize);
          box(cellSize);
          stroke(100);
          pop();
        }
      }
    }
  }
}

function xor(a,b) {
  return ( a || b ) && !( a && b );
}

function mouseDragged(){
  if (mouseOverControls) return;
  xAngle += (mouseY - pmouseY)/100;
  yAngle += (mouseX - pmouseX)/100;
  if (xAngle < -PI/2) xAngle = -PI/2;
  if (xAngle > PI/2) xAngle = PI/2;
}

function mouseReleased(){
  mouseOverControls = false;
}

function mouseWheel(event){
  zoom -= event.delta*10;
}

function resize(){
  resizeCanvas(window.innerWidth, window.innerHeight);
}
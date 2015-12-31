var canvas = document.getElementById('canvas'),
ctx = canvasPlus('canvas'),
pi = Math.PI,
rt3 = Math.sqrt(3),
balls = [],
Ball = function (x, y, angle) {
  this.x = x;
  this.y = y;
  this.last; // last side hit, used to prevent "buzzing" glitch
  this.color = colors[Math.floor(Math.random() * colors.length)];
  this.angle = Math.round((angle - pi / 5) / (pi / 12)) * (pi / 12) + pi / 5; // the nearest angle that is 72 degrees more than a multiple of 15 degrees
  this.rad = 10;
  this.draw = function () {
    ctx.fillStyle = this.color;
    ctx.drawCircle('fill', this.x, this.y, this.rad);
  }
},
w = window.innerWidth, // canvas width
h = window.innerHeight * 9 / 10, // canvas height accounting for 5% margin on top and bottom of canvas
unit = h, // one unit is equal to the height of the canvas
munit = unit / 1000, // miliunit
speed = 15, // miliunits per 25 miliseconds
vertices = [ // vertices of the hexagon
  [(3 * unit) / (2 * rt3), 0],
  [unit / (2 * rt3), 0],
  [0, unit / 2],
  [unit / (2 * rt3), unit],
  [(3 * unit) / (2 * rt3), unit],
  [2 * unit / rt3, unit / 2]],
colors = ['red', 'orange', 'yellow', 'lime', 'cyan', 'blue', 'purple'], // possible ball colors
sideColors = ['white', 'white', 'white', 'white', 'white', 'white'], // stores color of each side
bgColors = ['black', '#002', '#020', '#200', '#022', '#220', '#202'], // possible background colors
notes = ['C1', 'D1', 'E1', 'G1', 'A2', 'C2'],
drawFrame = function () {
  ctx.clear();
  // Draw the hexagon
  ctx.save();
  ctx.translate(w / 2 - (unit / rt3), 0); // make the rightmost point of the hexagon x0
  ctx.applyStyleObject({strokeStyle: sideColors[sideColors.length - 1], lineWidth: '4', lineJoin: 'miter'});
  ctx.drawLine(vertices[vertices.length - 1][0], vertices[vertices.length - 1][1], vertices[0][0], vertices[0][1]); // draw side n-1
  vertices.slice(1).forEach(function (e, i) { // draw rest of the sides
    ctx.strokeStyle = sideColors[i];
    ctx.drawLine(vertices[i][0], vertices[i][1], e[0], e[1]);    
  });
  // Move balls
  balls.forEach(function (e) {
    var v1, v2, dist, aud, i;
    e.draw();
    if (vertices.some(function (coords) {return Math.abs(e.x - coords[0]) <= e.rad && Math.abs(e.y - coords[1]) <= e.rad;})) { // if ball hits a vertex
      e.angle += Math.PI; // reverse the direction
      e.last = -1;
    }
    else {
      for (i = 0; i < vertices.length; i += 1) {
        v1 = vertices[i];
        v2 = vertices[i + 1 < vertices.length ? i + 1 : i + 1 - vertices.length];
        dist = Math.abs((e.x - v1[0]) * (v2[1] - v1[1]) - (e.y - v1[1]) * (v2[0] - v1[0])) /
               Math.sqrt(Math.pow(v2[0] - v1[0], 2) + Math.pow(v2[1] - v1[1], 2)); // formula to find distance between point and line
        if (dist < e.rad) {
          document.getElementById(notes[i]).pause();
		  document.getElementById(notes[i]).currentTime = 0;
		  document.getElementById(notes[i]).play();
          e.angle = pi - e.angle - 2 * (i * 2 + 3) * pi / 6;
          sideColors[i] = e.color;
          document.body.style.backgroundColor = bgColors[Math.floor(Math.random() * bgColors.length)];
          e.last = i;
          break;
        }
      }                         
    }
    e.x += Math.cos(e.angle) * munit * speed;
    e.y += Math.sin(e.angle) * munit * speed;
  });
  ctx.restore();
},
interval, i, aud;
for (i = 0; i < notes.length; i += 1) {
  aud = new Audio();
  aud.id = notes[i];
  aud.innerHTML = '<source src="' + notes[i] + '.mp3" type="audio/mpeg" /><source src="' + notes[i] + '.ogg" type="audio/ogg" />';
  aud.load();
  document.getElementById('audio').appendChild(aud);
}
canvas.width = w;
canvas.height = h;
canvas.style.marginTop = window.innerHeight / 20 + 'px'; // 5% margin on top and bottom of canvas
interval = setInterval(drawFrame, 25);
canvas.addEventListener('click', function (e) {
  var angle,
  x = ctx.mouseX(e),
  y = ctx.mouseY(e);
  angle = Math.atan2(y - h / 2, x - w / 2); // Find the angle of the mouse from the center of the canvas
  balls.push(new Ball(unit / rt3, unit / 2, angle)); // Create new ball in center
  document.getElementById('balls').innerHTML = balls.length;
});
document.getElementById('speed').addEventListener('change', function (e) {
  speed = Number(this.value);
});
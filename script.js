// Color palette
var C = [
  '#e8220a', '#f97316', '#fbbf24', '#22c55e', '#3b82f6',
  '#a855f7', '#ec4899', '#ef4444', '#84cc16', '#06b6d4'
];

// Canvas setup
var cv = document.getElementById('canvas');
var ctx = cv.getContext('2d');
var cur = document.getElementById('cursor');
var W, H;

function rs() {
  W = cv.width = innerWidth;
  H = cv.height = innerHeight;
}
rs();
window.addEventListener('resize', rs);

// Custom cursor follow
document.addEventListener('mousemove', function(e) {
  cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
  cur.style.background = C[Math.floor(Math.random() * C.length)];
});

// Particle system
var parts = [];

function rn(a, b) {
  return Math.random() * (b - a) + a;
}

function rc() {
  return C[Math.floor(Math.random() * C.length)];
}

// Particle constructor
function Pt(x, y, big) {
  this.x = x;
  this.y = y;
  this.r = big ? rn(6, 18) : rn(3, 10);
  var a = rn(0, Math.PI * 2);
  var s = big ? rn(6, 18) : rn(2, 10);
  this.vx = Math.cos(a) * s;
  this.vy = Math.sin(a) * s - rn(0, big ? 10 : 4);
  this.gv = rn(0.18, 0.35);
  this.dg = rn(0.93, 0.98);
  this.col = rc();
  this.life = 1;
  this.dc = big ? rn(0.008, 0.018) : rn(0.015, 0.03);
  this.sq = Math.random() < 0.35;
  this.rot = rn(0, Math.PI * 2);
  this.rs = rn(-0.12, 0.12);
}

Pt.prototype.tick = function() {
  this.vy += this.gv;
  this.vx *= this.dg;
  this.vy *= this.dg;
  this.x += this.vx;
  this.y += this.vy;
  this.life -= this.dc;
  this.rot += this.rs;
};

Pt.prototype.draw = function() {
  ctx.save();
  ctx.globalAlpha = Math.max(0, this.life);
  ctx.fillStyle = this.col;
  ctx.shadowColor = this.col;
  ctx.shadowBlur = 8;
  ctx.translate(this.x, this.y);
  ctx.rotate(this.rot);
  
  if (this.sq) {
    ctx.fillRect(-this.r * 0.6, -this.r * 0.6, this.r * 1.2, this.r * 1.2);
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

// Create burst of particles
function burst(x, y, n, big) {
  for (var i = 0; i < n; i++) {
    parts.push(new Pt(x, y, big));
  }
}

// Animation loop
(function loop() {
  ctx.clearRect(0, 0, W, H);
  parts = parts.filter(function(p) { return p.life > 0; });
  parts.forEach(function(p) {
    p.tick();
    p.draw();
  });
  requestAnimationFrame(loop);
})();

// Create background blob
function blob(x, y, sz) {
  var el = document.createElement('div');
  el.className = 'blob';
  var s = sz || rn(120, 300);
  el.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (x - s / 2) + 'px;top:' + (y - s / 2) + 'px;background:' + rc() + ';';
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 9000);
}

// Create ripple effect
function ripple(x, y) {
  var el = document.createElement('div');
  el.className = 'ripple';
  var s = rn(80, 180);
  el.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + x + 'px;top:' + y + 'px;background:' + rc() + ';';
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 900);
}

// Click anywhere (except button) to splash
document.addEventListener('click', function(e) {
  if (e.target.closest('#splashBtn')) return;
  burst(e.clientX, e.clientY, 35, false);
  blob(e.clientX, e.clientY, rn(80, 200));
  ripple(e.clientX, e.clientY);
});

// Main button click handler
document.getElementById('splashBtn').addEventListener('click', function(e) {
  e.stopPropagation();
  
  // Center big burst
  burst(W / 2, H / 2, 220, true);
  
  // Corner bursts with delay
  [
    [rn(0, W * 0.3), rn(0, H * 0.3)],
    [rn(W * 0.7, W), rn(0, H * 0.3)],
    [rn(0, W * 0.3), rn(H * 0.7, H)],
    [rn(W * 0.7, W), rn(H * 0.7, H)],
    [W / 2, rn(0, H * 0.2)],
    [W / 2, rn(H * 0.8, H)],
    [rn(0, W * 0.15), H / 2],
    [rn(W * 0.85, W), H / 2]
  ].forEach(function(pt, i) {
    setTimeout(function() {
      burst(pt[0], pt[1], 90, true);
      blob(pt[0], pt[1], rn(150, 350));
    }, i * 60);
  });
  
  // Random blobs
  for (var i = 0; i < 14; i++) {
    (function(ii) {
      setTimeout(function() {
        blob(rn(0, W), rn(0, H), rn(100, 280));
      }, ii * 45);
    })(i);
  }
  
  // Burst rings
  for (var j = 0; j < 5; j++) {
    (function(jj) {
      setTimeout(function() {
        var el = document.createElement('div');
        el.className = 'burst-ring';
        el.style.cssText = 'width:200px;height:200px;left:' + W / 2 + 'px;top:' + H / 2 + 'px;border-color:' + rc() + ';';
        document.body.appendChild(el);
        setTimeout(function() { el.remove(); }, 1100);
      }, jj * 100);
    })(j);
  }
});

// Auto-initial animation
setTimeout(function() {
  for (var i = 0; i < 5; i++) {
    (function(ii) {
      setTimeout(function() {
        var x = rn(W * 0.1, W * 0.9);
        var y = rn(H * 0.1, H * 0.6);
        burst(x, y, 40, false);
        blob(x, y, rn(80, 180));
      }, ii * 120);
    })(i);
  }
}, 600);
// 產生新場景的佔位美術（正式美術完成後直接覆蓋同名檔即可）
// 用法：node scripts/gen-placeholder-art.mjs
import sharp from 'sharp';

const W = 1024;
const H = 683;

// 簡化的原靈花樹：樹幹＋樹冠＋花／果圓點
function treeSvg({ sky, crown, dots, dotR = 14, leaves = 90, sparse = false }) {
  const rand = mulberry32(42);
  let crownCircles = '';
  for (let i = 0; i < leaves; i++) {
    const a = rand() * Math.PI * 2;
    const r = 60 + rand() * 150;
    const cx = 512 + Math.cos(a) * r;
    const cy = 300 + Math.sin(a) * r * 0.62;
    crownCircles += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(34 + rand() * 26).toFixed(0)}" fill="${crown}" opacity="0.85"/>`;
  }
  let dotCircles = '';
  const n = sparse ? 6 : 26;
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const r = 50 + rand() * 140;
    const cx = 512 + Math.cos(a) * r;
    const cy = 295 + Math.sin(a) * r * 0.6;
    dotCircles += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${dotR}" fill="${dots}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <ellipse cx="512" cy="640" rx="360" ry="46" fill="#ffffff" opacity="0.5"/>
  <path d="M492 630 Q500 470 512 430 Q524 470 532 630 Z" fill="#8a6f4d"/>
  <path d="M508 500 Q450 440 430 400" stroke="#8a6f4d" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M516 480 Q580 430 600 390" stroke="#8a6f4d" stroke-width="16" fill="none" stroke-linecap="round"/>
  ${crownCircles}
  ${dotCircles}
</svg>`;
}

function skySvg(stops, clouds = true) {
  const rand = mulberry32(7);
  let cloudShapes = '';
  if (clouds) {
    for (let i = 0; i < 10; i++) {
      const cx = rand() * W;
      const cy = 80 + rand() * (H - 200);
      const rx = 90 + rand() * 130;
      cloudShapes += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${(rx * 0.32).toFixed(0)}" fill="#ffffff" opacity="${(0.25 + rand() * 0.3).toFixed(2)}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      ${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  ${cloudShapes}
</svg>`;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FILES = {
  // 序章：白金雲海（乘蓮台上天堂）
  'prologue-heaven.webp': skySvg([[0, '#fdfbf4'], [0.55, '#f3e9d0'], [1, '#e4d3ac']]),
  // 過場：白霧漸染昏黃（蓮台下凡）
  'interlude-descend.webp': skySvg([[0, '#f6f1e4'], [0.5, '#a08a6a'], [1, '#3a2f22']]),
  // 四結局的原靈花樹
  'tree-highGood.webp': treeSvg({ sky: ['#fdfbf4', '#efe3c4'], crown: '#8fbf7f', dots: '#f6d566', leaves: 110 }),
  'tree-highBad.webp': treeSvg({ sky: ['#f8f5ea', '#ded3b4'], crown: '#6f9e63', dots: '#e8c14e', leaves: 130, sparse: true }),
  'tree-lowGood.webp': treeSvg({ sky: ['#fdf9f2', '#f0ddc8'], crown: '#a7c495', dots: '#ffffff', dotR: 10, leaves: 70 }),
  'tree-lowBad.webp': treeSvg({ sky: ['#f3eede', '#cbbb9a'], crown: '#b3a35f', dots: '#8a6f4d', dotR: 8, leaves: 45, sparse: true }),
};

for (const [name, svg] of Object.entries(FILES)) {
  await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(`assets/art/${name}`);
  console.log('產生', name);
}

// 自检脚本：把 app.js 的纯函数抽出跑一遍（不依赖 DOM/Canvas）
const CIPAI_5 = { name: '五言绝句·仄起' };
const CIPAI_7 = { name: '七言绝句·平起' };
const TEMPLATES = { '月':['举头','对酌','独坐','推窗','倚楼'], '酒':['一壶','半盏','三杯'], '花':['一树','半窗','满径'] };
const ENDINGS = ['入梦来','落花中','满空山','照影寒','入云端'];
const moods = Object.keys(TEMPLATES);
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function detectMood(t){for(const k of moods){if(t&&t.indexOf(k)>=0)return k;}return pick(moods);}
function buildLine(m){return pick(TEMPLATES[m]||TEMPLATES['月'])+' '+pick(ENDINGS);}
function buildPoem(text, cipai){
  const m=detectMood(text);
  const n = cipai===CIPAI_7?7:5;
  const lines=[];
  for(let i=0;i<n;i++) lines.push(buildLine(m));
  if(text && text.trim()){
    const t=text.trim().slice(0,2);
    lines[0]=t+lines[0].slice(Math.min(2,lines[0].length));
  }
  return {mood:m,lines,cipaiName:cipai.name};
}
for (let i=0;i<3;i++){
  const p5 = buildPoem('月', CIPAI_5);
  const p7 = buildPoem('花', CIPAI_7);
  console.log('5言 mood='+p5.mood, '->', p5.lines.length+'行:', p5.lines.join(' | '));
  console.log('7言 mood='+p7.mood, '->', p7.lines.length+'行:', p7.lines.join(' | '));
}

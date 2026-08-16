// src/<slug>.html (본문만) + _template.html → <slug>/index.html 과 목록 index.html
// 실행: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const apps = JSON.parse(readFileSync('apps.json', 'utf8'));
const tpl = readFileSync('_template.html', 'utf8');

// 닻(#ko·#en·#ja·#zhHant)은 앱의 locale.ts 가 만드는 LANG 값과 **글자까지 같아야 한다**.
// 앱이 링크를 열 때 그 값을 그대로 붙인다 — 'zh' 로 줄이면 간체 기기까지 번체 판으로 온다.
const LANG_NAME = { ko: '한국어', en: 'English', ja: '日本語', zhHant: '繁體中文' };

for (const { slug, title, langs, moved } of apps) {
  // moved: 스토어에 이미 등록된 옛 주소. 죽이지 않고 새 주소로 보낸다.
  if (moved) {
    mkdirSync(slug, { recursive: true });
    writeFileSync(`${slug}/index.html`,
      `<!DOCTYPE html>\n<html lang="ko">\n<head>\n<meta charset="UTF-8">\n` +
      `<meta http-equiv="refresh" content="0; url=${moved}">\n` +
      `<link rel="canonical" href="${moved}">\n<title>${title}</title>\n</head>\n` +
      `<body><p><a href="${moved}">${title}</a></p></body>\n</html>\n`);
    continue;
  }

  // langs 가 있으면 src/<slug>.<lang>.html 여러 개를 한 페이지에 담고 탭으로 고른다
  const body = langs
    ? `<nav class="langs">${langs.map(l => `<a href="#${l}">${LANG_NAME[l]}</a>`).join('')}</nav>\n` +
      langs.map(l => `<section class="lang" data-lang="${l}">\n${readFileSync(`src/${slug}.${l}.html`, 'utf8')}</section>`).join('\n')
    : readFileSync(`src/${slug}.html`, 'utf8');
  mkdirSync(slug, { recursive: true });
  writeFileSync(`${slug}/index.html`, tpl.replace('{{TITLE}}', title).replace('{{BODY}}', body));
}

const list = apps.filter(a => !a.moved).map(a => `<li><a href="${a.slug}/">${a.title}</a></li>`).join('\n');
writeFileSync('index.html', tpl
  .replace('{{TITLE}}', '개인정보처리방침 & 고객지원')
  .replace('{{BODY}}', `<h1>네모팩토리</h1>\n<p>앱별 개인정보처리방침과 고객지원 안내입니다.</p>\n<ul>\n${list}\n</ul>`)
  .replace('<a href="../">전체 목록</a>', ''));

console.log(`${apps.length}개 생성`);

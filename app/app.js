const CHECKLIST_KEY = 'gta6-trophy-checklist';
const SPOILER_KEY = 'gta6-trophy-spoiler';
const STAGE_NAMES = {
  1: 'Story playthrough',
  2: 'Side content',
  3: 'Collectibles & grind',
  4: 'Cleanup + platinum',
};

function kindFor(trophy) {
  return trophy.kind;
}

function stageFor(trophy) {
  return trophy.roadmap_stage;
}

function sourceFor(trophy) {
  return trophy.sources;
}

const rows = document.getElementById('rows');
const empty = document.getElementById('empty');
const detail = document.getElementById('detail');
const detailContent = document.getElementById('detail-content');
const detailEmpty = detail.querySelector('.detail-empty');
const search = document.getElementById('search');
const kind = document.getElementById('kind');
const grade = document.getElementById('grade');
const spoiler = document.getElementById('spoiler');
const status = document.getElementById('status');
const resultsCount = document.getElementById('results-count');
const progress = document.getElementById('progress');
const progressPercent = document.getElementById('progress-percent');
const progressBar = document.getElementById('progress-bar');
const progressTrack = document.querySelector('.progress-track');

let catalogue;
let earned = new Set();
let selectedName = null;

function readEarned() {
  try {
    const value = JSON.parse(localStorage.getItem(CHECKLIST_KEY) ?? '[]');
    return new Set(Array.isArray(value) ? value.filter((name) => typeof name === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify([...earned]));
}

function announce(message) {
  status.textContent = message;
  window.setTimeout(() => {
    if (status.textContent === message) status.textContent = '';
  }, 3500);
}

function isHidden(trophy) {
  return spoiler.checked && kindFor(trophy) === 'story' && !earned.has(trophy.name);
}

function visibleTrophies() {
  const query = search.value.trim().toLowerCase();
  return catalogue.filter((trophy) => {
    const trophyKind = kindFor(trophy);
    const searchable = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophyKind}`.toLowerCase();
    return (kind.value === 'all' || trophyKind === kind.value)
      && (grade.value === 'all' || trophy.grade === grade.value)
      && (!query || searchable.includes(query));
  });
}

function gradeLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderProgress() {
  const earnedCount = catalogue.filter((trophy) => earned.has(trophy.name)).length;
  const percent = Math.round((earnedCount / catalogue.length) * 100);
  progress.textContent = `${earnedCount} / ${catalogue.length} earned`;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  progressTrack.setAttribute('aria-valuenow', String(percent));
  progressTrack.setAttribute('aria-valuetext', `${earnedCount} of ${catalogue.length} trophies earned`);
  document.getElementById('progress-summary').textContent = percent === 100 ? 'Leonida Legend status confirmed.' : `${catalogue.length - earnedCount} trophies remain on the board.`;
}

function renderRows() {
  const visible = visibleTrophies();
  rows.replaceChildren();
  empty.hidden = visible.length !== 0;
  resultsCount.textContent = `${visible.length} of ${catalogue.length} trophies`;

  for (const trophy of visible) {
    const hidden = isHidden(trophy);
    const row = document.createElement('tr');
    row.dataset.trophy = trophy.name;
    row.tabIndex = 0;
    if (selectedName === trophy.name) row.classList.add('selected');

    const doneCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.className = 'checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = earned.has(trophy.name);
    checkbox.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    checkbox.addEventListener('click', (event) => event.stopPropagation());
    checkbox.addEventListener('change', () => {
      selectedName = trophy.name;
      if (checkbox.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveEarned();
      renderProgress();
      renderRows();
      renderDetail(trophy);
    });
    doneCell.append(checkbox);

    const titleCell = document.createElement('td');
    const title = document.createElement('span');
    title.className = 'trophy-name';
    title.textContent = hidden ? 'Hidden story trophy — earn it to reveal' : trophy.name;
    const description = document.createElement('span');
    description.className = 'trophy-description';
    description.textContent = hidden ? 'Story details are hidden by your spoiler setting.' : trophy.description;
    titleCell.append(title, description);

    const gradeCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `grade grade-${trophy.grade}`;
    badge.textContent = gradeLabel(trophy.grade);
    gradeCell.append(badge);

    const routeCell = document.createElement('td');
    routeCell.textContent = `${STAGE_NAMES[stageFor(trophy)]} · ${kindFor(trophy)}`;

    row.append(doneCell, titleCell, gradeCell, routeCell);
    row.addEventListener('click', () => {
      selectedName = trophy.name;
      renderRows();
      renderDetail(trophy);
    });
    row.addEventListener('keydown', (event) => {
      if (event.target === row && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        selectedName = trophy.name;
        renderRows();
        renderDetail(trophy);
      }
    });
    rows.append(row);
  }
}

function renderDetail(trophy) {
  if (!trophy) {
    detailEmpty.hidden = false;
    detailContent.hidden = true;
    return;
  }
  const hidden = isHidden(trophy);
  detailEmpty.hidden = true;
  detailContent.hidden = false;
  document.getElementById('detail-kind').textContent = kindFor(trophy);
  document.getElementById('detail-missable').hidden = !trophy.missable;
  document.getElementById('detail-title').textContent = hidden ? 'Hidden story trophy — earn it to reveal' : trophy.name;
  document.getElementById('detail-description').textContent = hidden ? 'Hidden story trophy — earn it to reveal' : trophy.description;
  document.getElementById('detail-grade').textContent = gradeLabel(trophy.grade);
  document.getElementById('detail-stage').textContent = `${stageFor(trophy)} · ${STAGE_NAMES[stageFor(trophy)]}`;
  document.getElementById('detail-guide').textContent = hidden ? 'Turn off “Hide story spoilers” to read this guide.' : trophy.guide;
  const sourceList = document.getElementById('detail-sources');
  sourceList.replaceChildren();
  for (const source of sourceFor(trophy)) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = source.name;
    item.append(link);
    sourceList.append(item);
  }
}

function render() {
  renderProgress();
  renderRows();
  const selected = catalogue.find((trophy) => trophy.name === selectedName);
  renderDetail(selected);
}

document.getElementById('export').addEventListener('click', () => {
  const file = new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
  announce('Progress exported as trophy-progress.json.');
});

document.getElementById('import').addEventListener('change', async (event) => {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const list = Array.isArray(parsed) ? parsed : parsed?.earned;
    if (!Array.isArray(list)) throw new Error('expected an array of trophy names');
    const validNames = new Set(catalogue.map((trophy) => trophy.name));
    earned = new Set(list.filter((name) => typeof name === 'string' && validNames.has(name)));
    saveEarned();
    render();
    announce(`Imported ${earned.size} earned trophies.`);
  } catch {
    announce('That progress file could not be read.');
  } finally {
    input.value = '';
  }
});

for (const control of [search, kind, grade]) control.addEventListener('input', renderRows);
spoiler.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoiler.checked));
  render();
});

const documentData = await (await fetch('data/trophies.json')).json();
catalogue = Array.isArray(documentData.trophies) ? documentData.trophies : [];
earned = readEarned();
try {
  spoiler.checked = JSON.parse(localStorage.getItem(SPOILER_KEY) ?? 'false') === true;
} catch {
  spoiler.checked = false;
}
render();

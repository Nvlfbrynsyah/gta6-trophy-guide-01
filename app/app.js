const CHECKLIST_KEY = 'gta6-trophy-checklist';
const SPOILER_KEY = 'gta6-trophy-spoiler';
const STAGE_NAMES = {
  1: 'Story playthrough',
  2: 'Side content',
  3: 'Collectibles & grind',
  4: 'Cleanup + platinum',
};
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

const $ = (id) => document.getElementById(id);
const rows = $('rows');
const empty = $('empty');
const detail = $('detail');
const detailContent = $('detail-content');
const detailEmpty = detail.querySelector('.detail-empty');
const search = $('search');
const kind = $('kind');
const grade = $('grade');
const stage = $('stage');
const sort = $('sort');
const spoiler = $('spoiler');
const hideEarned = $('hide-earned');
const status = $('status');
const resultsCount = $('results-count');
const progress = $('progress');
const progressPercent = $('progress-percent');
const progressBar = $('progress-bar');
const progressTrack = document.querySelector('.progress-track');

let catalogue = [];
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
  return spoiler.checked && trophy.kind === 'story' && !earned.has(trophy.name);
}

function formatGrade(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function estimatedHours(value) {
  const normalized = value.toLowerCase();
  const values = [...normalized.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
  if (!values.length) return 0;
  let amount = values.length > 1 ? (values[0] + values[1]) / 2 : values[0];
  if (normalized.includes('+')) amount *= 1.5;
  if (normalized.includes('min')) amount /= 60;
  return amount;
}

function overallDifficultyLabel(average) {
  if (average < 1.5) return 'Trivial';
  if (average < 2.5) return 'Manageable';
  if (average < 3.5) return 'Moderate';
  if (average < 4.5) return 'Demanding';
  return 'Long-haul';
}

function renderPlatinumSummary() {
  const hours = catalogue.reduce((sum, trophy) => sum + estimatedHours(trophy.time_estimate), 0);
  const difficulty = catalogue.reduce((sum, trophy) => sum + trophy.difficulty, 0) / catalogue.length;
  const roundedHours = Math.round(hours);
  $('platinum-summary').textContent = `Estimated combined effort: ~${roundedHours} h · overall difficulty: ${overallDifficultyLabel(difficulty)} (average ${difficulty.toFixed(1)}/5).`;
}

function renderProgress() {
  const earnedCount = catalogue.filter((trophy) => earned.has(trophy.name)).length;
  const percent = catalogue.length ? Math.round((earnedCount / catalogue.length) * 100) : 0;
  progress.textContent = `${earnedCount} / ${catalogue.length} earned`;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  progressTrack.setAttribute('aria-valuenow', String(percent));
  progressTrack.setAttribute('aria-valuetext', `${earnedCount} of ${catalogue.length} trophies earned`);
  $('progress-summary').textContent = percent === 100 ? 'Leonida Legend status confirmed.' : `${catalogue.length - earnedCount} trophies remain on the board.`;

  const gradeCounts = Object.fromEntries(GRADE_ORDER.map((value) => [value, { earned: 0, total: 0 }]));
  for (const trophy of catalogue) {
    gradeCounts[trophy.grade].total += 1;
    if (earned.has(trophy.name)) gradeCounts[trophy.grade].earned += 1;
  }
  const breakdown = $('grade-breakdown');
  breakdown.replaceChildren();
  for (const value of GRADE_ORDER) {
    const item = document.createElement('span');
    item.className = `grade-stat grade-stat-${value}`;
    item.textContent = `${formatGrade(value)} ${gradeCounts[value].earned}/${gradeCounts[value].total}`;
    breakdown.append(item);
  }

  for (let stageNumber = 1; stageNumber <= 4; stageNumber += 1) {
    const trophies = catalogue.filter((trophy) => trophy.roadmap_stage === stageNumber);
    const count = trophies.length;
    const stageEarned = trophies.filter((trophy) => earned.has(trophy.name)).length;
    const stagePercent = count ? Math.round(stageEarned / count * 100) : 0;
    $(`stage-count-${stageNumber}`).textContent = `${count} ${count === 1 ? 'trophy' : 'trophies'}`;
    $(`stage-earned-${stageNumber}`).textContent = `${stageEarned} / ${count} earned`;
    $(`stage-progress-${stageNumber}`).style.width = `${stagePercent}%`;
    const button = document.querySelector(`.stage-card[data-stage="${stageNumber}"]`);
    button.setAttribute('aria-pressed', String(stage.value === String(stageNumber)));
  }
}

function compareTime(a, b) {
  return estimatedHours(b.time_estimate) - estimatedHours(a.time_estimate);
}

function sortedTrophies(list) {
  const gradeIndex = (value) => GRADE_ORDER.indexOf(value);
  return [...list].sort((a, b) => {
    if (sort.value === 'name') return a.name.localeCompare(b.name);
    if (sort.value === 'grade') return gradeIndex(a.grade) - gradeIndex(b.grade) || a.id - b.id;
    if (sort.value === 'difficulty') return b.difficulty - a.difficulty || a.id - b.id;
    if (sort.value === 'time') return compareTime(a, b) || a.id - b.id;
    return a.roadmap_stage - b.roadmap_stage || a.id - b.id;
  });
}

function visibleTrophies() {
  const query = search.value.trim().toLowerCase();
  const filtered = catalogue.filter((trophy) => {
    const searchable = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    return (kind.value === 'all' || (kind.value === 'missable' ? trophy.missable === true : trophy.kind === kind.value))
      && (grade.value === 'all' || trophy.grade === grade.value)
      && (stage.value === 'all' || trophy.roadmap_stage === Number(stage.value))
      && (!hideEarned.checked || !earned.has(trophy.name))
      && (!query || searchable.includes(query));
  });
  return sortedTrophies(filtered);
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
      render();
    });
    doneCell.append(checkbox);

    const titleCell = document.createElement('td');
    const title = document.createElement('span');
    title.className = 'trophy-name';
    title.textContent = hidden ? 'Hidden story trophy — earn it to reveal' : trophy.name;
    const description = document.createElement('span');
    description.className = 'trophy-description';
    description.textContent = hidden ? 'Story details are hidden by your spoiler setting.' : trophy.description;
    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    meta.textContent = `Difficulty ${trophy.difficulty}/5 · ${trophy.time_estimate}`;
    titleCell.append(title, description, meta);
    if (trophy.missable) {
      const marker = document.createElement('span');
      marker.className = 'row-missable';
      marker.textContent = 'MISSABLE';
      titleCell.append(marker);
    }

    const gradeCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `grade grade-${trophy.grade}`;
    badge.textContent = formatGrade(trophy.grade);
    gradeCell.append(badge);

    const routeCell = document.createElement('td');
    routeCell.textContent = `Stage ${trophy.roadmap_stage} · ${trophy.kind}`;
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

function targetFor(trophy) {
  if (trophy.count === undefined) return '';
  if (trophy.name === 'A Long Road') return '100% completion';
  if (trophy.name === 'Dime on the Dollar') return '$250,000 laundered';
  if (trophy.name === 'Treat Yo Self') return '$100,000 spent';
  return trophy.description.replace(/^[^0-9$]*/, '').replace(/[.!?]+$/, '').trim();
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
  $('detail-kind').textContent = trophy.kind;
  $('detail-missable').hidden = !trophy.missable;
  $('detail-title').textContent = hidden ? 'Hidden story trophy — earn it to reveal' : trophy.name;
  $('detail-description').textContent = hidden ? 'Hidden story trophy — earn it to reveal' : trophy.description;
  $('detail-grade').textContent = formatGrade(trophy.grade);
  $('detail-stage').textContent = `${trophy.roadmap_stage} · ${STAGE_NAMES[trophy.roadmap_stage]}`;
  $('detail-difficulty').textContent = `${trophy.difficulty}/5`;
  $('detail-time').textContent = trophy.time_estimate;
  $('detail-guide').textContent = hidden ? 'Turn off “Hide story spoilers” to read this guide.' : trophy.guide;
  const target = targetFor(trophy);
  $('detail-target').hidden = !target;
  $('detail-target').textContent = target ? `Target: ${target}` : '';
  $('detail-missable-note').hidden = !trophy.missable_note;
  $('detail-missable-text').textContent = trophy.missable_note ?? '';

  const sourceList = $('detail-sources');
  sourceList.replaceChildren();
  for (const source of trophy.sources ?? []) {
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
  renderDetail(catalogue.find((trophy) => trophy.name === selectedName));
}

$('export').addEventListener('click', () => {
  const file = new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
  announce('Progress exported as trophy-progress.json.');
});

$('import').addEventListener('change', async (event) => {
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

$('reset').addEventListener('click', () => {
  if (!window.confirm('Clear all saved trophy progress from this browser?')) return;
  earned.clear();
  localStorage.removeItem(CHECKLIST_KEY);
  selectedName = null;
  render();
  announce('Trophy progress was reset.');
});

for (const control of [search, kind, grade, sort, hideEarned]) {
  control.addEventListener(control.tagName === 'SELECT' ? 'change' : 'input', renderRows);
}
stage.addEventListener('change', render);
spoiler.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoiler.checked));
  render();
});
document.querySelectorAll('.stage-card').forEach((button) => {
  button.addEventListener('click', () => {
    stage.value = button.dataset.stage;
    render();
    $('tracker-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const documentData = await (await fetch('data/trophies.json')).json();
catalogue = Array.isArray(documentData.trophies) ? documentData.trophies : [];
earned = readEarned();
try {
  spoiler.checked = JSON.parse(localStorage.getItem(SPOILER_KEY) ?? 'false') === true;
} catch {
  spoiler.checked = false;
}
renderPlatinumSummary();
render();

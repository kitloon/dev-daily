/* Pure calendar/progress rules. No browser storage, clock overrides or UI dependencies. */
(() => {
  'use strict';
  const timeZone = 'Asia/Kuala_Lumpur';

  function dateKey(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(now);
    const get = type => parts.find(part => part.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function dayComplete(progress, day) {
    return Boolean(day?.lessons?.length) && day.lessons.every(lesson => progress.completed.includes(lesson.id));
  }

  function reconcile(raw, courses, today = dateKey()) {
    if (!validDate(today)) throw new Error('Invalid learning calendar date');
    const source = raw && typeof raw === 'object' ? raw : {};
    const allowed = new Set(courses.flatMap(day => day.lessons.map(lesson => lesson.id)));
    const ids = field => Array.isArray(source[field]) ? [...new Set(source[field].filter(id => allowed.has(id)))] : [];
    const firstDay = courses[0]?.number || 1;
    const progress = {
      version: 2,
      completed: ids('completed'),
      saved: ids('saved'),
      currentDay: courses.some(day => day.number === source.currentDay) ? source.currentDay : firstDay,
      dayCompletedOn: {},
      lastAdvancedOn: validDate(source.lastAdvancedOn) ? source.lastAdvancedOn : null
    };
    for (const day of courses) {
      if (!dayComplete(progress, day)) continue;
      const previous = source.dayCompletedOn?.[day.number];
      // Legacy completion has no date: conservatively treat it as completed today.
      progress.dayCompletedOn[day.number] = validDate(previous) ? previous : today;
    }
    const completedOn = progress.dayCompletedOn[progress.currentDay];
    const nextDay = courses.find(day => day.number === progress.currentDay + 1);
    // Advance only one lesson day per calendar day, never skip an unfinished day.
    if (nextDay && completedOn && completedOn < today && (!progress.lastAdvancedOn || progress.lastAdvancedOn < today)) {
      progress.currentDay = nextDay.number;
      progress.lastAdvancedOn = today;
    }
    return progress;
  }

  window.LearningState = Object.freeze({ timeZone, dateKey, validDate, dayComplete, reconcile });
})();

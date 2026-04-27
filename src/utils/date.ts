export const getDateKey = (date = new Date()): string => date.toISOString().slice(0, 10);

export const formatLongDate = (date = new Date()): string =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

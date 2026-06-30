// src/utils/helpers.js
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const getInitials = (title = '') =>
  title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

/* icons.js — 일관된 모노라인 아이콘 세트 (feather 스타일, currentColor) */
window.App = window.App || {};
(function (A) {
  'use strict';
  const P = {
    home: '<path d="M3.5 11.5 12 4.5l8.5 7"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5V14h4v5.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17"/><path d="M8 3.5v3.5M16 3.5v3.5"/>',
    chat: '<path d="M20 6.5A1.5 1.5 0 0 0 18.5 5h-13A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16H8v3.4L12.6 16h5.9A1.5 1.5 0 0 0 20 14.5z"/><path d="M8.5 10.4h.01M12 10.4h.01M15.5 10.4h.01"/>',
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z"/><path d="M9 4v14M15 6v14"/>',
    alert: '<path d="M12 4.5 21 19.5H3z"/><path d="M12 10v4.4"/><path d="M12 17.2h.01"/>',
    food: '<path d="M3 11.5h18"/><path d="M19.5 11.5a7.5 7.5 0 0 1-15 0z"/><path d="M7 20h10"/><path d="M9.2 4.4c-.6.8-.6 1.6 0 2.4M14.8 4.4c-.6.8-.6 1.6 0 2.4"/>',
    bag: '<path d="M6 8h12l1 11.4a1 1 0 0 1-1 1.1H6a1 1 0 0 1-1-1.1L6 8z"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8"/>',
    bulb: '<path d="M9.5 18.5h5"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.7 10.7c.6.5.9 1.1 1 1.8h5.4c.1-.7.4-1.3 1-1.8A6 6 0 0 0 12 3z"/>',
    camera: '<rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><path d="M8.5 7.5 10 5h4l1.5 2.5"/><circle cx="12" cy="13.6" r="3.2"/>',
    swap: '<path d="M5 9h11l-3-3"/><path d="M19 15H8l3 3"/>',
    medical: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="M12 8.5v7M8.5 12h7"/>',
    folder: '<path d="M4 6.5h5l2 2.5h9v9.3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/>',
    check: '<circle cx="12" cy="12" r="8.5"/><path d="M8.4 12.3l2.5 2.5 4.7-4.9"/>',
    clipboard: '<rect x="5" y="5" width="14" height="16" rx="2.5"/><path d="M9 5V4.2A1.2 1.2 0 0 1 10.2 3h3.6A1.2 1.2 0 0 1 15 4.2V5"/><path d="M8.5 11h7M8.5 15h4.5"/>',
    back: '<path d="M14.5 6 8.5 12l6 6"/>',
    settings: '<path d="M4 8h9M17 8h3"/><path d="M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2"/><circle cx="9" cy="16" r="2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5 16 16"/>',
    pin: '<path d="M12 21s6.5-5.8 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.2 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'
  };
  A.icon = function (name, cls) {
    return `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
  };
})(window.App);

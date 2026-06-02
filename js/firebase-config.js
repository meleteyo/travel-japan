/* firebase-config.js — Firebase 웹 설정.
   웹 config는 공개돼도 안전한 식별자(접근통제는 Realtime DB 보안규칙이 담당).
   진짜 비밀은 '가족 코드'이며, 그것은 사용자가 입력/공유하고 저장소에 커밋하지 않는다.
   이 파일이 없거나 값이 비면 A.sync.available()가 false → 앱은 로컬-only로 안전 동작. */
window.App = window.App || {};
window.App.firebaseConfig = {
  apiKey: 'AIzaSyBpXck0JTWREbBSdrdP04pl6zTRNdc4V04',
  authDomain: 'tokyo-family-2026.firebaseapp.com',
  databaseURL: 'https://tokyo-family-2026-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'tokyo-family-2026',
  storageBucket: 'tokyo-family-2026.firebasestorage.app',
  messagingSenderId: '549352117690',
  appId: '1:549352117690:web:6d0994013983788379f983',
};

/**
 * Lightweight internationalization helper for Sonnetmdp & SonTube
 * Auto-detects device language (Vietnamese vs English) with fallback
 */

export type Locale = 'vi' | 'en';

export const getSystemLocale = (): Locale => {
  if (typeof navigator !== 'undefined' && navigator.language) {
    if (navigator.language.toLowerCase().startsWith('vi')) {
      return 'vi';
    }
  }
  return 'en';
};

export const getGreeting = (locale: Locale, userName?: string): string => {
  const hour = new Date().getHours();
  let timeStr = '';
  
  if (locale === 'vi') {
    if (hour < 12) timeStr = 'Chào buổi sáng';
    else if (hour < 18) timeStr = 'Chào buổi chiều';
    else timeStr = 'Chào buổi tối';
  } else {
    if (hour < 12) timeStr = 'Good morning';
    else if (hour < 18) timeStr = 'Good afternoon';
    else timeStr = 'Good evening';
  }

  if (userName) {
    return `${timeStr}, ${userName.split(' ')[0]}`;
  }
  return timeStr;
};

export const DICTIONARY = {
  vi: {
    appName: 'Sonnetmdp',
    tubeAppName: 'SonTube',
    navHome: 'Trang chủ',
    navSearch: 'Tìm kiếm',
    navLibrary: 'Thư viện',
    navTheatre: 'SonTube Video',
    chipAll: 'Tất cả',
    chipRelax: 'Thư giãn',
    chipSleep: 'Dễ ngủ',
    chipEnergize: 'Nạp năng lượng',
    chipWorkout: 'Tập luyện',
    chipFocus: 'Tập trung',
    chipParty: 'Tiệc tùng',
    chipCommute: 'Di chuyển',
    quickPickEyebrow: 'BẮT ĐẦU MỘT BÀI PHÁT',
    quickPickTitle: 'Chọn nhanh đài phát',
    listenAgain: 'Nghe lại',
    recommendedVideos: 'Video đề xuất SonTube',
    charts: 'Bảng xếp hạng Sonnetmdp',
    supermix: 'Tuyển tập đặc biệt (Supermix)',
    startStation: 'Phát đài',
    albumTag: 'Album',
    videoTag: 'Video',
    songTag: 'Bài hát',
    searchPlaceholder: 'Tìm bài hát, nghệ sĩ, video...',
    notifications: 'Thông báo',
    history: 'Lịch sử phát',
    settings: 'Cài đặt',
    offlineMusic: 'Nhạc ngoại tuyến',
    noHistoryDesc: 'Các bài hát bạn nghe sẽ xuất hiện tại đây',
  },
  en: {
    appName: 'Sonnetmdp',
    tubeAppName: 'SonTube',
    navHome: 'Home',
    navSearch: 'Search',
    navLibrary: 'Library',
    navTheatre: 'SonTube Video',
    chipAll: 'All',
    chipRelax: 'Relax',
    chipSleep: 'Sleep',
    chipEnergize: 'Energize',
    chipWorkout: 'Workout',
    chipFocus: 'Focus',
    chipParty: 'Party',
    chipCommute: 'Commute',
    quickPickEyebrow: 'START A RADIO',
    quickPickTitle: 'Quick Picks',
    listenAgain: 'Listen Again',
    recommendedVideos: 'SonTube Recommended Videos',
    charts: 'Sonnetmdp Top Charts',
    supermix: 'My Supermix',
    startStation: 'Start Radio',
    albumTag: 'Album',
    videoTag: 'Video',
    songTag: 'Song',
    searchPlaceholder: 'Search songs, artists, videos...',
    notifications: 'Notifications',
    history: 'History',
    settings: 'Settings',
    offlineMusic: 'Offline Library',
    noHistoryDesc: 'Tracks you listen to will appear here',
  },
};

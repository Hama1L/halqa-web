export interface PublicAuthor {
  id: string | null;
  displayName: string;
  isAnonymous: boolean;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  tags: string[];
  status: "OPEN" | "ANSWERED" | "CLOSED";
  createdAt: string;
  author: PublicAuthor;
  answersCount?: number;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  body: string;
  upvotes: number;
  upvotedByMe: boolean;
  createdAt: string;
  author: PublicAuthor;
}

export interface AyahSnapshot {
  number: number;
  arabic: string;
  translation: string;
}

export interface InsightComment {
  id: string;
  body: string;
  createdAt: string;
  author: PublicAuthor;
}

export interface Insight {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  ayahs: AyahSnapshot[];
  insightText: string;
  likes: number;
  likedByMe: boolean;
  commentsCount: number;
  comments?: InsightComment[];
  createdAt: string;
  author: PublicAuthor;
}

export interface Me {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  createdAt: string;
}

export interface MyQuestion {
  id: string;
  title: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  isAnonymous: boolean;
  isRemoved: boolean;
  createdAt: string;
}

export interface MyAnswer {
  id: string;
  body: string;
  isAnonymous: boolean;
  isRemoved: boolean;
  createdAt: string;
  question: { id: string; title: string };
}

export interface MyInsight {
  id: string;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  insightText: string;
  isAnonymous: boolean;
  isRemoved: boolean;
  likes: number;
  commentsCount: number;
  createdAt: string;
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

export interface SurahAyahFull {
  number: number;
  arabic: string;
  translation: string;
}

export interface SurahDetail {
  meta: SurahMeta;
  ayahs: SurahAyahFull[];
}
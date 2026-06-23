import { create } from 'zustand';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  bio: string;
  followersCount: number;
  followingCount: number;
}

interface Post {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  mediaURL: string;
  mediaType: 'image' | 'video' | 'audio';
  caption: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
  isLiked: boolean;
}

interface AppState {
  currentUser: User | null;
  isLoggedIn: boolean;
  setCurrentUser: (user: User | null) => void;
  setIsLoggedIn: (val: boolean) => void;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, data: Partial<Post>) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  isLoggedIn: false,
  setCurrentUser: (user) => set({ currentUser: user }),
  setIsLoggedIn: (val) => set({ isLoggedIn: val }),
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (id, data) => set((state) => ({
    posts: state.posts.map((p) => p.id === id ? { ...p, ...data } : p)
  })),
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
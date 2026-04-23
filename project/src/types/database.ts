export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Post, 'id' | 'created_at'>>;
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Omit<ContactMessage, 'id' | 'created_at'>;
        Update: never;
      };
      admin_profiles: {
        Row: AdminProfile;
        Insert: Omit<AdminProfile, 'created_at'>;
        Update: Partial<Omit<AdminProfile, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  category_id: string | null;
  meta_title: string;
  meta_description: string;
  keywords: string;
  published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithCategory extends Post {
  categories: Category | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

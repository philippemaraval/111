export type Size = "S" | "M" | "L" | "XL";

export type StockBySize = Record<Size, number>;

export type Coordinates = {
  lat: number;
  lng: number;
};

export type ProductGalleryImage = {
  label: string;
  url: string;
};

export type SeoMetadata = {
  slug?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  gallery?: ProductGalleryImage[];
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type NeighborhoodRow = {
  id: string;
  name: string;
  arrondissement: number;
  price: number;
  stock_by_size: Json;
  image_url: string;
  description_history: string;
  coordinates: Json;
  is_available: boolean;
  release_date: string | null;
  seo_metadata: Json;
};

export type NeighborhoodMetricsRow = {
  neighborhood_id: string;
  vote_count: number;
  sales_count: number;
  popularity_score: number;
};

export type Neighborhood = {
  id: string;
  name: string;
  slug: string;
  arrondissement: number;
  price: number;
  stockBySize: StockBySize;
  imageUrl: string;
  descriptionHistory: string;
  coordinates: Coordinates;
  isAvailable: boolean;
  releaseDate: string | null;
  seo: SeoMetadata;
  voteCount: number;
  salesCount: number;
  popularityScore: number;
  gallery: ProductGalleryImage[];
};

export type SearchIndexItem = {
  id: string;
  name: string;
  slug: string;
  arrondissement: number;
  isAvailable: boolean;
};

export type VoteRow = {
  id: string;
  email: string;
  neighborhood_id: string;
  created_at: string;
};

export type VoteSummary = {
  neighborhoodId: string;
  neighborhoodName: string;
  arrondissement: number;
  totalVotes: number;
  emails: string[];
};

export type CartItem = {
  neighborhoodId: string;
  slug: string;
  name: string;
  size: Size;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
};

export type Database = {
  public: {
    Tables: {
      neighborhoods: {
        Row: NeighborhoodRow;
        Insert: Omit<NeighborhoodRow, "id"> & { id?: string };
        Update: Partial<NeighborhoodRow>;
        Relationships: [];
      };
      votes: {
        Row: VoteRow;
        Insert: Omit<VoteRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<VoteRow>;
        Relationships: [
          {
            foreignKeyName: "votes_neighborhood_id_fkey";
            columns: ["neighborhood_id"];
            isOneToOne: false;
            referencedRelation: "neighborhoods";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          stripe_session_id: string;
          email: string | null;
          amount_total: number | null;
          currency: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          stripe_session_id: string;
          email?: string | null;
          amount_total?: number | null;
          currency?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          email?: string | null;
          amount_total?: number | null;
          currency?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          neighborhood_id: string;
          size: Size;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          neighborhood_id: string;
          size: Size;
          quantity: number;
          unit_price: number;
        };
        Update: Partial<{
          size: Size;
          quantity: number;
          unit_price: number;
        }>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_neighborhood_id_fkey";
            columns: ["neighborhood_id"];
            isOneToOne: false;
            referencedRelation: "neighborhoods";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      neighborhood_metrics: {
        Row: NeighborhoodMetricsRow;
        Relationships: [
          {
            foreignKeyName: "neighborhood_metrics_neighborhood_id_fkey";
            columns: ["neighborhood_id"];
            isOneToOne: true;
            referencedRelation: "neighborhoods";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

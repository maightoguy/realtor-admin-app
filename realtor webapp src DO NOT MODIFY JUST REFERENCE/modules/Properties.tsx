export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  commission: string;
  description?: string | null;
  contract_docs?: string[] | null;
  commission_percent?: number | null;
  land_size_sqm?: number | null;
  security?: string | null;
  accessibility?: string | null;
  topography?: string | null;
  status?: string | null;
  image: string;
  images: string[];
  type: string;
  category?: string | null;
}

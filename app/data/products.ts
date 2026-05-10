export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  createdAt?: any;
  updatedAt?: any;
}

export const products: Product[] = [];

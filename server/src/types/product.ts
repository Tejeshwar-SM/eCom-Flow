export interface Variant {
  type: 'color' | 'size' | 'style';
  name: string;
  options: string[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  variants: Variant[];
  inventory: number;
  createdAt: Date;
  updatedAt: Date;
}

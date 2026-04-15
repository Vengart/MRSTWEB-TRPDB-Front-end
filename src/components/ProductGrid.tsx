import type { Product } from '../types';
import ProductCard from './ProductCard';

export default function ProductGrid({
  products,
  cart,
  likes,
  onToggleCart,
  onToggleLike
}:{
  products: Product[];
  cart: Set<string>;
  likes: Set<string>;
  onToggleCart:(id:string)=>void;
  onToggleLike:(id:string)=>void;
}){
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14,marginTop:16}}>
      {products.map(p=> (
        <ProductCard key={p.id} product={p} inCart={cart.has(p.id)} liked={likes.has(p.id)} onToggleCart={onToggleCart} onToggleLike={onToggleLike} />
      ))}
    </div>
  );
}

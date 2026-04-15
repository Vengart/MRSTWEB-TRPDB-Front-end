import type { Product } from '../types';

export default function ProductCard({
  product,
  inCart,
  liked,
  onToggleCart,
  onToggleLike
}:{
  product: Product;
  inCart: boolean;
  liked: boolean;
  onToggleCart:(id:string)=>void;
  onToggleLike:(id:string)=>void;
}){
  return (
    <div style={{background:'#fff',padding:12,borderRadius:10,border:'1px solid #eceff6',display:'flex',flexDirection:'column',gap:8}}>
      <div style={{height:120,background:'#f0f2f7',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36}}>{product.img}</div>
        <div style={{fontWeight:600}}>{product.name}</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{color:'#7b3fe4',fontWeight:700}}>{product.price?('$'+product.price):'Бесплатно'}</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>onToggleCart(product.id)} style={{padding:'8px 10px',borderRadius:8,border:0,background:inCart?'#f3d9ff':'#eef2ff',color:'#7b3fe4',cursor:'pointer'}}>{inCart?'В корзине':'В корзину'}</button>
              <button onClick={()=>onToggleLike(product.id)} style={{background:'#fff',border:'1px solid #eee',padding:'6px 8px',borderRadius:8,cursor:'pointer'}}>{liked?'★':'☆'}</button>
            </div>
      </div>
    </div>
  );
}

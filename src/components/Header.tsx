export default function Header() {
  return (
    <header style={{background:'#fff',borderBottom:'1px solid #e6e9ef',padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{color:'#7b3fe4',fontWeight:700,fontSize:18}}>Orichalcum</div>
      <nav>
        <a href="#" style={{marginLeft:14,color:'#333',textDecoration:'none'}}>Каталог</a>
        <a href="#" style={{marginLeft:14,color:'#333',textDecoration:'none'}}>Избранное</a>
        <a href="#" style={{marginLeft:14,color:'#333',textDecoration:'none'}}>О нас</a>
      </nav>
    </header>
  );
}

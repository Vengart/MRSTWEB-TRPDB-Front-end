export default function Hero({ onGoto }: { onGoto?: () => void }) {
  return (
    <section style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'linear-gradient(90deg,#fff 60%, rgba(123,63,228,0.06))',padding:20,borderRadius:10}}>
      <div>
        <h1 style={{margin:0,fontSize:22}}>Orichalcum — место для ваших товаров и встреч</h1>
        <p style={{color:'#777',marginTop:6}}>Интерактивная база знаний и организация игр: заметки, события и объявления.</p>
        <div style={{marginTop:12}}>
          <button onClick={onGoto} style={{background:'#7b3fe4',color:'#fff',padding:'8px 12px',borderRadius:8,border:0,cursor:'pointer'}}>Перейти к каталогу</button>
        </div>
      </div>
      <div style={{maxWidth:320,textAlign:'right'}}>
        <div style={{fontWeight:700}}>Организуй встречи</div>
        <div style={{color:'#777'}}>Планируй, публикуй анонсы и веди заметки вместе с игроками</div>
      </div>
    </section>
  );
}

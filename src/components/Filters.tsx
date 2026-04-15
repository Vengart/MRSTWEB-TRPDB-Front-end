const CATS = [
  { id: 'all', label: 'Все' },
  { id: 'electronics', label: 'Электроника' },
  { id: 'clothing', label: 'Одежда' }
];

export default function Filters({ cat, onChange }:{cat:string; onChange:(c:string)=>void}){
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      {CATS.map(c=> (
        <button key={c.id} onClick={()=>onChange(c.id)} style={{padding:'8px 12px',borderRadius:8,border:c.id===cat?`1px solid #7b3fe4`:'1px solid transparent',background:'#fff',color:c.id===cat?'#7b3fe4':'#000',cursor:'pointer'}}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

export default function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{flex:1}}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Поиск товаров или заметок..."
        style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #dfe6f0'}}
      />
    </div>
  );
}

export default function GradeSelector({ selected, onChange }) {
  const grades = [6, 7, 8, 9, 10, 11, 12]
  return (
    <select 
      value={selected} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    >
      {grades.map(g => (
        <option key={g} value={g}>Grade {g}</option>
      ))}
    </select>
  )
}

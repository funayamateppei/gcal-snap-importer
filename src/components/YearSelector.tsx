interface Props {
  year: number
  onYearChange: (year: number) => void
}

export const YearSelector = ({ year, onYearChange }: Props) => {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-100">
      <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-2">
        対象年
      </label>
      <select
        id="year-select"
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}年
          </option>
        ))}
      </select>
    </div>
  )
}

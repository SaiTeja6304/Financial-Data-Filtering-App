import { useState, useEffect } from 'react';
import './App.css';
import './index.css';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [revenueRange, setRevenueRange] = useState({ min: '', max: '' });
  const [netIncomeRange, setNetIncomeRange] = useState({ min: '', max: '' });
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  const [activeFilter, setActiveFilter] = useState(null); // To handle dropdown-like filters

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/income-statement/AAPL?period=annual&apikey=${import.meta.env.VITE_API_URL}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
        setFilteredData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilter = () => {
    const filtered = data.filter((item) => {
      const itemYear = new Date(item.date).getFullYear();
      const startYear = dateRange.start ? parseInt(dateRange.start) : null;
      const endYear = dateRange.end ? parseInt(dateRange.end) : null;
  
      const isDateInRange =
        (!startYear || itemYear >= startYear) && (!endYear || itemYear <= endYear);
  
      const isRevenueInRange =
        (!revenueRange.min || item.revenue >= parseInt(revenueRange.min)) &&
        (!revenueRange.max || item.revenue <= parseInt(revenueRange.max));
  
      const isNetIncomeInRange =
        (!netIncomeRange.min || item.netIncome >= parseInt(netIncomeRange.min)) &&
        (!netIncomeRange.max || item.netIncome <= parseInt(netIncomeRange.max));
  
      return isDateInRange && isRevenueInRange && isNetIncomeInRange;
    });
  
    setFilteredData(filtered);
  };  
  
  const handleClear = () => {
    setDateRange({ start: '', end: '' });
    setRevenueRange({ min: '', max: '' });
    setNetIncomeRange({ min: '', max: '' });
    setSortConfig({ key: '', direction: '' });
    setFilteredData(data); // Reset to original data
  };
  

  const handleSort = (key) => {
    if (!key || !sortConfig.direction) return;

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(sortedData);
  };

  if (loading) return <div className="text-center text-lg font-bold mt-10">Loading...</div>;

  if (error) return <div className="text-center text-red-500 font-bold mt-10">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 max-w-full">
      <h1 className="text-3xl font-bold text-center mb-6 relative">
        Financial Data Filtering App
        <span
          className="absolute h-1 w-48 left-1/2 transform -translate-x-1/2 bottom-0 bg-gradient-to-r from-blue-500 to-blue-800"
        ></span>
      </h1>

      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
          {['date', 'revenue', 'netIncome'].map((filter) => (
            <div key={filter} className="mb-4">
              <button
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)} Filter
              </button>
              {activeFilter === filter && (
                <div className="mt-2 space-y-2">
                  {filter === 'date' ? (
                    <>
                      <select
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      >
                        <option value="">Start Year</option>
                        {Array.from({ length: 2100 - 1500 + 1 }, (_, i) => 1500 + i).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <select
                        className="border border-gray-300 rounded px-2 py-1 w-full mt-2"
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      >
                        <option value="">End Year</option>
                        {Array.from({ length: 2100 - 1500 + 1 }, (_, i) => 1500 + i).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        placeholder="Min"
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                        onChange={(e) =>
                          filter === 'revenue'
                            ? setRevenueRange({ ...revenueRange, min: e.target.value })
                            : setNetIncomeRange({ ...netIncomeRange, min: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="border border-gray-300 rounded px-2 py-1 w-full mt-2"
                        onChange={(e) =>
                          filter === 'revenue'
                            ? setRevenueRange({ ...revenueRange, max: e.target.value })
                            : setNetIncomeRange({ ...netIncomeRange, max: e.target.value })
                        }
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
            onClick={handleFilter}
          >
            Apply Filters
          </button>
          <button
          className="mt-4 ml-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
          onClick={handleClear}
          >
            Clear Filters & Sorting
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Sorting Options</h2>
          <div className="flex flex-col gap-4">
            <div className="w-full sm:w-auto">
              <label className="block mb-1">Sort By</label>
              <select
                className="border border-gray-300 rounded px-2 py-1 w-full"
                onChange={(e) => setSortConfig({ ...sortConfig, key: e.target.value })}
                value={sortConfig.key || ''}
              >
                <option value="">Select</option>
                <option value="date">Date</option>
                <option value="revenue">Revenue</option>
                <option value="netIncome">Net Income</option>
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <label className="block mb-1">Order</label>
              <select
                className="border border-gray-300 rounded px-2 py-1 w-full"
                onChange={(e) => setSortConfig({ ...sortConfig, direction: e.target.value })}
                value={sortConfig.direction || ''}
              >
                <option value="ascending">Ascending</option>
                <option value="descending">Descending</option>
              </select>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => handleSort(sortConfig.key)}
            >
              Apply Sort
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4 text-center">Financial Data Table</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-black">
          <thead>
            <tr className="bg-blue-100">
              <th
                className="px-4 py-2 border border-black text-left cursor-pointer text-center"
                onClick={() => handleSort('date')}
              >
                Date {sortConfig.key === 'date' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
              <th
                className="px-4 py-2 border border-black text-left cursor-pointer text-center"
                onClick={() => handleSort('revenue')}
              >
                Revenue {sortConfig.key === 'revenue' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
              <th
                className="px-4 py-2 border border-black text-left cursor-pointer text-center"
                onClick={() => handleSort('netIncome')}
              >
                Net Income {sortConfig.key === 'netIncome' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
              <th className="px-4 py-2 border border-black text-left text-center">Gross Profit</th>
              <th className="px-4 py-2 border border-black text-left text-center">EPS</th>
              <th className="px-4 py-2 border border-black text-left text-center">Operating Income</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="odd:bg-white even:bg-gray-100">
                <td className="px-4 py-2 border border-black">{item.date}</td>
                <td className="px-4 py-2 border border-black">${item.revenue.toLocaleString()}</td>
                <td className="px-4 py-2 border border-black">${item.netIncome.toLocaleString()}</td>
                <td className="px-4 py-2 border border-black">${item.grossProfit.toLocaleString()}</td>
                <td className="px-4 py-2 border border-black">{item.eps}</td>
                <td className="px-4 py-2 border border-black">${item.operatingIncome.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;

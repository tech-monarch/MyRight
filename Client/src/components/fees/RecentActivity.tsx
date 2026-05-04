const transactions = [
  { id: 'TX-990211', description: 'Initial Fee - Case #101', date: '25th March, 2024', status: 'Cleared', amount: '$250.00' },
  { id: 'TX-990211', description: 'Mediation Fee - Case #101', date: '30th March, 2024', status: 'Cleared', amount: '$1500.00' },
  { id: 'TX-990211', description: 'Initial Fee - Case #082', date: '17th October, 2023', status: 'Cleared', amount: '$250.00' },
];

export default function RecentActivity() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-700 mb-6">Recent Financial Activity</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-2 w-1/5">TRANSACTION ID</th>
              <th className="py-4 px-2 w-1/3">DESCRIPTION</th>
              <th className="py-4 px-2 w-1/5">DATE</th>
              <th className="py-4 px-2 w-1/6">STATUS</th>
              <th className="py-4 px-2 w-1/6 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-5 px-2 text-gray-500">{tx.id}</td>
                <td className="py-5 px-2 text-gray-700 font-medium">{tx.description}</td>
                <td className="py-5 px-2 text-gray-500">{tx.date}</td>
                <td className="py-5 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                    <span className="text-[#10B981] font-bold text-[13px]">{tx.status}</span>
                  </div>
                </td>
                <td className="py-5 px-2 text-right text-gray-800 font-medium">{tx.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 mt-2 w-full h-1"></div>
    </div>
  );
}

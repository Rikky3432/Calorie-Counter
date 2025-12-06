import React from 'react';
import { AnalysisResult, FoodItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Award, Flame, Zap, Droplet, Dumbbell, AlertCircle } from 'lucide-react';

interface NutritionDisplayProps {
  data: AnalysisResult;
  onReset: () => void;
}

const COLORS = ['#F87171', '#60A5FA', '#34D399']; // Fat (Red), Carbs (Blue), Protein (Green) - standard macro colors

export const NutritionDisplay: React.FC<NutritionDisplayProps> = ({ data, onReset }) => {
  const chartData = [
    { name: 'Fat', value: data.fat, unit: 'g' },
    { name: 'Carbs', value: data.carbs, unit: 'g' },
    { name: 'Protein', value: data.protein, unit: 'g' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Summary Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-slate-100">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="text-orange-400" fill="currentColor" />
              {data.totalCalories} <span className="text-base font-normal opacity-80">kcal</span>
            </h2>
            <p className="text-slate-300 text-sm mt-1">Total Energy</p>
          </div>
          <div className="text-right">
             <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-sm">
                <Award size={14} className="text-yellow-400" />
                Score: {data.confidenceScore}%
             </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Macro Chart */}
            <div className="w-48 h-48 relative flex-shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                 <span className="text-xs text-slate-400 font-medium">Macros</span>
              </div>
            </div>

            {/* Macro Breakdown Grid */}
            <div className="flex-1 w-full grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 bg-red-50 rounded-2xl border border-red-100">
                <div className="p-2 bg-red-100 text-red-500 rounded-full mb-2">
                  <Droplet size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{data.fat}g</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fat</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="p-2 bg-blue-100 text-blue-500 rounded-full mb-2">
                  <Zap size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{data.carbs}g</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Carbs</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-green-50 rounded-2xl border border-green-100">
                <div className="p-2 bg-green-100 text-green-500 rounded-full mb-2">
                  <Dumbbell size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{data.protein}g</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Protein</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Food Items List */}
      <h3 className="text-lg font-bold text-slate-800 mb-3 px-1">Detailed Breakdown</h3>
      <div className="space-y-3 mb-6">
        {data.items.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center transition hover:shadow-md">
            <div>
              <h4 className="font-semibold text-slate-800">{item.name}</h4>
              <p className="text-sm text-slate-500">{item.portionSize}</p>
            </div>
            <div className="text-right">
              <span className="block font-bold text-slate-800">{item.calories} kcal</span>
              <div className="text-xs text-slate-400 flex gap-2 justify-end">
                <span className="text-green-600">P: {item.protein}g</span>
                <span className="text-blue-500">C: {item.carbs}g</span>
                <span className="text-red-400">F: {item.fat}g</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Health Tip */}
      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex gap-4 items-start mb-8">
        <div className="text-indigo-600 mt-1 flex-shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="font-semibold text-indigo-900 mb-1">Health Insight</h4>
          <p className="text-indigo-800 text-sm leading-relaxed">{data.healthTip}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="text-center pb-8">
        <button
          onClick={onReset}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Scan Another Meal
        </button>
      </div>
    </div>
  );
};

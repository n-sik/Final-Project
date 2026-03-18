import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import commonBarStyles from '../../Common/CommonBar.module.css';

const DashboardTab = ({ chartData }) => (
  <div className={commonBarStyles.chartContainer} style={{ width: '100%', flex: 1, minHeight: 0 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
        <YAxis hide domain={[0, 100]} />
        <Tooltip cursor={{fill: '#f8fafc'}} />
        <Bar dataKey="progress" radius={[4, 4, 0, 0]} barSize={45}>
          {chartData.map((e, i) => (
            <Cell key={i} fill={e.progress >= 80 ? '#10b981' : e.progress >= 40 ? '#3b82f6' : '#ef4444'} />
          ))}
          <LabelList dataKey="progress" position="top" fill="#64748b" fontSize={11} formatter={v => `${v}%`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default DashboardTab;
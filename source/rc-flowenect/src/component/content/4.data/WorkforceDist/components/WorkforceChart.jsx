import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from '../WorkforceDist.module.css';
import commonBarStyles from '../../Common/CommonBar.module.css'; // 공통 바 스타일 임포트

const STATUS_COLORS = {
  WORK: { fill: '#10b981', bg: '#ecfdf5' },
  LEAVE: { fill: '#f59e0b', bg: '#fffbeb' },
  RESIGN: { fill: '#ef4444', bg: '#fef2f2' },
};

const WorkforceChart = ({ data = [], onBarClick }) => {
  if (!data || data.length === 0) {
    return <div className={styles.viewPort} style={{ textAlign: 'center', padding: '100px 0' }}>데이터가 없습니다.</div>;
  }

  // 데이터 집계 로직
  const chartData = Object.entries(
    data.reduce((acc, cur) => {
      const dept = cur.deptNm || '미지정';
      if (!acc[dept]) {
        acc[dept] = { name: dept, work: 0, leave: 0, resign: 0 };
      }
      const status = cur.empStatNm || ''; 
      if (status === '재직') acc[dept].work += 1;
      else if (status === '휴직') acc[dept].leave += 1;
      else if (status === '퇴사') acc[dept].resign += 1;
      return acc;
    }, {})
  )
  .map(([_, value]) => value)
  .sort((a, b) => (b.work + b.leave + b.resign) - (a.work + a.leave + a.resign));

  // Bar 공통 속성 정의 (중복 제거 및 테두리 방멸)
  const commonBarProps = {
    stackId: "a",
    barSize: 45,
    activeBar: false, // 클릭 시 강조 테두리 제거
    tabIndex: -1,     // 포커스 방지
    style: { outline: 'none', cursor: 'pointer' }
  };

  return (
    /* commonBarStyles.chartContainer 적용으로 SVG 외곽선 원천 차단 */
    <div className={`${styles.viewPort} ${commonBarStyles.chartContainer}`} >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: -20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
            dy={10} 
            interval={0}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            allowDecimals={false}
          />
          
          <Tooltip 
            cursor={{ fill: '#f8fafc' }} 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', // 테두리 제거
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '12px',
              outline: 'none' // 포커스 테두리 제거
            }}
          />
          
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px' }}
            formatter={(value) => <span style={{ color: '#475569', fontWeight: 600, fontSize: '13px' }}>{value}</span>}
          />
          
          <Bar 
            {...commonBarProps}
            dataKey="work" 
            name="재직" 
            fill={STATUS_COLORS.WORK.fill} 
            onClick={(s) => onBarClick?.(s.name)}
          />
          <Bar 
            {...commonBarProps}
            dataKey="leave" 
            name="휴직" 
            fill={STATUS_COLORS.LEAVE.fill} 
            onClick={(s) => onBarClick?.(s.name)}
          />
          <Bar 
            {...commonBarProps}
            dataKey="resign" 
            name="퇴사" 
            fill={STATUS_COLORS.RESIGN.fill} 
            radius={[6, 6, 0, 0]} 
            onClick={(s) => onBarClick?.(s.name)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkforceChart;
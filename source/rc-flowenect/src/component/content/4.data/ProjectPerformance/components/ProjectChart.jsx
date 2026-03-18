import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from '../ProjectPerformance.module.css';
// commonBarStyles는 실제 클래스 적용을 위해 임포트 상태로 둡니다.
import commonBarStyles from '../../Common/CommonBar.module.css';

const ProjectChart = ({ data, colors, onBarClick }) => {
  return (
    /* commonBarStyles.chartContainer 클래스를 추가하여 SVG 외곽선을 잡습니다. */
    <div className={`${styles.chartWrapper} ${commonBarStyles.chartContainer}`} style={{ width: '100%', height: '477px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 30, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            dy={10} 
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          
          <Tooltip 
            cursor={{ fill: '#f8fafc' }} 
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              outline: 'none' // 툴팁 자체 아웃라인 제거
            }}
          />
          
          <Legend 
            iconType="circle" 
            verticalAlign="top" 
            align="right" 
            wrapperStyle={{ paddingBottom: '20px', fontSize: '13px', fontWeight: 600 }}
          />
          
          {/* Bar 공통 속성: 
            1. activeBar={false}로 클릭 시 리차트 기본 강조 테두리 제거 
            2. tabIndex={-1}로 브라우저 포커스 링 원천 차단
            3. outline: 'none'으로 시각적 잔상 제거
          */}
          <Bar 
            dataKey="end" 
            name="완료" 
            stackId="a" 
            fill={colors.END} 
            barSize={45}
            activeBar={false}
            tabIndex={-1}
            onClick={(state) => onBarClick && onBarClick(state.name)}
            style={{ cursor: 'pointer', outline: 'none' }}
          />
          <Bar 
            dataKey="ing" 
            name="진행" 
            stackId="a" 
            fill={colors.ING} 
            activeBar={false}
            tabIndex={-1}
            onClick={(state) => onBarClick && onBarClick(state.name)}
            style={{ cursor: 'pointer', outline: 'none' }}
          />
          <Bar 
            dataKey="delay" 
            name="지연" 
            stackId="a" 
            fill={colors.DELAY} 
            radius={[4, 4, 0, 0]}
            activeBar={false}
            tabIndex={-1}
            onClick={(state) => onBarClick && onBarClick(state.name)}
            style={{ cursor: 'pointer', outline: 'none' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectChart;
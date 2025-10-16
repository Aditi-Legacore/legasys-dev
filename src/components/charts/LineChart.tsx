'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import {
  isToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
  format,
  eachHourOfInterval,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns';

interface Intake {
  id: string;
  updatedAt: string;
  // other fields...
}

export default function LineChart() {
  const [period, setPeriod] = useState('day');
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntakes = async () => {
      try {
        const response = await fetch('/api/intake');
        const data = await response.json();
        setIntakes(data);
      } catch (error) {
        console.error('Failed to fetch intakes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIntakes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getChartData = (period: string, intakes: Intake[]) => {
    const now = new Date();
    let filteredIntakes: Intake[] = [];
    let categories: string[] = [];
    let data: number[] = [];

    switch (period) {
      case 'day':
        filteredIntakes = intakes.filter((intake) => isToday(new Date(intake.updatedAt)));
        categories = eachHourOfInterval({ start: startOfDay(now), end: endOfDay(now) }).map((hour: Date) => format(hour, 'HH:mm'));
        data = categories.map((_, index) => {
          const hourStart = new Date(now);
          hourStart.setHours(index, 0, 0, 0);
          const hourEnd = new Date(hourStart);
          hourEnd.setHours(index + 1, 0, 0, 0);
          return filteredIntakes.filter((intake) => {
            const updatedAt = new Date(intake.updatedAt);
            return updatedAt >= hourStart && updatedAt < hourEnd;
          }).length;
        });
        break;
      case 'week':
        filteredIntakes = intakes.filter((intake) => {
          const updatedAt = new Date(intake.updatedAt);
          return updatedAt >= startOfWeek(now) && updatedAt <= endOfWeek(now);
        });
        categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        data = categories.map((_, index) => {
          const dayStart = new Date(startOfWeek(now));
          dayStart.setDate(dayStart.getDate() + index);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          return filteredIntakes.filter((intake) => {
            const updatedAt = new Date(intake.updatedAt);
            return updatedAt >= dayStart && updatedAt < dayEnd;
          }).length;
        });
        break;
      case 'month':
        filteredIntakes = intakes.filter((intake) => {
          const updatedAt = new Date(intake.updatedAt);
          return updatedAt >= startOfMonth(now) && updatedAt <= endOfMonth(now);
        });
        const weeks = eachWeekOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });
        categories = weeks.map((week: Date, index: number) => `Week ${index + 1}`);
        data = weeks.map((weekStart: Date, index: number) => {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return filteredIntakes.filter((intake) => {
            const updatedAt = new Date(intake.updatedAt);
            return updatedAt >= weekStart && updatedAt <= weekEnd;
          }).length;
        });
        break;
      case 'year':
        filteredIntakes = intakes.filter((intake) => {
          const updatedAt = new Date(intake.updatedAt);
          return updatedAt >= startOfYear(now) && updatedAt <= endOfYear(now);
        });
        categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data = categories.map((_, index) => {
          const monthStart = new Date(now.getFullYear(), index, 1);
          const monthEnd = new Date(now.getFullYear(), index + 1, 0);
          return filteredIntakes.filter((intake) => {
            const updatedAt = new Date(intake.updatedAt);
            return updatedAt >= monthStart && updatedAt <= monthEnd;
          }).length;
        });
        break;
      default:
        categories = [];
        data = [];
    }

    return { categories, data };
  };

  const { categories, data } = getChartData(period, intakes);

  const options = {
    chart: {
      type: 'line' as const,
      height: 350,
    },
    xaxis: {
      categories,
    },
    yaxis: {
      title: {
        text: 'Number of Intakes',
      },
    },
    stroke: {
      curve: 'smooth' as const,
    },
  };

  const series = [
    {
      name: 'Intakes',
      data,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Daily Case Intake Report
        </h1>        
        <label htmlFor="period-select" className="mr-2">Select Period:</label>
        <select
          id="period-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border rounded p-2"
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
}

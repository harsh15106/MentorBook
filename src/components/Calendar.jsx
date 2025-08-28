// src/components/Calendar.jsx

import React, { useState } from 'react';
import './Calendar.css';

const Calendar = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get today's date and reset the time to midnight for accurate comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentYear, currentMonth + offset, 1));
  };

  const handleDayClick = (day) => {
    const newSelectedDate = new Date(currentYear, currentMonth, day);
    // --- EDIT: Prevent selecting today or any past date ---
    if (newSelectedDate <= today) return;
    onDateSelect(newSelectedDate);
  };

  const renderDays = () => {
    const days = [];
    // Add blank spaces for the days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    // Add the actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentYear, currentMonth, day);
      // --- EDIT: A date is now considered disabled if it's today or in the past ---
      const isDisabled = dayDate <= today;
      const isSelected = selectedDate && dayDate.toDateString() === selectedDate.toDateString();
      const isToday = dayDate.toDateString() === today.toDateString();

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)} className="nav-button">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="month-year">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button onClick={() => changeMonth(1)} className="nav-button">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      <div className="calendar-grid">
        {daysOfWeek.map(day => (
          <div key={day} className="day-of-week">{day}</div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;

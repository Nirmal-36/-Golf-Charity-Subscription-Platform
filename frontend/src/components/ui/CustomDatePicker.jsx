import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDatePicker = ({ value, onChange, label, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format as YYYY-MM-DD for consistency with native date handling
    const formattedDate = selectedDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === viewDate.getMonth() && 
           today.getFullYear() === viewDate.getFullYear();
  };

  const isSelected = (day) => {
    if (!value) return false;
    const current = new Date(value);
    return current.getDate() === day && 
           current.getMonth() === viewDate.getMonth() && 
           current.getFullYear() === viewDate.getFullYear();
  };

  const renderDays = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8 md:w-10 md:h-10"></div>);
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      days.push(
        <button
          key={d}
          type="button"
          onClick={() => handleDateSelect(d)}
          className={`w-8 h-8 md:w-10 md:h-10 rounded-xl font-bold transition-all text-sm flex items-center justify-center ${
            isSelected(d) 
              ? 'bg-brand-green text-white scale-110 shadow-lg' 
              : isToday(d)
                ? 'bg-brand-green/10 text-brand-green'
                : 'hover:bg-gray-100 text-brand-dark'
          }`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
          {label} {required && <span className="text-brand-green">*</span>}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50 border-2 transition-all rounded-2xl p-4 font-bold text-left flex items-center justify-between outline-none ${
          isOpen ? 'border-brand-green bg-white shadow-lg' : 'border-transparent hover:bg-gray-100'
        }`}
      >
        <span className={value ? 'text-brand-dark' : 'text-gray-400'}>
          {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select Date'}
        </span>
        <Calendar size={20} className="text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute z-[100] mt-2 bg-white rounded-[32px] shadow-2xl border border-gray-100 p-6 w-72 md:w-80"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-black text-brand-dark">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h4>
              <div className="flex gap-2">
                <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-[10px] font-black text-gray-400 text-center uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderDays()}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-50 text-center">
              <button 
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  onChange(today);
                  setIsOpen(false);
                }}
                className="text-xs font-black text-brand-green uppercase tracking-widest hover:underline"
              >
                Go to Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;

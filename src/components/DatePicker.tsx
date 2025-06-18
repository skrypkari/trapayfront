import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(date);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.date-picker-container')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const quickSelects = [
    { label: 'Today', onClick: () => handleDateSelect(new Date()) },
    { label: 'Yesterday', onClick: () => handleDateSelect(new Date(Date.now() - 86400000)) },
    { label: 'Last Week', onClick: () => handleDateSelect(new Date(Date.now() - 7 * 86400000)) },
    { label: 'Last Month', onClick: () => handleDateSelect(new Date(Date.now() - 30 * 86400000)) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="date-picker-container absolute z-50 mt-2 p-4 bg-white rounded-xl shadow-xl border border-gray-200 w-[320px]"
    >
      {/* Quick Select Section */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {quickSelects.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          <h2 className="text-sm font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day, index) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={index}
                onClick={() => handleDateSelect(day)}
                className={`
                  relative h-8 w-8 flex items-center justify-center text-sm rounded-full
                  transition-all duration-200
                  ${!isCurrentMonth && 'text-gray-300'}
                  ${isSelected && 'bg-primary text-white'}
                  ${!isSelected && isCurrentMonth && 'hover:bg-primary/10'}
                  ${isCurrentDay && !isSelected && 'text-primary font-semibold'}
                `}
              >
                {format(day, 'd')}
                {isCurrentDay && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">Selected:</div>
          <div className="text-sm font-medium text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DatePicker;
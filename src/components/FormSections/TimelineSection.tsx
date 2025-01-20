import React from 'react';
import { Calendar } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import pl from 'date-fns/locale/pl';

registerLocale('pl', pl);

interface TimelineSectionProps {
  decisionDate: string;
  implementationDate: string;
  onDateChange: (field: 'decisionDate' | 'implementationDate', value: string) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  decisionDate,
  implementationDate,
  onDateChange,
}) => {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 5);

  const formatDate = (dateString: string): Date | null => {
    return dateString ? new Date(dateString) : null;
  };

  const handleDateChange = (field: 'decisionDate' | 'implementationDate', date: Date | null) => {
    onDateChange(field, date ? date.toISOString().split('T')[0] : '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6 text-[#0066CC]" />
        <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
          Harmonogram projektu
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Do kiedy musisz wybrać system/dostawcę? *
          </label>
          <div className="sf-calendar-wrapper">
            <Calendar className="sf-calendar-icon" />
            <DatePicker
              selected={formatDate(decisionDate)}
              onChange={(date: Date) => handleDateChange('decisionDate', date)}
              minDate={today}
              maxDate={maxDate}
              locale="pl"
              dateFormat="dd MMMM yyyy"
              className="sf-calendar-input"
              placeholderText="Wybierz datę"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Do kiedy powinien zostać wdrożony system? *
          </label>
          <div className="sf-calendar-wrapper">
            <Calendar className="sf-calendar-icon" />
            <DatePicker
              selected={formatDate(implementationDate)}
              onChange={(date: Date) => handleDateChange('implementationDate', date)}
              minDate={formatDate(decisionDate) || today}
              maxDate={maxDate}
              locale="pl"
              dateFormat="dd MMMM yyyy"
              className="sf-calendar-input"
              placeholderText="Wybierz datę"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};
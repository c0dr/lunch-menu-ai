import { type FC, type ChangeEvent } from 'react';

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  isDisabled?: boolean;
}

export const DatePicker: FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  minDate,
  maxDate,
  isDisabled = false,
}) => {
  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="date-picker" className="text-sm font-medium text-gray-700">
        Select Date
      </label>
      <input
        type="date"
        id="date-picker"
        value={selectedDate}
        onChange={handleDateChange}
        min={minDate}
        max={maxDate}
        disabled={isDisabled}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
};
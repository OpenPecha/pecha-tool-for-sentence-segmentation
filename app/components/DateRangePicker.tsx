import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
function DateRangePickerWrapper({ startDate, onChange, endDate }) {
  return (
    <div className="flex justify-center gap-3 mb-5">
      <div className="flex items-center gap-2">
        Start:
        <DatePicker
          selected={startDate}
          onChange={(date) => onChange({ endDate, startDate: date })}
        />
      </div>
      <div className="flex items-center gap-2">
        End:
        <DatePicker
          selected={endDate}
          onChange={(date) => onChange({ startDate, endDate: date })}
        />
      </div>
    </div>
  );
}

export default DateRangePickerWrapper;

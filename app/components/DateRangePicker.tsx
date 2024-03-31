import {useEffect,useState} from 'react'
import DatePicker from "react-datepicker";
function DateRangePickerWrapper({range,onChange}) {


    return (
        <div className='flex justify-center gap-3 mb-5'>
  <div className='border border-gray-600 rounded-md p-2'>
     Start: <DatePicker selected={range.startDate} onChange={(date) => onChange({...range,startDate:date})}  />
    </div>
  <div className=' border border-gray-600 rounded-md p-2'>

      End: <DatePicker selected={range.endDate} onChange={(date) => onChange({...range,endDate:date})} />        

</div>        </div>
    );
}

export default DateRangePickerWrapper

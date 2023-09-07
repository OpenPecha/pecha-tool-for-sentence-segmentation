import { useState } from "react";

function useTimeTracker() {
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(Date.now());
  let timeDiff = endTime - startTime;
  return { startTime, endTime, timeDiff };
}

export default useTimeTracker;

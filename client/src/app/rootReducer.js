import authReducer from '../features/auth/authSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import leaveReducer from '../features/leave/leaveSlice';

const rootReducer = {
  auth: authReducer,
  attendance: attendanceReducer,
  leave: leaveReducer,
};

export default rootReducer;

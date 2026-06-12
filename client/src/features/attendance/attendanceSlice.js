const initialState = {
  history: [],
  todayStatus: { punchedIn: false, punchedOut: false, attendance: null },
  loading: false,
  error: null,
};

export default function attendanceReducer(state = initialState, action) {
  switch (action.type) {
    case 'attendance/fetchRequest':
      return { ...state, loading: true, error: null };
    case 'attendance/fetchHistorySuccess':
      return { ...state, loading: false, history: action.payload };
    case 'attendance/fetchStatusSuccess':
      return { ...state, loading: false, todayStatus: action.payload };
    case 'attendance/punchSuccess':
      return {
        ...state,
        loading: false,
        todayStatus: {
          punchedIn: !!action.payload.punchIn,
          punchedOut: !!action.payload.punchOut,
          attendance: action.payload
        }
      };
    case 'attendance/fetchFailure':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

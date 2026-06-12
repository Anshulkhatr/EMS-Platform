const initialState = {
  balance: { casual: 0, sick: 0, earned: 0, unpaid: 0 },
  history: [],
  approvals: [],
  loading: false,
  error: null,
};

export default function leaveReducer(state = initialState, action) {
  switch (action.type) {
    case 'leave/fetchRequest':
      return { ...state, loading: true, error: null };
    case 'leave/fetchBalanceSuccess':
      return { ...state, loading: false, balance: action.payload };
    case 'leave/fetchHistorySuccess':
      return { ...state, loading: false, history: action.payload };
    case 'leave/fetchApprovalsSuccess':
      return { ...state, loading: false, approvals: action.payload };
    case 'leave/actionSuccess':
      return { ...state, loading: false };
    case 'leave/fetchFailure':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

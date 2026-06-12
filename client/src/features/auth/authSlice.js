const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

// Simple reducer definition since we'll use clean RTK-like standard dispatching
export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case 'auth/loginRequest':
    case 'auth/registerRequest':
      return { ...state, loading: true, error: null };
    case 'auth/loginSuccess':
    case 'auth/registerSuccess':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return { ...state, loading: false, token: action.payload.token, user: action.payload.user, error: null };
    case 'auth/loginFailure':
    case 'auth/registerFailure':
      return { ...state, loading: false, error: action.payload };
    case 'auth/logout':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { ...state, token: null, user: null, loading: false, error: null };
    default:
      return state;
  }
}

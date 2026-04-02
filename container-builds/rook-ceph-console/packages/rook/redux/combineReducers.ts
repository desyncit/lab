import { combineReducers } from 'redux';
import { rookNamespaceReducer, rookSystemFlagsReducer } from './reducers';
import {
  rookNamespaceReducerName,
  rookSystemFlagsReducerName,
} from './selectors';

export default combineReducers({
  [rookNamespaceReducerName]: rookNamespaceReducer,
  [rookSystemFlagsReducerName]: rookSystemFlagsReducer,
});

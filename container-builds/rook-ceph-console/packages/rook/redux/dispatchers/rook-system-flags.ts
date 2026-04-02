import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ROOKSystemFlagsPayload, setROOKSystemFlags } from '../actions';

type UseROOKSystemFlagsDispatch = () => (payload: ROOKSystemFlagsPayload) => void;

export const useROOKSystemFlagsDispatch: UseROOKSystemFlagsDispatch = () => {
  const dispatch = useDispatch();

  return useCallback(
    (payload: ROOKSystemFlagsPayload) => {
      dispatch(setROOKSystemFlags(payload));
    },
    [dispatch]
  );
};

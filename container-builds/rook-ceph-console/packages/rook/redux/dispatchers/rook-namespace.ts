import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { NsPayload, setROOKNamespace } from '../actions';

type UseROOKNamespaceDispatch = () => (payload: NsPayload) => void;

export const useROOKNamespaceDispatch: UseROOKNamespaceDispatch = () => {
  const dispatch = useDispatch();

  return useCallback(
    (payload: NsPayload) => {
      dispatch(setROOKNamespace(payload));
    },
    [dispatch]
  );
};

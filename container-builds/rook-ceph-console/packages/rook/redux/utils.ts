import * as React from 'react';
import { useLocation } from 'react-router-dom-v5-compat';
import { useROOKSystemFlagsSelector } from './selectors/rook-system-flags';

type ClusterDetails = {
  clusterName: string;
  clusterNamespace: string;
};

export const useGetInternalClusterDetails = (): ClusterDetails => {
  const { systemFlags } = useROOKSystemFlagsSelector();

  return React.useMemo(() => {
    const internalClusterDetails = Object.entries(systemFlags).find(
      ([, info]) => info.isInternalMode
    );
    if (!internalClusterDetails) {
      return {
        clusterName: '',
        clusterNamespace: '',
      };
    }

    return {
      clusterName: internalClusterDetails[1].rookSystemName,
      clusterNamespace: internalClusterDetails[0],
    };
  }, [systemFlags]);
};

export const useGetExternalClusterDetails = (): ClusterDetails => {
  const { systemFlags } = useROOKSystemFlagsSelector();

  return React.useMemo(() => {
    const externalClusterDetails = Object.entries(systemFlags).find(
      ([, info]) => info.isExternalMode
    );
    if (!externalClusterDetails) {
      return {
        clusterName: '',
        clusterNamespace: '',
      };
    }

    return {
      clusterName: externalClusterDetails[1].rookSystemName,
      clusterNamespace: externalClusterDetails[0],
    };
  }, [systemFlags]);
};

export const useGetClusterDetails = (): ClusterDetails => {
  const internal = useGetInternalClusterDetails();
  const external = useGetExternalClusterDetails();

  const location = useLocation();

  return location.pathname.includes('/rook/external-systems')
    ? external
    : internal;
};

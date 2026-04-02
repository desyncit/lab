import * as React from 'react';
import {
  isExternalCluster,
  isClusterIgnored,
  isNFSEnabled,
} from '@odf/core/utils';
import { CephObjectStoreModel } from '@odf/shared';
import { useDeepCompareMemoize } from '@odf/shared/hooks/deep-compare-memoize';
import { CephClusterModel, StorageClusterModel } from '@odf/shared/models';
import { getName, getNamespace } from '@odf/shared/selectors';
import {
  StorageClusterKind,
  CephClusterKind,
  K8sResourceKind,
} from '@odf/shared/types';
import { referenceForModel } from '@odf/shared/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ROOKSystemFlagsPayload } from '../actions';
import { useROOKSystemFlagsDispatch } from '../dispatchers';

const watchResources = {
  scs: {
    kind: referenceForModel(StorageClusterModel),
    isList: true,
  },
  ccs: {
    kind: referenceForModel(CephClusterModel),
    isList: true,
  },
  coss: {
    kind: referenceForModel(CephObjectStoreModel),
    isList: true,
  },
};

type UseROOKSystemFlagsPayload = {
  storageClusters: StorageClusterKind[];
  cephClusters: CephClusterKind[];
  objectStores: K8sResourceKind[];
  allLoaded: boolean;
  anyError: Error;
};

const useROOKSystemFlagsPayload = ({
  storageClusters,
  cephClusters,
  objectStores,
  allLoaded,
  anyError,
}: UseROOKSystemFlagsPayload): ROOKSystemFlagsPayload => {
  const payload: ROOKSystemFlagsPayload = React.useMemo(() => {
    if (allLoaded && !anyError) {
      return storageClusters?.reduce(
        (acc: ROOKSystemFlagsPayload, sc) => {
          if (!isClusterIgnored(sc)) {
            const clusterNamespace = getNamespace(sc);
            const ceph = cephClusters?.find(
              (cc) => getNamespace(cc) === clusterNamespace
            );
            const cephObjStore = objectStores?.find(
              (cos) => getNamespace(cos) === clusterNamespace
            );
            const odfSystemFlags = {
              odfSystemName: getName(sc),
              ocsClusterName: getName(sc),
              isInternalMode: !isExternalCluster(sc),
              isCephAvailable: !!ceph,
              isRGWAvailable: !!cephObjStore,
              isNFSEnabled: isNFSEnabled(sc),
            };
            acc.systemFlags[clusterNamespace] = odfSystemFlags;
          }
          return acc;
        },
        {
          systemFlags: {},
          areFlagsLoaded: allLoaded,
          flagsLoadError: anyError,
        } as ROOKSystemFlagsPayload
      );
    }
    return {
      systemFlags: {},
      areFlagsLoaded: allLoaded,
      flagsLoadError: anyError,
    };
  }, [
    storageClusters,
    cephClusters,
    objectStores,
    allLoaded,
    anyError,
  ]);

  return useDeepCompareMemoize(payload);
};

export const useROOKSystemFlags = (): void => {
  const dispatch = useROOKSystemFlagsDispatch();

  const [storageClusters, scLoaded, scError] = useK8sWatchResource<
    StorageClusterKind[]
  >(watchResources.scs);
  const [cephClusters, ccLoaded, ccError] = useK8sWatchResource<
    CephClusterKind[]
  >(watchResources.ccs);
  const [objectStores, cosLoaded, cosError] = useK8sWatchResource<
    K8sResourceKind[]
  >(watchResources.coss);

  const allLoaded = scLoaded && ccLoaded && cosLoaded && nsLoaded;
  const anyError = scError || ccError || cosError || nsError;

  const memoizedPayload = useROOKSystemFlagsPayload({
    storageClusters,
    cephClusters,
    objectStores,
    allLoaded,
    anyError,
  });

  React.useEffect(() => dispatch(memoizedPayload), [dispatch, memoizedPayload]);
};

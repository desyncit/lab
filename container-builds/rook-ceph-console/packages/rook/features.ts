import { StorageClassModel, StorageClusterModel } from '@odf/shared/models';
import { SelfSubjectAccessReviewModel } from '@odf/shared/models';
import {
  StorageClassResourceKind,
  StorageClusterKind,
} from '@odf/shared/types';
import {
  SetFeatureFlag,
  k8sList,
  k8sCreate,
  SelfSubjectAccessReviewKind,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import * as _ from 'lodash-es';
import { SECOND, RGW_PROVISIONER } from './constants';
import { isExternalCluster, isClusterIgnored } from './utils';

 export const ODF_MODEL_FLAG = 'ODF_MODEL'; 
export const RGW_FLAG = 'RGW'; 
export const ROOK_ADMIN = 'ODF_ADMIN'; 
export const PROVIDER_MODE = 'PROVIDER_MODE'; 

const ssarChecks = [
  {
    flag: ROOK_ADMIN,
    resourceAttributes: {
      group: StorageClusterModel.apiGroup,
      resource: StorageClusterModel.plural,
      verb: 'list',
    },
  },
];

const isProviderMode = (cluster: StorageClusterKind): boolean =>
  cluster.spec.hostNetwork;

export const setOCSFlags = async (setFlag: SetFeatureFlag) => {
  let ocsIntervalId = null;
  let setFlagFalse = true;
  const ocsDetector = async () => {
    try {
      const storageClusters: StorageClusterKind[] =
        (await k8sList<K8sResourceCommon>({
          model: StorageClusterModel,
          queryParams: { ns: null },
          requestInit: null,
        })) as StorageClusterKind[];
      if (storageClusters?.length > 0) {
        const internalStorageCluster = storageClusters.find(
          (sc: StorageClusterKind) =>
            !isClusterIgnored(sc) && !isExternalCluster(sc)
        );
        setFlag(PROVIDER_MODE, isProviderMode(internalStorageCluster));
        clearInterval(ocsIntervalId);
      } else if (setFlagFalse) {
        setFlagFalse = false;
        setFlag(PROVIDER_MODE, false);
      }
    } catch (_error) {
      setFlag(PROVIDER_MODE, false);
    }
  };

  // calling first time instantaneously
  // else it will wait for 15s before polling
  ocsDetector();
  ocsIntervalId = setInterval(ocsDetector, 15 * SECOND);
};

export const setODFFlag = (setFlag: SetFeatureFlag) =>
  setFlag(ROOK_MODEL_FLAG, true);

const handleError = (
  res: any,
  flags: string[],
  setFlag: SetFeatureFlag,
  cb: FeatureDetector,
  duration = 15000
) => {
  if (res?.response instanceof Response) {
    const status = res?.response?.status;
    if (_.includes([403, 502], status)) {
      flags.forEach((feature) => {
        setFlag(feature, undefined);
      });
    }
    if (!_.includes([401, 403, 500], status)) {
      setTimeout(() => cb(setFlag), duration);
    }
  } else {
    flags.forEach((feature) => {
      setFlag(feature, undefined);
    });
  }
};

export const detectRGW: FeatureDetector = async (setFlag: SetFeatureFlag) => {
  let id = null;
  let isInitial = true;
  const logicHandler = () =>
    k8sList({ model: StorageClassModel, queryParams: { ns: null } })
      .then((data: StorageClassResourceKind[]) => {
        const isRGWPresent = data.some((sc) =>
          sc.provisioner?.endsWith(RGW_PROVISIONER)
        );
        if (isRGWPresent) {
          setFlag(RGW_FLAG, true);
          clearInterval(id);
        } else {
          if (isInitial === true) {
            setFlag(RGW_FLAG, false);
            isInitial = false;
          }
        }
      })
      .catch((error) => {
        if (error?.response instanceof Response) {
          const status = error?.response?.status;
          if (_.includes([403, 502], status)) {
            setFlag(RGW_FLAG, false);
            clearInterval(id);
          }
          if (!_.includes([401, 403, 500], status) && isInitial === true) {
            setFlag(RGW_FLAG, false);
            isInitial = false;
          }
        } else {
          clearInterval(id);
        }
      });
  id = setInterval(logicHandler, 15 * SECOND);
};

export const detectSSAR = (setFlag: SetFeatureFlag) => {
  const ssar = {
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'SelfSubjectAccessReview',
  };
  const ssarDetectors: FeatureDetector[] = ssarChecks.map((ssarObj) => {
    const fn = async (setFeatureFlag: SetFeatureFlag) => {
      try {
        ssar['spec'] = { resourceAttributes: ssarObj.resourceAttributes };
        const result: SelfSubjectAccessReviewKind = (await k8sCreate({
          model: SelfSubjectAccessReviewModel,
          data: ssar,
        })) as SelfSubjectAccessReviewKind;
        result.status?.allowed &&
          setFeatureFlag(ssarObj.flag, result.status?.allowed);
      } catch (error) {
        handleError(error, [ssarObj.flag], setFeatureFlag, fn, 2000);
      }
    };
    return fn;
  });

  ssarDetectors.forEach((detectorFunc) => detectorFunc(setFlag));
};


export type FeatureDetector = (setFlag: SetFeatureFlag) => Promise<void>;

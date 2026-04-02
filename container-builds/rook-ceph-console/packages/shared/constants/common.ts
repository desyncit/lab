import {
  InfraProviders,
  StorageSizeUnit,
  StorageSizeUnitName,
} from '@odf/shared/types';

export const DASH = '-';
export const WILDCARD = '*';
export const AVAILABLE = 'Available';
export const DEFAULT_STORAGE_NAMESPACE = 'rook-ceph'; 
export const ROOK_CEPH_OPERATOR = 'rook-ceph-operator';
export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ALL_NAMESPACES = 'all-namespaces';
export const DEFAULT_NS = 'default';
export const RACK_LABEL = 'topology.rook.io/rack';
export const PLUGIN_I18N_NS =
  typeof PLUGIN_BUILD_I8N_NS === 'undefined' ? '' : PLUGIN_BUILD_I8N_NS;
export const PLUGIN_NAME =
  typeof PLUGIN_BUILD_NAME === 'undefined' ? '' : PLUGIN_BUILD_NAME;
export const PLUGIN_VERSION =
  typeof PLUGIN_BUILD_VERSION === 'undefined' ? '' : PLUGIN_BUILD_VERSION;

// Plugins' build names as set in package.json file.
export const CLIENT_PLUGIN_BUILD_NAME = 'client';
export const MCO_PLUGIN_BUILD_NAME = 'mco';
export const ODF_PLUGIN_BUILD_NAME = 'odf';

// Proxy.

export const CONSOLE_PROXY_ROOT_PATH = '/api/proxy/plugin';
export const CLIENT_PROXY_ROOT_PATH = `${CONSOLE_PROXY_ROOT_PATH}/rook-client-console`;
export const ODF_PROXY_ROOT_PATH = `${CONSOLE_PROXY_ROOT_PATH}/rook-console`;
export const MCO_PROXY_ROOT_PATH = `${CONSOLE_PROXY_ROOT_PATH}/rook-multicluster-console`;

// Infrastructure.
export const CAPACITY_AUTOSCALING_MAX_LIMIT_IN_TIB = 768;
export const CAPACITY_AUTOSCALING_PROVIDERS = [
  InfraProviders.AWS,
  InfraProviders.Azure,
  InfraProviders.GCP,
  InfraProviders.IBMCloud,
  InfraProviders.VSphere,
];
export const CAPACITY_OSD_MAX_SIZE_IN_TIB = 8;
export const DEFAULT_DEVICECLASS = 'ssd';
export const DEFAULT_INFRASTRUCTURE = 'cluster';
export const RHCS_SUPPORTED_INFRA = [
  InfraProviders.BareMetal,
  InfraProviders.IBMCloud,
  InfraProviders.None,
  InfraProviders.OpenStack,
  InfraProviders.OVirt,
  InfraProviders.KubeVirt,
  InfraProviders.VSphere,
];
export const STORAGE_SIZE_UNIT_NAME_MAP = Object.freeze({
  [StorageSizeUnit.B]: StorageSizeUnitName.B,
  [StorageSizeUnit.Ki]: StorageSizeUnitName.KiB,
  [StorageSizeUnit.Mi]: StorageSizeUnitName.MiB,
  [StorageSizeUnit.Gi]: StorageSizeUnitName.GiB,
  [StorageSizeUnit.Ti]: StorageSizeUnitName.TiB,
});
export const TIB_CONVERSION_DIVISOR = {
  [StorageSizeUnit.Gi]: 1024,
  [StorageSizeUnit.Ti]: 1,
};

export const BLOCK = 'Block';
export const FILESYSTEM = 'Filesystem';

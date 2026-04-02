import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';

export const CephBlockPoolModel: K8sModel = {
  label: 'BlockPool',
  labelPlural: 'BlockPools',
  apiVersion: 'v1',
  apiGroup: 'ceph.rook.io',
  plural: 'cephblockpools',
  abbr: 'CBP',
  namespaced: true,
  kind: 'CephBlockPool',
  id: 'cephblockpools',
  crd: true,
};

export const CephObjectStoreModel: K8sModel = {
  label: 'Ceph Object Store',
  labelPlural: 'Ceph Object Stores',
  apiVersion: 'v1',
  apiGroup: 'ceph.rook.io',
  plural: 'cephobjectstores',
  abbr: 'COS',
  namespaced: true,
  kind: 'CephObjectStore',
  id: 'cephobjectstores',
  crd: true,
};


export const CephObjectBucketClaimModel: K8sModel = {
  label: 'Object Bucket Claim',
  labelPlural: 'Object Bucket Claims',
  apiVersion: 'v1alpha1',
  apiGroup: 'objectbucket.io',
  plural: 'objectbucketclaims',
  abbr: 'OBC',
  namespaced: true,
  kind: 'ObjectBucketClaim',
  id: 'objectbucketclaims',
  crd: true,
  legacyPluralURL: true,
};

export const CephObjectBucketModel: K8sModel = {
  label: 'Object Bucket',
  labelPlural: 'Object Buckets',
  apiVersion: 'v1alpha1',
  apiGroup: 'objectbucket.io',
  plural: 'objectbuckets',
  abbr: 'OB',
  namespaced: false,
  kind: 'ObjectBucket',
  id: 'objectbucket',
  crd: true,
  legacyPluralURL: true,
};

export const StorageConsumerModel: K8sModel = {
  abbr: 'SC',
  kind: 'StorageConsumer',
  label: 'Storage Consumer',
  labelPlural: 'Storage Consumers',
  plural: 'storageconsumers',
  apiVersion: 'v1alpha1',
  apiGroup: 'ocs.openshift.io',
  namespaced: true,
  crd: true,
  verbs: ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete'],
  shortNames: ['sc'],
};

export const CephFileSystemModel: K8sModel = {
  label: 'CephFilesystem',
  labelPlural: 'CephFilesystems',
  apiVersion: 'v1',
  apiGroup: 'ceph.rook.io',
  plural: 'cephfilesystems',
  abbr: 'CFS',
  namespaced: true,
  kind: 'CephFilesystem',
  id: 'cephfilesystems',
  crd: true,
};

export const CephBlockPoolRadosNamespaceModel: K8sModel = {
  label: 'CephBlockPoolRadosNamespace',
  labelPlural: 'CephBlockPoolRadosNamespaces',
  apiVersion: 'v1',
  apiGroup: 'ceph.rook.io',
  plural: 'cephblockpoolradosnamespaces',
  abbr: 'CBPR',
  namespaced: true,
  kind: 'CephBlockPoolRadosNamespace',
  id: 'cephblockpoolradosnamespaces',
  crd: true,
};

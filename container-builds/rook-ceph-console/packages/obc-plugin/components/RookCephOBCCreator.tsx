import * as React from 'react';
import {
  Form,
  FormGroup,
  TextInput,
  Button,
  Alert,
  Spinner,
  Modal,
  ModalVariant,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import {
  useK8sWatchResource,
  k8sCreate,
  K8sResourceCommon,
  K8sModel,
} from '@openshift-console/dynamic-plugin-sdk';

interface ObjectBucketClaim extends K8sResourceCommon {
  spec: {
    bucketName?: string;
    storageClassName: string;
    generateBucketName?: boolean;
  };
}

interface CephObjectStore extends K8sResourceCommon {
  spec?: {
    gateway?: {
      port?: number;
    };
  };
}

const ObjectBucketClaimModel: K8sModel = {
  apiVersion: 'v1alpha1',
  apiGroup: 'objectbucket.io',
  kind: 'ObjectBucketClaim',
  plural: 'objectbucketclaims',
  label: 'ObjectBucketClaim',
  labelPlural: 'ObjectBucketClaims',
  abbr: 'OBC',
};

const RookCephOBCCreator: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [storageClassName, setStorageClassName] = React.useState('');
  const [bucketName, setBucketName] = React.useState('');
  const [generateBucketName, setGenerateBucketName] = React.useState(false);
  const [obcName, setObcName] = React.useState('');
  const [namespace, setNamespace] = React.useState('default');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  // Watch for available CephObjectStores in rook-ceph namespace
  const [stores, storesLoaded] = useK8sWatchResource<CephObjectStore[]>({
    kind: 'CephObjectStore',
    namespaced: true,
    namespace: 'rook-ceph',
    isList: true,
  } as any); // Using 'as any' due to SDK type strictness

  const handleCreateOBC = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!obcName.trim()) {
        throw new Error('OBC name is required');
      }
      if (!storageClassName.trim()) {
        throw new Error('Storage class is required');
      }
      if (!generateBucketName && !bucketName.trim()) {
        throw new Error('Bucket name is required when not auto-generating');
      }

      const obc: ObjectBucketClaim = {
        apiVersion: ObjectBucketClaimModel.apiVersion,
        kind: ObjectBucketClaimModel.kind,
        metadata: {
          name: obcName,
          namespace: namespace,
        },
        spec: {
          storageClassName: storageClassName,
          ...(generateBucketName ? { generateBucketName: true } : { bucketName }),
        },
      };

      await k8sCreate({
        model: ObjectBucketClaimModel,
        data: obc,
      });

      setSuccess(`ObjectBucketClaim "${obcName}" created successfully`);
      resetForm();
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create OBC');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setObcName('');
    setBucketName('');
    setStorageClassName('');
    setGenerateBucketName(false);
    setNamespace('default');
  };

  const handleModalToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      resetForm();
      setError('');
      setSuccess('');
    }
  };

  return (
    <div>
      <Button onClick={handleModalToggle} variant="primary">
        Create Object Bucket Claim
      </Button>

      {success && (
        <Alert
          variant="success"
          title="Success"
          isInline
          style={{ marginTop: '1rem' }}
        >
          {success}
        </Alert>
      )}

      <Modal
        title="Create Object Bucket Claim"
        isOpen={isOpen}
        onClose={handleModalToggle}
        variant={ModalVariant.large}
      >
        <Form>
          {error && (
            <Alert variant="danger" title="Error" isInline>
              {error}
            </Alert>
          )}

          <FormGroup label="OBC Name" isRequired fieldId="obc-name">
            <TextInput
              id="obc-name"
              value={obcName}
              onChange={(_event, val) => setObcName(val)}
              placeholder="my-bucket-claim"
              isRequired
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>Kubernetes-valid name for the claim</HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          <FormGroup label="Namespace" isRequired fieldId="namespace">
            <TextInput
              id="namespace"
              value={namespace}
              onChange={(_event, val) => setNamespace(val)}
              placeholder="default"
              isRequired
            />
          </FormGroup>

          <FormGroup
            label="Storage Class"
            isRequired
            fieldId="storage-class"
          >
            <TextInput
              id="storage-class"
              value={storageClassName}
              onChange={(_event, val) => setStorageClassName(val)}
              placeholder="Select a CephObjectStore name"
              list="storage-class-list"
              isRequired
            />
            <datalist id="storage-class-list">
              {!storesLoaded ? (
                <option>Loading stores...</option>
              ) : stores && stores.length > 0 ? (
                stores.map((store) => (
                  <option key={store.metadata?.name} value={store.metadata?.name}>
                    {store.metadata?.name}
                  </option>
                ))
              ) : (
                <option>No CephObjectStores found</option>
              )}
            </datalist>
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  CephObjectStore instances from rook-ceph namespace
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          <FormGroup label="Bucket Naming" fieldId="bucket-naming">
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="bucket-naming"
                  checked={generateBucketName}
                  onChange={() => setGenerateBucketName(true)}
                  style={{ marginRight: '0.5rem' }}
                />
                Auto-generate bucket name
              </label>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="bucket-naming"
                  checked={!generateBucketName}
                  onChange={() => setGenerateBucketName(false)}
                  style={{ marginRight: '0.5rem' }}
                />
                Specify bucket name
              </label>
            </div>
          </FormGroup>

          {!generateBucketName && (
            <FormGroup label="Bucket Name" isRequired fieldId="bucket-name">
              <TextInput
                id="bucket-name"
                value={bucketName}
                onChange={(_event, val) => setBucketName(val)}
                placeholder="my-storage-bucket"
                isRequired
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>S3-compatible bucket name</HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          )}
        </Form>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button 
            variant="secondary" 
            onClick={handleModalToggle}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateOBC}
            isDisabled={loading || !obcName || !storageClassName}
          >
            {loading ? <Spinner size="sm" /> : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RookCephOBCCreator;

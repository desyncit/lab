import React from 'react';
import { PageSection, Title, Divider } from '@patternfly/react-core';
import RookCephOBCCreator from './RookCephOBCCreator';

const RookCephOBCPage: React.FC = () => {
  return (
    <>
      <PageSection variant="default">
        <Title headingLevel="h1">Object Bucket Claims</Title>
        <p>Manage Rook-Ceph object storage bucket claims</p>
      </PageSection>
      <Divider />
      <PageSection variant="default">
        <RookCephOBCCreator />
      </PageSection>
    </>
  );
};

export default RookCephOBCPage;

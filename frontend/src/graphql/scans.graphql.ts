import { gql } from '@apollo/client';

export const GET_SCANS = gql`
  query GetScans($filters: ScanFiltersInput) {
    scans(filters: $filters) {
      scans {
        id
        name
        target
        type
        status
        progress
        subdomains {
          subdomain
          ip
          discovered_at
        }
        openPorts {
          subdomain
          port
          service
          state
          discovered_at
        }
        error
        startedAt
        completedAt
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const GET_SCAN = gql`
  query GetScan($id: String!) {
    scan(id: $id) {
      id
      name
      target
      type
      status
      progress
      subdomains {
        subdomain
        ip
        discovered_at
      }
      openPorts {
        subdomain
        port
        service
        state
        discovered_at
      }
      error
      startedAt
      completedAt
      createdAt
      updatedAt
    }
  }
`;

export const START_QUICK_SCAN = gql`
  mutation StartQuickScan($target: String!) {
    startQuickScan(target: $target) {
      id
      name
      target
      type
      status
      createdAt
    }
  }
`;

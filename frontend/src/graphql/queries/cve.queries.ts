import { gql } from '@apollo/client';

export const GET_CVES = gql`
  query GetCVEs($filters: CVEFiltersInput) {
    cves(filters: $filters) {
      cves {
        id
        cveId
        title
        description
        severity
        cvssScore
        publishedDate
        affectedProducts
        references
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_CVE = gql`
  query GetCVE($id: ID!) {
    cve(id: $id) {
      id
      cveId
      title
      description
      severity
      cvssScore
      publishedDate
      affectedProducts
      references
      createdAt
      updatedAt
    }
  }
`;

export const GET_CVE_WITH_POCS = gql`
  query GetCVEWithPOCs($id: ID!) {
    cveWithPocs(id: $id) {
      id
      cveId
      title
      description
      severity
      cvssScore
      publishedDate
      affectedProducts
      references
      createdAt
      updatedAt
      pocs {
        id
        name
        description
        language
        scriptPath
        author
        createdAt
        updatedAt
      }
    }
  }
`;

export const SEARCH_CVES = gql`
  query SearchCVEs($query: String!) {
    searchCves(query: $query) {
      id
      cveId
      title
      description
      severity
      cvssScore
      publishedDate
      createdAt
    }
  }
`;

export const GET_CVE_STATISTICS = gql`
  query GetCVEStatistics {
    cveStatistics {
      total
      bySeverity {
        LOW
        MEDIUM
        HIGH
        CRITICAL
      }
      recent
    }
  }
`;

export const CREATE_CVE = gql`
  mutation CreateCVE($input: CreateCVEInput!) {
    createCve(input: $input) {
      id
      cveId
      title
      description
      severity
      cvssScore
      publishedDate
      affectedProducts
      references
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CVE = gql`
  mutation UpdateCVE($id: ID!, $input: UpdateCVEInput!) {
    updateCve(id: $id, input: $input) {
      id
      cveId
      title
      description
      severity
      cvssScore
      publishedDate
      affectedProducts
      references
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CVE = gql`
  mutation DeleteCVE($id: ID!) {
    deleteCve(id: $id)
  }
`;
import { gql } from '@apollo/client';

export const GET_POCS = gql`
  query GetPOCs($filters: POCFiltersInput) {
    pocs(filters: $filters) {
      pocs {
        id
        cveId
        name
        description
        language
        scriptPath
        usageExamples
        author
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const GET_POC = gql`
  query GetPOC($id: ID!) {
    poc(id: $id) {
      id
      cveId
      name
      description
      language
      scriptPath
      usageExamples
      author
      createdAt
      updatedAt
    }
  }
`;

export const GET_POC_WITH_LOGS = gql`
  query GetPOCWithLogs($id: ID!) {
    pocWithLogs(id: $id) {
      id
      cveId
      name
      description
      language
      scriptPath
      usageExamples
      author
      createdAt
      updatedAt
      executionLogs {
        id
        targetUrl
        command
        output
        status
        executedAt
      }
    }
  }
`;

export const GET_POCS_BY_CVE = gql`
  query GetPOCsByCVE($cveId: String!) {
    pocsByCve(cveId: $cveId) {
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
`;

export const GET_POC_LOGS = gql`
  query GetPOCLogs($pocId: String!, $limit: Int) {
    pocLogs(pocId: $pocId, limit: $limit) {
      id
      targetUrl
      command
      output
      status
      executedAt
    }
  }
`;

export const CREATE_POC = gql`
  mutation CreatePOC($input: CreatePOCInput!) {
    createPoc(input: $input) {
      id
      cveId
      name
      description
      language
      scriptPath
      usageExamples
      author
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_POC = gql`
  mutation UpdatePOC($id: ID!, $input: UpdatePOCInput!) {
    updatePoc(id: $id, input: $input) {
      id
      cveId
      name
      description
      language
      scriptPath
      usageExamples
      author
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_POC = gql`
  mutation DeletePOC($id: ID!) {
    deletePoc(id: $id)
  }
`;

export const EXECUTE_POC = gql`
  mutation ExecutePOC($pocId: String!, $input: ExecutePOCInput!) {
    executePoc(pocId: $pocId, input: $input) {
      message
      result {
        success
        output
        error
      }
      log {
        id
        targetUrl
        command
        output
        status
        executedAt
      }
    }
  }
`;
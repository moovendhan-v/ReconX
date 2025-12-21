import { useQuery, useMutation } from '@apollo/client/react';
import { 
  GET_POCS, 
  GET_POC, 
  GET_POC_WITH_LOGS, 
  GET_POCS_BY_CVE, 
  GET_POC_LOGS,
  CREATE_POC,
  UPDATE_POC,
  DELETE_POC,
  EXECUTE_POC 
} from '@/graphql/queries/poc.queries';
import { 
  POCFilters, 
  POC, 
  ExecutionLog, 
  CreatePOCInput, 
  UpdatePOCInput, 
  ExecutePOCInput,
  ExecuteResponse 
} from '@/services/graphql/poc.service';

export const usePOCs = (filters?: POCFilters) => {
  return useQuery(GET_POCS, {
    variables: { filters },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
};

export const usePOC = (id: string) => {
  return useQuery(GET_POC, {
    variables: { id },
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
    skip: !id,
  });
};

export const usePOCWithLogs = (id: string) => {
  return useQuery(GET_POC_WITH_LOGS, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    skip: !id,
    pollInterval: 30000, // Poll every 30 seconds for real-time logs
  });
};

export const usePOCsByCVE = (cveId: string) => {
  return useQuery(GET_POCS_BY_CVE, {
    variables: { cveId },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    skip: !cveId,
  });
};

export const usePOCLogs = (pocId: string, limit?: number) => {
  return useQuery(GET_POC_LOGS, {
    variables: { pocId, limit },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    skip: !pocId,
    pollInterval: 15000, // Poll every 15 seconds for real-time updates
  });
};

export const useCreatePOC = () => {
  return useMutation(CREATE_POC, {
    refetchQueries: [{ query: GET_POCS }],
    errorPolicy: 'all',
  });
};

export const useUpdatePOC = () => {
  return useMutation(UPDATE_POC, {
    errorPolicy: 'all',
  });
};

export const useDeletePOC = () => {
  return useMutation(DELETE_POC, {
    refetchQueries: [{ query: GET_POCS }],
    errorPolicy: 'all',
  });
};

export const useExecutePOC = () => {
  return useMutation(EXECUTE_POC, {
    errorPolicy: 'all',
  });
};

// Custom hook for POC management with optimistic updates
export const usePOCOperations = () => {
  const [createPOC, { loading: creating }] = useCreatePOC();
  const [updatePOC, { loading: updating }] = useUpdatePOC();
  const [deletePOC, { loading: deleting }] = useDeletePOC();
  const [executePOC, { loading: executing }] = useExecutePOC();

  const handleCreate = async (input: CreatePOCInput) => {
    try {
      const result = await createPOC({ variables: { input } });
      return result.data?.createPoc;
    } catch (error) {
      console.error('Create POC error:', error);
      throw error;
    }
  };

  const handleUpdate = async (id: string, input: UpdatePOCInput) => {
    try {
      const result = await updatePOC({ 
        variables: { id, input },
        optimisticResponse: {
          updatePoc: {
            __typename: 'POC',
            id,
            ...input,
            updatedAt: new Date().toISOString(),
          },
        },
      });
      return result.data?.updatePoc;
    } catch (error) {
      console.error('Update POC error:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deletePOC({ 
        variables: { id },
        optimisticResponse: {
          deletePoc: true,
        },
      });
      return result.data?.deletePoc;
    } catch (error) {
      console.error('Delete POC error:', error);
      throw error;
    }
  };

  const handleExecute = async (pocId: string, input: ExecutePOCInput): Promise<ExecuteResponse> => {
    try {
      const result = await executePOC({ 
        variables: { pocId, input },
        refetchQueries: [
          { query: GET_POC_LOGS, variables: { pocId, limit: 50 } },
          { query: GET_POC_WITH_LOGS, variables: { id: pocId } }
        ],
      });
      return result.data?.executePoc;
    } catch (error) {
      console.error('Execute POC error:', error);
      throw error;
    }
  };

  return {
    createPOC: handleCreate,
    updatePOC: handleUpdate,
    deletePOC: handleDelete,
    executePOC: handleExecute,
    loading: creating || updating || deleting || executing,
    isExecuting: executing,
  };
};

// Real-time execution monitoring hook
export const usePOCExecutionMonitor = (pocId: string) => {
  const { data, loading, error, startPolling, stopPolling } = usePOCLogs(pocId, 10);

  const startMonitoring = () => {
    startPolling(5000); // Poll every 5 seconds during execution
  };

  const stopMonitoring = () => {
    stopPolling();
  };

  const latestLog = data?.pocLogs?.[0];
  const isRunning = latestLog?.status === 'RUNNING';

  return {
    logs: data?.pocLogs || [],
    latestLog,
    isRunning,
    loading,
    error,
    startMonitoring,
    stopMonitoring,
  };
};
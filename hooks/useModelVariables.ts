import { useMemo } from 'react';
import { ModerateEffectNodeDataType } from '../store/data.service.types';

interface ModelData {
  nodes?: any[];
  edges?: any[];
}

interface UseModelVariablesReturn {
  moderateVariables: any[];
  mediatorVariables: any[];
  independentVariables: any[];
  dependentVariables: any[];
}

/**
 * Custom hook for classifying variables in a model based on their relationships
 * @param modelData - The model data containing nodes and edges
 * @returns Object containing arrays of classified variables
 */
export const useModelVariables = (modelData: ModelData | null | undefined): UseModelVariablesReturn => {
  const moderateVariables = useMemo(() => {
    if (!modelData?.nodes) return [];
    
    const moderateEffects = modelData.nodes.filter((node) =>
      node.data?.nodeType === "moderate_effect"
    );
    
    const moderateVars = modelData.nodes.filter((node) => {
      if (node.data?.nodeType !== "variable") return false;
      return moderateEffects.find((moderateEffect) => 
        (moderateEffect.data as ModerateEffectNodeDataType).moderateVariable === node.id
      );
    });
    
    return moderateVars;
  }, [modelData]);

  const mediatorVariables = useMemo(() => {
    if (!modelData?.nodes || !modelData?.edges) return [];
    
    const nodes = modelData.nodes;
    const edges = modelData.edges;
    
    return nodes.filter((node: any) => {
      if (node.data?.nodeType !== "variable") return false;
      
      const hasIncoming = edges.some((edge: any) => edge.target === node.id);
      const hasOutgoing = edges.some((edge: any) => edge.source === node.id);
      
      return hasIncoming && hasOutgoing && 
        !moderateVariables.find((moderateVariable: any) => moderateVariable.id === node.id);
    });
  }, [modelData, moderateVariables]);

  const independentVariables = useMemo(() => {
    if (!modelData?.nodes || !modelData?.edges) return [];
    
    const nodes = modelData.nodes;
    const edges = modelData.edges;
    
    return nodes.filter((node: any) => {
      if (node.data?.nodeType !== "variable") return false;
      
      const hasOutgoing = edges.some((edge: any) => edge.source === node.id);
      const hasIncoming = edges.some((edge: any) => edge.target === node.id);
      
      return hasOutgoing && !hasIncoming && 
        !moderateVariables.find((moderateVariable: any) => moderateVariable.id === node.id);
    });
  }, [modelData, moderateVariables]);

  const dependentVariables = useMemo(() => {
    if (!modelData?.nodes || !modelData?.edges) return [];
    
    const nodes = modelData.nodes;
    const edges = modelData.edges;
    
    return nodes.filter((node: any) => {
      if (node.data?.nodeType !== "variable") return false;
      
      const hasIncoming = edges.some((edge: any) => edge.target === node.id);
      const hasOutgoing = edges.some((edge: any) => edge.source === node.id);
      
      return hasIncoming && !hasOutgoing && 
        !moderateVariables.find((moderateVariable: any) => moderateVariable.id === node.id);
    });
  }, [modelData, moderateVariables]);

  return {
    moderateVariables,
    mediatorVariables,
    independentVariables,
    dependentVariables,
  };
};

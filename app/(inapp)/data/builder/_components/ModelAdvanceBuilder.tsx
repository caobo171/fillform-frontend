import { useState, useEffect, useCallback, useMemo } from 'react';
import Select, { MultiValue } from 'react-select';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AdvanceModelType, EdgeDataType, NodeDataType } from '@/store/data.service.types';

interface ModelAdvanceBuilderProps {
  model?: AdvanceModelType | null,
  setModel: (model: AdvanceModelType) => void,
  useLocalStorage?: boolean,
  isReadOnly?: boolean,
}

interface NodeData extends Record<string, unknown> {
  label: string;
  nodeType: 'variable' | 'moderate_effect';

  // Only for variable
  observableQuestions: number;
  likertScale: number;
  average?: number;
  standardDeviation?: number;

  // Only for moderate_effect
  moderateVariable?: string;
  independentVariable?: string;
}

// Node Edit Form Component
const NodeEditForm = ({ node, onSave, onCancel, availableNodes }: {
  node: Node;
  onSave: (data: NodeData) => void;
  onCancel: () => void;
  availableNodes: Node[];
}) => {
  const [label, setLabel] = useState((node.data?.label as string) || '');
  const nodeType = (node.data?.nodeType as 'variable' | 'moderate_effect') || 'variable';
  const [observableQuestions, setObservableQuestions] = useState(
    (node.data?.observableQuestions as number) || 1
  );
  const [likertScale, setLikertScale] = useState(
    (node.data?.likertScale as number) || 5
  );
  const [average, setAverage] = useState<string>(
    (node.data?.average?.toString() || '0')
  );
  const [standardDeviation, setStandardDeviation] = useState<string>(
    (node.data?.standardDeviation?.toString() || '1')
  );
  const [moderateVariable, setModerateVariable] = useState<string>(
    (node.data?.moderateVariable as string) || ''
  );
  const [independentVariable, setIndependentVariable] = useState<string>(
    (node.data?.independentVariable as string) || ''
  );

  // Filter available nodes (exclude current node)
  const targetOptions = availableNodes.filter(n => n.id !== node.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      const baseData: NodeData = {
        label: label.trim(),
        nodeType,
        observableQuestions: nodeType === 'variable' ? observableQuestions : 1,
        likertScale: nodeType === 'variable' ? likertScale : 5,
        average: nodeType === 'variable' ? parseFloat(average) : undefined,
        standardDeviation: nodeType === 'variable' ? parseFloat(standardDeviation) : undefined,
        moderateVariable: nodeType === 'moderate_effect' ? moderateVariable : undefined,
        independentVariable: nodeType === 'moderate_effect' ? independentVariable : undefined,
      };
      onSave(baseData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h3 className="text-lg font-bold mb-4">Edit Variable</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Variable Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variable Name
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter variable name"
              autoFocus
            />
          </div>

          {/* Observable Questions Count - Only for Variable type */}
          {nodeType === 'variable' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Observable Questions
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={observableQuestions}
                onChange={(e) => setObservableQuestions(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}



          {/* Likert Scale Selection - Only for Variable type */}
          {nodeType === 'variable' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Likert Scale Points
              </label>
              <select
                value={likertScale}
                onChange={(e) => setLikertScale(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3-point scale</option>
                <option value={4}>4-point scale</option>
                <option value={5}>5-point scale</option>
                <option value={6}>6-point scale</option>
                <option value={7}>7-point scale</option>
                <option value={8}>8-point scale</option>
                <option value={9}>9-point scale</option>
                <option value={10}>10-point scale</option>
              </select>
            </div>
          )}

          {/* Average and Standard Deviation - Only for Variable type */}
          {nodeType === 'variable' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average (Mean)
                </label>
                <input
                  type="text"
                  value={average}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAverage(value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard Deviation
                </label>
                <input
                  type="text"
                  value={standardDeviation}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string, positive numbers and decimal points
                    setStandardDeviation(value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1.00"
                />
              </div>
            </div>
          )}

          {/* Moderate Effect Fields (only for moderate_effect type) */}
          {nodeType === 'moderate_effect' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moderate Variable
                </label>
                <select
                  value={moderateVariable}
                  onChange={(e) => setModerateVariable(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select moderate variable...</option>
                  {availableNodes.filter(n => n.id !== node.id && n.data?.nodeType === 'variable').map(targetNode => (
                    <option key={targetNode.id} value={targetNode.id}>
                      {(targetNode.data?.label as string) || targetNode.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Independent Variable
                </label>
                <select
                  value={independentVariable}
                  onChange={(e) => setIndependentVariable(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select independent variable...</option>
                  {availableNodes.filter(n => n.id !== node.id && n.data?.nodeType === 'variable').map(targetNode => (
                    <option key={targetNode.id} value={targetNode.id}>
                      {(targetNode.data?.label as string) || targetNode.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Moderate Effect Form Component
const ModerateEffectForm = ({ selectedNodeId, editingNode, onSave, onCancel, availableNodes }: {
  selectedNodeId?: string;
  editingNode?: Node | null;
  onSave: (data: { label: string; moderateVariable: string; independentVariable: string; effectType: 'positive' | 'negative' }) => void;
  onCancel: () => void;
  availableNodes: Node[];
}) => {
  const isEditing = !!editingNode;
  const selectedNode = selectedNodeId ? availableNodes.find(n => n.id === selectedNodeId) : null;
  
  const [label, setLabel] = useState(() => {
    if (isEditing) return (editingNode.data?.label as string) || '';
    return `Moderate Effect on ${selectedNode?.data?.label || 'Variable'}`;
  });
  
  const [moderateVariable, setModerateVariable] = useState(() => {
    if (isEditing) return (editingNode.data?.moderateVariable as string) || '';
    return '';
  });
  
  const [independentVariable, setIndependentVariable] = useState(() => {
    if (isEditing) return (editingNode.data?.independentVariable as string) || '';
    return '';
  });
  
  const [effectType, setEffectType] = useState<'positive' | 'negative'>(() => {
    if (isEditing) return (editingNode.data?.effectType as 'positive' | 'negative') || 'positive';
    return 'positive';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim() && moderateVariable && independentVariable) {
      onSave({
        label: label.trim(),
        moderateVariable,
        independentVariable,
        effectType
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h3 className="text-lg font-bold mb-4">
          {isEditing ? 'Edit Moderate Effect' : 'Create Moderate Effect'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Moderate Effect Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moderate Effect Name
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter moderate effect name"
              autoFocus
            />
          </div>

          {/* Target Variable (Read-only) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Variable (Selected)
              </label>
              <input
                type="text"
                value={(selectedNode?.data?.label as string) || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>
          )}

          {/* Moderate Variable Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moderate Variable
            </label>
            <select
              value={moderateVariable}
              onChange={(e) => setModerateVariable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select moderate variable...</option>
              {availableNodes.filter(n => 
                n.data?.nodeType === 'variable' && 
                n.id !== selectedNodeId && 
                n.id !== editingNode?.id
              ).map(node => (
                <option key={node.id} value={node.id}>
                  {(node.data?.label as string) || node.id}
                </option>
              ))}
            </select>
          </div>

          {/* Independent Variable Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Independent Variable
            </label>
            <select
              value={independentVariable}
              onChange={(e) => setIndependentVariable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select independent variable...</option>
              {availableNodes.filter(n => 
                n.data?.nodeType === 'variable' && 
                n.id !== selectedNodeId && 
                n.id !== moderateVariable && 
                n.id !== editingNode?.id
              ).map(node => (
                <option key={node.id} value={node.id}>
                  {(node.data?.label as string) || node.id}
                </option>
              ))}
            </select>
          </div>

          {/* Effect Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moderate Effect Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="positive"
                  checked={effectType === 'positive'}
                  onChange={(e) => setEffectType(e.target.value as 'positive' | 'negative')}
                  className="mr-2"
                />
                <span className="text-green-600 font-medium">Positive Moderation</span>
                <span className="text-sm text-gray-500 ml-2">(strengthens the effect)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="negative"
                  checked={effectType === 'negative'}
                  onChange={(e) => setEffectType(e.target.value as 'positive' | 'negative')}
                  className="mr-2"
                />
                <span className="text-red-600 font-medium">Negative Moderation</span>
                <span className="text-sm text-gray-500 ml-2">(weakens the effect)</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!label.trim() || !moderateVariable || !independentVariable}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isEditing ? 'Update Moderate Effect' : 'Create Moderate Effect'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edge Edit Form Component
const EdgeEditForm = ({ edge, onSave, onCancel, nodes }: {
  edge: Edge;
  onSave: (data: { effectType: 'positive' | 'negative' }) => void;
  onCancel: () => void;
  nodes: Node[];
}) => {
  const [effectType, setEffectType] = useState<'positive' | 'negative'>(
    (edge.data?.effectType as 'positive' | 'negative') || 'positive'
  );

  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ effectType });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h3 className="text-lg font-bold mb-4">Edit Connection</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Connection Info */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600 mb-1">Connection:</div>
            <div className="font-medium">
              {(sourceNode?.data?.label as string) || edge.source} → {(targetNode?.data?.label as string) || edge.target}
            </div>
          </div>

          {/* Effect Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effect Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="positive"
                  checked={effectType === 'positive'}
                  onChange={(e) => setEffectType(e.target.value as 'positive' | 'negative')}
                  className="mr-2"
                />
                <span className="text-green-600 font-medium">Positive Effect</span>
                <span className="text-sm text-gray-500 ml-2">(increases target)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="negative"
                  checked={effectType === 'negative'}
                  onChange={(e) => setEffectType(e.target.value as 'positive' | 'negative')}
                  className="mr-2"
                />
                <span className="text-red-600 font-medium">Negative Effect</span>
                <span className="text-sm text-gray-500 ml-2">(decreases target)</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Custom Node Component
const CustomNode = ({ data, selected, nodes }: { data: NodeData; selected?: boolean; nodes?: Node[] }) => {
  const nodeType = data?.nodeType || 'variable';
  const observableQuestions = data?.observableQuestions || 1;
  const moderateVariable = data?.moderateVariable;
  const independentVariable = data?.independentVariable;
  const average = data?.average;
  const standardDeviation = data?.standardDeviation;

  // Get node labels for moderate effect display
  const moderateVariableLabel = moderateVariable && nodes ? 
    nodes.find(n => n.id === moderateVariable)?.data?.label || moderateVariable : moderateVariable;
  const independentVariableLabel = independentVariable && nodes ? 
    nodes.find(n => n.id === independentVariable)?.data?.label || independentVariable : independentVariable;

  // Define colors and styles based on node type
  const getNodeStyles = (type: string) => {
    switch (type) {
      case 'moderate_effect':
        return {
          border: 'border-purple-500',
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          badge: 'bg-purple-600',
          count: 'bg-purple-200 text-purple-800',
          label: 'MODERATE EFFECT'
        };
      default: // variable
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-50',
          text: 'text-blue-900',
          badge: 'bg-blue-600',
          count: 'bg-blue-100 text-blue-800',
          label: 'VARIABLE'
        };
    }
  };

  const styles = getNodeStyles(nodeType);

  return (
    <div className={`px-4 py-3 shadow-md rounded-md border-2 min-w-[140px] ${selected ? 'border-green-500' : styles.border
      } ${styles.bg}`}>
      <div className="flex flex-col items-center text-center">
        {/* Variable Name */}
        <div className={`text-sm font-bold mb-1 ${styles.text}`}>
          {data.label}
        </div>

        {/* Status and Count Display */}
        <div className="flex flex-col items-center gap-1">
          <div className={`${styles.badge} text-white text-xs px-2 py-1 rounded-full font-bold`}>
            {styles.label}
          </div>

          {/* Show moderate effect details */}
          {nodeType === 'moderate_effect' && (moderateVariable || independentVariable) && (
            <div className="bg-purple-300 text-purple-900 text-xs px-2 py-1 rounded-full font-medium">
              {moderateVariableLabel && independentVariableLabel ? `${moderateVariableLabel} × ${independentVariableLabel}` : 
               moderateVariableLabel ? `Moderate: ${moderateVariableLabel}` : 
               independentVariableLabel ? `Independent: ${independentVariableLabel}` : ''}
            </div>
          )}

          {/* Show observable count for variable type */}
          {nodeType === 'variable' && (
            <div className={`text-xs px-2 py-1 rounded-full font-medium ${styles.count}`}>
              {observableQuestions} Observable{observableQuestions !== 1 ? 's' : ''}
            </div>
          )}

          {/* Show average and standard deviation if they exist */}
          {(average !== undefined && average !== 0) || (standardDeviation !== undefined && standardDeviation !== 1) ? (
            <div className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
              μ={average?.toFixed(2) || '0.00'}, σ={standardDeviation?.toFixed(2) || '1.00'}
            </div>
          ) : null}
        </div>
      </div>

      {/* Left Handle (Input) - Only for variable nodes */}
      {nodeType === 'variable' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-4 !h-4 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 !left-[-8px]"
        />
      )}

      {/* Right Handle (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-green-500 !border-2 !border-white hover:!bg-green-600 !right-[-8px]"
      />
    </div>
  );
};

export const ModelAdvanceBuilder = ({ model, setModel, useLocalStorage = false, isReadOnly = false }: ModelAdvanceBuilderProps) => {

  // Local storage functions
  const saveToLocalStorage = useCallback((dagModel: AdvanceModelType) => {
    try {
      localStorage.setItem('dagModel', JSON.stringify(dagModel));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback((): AdvanceModelType | null => {
    try {
      const saved = localStorage.getItem('dagModel');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, []);

  // Initialize nodes and edges from the model or localStorage
  const getInitialData = useCallback(() => {

    let savedModel: AdvanceModelType | null = null;
    if (useLocalStorage) {
      savedModel = loadFromLocalStorage();
    }
    const sourceModel = model || savedModel;

    return {
      nodes: sourceModel?.nodes?.map(node => ({
        id: node.id,
        type: 'customNode',
        position: node.position,
        data: node.data,
      })) || [],
      edges: sourceModel?.edges?.map(edge => {
        const effectType = (edge as any).data?.effectType || 'positive';
        const color = effectType === 'negative' ? '#ef4444' : '#10b981';
        
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          animated: false,
          data: edge.data,
          style: { 
            stroke: color, 
            strokeWidth: 2 
          },
          markerEnd: {
            type: 'arrowclosed' as const,
            color: color,
          },
        };
      }) || []
    };
  }, [model, loadFromLocalStorage, useLocalStorage]);

  const initialData = getInitialData();
  const initialNodes: Node[] = initialData.nodes;
  const initialEdges: Edge[] = initialData.edges;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [nodeLabel, setNodeLabel] = useState('');
  const [showModerateEffectForm, setShowModerateEffectForm] = useState(false);
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);

  // Create nodeTypes with access to current nodes
  const nodeTypes: NodeTypes = useMemo(() => ({
    customNode: (props: any) => <CustomNode {...props} nodes={nodes} />
  }), [nodes]);

  // Handle node data update from form
  const handleNodeUpdate = useCallback((nodeId: string, data: NodeData) => {
    setNodes((nds) => {
      return nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data
            }
          };
        }
        return node;
      });
    });
  }, [setNodes]);

  // Handle form save
  const handleFormSave = useCallback((data: NodeData) => {
    if (editingNode) {
      handleNodeUpdate(editingNode.id, data);
      setEditingNode(null);
    }
  }, [editingNode, handleNodeUpdate]);

  // Handle form cancel
  const handleFormCancel = useCallback(() => {
    setEditingNode(null);
  }, []);

  // Initialize node data with default values
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          observableQuestions: node.data.observableQuestions || 1
        },
      }))
    );
  }, [setNodes]);

  // Cycle detection function
  const hasCycle = useCallback((edges: Edge[], newEdge: { source: string; target: string }) => {
    const allEdges = [...edges, newEdge];
    const graph: { [key: string]: string[] } = {};

    // Build adjacency list
    allEdges.forEach(edge => {
      if (!graph[edge.source]) graph[edge.source] = [];
      graph[edge.source].push(edge.target);
    });

    // DFS to detect cycle
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string): boolean => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recursionStack.delete(node);
      return false;
    };

    // Check all nodes for cycles
    for (const node of Object.keys(graph)) {
      if (!visited.has(node) && dfs(node)) {
        return true;
      }
    }

    return false;
  }, []);

  // Handle connection between nodes with cycle detection
  const onConnect = useCallback(
    (params: Connection) => {
      if (isReadOnly || !params.source || !params.target) return;

      // Check for cycle before adding edge
      if (hasCycle(edges, { source: params.source, target: params.target })) {
        alert('Cannot create this connection as it would create a cycle in the graph.');
        return;
      }

      const newEdge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        animated: true,
        data: { effectType: 'positive' },
        style: { stroke: '#10b981', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed' as const,
          color: '#10b981',
        },
      } as Edge;
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, edges, hasCycle, isReadOnly],
  );

  // Add new variable node
  const addNode = useCallback(() => {
    if (isReadOnly || !nodeLabel.trim()) return;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'customNode',
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        label: nodeLabel,
        nodeType: 'variable' as const,
        observableQuestions: 1,
        likertScale: 5,
        average: 0,
        standardDeviation: 1
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeLabel('');
  }, [nodeLabel, setNodes, isReadOnly]);

  // Handle moderate effect form save
  const handleModerateEffectSave = useCallback((data: { label: string; moderateVariable: string; independentVariable: string; effectType: 'positive' | 'negative' }) => {
    // Check if we're editing an existing moderate effect node
    if (editingNode && editingNode.data?.nodeType === 'moderate_effect') {
      // Update existing moderate effect node
      setNodes((nds) => 
        nds.map((node) => 
          node.id === editingNode.id 
            ? { 
                ...node, 
                data: { 
                  ...node.data, 
                  label: data.label,
                  moderateVariable: data.moderateVariable,
                  independentVariable: data.independentVariable,
                  effectType: data.effectType
                } 
              }
            : node
        )
      );

      // Update the edge connected to this moderate effect node
      setEdges((eds) => 
        eds.map((edge) => 
          edge.source === editingNode.id 
            ? { 
                ...edge, 
                data: { ...edge.data, effectType: data.effectType },
                style: { 
                  stroke: data.effectType === 'positive' ? '#10b981' : '#ef4444', 
                  strokeWidth: 2 
                },
                markerEnd: {
                  type: 'arrowclosed' as const,
                  color: data.effectType === 'positive' ? '#10b981' : '#ef4444',
                }
              }
            : edge
        )
      );

      setEditingNode(null);
      setShowModerateEffectForm(false);
      return;
    }

    // Creating new moderate effect node
    if (!selectedNode) return;

    const selectedNodeData = nodes.find(n => n.id === selectedNode);
    if (!selectedNodeData || selectedNodeData.data.nodeType !== 'variable') return;

    const newNodeId = `moderate-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'customNode',
      position: {
        x: selectedNodeData.position.x + 200,
        y: selectedNodeData.position.y,
      },
      data: {
        label: data.label,
        nodeType: 'moderate_effect' as const,
        observableQuestions: 1,
        likertScale: 5,
        moderateVariable: data.moderateVariable,
        independentVariable: data.independentVariable,
        effectType: data.effectType
      },
    };

    // Create edge from moderate effect node to target variable (selected node)
    const newEdge: Edge = {
      id: `edge-${newNodeId}-${selectedNode}`,
      source: newNodeId,
      target: selectedNode,
      animated: true,
      data: { effectType: data.effectType },
      style: { 
        stroke: data.effectType === 'positive' ? '#10b981' : '#ef4444', 
        strokeWidth: 2 
      },
      markerEnd: {
        type: 'arrowclosed' as const,
        color: data.effectType === 'positive' ? '#10b981' : '#ef4444',
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setShowModerateEffectForm(false);
  }, [selectedNode, nodes, setNodes, setEdges, editingNode]);

  // Handle moderate effect form cancel
  const handleModerateEffectCancel = useCallback(() => {
    setShowModerateEffectForm(false);
    setEditingNode(null);
  }, []);

  // Delete selected node
  const deleteNode = useCallback(() => {
    if (isReadOnly || !selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode));
    setEdges((eds) => eds.filter((edge) =>
      edge.source !== selectedNode && edge.target !== selectedNode
    ));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges, isReadOnly]);

  // Handle node selection only
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
    setSelectedEdge(null); // Clear edge selection when selecting node
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null); // Clear node selection when selecting edge
  }, []);

  // Handle edit node button click
  const handleEditNode = useCallback(() => {
    if (isReadOnly || !selectedNode) return;
    
    const nodeToEdit = nodes.find(node => node.id === selectedNode);
    if (nodeToEdit) {
      if (nodeToEdit.data?.nodeType === 'moderate_effect') {
        // Use the unified moderate effect form for editing
        setEditingNode(nodeToEdit);
        setShowModerateEffectForm(true);
      } else {
        // Use the regular node edit form for variable nodes
        setEditingNode(nodeToEdit);
      }
    }
  }, [selectedNode, nodes, isReadOnly]);

  // Handle delete edge
  const deleteEdge = useCallback(() => {
    if (isReadOnly || !selectedEdge) return;

    // Check if the source node is a moderate effect node
    const sourceNode = nodes.find(node => node.id === selectedEdge.source);
    if (sourceNode?.data?.nodeType === 'moderate_effect') {
      alert('Cannot delete connections from moderate effect nodes. These connections are automatically managed.');
      return;
    }

    setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
    setSelectedEdge(null);
  }, [selectedEdge, setEdges, nodes, isReadOnly]);

  // Handle edge update from form
  const handleEdgeUpdate = useCallback((edgeData: { effectType: 'positive' | 'negative' }) => {
    if (!editingEdge) return;

    setEdges((eds) => 
      eds.map((edge) => 
        edge.id === editingEdge.id 
          ? { 
              ...edge, 
              data: { 
                ...edge.data, 
                effectType: edgeData.effectType 
              },
              style: {
                ...edge.style,
                stroke: edgeData.effectType === 'positive' ? '#10b981' : '#ef4444',
                strokeWidth: 2
              }
            }
          : edge
      )
    );
    setEditingEdge(null);
  }, [editingEdge, setEdges]);

  // Update model when nodes or edges change and save to localStorage
  useEffect(() => {
    const dagModel: AdvanceModelType = {
      name: model?.name || 'Untitled Graph',
      nodes: nodes.map(node => ({
        id: node.id,
        data: node.data as NodeDataType,
        position: node.position,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: edge.data as EdgeDataType,
      }))
    };

    setModel(dagModel);

    if (useLocalStorage) {
      saveToLocalStorage(dagModel);
    }
  }, [nodes, edges, model?.name, setModel, saveToLocalStorage]);

  return (
    <div className="w-full h-full">
      {/* Controls Panel */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center">
          {!isReadOnly && (
            <div className="flex gap-2">
              <input
                type="text"
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
                placeholder="Enter node label"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addNode()}
              />
              <button
                onClick={addNode}
                disabled={!nodeLabel.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Variable
              </button>
            </div>
          )}

          {selectedNode && !isReadOnly && (
            <div className="flex gap-2">
              <button
                onClick={handleEditNode}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Edit Node
              </button>
              {/* Show Add Moderate Effect button only for variable nodes */}
              {nodes.find(n => n.id === selectedNode)?.data?.nodeType === 'variable' && (
                <button
                  onClick={() => setShowModerateEffectForm(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                >
                  Add Moderate Effect
                </button>
              )}
              <button
                onClick={deleteNode}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete Selected Node
              </button>
            </div>
          )}

          {selectedEdge && !isReadOnly && (() => {
            // Check if the selected edge is from a moderate effect node
            const sourceNode = nodes.find(node => node.id === selectedEdge.source);
            const isModerateEffectEdge = sourceNode?.data?.nodeType === 'moderate_effect';
            
            return !isModerateEffectEdge ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingEdge(selectedEdge)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit Connection
                </button>
                <button
                  onClick={deleteEdge}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete Selected Connection
                </button>
              </div>
            ) : null;
          })()}

          <div className="flex gap-4 items-center">
            <div className="text-sm text-gray-600">
              Nodes: {nodes.length} | Edges: {edges.length}
              {selectedNode && ` | Selected Node: ${selectedNode}`}
              {selectedEdge && ` | Selected Edge: ${selectedEdge.id}`}
            </div>

            {!isReadOnly && (
              <button
                onClick={() => {
                  const confirmed = confirm('Are you sure you want to clear the graph?');
                  if (confirmed) {
                    setNodes([]);
                    setEdges([]);
                    localStorage.removeItem('dagModel');
                  }
                }}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Graph
              </button>
            )}
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="w-full h-96 border border-gray-300 rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isReadOnly ? undefined : onNodesChange}
          onEdgesChange={isReadOnly ? undefined : onEdgesChange}
          onConnect={isReadOnly ? undefined : onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="top-right"
          panOnDrag={true}
          panOnScroll={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={true}
          minZoom={0.1}
          maxZoom={4}
          nodesDraggable={!isReadOnly}
          nodesConnectable={!isReadOnly}
          elementsSelectable={true}
        >
          <MiniMap />
          <Controls showZoom={true} showFitView={true} showInteractive={true} />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Node Edit Form Modal - Only for variable nodes */}
      {!isReadOnly && editingNode && editingNode.data?.nodeType === 'variable' && (
        <NodeEditForm
          node={editingNode}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          availableNodes={nodes}
        />
      )}

      {/* Moderate Effect Form Modal - For creating new or editing existing moderate effects */}
      {!isReadOnly && showModerateEffectForm && (
        <ModerateEffectForm
          selectedNodeId={selectedNode || undefined}
          editingNode={editingNode?.data?.nodeType === 'moderate_effect' ? editingNode : null}
          onSave={handleModerateEffectSave}
          onCancel={handleModerateEffectCancel}
          availableNodes={nodes}
        />
      )}

      {/* Edge Edit Form Modal */}
      {!isReadOnly && editingEdge && (
        <EdgeEditForm
          edge={editingEdge}
          onSave={handleEdgeUpdate}
          onCancel={() => setEditingEdge(null)}
          nodes={nodes}
        />
      )}
    </div>
  );
};

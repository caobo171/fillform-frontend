import { useMe } from '@/hooks/user';
import { Helper } from '@/services/Helper';
import { DataModel, RawForm, DagModeType, NodeSchemaType, EdgeSchemaType } from '@/store/types';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
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

interface ModelAdvanceBuilderProps {
  model?: DagModeType | null,
  setModel: (model: DagModeType) => void,
}

interface NodeData {
  label: string;
  variableType: 'normal' | 'mediate' | 'moderate';
  observableQuestions: number;
  likertScale: number;
  moderationTargets?: string[];
  moderationTargetLabels?: string[];
  average?: number;
  standardDeviation?: number;
}

// Node Edit Form Component
const NodeEditForm = ({ node, onSave, onCancel, availableNodes }: {
  node: Node;
  onSave: (data: { label: string; variableType: 'normal' | 'mediate' | 'moderate'; observableQuestions: number; likertScale: number; moderationTargets?: string[]; average?: number; standardDeviation?: number }) => void;
  onCancel: () => void;
  availableNodes: Node[];
}) => {
  const [label, setLabel] = useState((node.data?.label as string) || '');
  const [variableType, setVariableType] = useState<'normal' | 'mediate' | 'moderate'>(
    (node.data?.variableType as 'normal' | 'mediate' | 'moderate') || 'normal'
  );
  const [observableQuestions, setObservableQuestions] = useState(
    (node.data?.observableQuestions as number) || 1
  );
  const [likertScale, setLikertScale] = useState(
    (node.data?.likertScale as number) || 5
  );
  const [moderationTargets, setModerationTargets] = useState<MultiValue<{ value: string; label: string }>>(
    (node.data?.moderationTargets as string[] || []).map(id => {
      const targetNode = availableNodes.find(n => n.id === id);
      return { value: id, label: (targetNode?.data?.label as string) || id };
    })
  );
  const [average, setAverage] = useState<string>(
    (node.data?.average as string) || '0'
  );
  const [standardDeviation, setStandardDeviation] = useState<string>(
    (node.data?.standardDeviation as string) || '1'
  );

  // Filter available nodes (exclude current node)
  const targetOptions = availableNodes.filter(n => n.id !== node.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      onSave({
        label: label.trim(),
        variableType,
        observableQuestions,
        likertScale,
        moderationTargets: variableType === 'moderate' ? moderationTargets.map(t => t.value) : undefined,
        average: parseFloat(average),
        standardDeviation: parseFloat(standardDeviation)
      });
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

          {/* Observable Questions Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Observable Questions
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={observableQuestions}
              onChange={(e) => setObservableQuestions(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Variable Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variable Type
            </label>
            <select
              value={variableType}
              onChange={(e) => setVariableType(e.target.value as 'normal' | 'mediate' | 'moderate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal Variable</option>
              <option value="mediate">Mediate Variable</option>
              <option value="moderate">Moderate Variable</option>
            </select>
          </div>

          {/* Likert Scale Selection */}
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

          {/* Average and Standard Deviation (for independent variables) */}
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

          {/* Moderation Target Selection (only for moderate variables) */}
          {variableType === 'moderate' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moderates Effect On
              </label>
              <Select
                isMulti
                value={moderationTargets}
                onChange={setModerationTargets}
                options={targetOptions.map(targetNode => ({
                  value: targetNode.id,
                  label: (targetNode.data?.label as string) || targetNode.id
                }))}
                placeholder="Select target variables..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
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

// Custom Node Component
const CustomNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  const variableType = data?.variableType || 'normal';
  const observableQuestions = data?.observableQuestions || 1;
  const moderationTargets = data?.moderationTargets || [];
  const moderationTargetLabels = data?.moderationTargetLabels || [];
  const average = data?.average;
  const standardDeviation = data?.standardDeviation;

  // Define colors and styles based on variable type
  const getVariableStyles = (type: string) => {
    switch (type) {
      case 'moderate':
        return {
          border: 'border-purple-500',
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          badge: 'bg-purple-600',
          count: 'bg-purple-200 text-purple-800',
          label: 'MODERATE'
        };
      case 'mediate':
        return {
          border: 'border-orange-500',
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          badge: 'bg-orange-600',
          count: 'bg-orange-200 text-orange-800',
          label: 'MEDIATE'
        };
      default: // normal
        return {
          border: 'border-gray-200',
          bg: 'bg-white',
          text: 'text-gray-900',
          badge: 'bg-gray-600',
          count: 'bg-blue-100 text-blue-800',
          label: 'NORMAL'
        };
    }
  };

  const styles = getVariableStyles(variableType);

  return (
    <div className={`px-4 py-3 shadow-md rounded-md border-2 min-w-[140px] ${selected ? 'border-blue-500' : styles.border
      } ${styles.bg}`}>
      <div className="flex flex-col items-center text-center">
        {/* Variable Name */}
        <div className={`text-sm font-bold mb-1 ${styles.text}`}>
          {data?.label}
        </div>

        {/* Status and Count Display */}
        <div className="flex flex-col items-center gap-1">
          {variableType !== 'normal' && (
            <div className={`${styles.badge} text-white text-xs px-2 py-1 rounded-full font-bold`}>
              {styles.label}
            </div>
          )}

          {/* Show moderation targets for moderate variables */}
          {variableType === 'moderate' && moderationTargets.length > 0 && (
            <div className="bg-purple-300 text-purple-900 text-xs px-2 py-1 rounded-full font-medium">
              Moderates: {moderationTargetLabels.join(', ')}
            </div>
          )}

          <div className={`text-xs px-2 py-1 rounded-full font-medium ${styles.count}`}>
            {observableQuestions} Observable{observableQuestions !== 1 ? 's' : ''}
          </div>

          {/* Show average and standard deviation if they exist */}
          {(average !== undefined && average !== 0) || (standardDeviation !== undefined && standardDeviation !== 1) ? (
            <div className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
              μ={average?.toFixed(2) || '0.00'}, σ={standardDeviation?.toFixed(2) || '1.00'}
            </div>
          ) : null}
        </div>
      </div>

      {/* Left Handle (Input) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 !left-[-8px]"
      />

      {/* Right Handle (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-green-500 !border-2 !border-white hover:!bg-green-600 !right-[-8px]"
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  customNode: CustomNode,
};

export const ModelAdvanceBuilder = ({ model, setModel }: ModelAdvanceBuilderProps) => {
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
      if (recursionStack.has(node)) return true; // Cycle found
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

    // Check all nodes
    for (const node in graph) {
      if (!visited.has(node)) {
        if (dfs(node)) return true;
      }
    }

    return false;
  }, []);

  // Local storage functions
  const saveToLocalStorage = useCallback((dagModel: DagModeType) => {
    try {
      localStorage.setItem('dagModel', JSON.stringify(dagModel));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback((): DagModeType | null => {
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
    const savedModel = loadFromLocalStorage();
    const sourceModel = model || savedModel;

    return {
      nodes: sourceModel?.nodes?.map(node => ({
        id: node.id,
        type: 'customNode',
        position: node.position,
        data: node.data,
      })) || [],
      edges: sourceModel?.edges?.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated || false,
        style: edge.style || { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed' as const,
          color: '#3b82f6',
        },
      })) || []
    };
  }, [model, loadFromLocalStorage]);

  const initialData = getInitialData();
  const initialNodes: Node[] = initialData.nodes;
  const initialEdges: Edge[] = initialData.edges;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [nodeLabel, setNodeLabel] = useState('');

  // Handle node data update from form
  const handleNodeUpdate = useCallback((nodeId: string, data: NodeData) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === nodeId) {
          // Find the moderation target labels if it's a moderate variable
          let moderationTargetLabels = undefined;
          if (data.variableType === 'moderate' && data.moderationTargets) {
            moderationTargetLabels = data.moderationTargets.map(targetId => {
              const targetNode = nds.find(n => n.id === targetId);
              return targetNode?.data?.label || targetId;
            });
          }

          return {
            ...node,
            data: {
              ...node.data,
              ...data,
              moderationTargetLabels
            }
          };
        }
        return node;
      });

      // Update all moderate nodes' target labels in case the target node's label changed
      return updatedNodes.map((node) => {
        if (node.data.variableType === 'moderate' && node.data.moderationTargets && Array.isArray(node.data.moderationTargets)) {
          const moderationTargetLabels = node.data.moderationTargets.map((targetId: string) => {
            const targetNode = updatedNodes.find(n => n.id === targetId);
            return targetNode?.data?.label || targetId;
          });
          return {
            ...node,
            data: {
              ...node.data,
              moderationTargetLabels
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

  // Handle connection between nodes with cycle detection
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      // Check for cycle before adding edge
      if (hasCycle(edges, { source: params.source, target: params.target })) {
        alert('Cannot create this connection as it would create a cycle in the graph.');
        return;
      }

      const newEdge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed' as const,
          color: '#3b82f6',
        },
      } as Edge;
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, edges, hasCycle],
  );

  // Add new node
  const addNode = useCallback(() => {
    if (!nodeLabel.trim()) return;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'customNode',
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        label: nodeLabel,
        isModerator: false,
        observableQuestions: 1
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeLabel('');
  }, [nodeLabel, setNodes]);

  // Delete selected node
  const deleteNode = useCallback(() => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode));
    setEdges((eds) => eds.filter((edge) =>
      edge.source !== selectedNode && edge.target !== selectedNode
    ));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  // Handle node selection only
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node.id);
    setSelectedEdge(null); // Clear edge selection when selecting node
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge.id);
    setSelectedNode(null); // Clear node selection when selecting edge
  }, []);

  // Handle edit node button click
  const handleEditNode = useCallback(() => {
    if (selectedNode) {
      const nodeToEdit = nodes.find(node => node.id === selectedNode);
      if (nodeToEdit) {
        setEditingNode(nodeToEdit);
      }
    }
  }, [selectedNode, nodes]);

  // Handle delete edge
  const deleteEdge = useCallback(() => {
    if (!selectedEdge) return;

    setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge));
    setSelectedEdge(null);
  }, [selectedEdge, setEdges]);

  // Update model when nodes or edges change and save to localStorage
  useEffect(() => {
    const dagModel: DagModeType = {
      name: model?.name || 'Untitled Graph',
      nodes: nodes.map(node => ({
        id: node.id,
        data: node.data,
        position: node.position,
        type: node.type,
      })) as NodeSchemaType[],
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated || false,
        style: edge.style,
      })) as EdgeSchemaType[],
      version: model?.version,
      createdAt: model?.createdAt,
    };

    setModel(dagModel);
    saveToLocalStorage(dagModel);
  }, [nodes, edges, model?.name, model?.version, model?.createdAt, setModel, saveToLocalStorage]);

  return (
    <div className="w-full h-full">
      {/* Controls Panel */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center">
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
              Add Node
            </button>
          </div>

          {selectedNode && (
            <div className="flex gap-2">
              <button
                onClick={handleEditNode}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Edit Node
              </button>
              <button
                onClick={deleteNode}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete Selected Node
              </button>
            </div>
          )}

          {selectedEdge && (
            <div className="flex gap-2">
              <button
                onClick={deleteEdge}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete Selected Connection
              </button>
            </div>
          )}

          <div className="flex gap-4 items-center">
            <div className="text-sm text-gray-600">
              Nodes: {nodes.length} | Edges: {edges.length}
              {selectedNode && ` | Selected Node: ${selectedNode}`}
              {selectedEdge && ` | Selected Edge: ${selectedEdge}`}
            </div>

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
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="w-full h-96 border border-gray-300 rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
        >
          <MiniMap />
          <Controls showZoom={true} showFitView={true} showInteractive={true} />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Node Edit Form Modal */}
      {editingNode && (
        <NodeEditForm
          node={editingNode}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          availableNodes={nodes}
        />
      )}
    </div>
  );
};

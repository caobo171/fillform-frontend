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

// Custom Node Component
const CustomNode = ({ data, id }: { data: any; id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(data.label);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      data.onLabelChange?.(id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(data.label);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleModeratorToggle = () => {
    data.onModeratorChange?.(id, !data.isModerator);
  };

  const isModerator = data.isModerator || false;

  return (
    <div className={`px-6 py-4 shadow-md rounded-lg bg-white border-2 relative min-w-[140px] ${
      isModerator ? 'border-purple-500 bg-purple-50' : 'border-stone-400'
    }`}>
      {/* Moderator Badge */}
      {isModerator && (
        <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          MOD
        </div>
      )}

      {/* Left Handle (Input) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-4 !h-4 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 !left-[-8px]" 
      />
      
      {/* Node Content */}
      <div className="text-center">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSave}
              className="text-lg font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 outline-none text-center"
              autoFocus
            />
            <div className="flex gap-1 justify-center">
              <button
                onClick={handleSave}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                ✓
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div 
              className="text-lg font-bold text-gray-800 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
              onDoubleClick={handleDoubleClick}
              title="Double-click to edit"
            >
              {data.label}
            </div>
            
            {/* Moderator Toggle */}
            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id={`moderator-${id}`}
                checked={isModerator}
                onChange={handleModeratorToggle}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
              <label 
                htmlFor={`moderator-${id}`}
                className="text-sm text-gray-600 cursor-pointer select-none"
              >
                Moderator
              </label>
            </div>
          </div>
        )}
      </div>
      
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
  // Initialize nodes and edges from the model
  const initialNodes: Node[] = model?.nodes?.map(node => ({
    id: node.id,
    type: 'customNode',
    position: node.position,
    data: node.data,
  })) || [];

  const initialEdges: Edge[] = model?.edges?.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: edge.animated || false,
    style: edge.style || { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: {
      type: 'arrowclosed',
      color: '#3b82f6',
    },
  })) || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeLabel, setNodeLabel] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Handle node label changes
  const handleLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  }, [setNodes]);

  // Handle moderator variable toggle
  const handleModeratorChange = useCallback((nodeId: string, isModerator: boolean) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, isModerator } }
          : node
      )
    );
  }, [setNodes]);

  // Update node data to include the label change and moderator change handlers
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { 
          ...node.data, 
          onLabelChange: handleLabelChange,
          onModeratorChange: handleModeratorChange 
        },
      }))
    );
  }, [handleLabelChange, handleModeratorChange, setNodes]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed',
          color: '#3b82f6',
        },
      } as Edge;
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges],
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
        onLabelChange: handleLabelChange,
        onModeratorChange: handleModeratorChange
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setNodeLabel('');
  }, [nodeLabel, setNodes, handleLabelChange, handleModeratorChange]);

  // Delete selected node
  const deleteNode = useCallback(() => {
    if (!selectedNode) return;
    
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== selectedNode && edge.target !== selectedNode
    ));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  // Update model when nodes or edges change
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
  }, [nodes, edges, model?.name, model?.version, model?.createdAt, setModel]);

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
            <button
              onClick={deleteNode}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete Selected Node
            </button>
          )}
          
          <div className="text-sm text-gray-600">
            Nodes: {nodes.length} | Edges: {edges.length}
            {selectedNode && ` | Selected: ${selectedNode}`}
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
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="top-right"
        >
          <MiniMap />
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

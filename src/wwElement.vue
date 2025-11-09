<template>
  <div 
    ref="canvasContainer"
    class="ww-canvas-vueflow" 
    :style="canvasStyle"
    @mousedown="handleCanvasMouseDown"
    @mousemove="handleCanvasMouseMove"
    @mouseup="handleCanvasMouseUp"
    @wheel="handleWheel"
  >
    <!-- Background Grid -->
    <svg 
      v-if="content?.gridEnabled"
      class="canvas-grid"
      :style="gridStyle"
    >
      <defs>
        <pattern 
          id="grid-pattern" 
          :width="gridSize" 
          :height="gridSize" 
          patternUnits="userSpaceOnUse"
          :patternTransform="`translate(${(viewport?.x || 0) % gridSize}, ${(viewport?.y || 0) % gridSize}) scale(${viewport?.zoom || 1})`"
        >
          <path 
            :d="`M ${gridSize} 0 L 0 0 0 ${gridSize}`" 
            fill="none" 
            :stroke="content?.gridColor || '#e0e0e0'" 
            stroke-width="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>

    <!-- Canvas Content -->
    <div 
      class="canvas-viewport"
      :style="viewportStyle"
    >
      <!-- SVG Layer for Edges -->
      <svg class="edges-layer">
        <!-- Active Connection Preview -->
        <path
          v-if="draggingConnection"
          :d="connectionPreviewPath"
          class="edge-preview"
          :stroke="content?.edgeColor || '#999'"
          stroke-width="2"
          fill="none"
        />

        <!-- Rendered Edges -->
        <g
          v-for="edge in visibleEdges"
          :key="edge.id"
          :class="['edge-group', { 'edge-selected': selectedEdgeId === edge.id }]"
          @click="handleEdgeClick(edge.id)"
        >
          <path
            :d="getEdgePath(edge)"
            class="edge-path"
            :stroke="edge.selected ? content?.selectedEdgeColor || '#007aff' : content?.edgeColor || '#999'"
            :stroke-width="edge.selected ? 3 : 2"
            fill="none"
          />
          <!-- Edge Interaction Area (invisible, larger hitbox) -->
          <path
            :d="getEdgePath(edge)"
            class="edge-hitbox"
            stroke="transparent"
            stroke-width="15"
            fill="none"
          />
        </g>
      </svg>

      <!-- Nodes Layer -->
      <div
        v-for="node in nodes"
        :key="node.id"
        :class="['canvas-node', { 
          'node-selected': selectedNodeId === node.id,
          'node-dragging': draggingNodeId === node.id
        }]"
        :style="getNodeStyle(node)"
        @mousedown.stop="handleNodeMouseDown($event, node.id)"
        @click.stop="handleNodeClick(node.id)"
      >
        <!-- Node Handles -->
        <div
          v-for="handle in getNodeHandles(node)"
          :key="handle.id"
          :class="['node-handle', `handle-${handle.position}`, `handle-${handle.type}`]"
          :style="getHandleStyle(handle)"
          @mousedown.stop="handleHandleMouseDown($event, node.id, handle)"
          @mouseup.stop="handleHandleMouseUp($event, node.id, handle)"
        >
          <div class="handle-dot" />
        </div>

        <!-- Node Content -->
        <div class="node-content">
          <div class="node-header">
            <span class="node-title">{{ node?.data?.label || node?.data?.title || `Node ${node.id}` }}</span>
            <button 
              v-if="content?.deletableNodes"
              class="node-delete"
              @click.stop="deleteNode(node.id)"
            >
              ×
            </button>
          </div>
          <div v-if="node?.data?.description" class="node-description">
            {{ node.data.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Drop Zone Control Area -->
    <div 
      v-if="content?.dropZoneEnabled"
      class="dropzone-control"
      :style="dropZoneStyle"
    >
      <!-- Dropzone Info Display -->
      <div v-if="selectedNodeId" class="dropzone-info">
        <span class="info-label">Selected:</span>
        <span class="info-value">{{ getSelectedNodeLabel }}</span>
      </div>

      <!-- Dropzone Actions (WeWeb elements can be dropped here) -->
      <wwLayout 
        path="dropZoneContent" 
        direction="row"
        class="dropzone-container"
      />

      <!-- Built-in Canvas Controls -->
      <div class="canvas-controls">
        <button 
          class="control-btn"
          @click="handleZoomIn"
          title="Zoom In"
        >
          +
        </button>
        <button 
          class="control-btn"
          @click="handleZoomOut"
          title="Zoom Out"
        >
          −
        </button>
        <button 
          class="control-btn"
          @click="handleFitView"
          title="Fit View"
        >
          ⊡
        </button>
        <button 
          class="control-btn"
          @click="handleResetView"
          title="Reset View"
        >
          ↻
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

export default {
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: {
    'trigger-event': null
  },
  setup(props, { emit }) {
    // ========================================
    // REFS
    // ========================================
    const canvasContainer = ref(null);

    // ========================================
    // INTERNAL VARIABLES (wwLib Component Variables)
    // ========================================
    
    // Nodes state
    const { value: nodes, setValue: setNodes } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'nodes',
      type: 'array',
      defaultValue: [],
    });

    // Edges state
    const { value: edges, setValue: setEdges } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'edges',
      type: 'array',
      defaultValue: [],
    });

    // Viewport state
    const { value: viewport, setValue: setViewport } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'viewport',
      type: 'object',
      defaultValue: { x: 0, y: 0, zoom: 1 },
    });

    // Selected node ID
    const { value: selectedNodeId, setValue: setSelectedNodeId } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedNodeId',
      type: 'string',
      defaultValue: null,
    });

    // Selected edge ID
    const { value: selectedEdgeId, setValue: setSelectedEdgeId } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedEdgeId',
      type: 'string',
      defaultValue: null,
    });

    // Dragging connection state
    const { value: draggingConnection, setValue: setDraggingConnection } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'draggingConnection',
      type: 'object',
      defaultValue: null,
    });

    // Zoom percentage
    const { value: zoomPercentage, setValue: setZoomPercentage } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'zoomPercentage',
      type: 'number',
      defaultValue: 100,
    });

    // ========================================
    // LOCAL STATE (UI-only, non-exposed)
    // ========================================
    const draggingNodeId = ref(null);
    const dragOffset = ref({ x: 0, y: 0 });
    const isPanning = ref(false);
    const panStart = ref({ x: 0, y: 0 });
    const mousePosition = ref({ x: 0, y: 0 });
    const gridSize = 20;

    /* wwEditor:start */
    const isEditing = computed(() => props.wwEditorState?.isEditing);
    /* wwEditor:end */

    // ========================================
    // INITIALIZATION
    // ========================================
    
    // Transform and initialize nodes from props
    watch(() => props.content?.initialNodes, (newNodes) => {
      if (newNodes && Array.isArray(newNodes) && newNodes.length > 0) {
        // Transform flattened structure to VueFlow format
        const transformedNodes = newNodes.map(node => ({
          id: node?.id || `node-${Date.now()}`,
          type: node?.type || 'default',
          position: {
            x: node?.positionX ?? node?.position?.x ?? 100,
            y: node?.positionY ?? node?.position?.y ?? 100
          },
          data: {
            label: node?.label ?? node?.data?.label ?? 'Node',
            description: node?.description ?? node?.data?.description ?? ''
          }
        }));
        setNodes(JSON.parse(JSON.stringify(transformedNodes)));
      }
    }, { immediate: true });

    // Initialize edges from props
    watch(() => props.content?.initialEdges, (newEdges) => {
      if (newEdges && Array.isArray(newEdges) && newEdges.length > 0) {
        setEdges(JSON.parse(JSON.stringify(newEdges)));
      }
    }, { immediate: true });

    // ========================================
    // COMPUTED STYLES
    // ========================================
    
    const canvasStyle = computed(() => ({
      '--canvas-bg': props.content?.backgroundColor || '#ffffff',
      '--node-bg': props.content?.nodeBackgroundColor || '#f9f9f9',
      '--node-border': props.content?.nodeBorderColor || '#d0d0d0',
      '--node-selected': props.content?.selectedNodeColor || '#007aff',
      '--handle-bg': props.content?.handleColor || '#007aff',
      width: '100%',
      height: '100%',
    }));

    const gridStyle = computed(() => ({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    }));

    const viewportStyle = computed(() => ({
      transform: `translate(${viewport.value?.x || 0}px, ${viewport.value?.y || 0}px) scale(${viewport.value?.zoom || 1})`,
      transformOrigin: '0 0',
    }));

    const dropZoneStyle = computed(() => ({
      '--dropzone-height': props.content?.dropZoneHeight || '80px',
      '--dropzone-bg': props.content?.dropZoneBackground || '#f5f5f5',
    }));

    // ========================================
    // COMPUTED PROPERTIES (Formulas)
    // ========================================
    
    const visibleEdges = computed(() => {
      const nodeIds = new Set(nodes.value?.map(n => n.id) || []);
      return (edges.value || []).filter(edge => 
        nodeIds.has(edge.source) && nodeIds.has(edge.target)
      );
    });

    const getSelectedNodeLabel = computed(() => {
      if (!selectedNodeId.value) return '';
      const node = nodes.value?.find(n => n.id === selectedNodeId.value);
      return node?.data?.label || node?.data?.title || `Node ${selectedNodeId.value}`;
    });

    const connectionPreviewPath = computed(() => {
      if (!draggingConnection.value) return '';
      
      const sourceNode = nodes.value?.find(n => n.id === draggingConnection.value.sourceNodeId);
      if (!sourceNode) return '';
      
      const handle = draggingConnection.value.handle;
      const sourcePos = getHandlePosition(sourceNode, handle);
      const targetPos = mousePosition.value;
      
      return createBezierPath(sourcePos, targetPos);
    });

    // ========================================
    // NODE METHODS
    // ========================================
    
    const getNodeStyle = (node) => {
      return {
        position: 'absolute',
        left: `${node?.position?.x || 0}px`,
        top: `${node?.position?.y || 0}px`,
        transform: 'translate(-50%, -50%)',
      };
    };

    const getNodeHandles = (node) => {
      const nodeType = node?.type || 'default';
      const connectable = props.content?.connectableNodes !== false;
      
      if (!connectable) return [];
      
      // Default handles configuration
      const defaultHandles = [
        { id: 'top', type: 'target', position: 'top' },
        { id: 'bottom', type: 'source', position: 'bottom' },
        { id: 'left', type: 'target', position: 'left' },
        { id: 'right', type: 'source', position: 'right' },
      ];
      
      // Custom handles from node data
      if (node?.data?.handles && Array.isArray(node.data.handles)) {
        return node.data.handles;
      }
      
      return defaultHandles;
    };

    const getHandleStyle = (handle) => {
      const positions = {
        top: { top: '0', left: '50%', transform: 'translate(-50%, -50%)' },
        bottom: { bottom: '0', left: '50%', transform: 'translate(-50%, 50%)' },
        left: { left: '0', top: '50%', transform: 'translate(-50%, -50%)' },
        right: { right: '0', top: '50%', transform: 'translate(50%, -50%)' },
      };
      return positions[handle.position] || positions.right;
    };

    const getHandlePosition = (node, handle) => {
      const nodeX = node?.position?.x || 0;
      const nodeY = node?.position?.y || 0;
      
      // Approximate offsets based on handle position
      const offsets = {
        top: { x: 0, y: -30 },
        bottom: { x: 0, y: 30 },
        left: { x: -60, y: 0 },
        right: { x: 60, y: 0 },
      };
      
      const offset = offsets[handle.position] || { x: 0, y: 0 };
      
      return {
        x: nodeX + offset.x,
        y: nodeY + offset.y,
      };
    };

    // ========================================
    // EDGE METHODS
    // ========================================
    
    const getEdgePath = (edge) => {
      const sourceNode = nodes.value?.find(n => n.id === edge.source);
      const targetNode = nodes.value?.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return '';
      
      // Find corresponding handles
      const sourceHandle = edge.sourceHandle || 'bottom';
      const targetHandle = edge.targetHandle || 'top';
      
      const sourcePos = getHandlePosition(sourceNode, { position: sourceHandle });
      const targetPos = getHandlePosition(targetNode, { position: targetHandle });
      
      const pathType = props.content?.edgePathType || 'bezier';
      
      if (pathType === 'straight') {
        return `M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`;
      }
      
      // Bezier curve (default)
      return createBezierPath(sourcePos, targetPos);
    };

    const createBezierPath = (source, target) => {
      const dx = Math.abs(target.x - source.x);
      const dy = Math.abs(target.y - source.y);
      const offset = Math.min(dx, dy) * 0.5;
      
      const cx1 = source.x;
      const cy1 = source.y + offset;
      const cx2 = target.x;
      const cy2 = target.y - offset;
      
      return `M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`;
    };

    // ========================================
    // INTERACTION HANDLERS
    // ========================================
    
    const handleCanvasMouseDown = (event) => {
      // Only pan if clicking on canvas background (not nodes)
      if (event.target === canvasContainer.value || event.target.closest('.canvas-grid') || event.target.closest('.canvas-viewport')) {
        isPanning.value = true;
        panStart.value = {
          x: event.clientX - (viewport.value?.x || 0),
          y: event.clientY - (viewport.value?.y || 0),
        };
        
        // Deselect when clicking canvas
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
      }
    };

    const handleCanvasMouseMove = (event) => {
      // Update mouse position for connection preview
      if (canvasContainer.value && viewport.value) {
        const rect = canvasContainer.value.getBoundingClientRect();
        const x = (event.clientX - rect.left - (viewport.value.x || 0)) / (viewport.value.zoom || 1);
        const y = (event.clientY - rect.top - (viewport.value.y || 0)) / (viewport.value.zoom || 1);
        mousePosition.value = { x, y };
      }
      
      // Handle panning
      if (isPanning.value && props.content?.zoomEnabled !== false && viewport.value) {
        const newX = event.clientX - panStart.value.x;
        const newY = event.clientY - panStart.value.y;
        setViewport({ ...viewport.value, x: newX, y: newY });
      }
      
      // Handle node dragging
      if (draggingNodeId.value) {
        const node = nodes.value?.find(n => n.id === draggingNodeId.value);
        if (node) {
          const newX = mousePosition.value.x;
          const newY = mousePosition.value.y;
          
          // Snap to grid if enabled
          const finalX = props.content?.snapToGrid ? Math.round(newX / gridSize) * gridSize : newX;
          const finalY = props.content?.snapToGrid ? Math.round(newY / gridSize) * gridSize : newY;
          
          updateNodePosition(draggingNodeId.value, finalX, finalY);
        }
      }
    };

    const handleCanvasMouseUp = () => {
      if (isPanning.value) {
        isPanning.value = false;
      }
      
      if (draggingNodeId.value) {
        // Emit node moved event
        emit('trigger-event', {
          name: 'node-moved',
          event: { 
            nodeId: draggingNodeId.value,
            position: nodes.value?.find(n => n.id === draggingNodeId.value)?.position
          }
        });
        draggingNodeId.value = null;
      }
      
      if (draggingConnection.value) {
        // Connection attempt ended without target
        setDraggingConnection(null);
      }
    };

    const handleWheel = (event) => {
      if (props.content?.zoomEnabled === false || !viewport.value) return;
      
      event.preventDefault();
      
      const delta = -event.deltaY * 0.001;
      const newZoom = Math.min(
        Math.max((viewport.value.zoom || 1) + delta, props.content?.minZoom || 0.1),
        props.content?.maxZoom || 2
      );
      
      setViewport({ ...viewport.value, zoom: newZoom });
      setZoomPercentage(Math.round(newZoom * 100));
      
      emit('trigger-event', {
        name: 'zoom-changed',
        event: { zoom: newZoom, percentage: Math.round(newZoom * 100) }
      });
    };

    const handleNodeMouseDown = (event, nodeId) => {
      draggingNodeId.value = nodeId;
      const node = nodes.value?.find(n => n.id === nodeId);
      if (node) {
        dragOffset.value = {
          x: mousePosition.value.x - node.position.x,
          y: mousePosition.value.y - node.position.y,
        };
      }
    };

    const handleNodeClick = (nodeId) => {
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
      
      emit('trigger-event', {
        name: 'node-selected',
        event: { nodeId, node: nodes.value?.find(n => n.id === nodeId) }
      });
    };

    const handleEdgeClick = (edgeId) => {
      setSelectedEdgeId(edgeId);
      setSelectedNodeId(null);
      
      emit('trigger-event', {
        name: 'edge-selected',
        event: { edgeId, edge: edges.value?.find(e => e.id === edgeId) }
      });
    };

    const handleHandleMouseDown = (event, nodeId, handle) => {
      if (handle.type === 'source') {
        event.stopPropagation();
        setDraggingConnection({
          sourceNodeId: nodeId,
          handle: handle,
          sourceHandle: handle.id,
        });
      }
    };

    const handleHandleMouseUp = (event, nodeId, handle) => {
      if (draggingConnection.value && handle.type === 'target') {
        event.stopPropagation();
        
        // Create new edge
        const newEdge = {
          id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          source: draggingConnection.value.sourceNodeId,
          target: nodeId,
          sourceHandle: draggingConnection.value.sourceHandle,
          targetHandle: handle.id,
        };
        
        // Check if connection already exists
        const existingEdge = edges.value?.find(e => 
          e.source === newEdge.source && 
          e.target === newEdge.target &&
          e.sourceHandle === newEdge.sourceHandle &&
          e.targetHandle === newEdge.targetHandle
        );
        
        if (!existingEdge) {
          addEdge(newEdge);
          
          emit('trigger-event', {
            name: 'connection-made',
            event: { edge: newEdge }
          });
        }
        
        setDraggingConnection(null);
      }
    };

    // ========================================
    // CANVAS CONTROL METHODS (Triggers)
    // ========================================
    
    const addNode = (nodeData) => {
      const newNode = {
        id: nodeData?.id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: nodeData?.type || 'default',
        position: nodeData?.position || { x: 100, y: 100 },
        data: nodeData?.data || { label: 'New Node' },
      };
      
      setNodes([...(nodes.value || []), newNode]);
      
      emit('trigger-event', {
        name: 'node-added',
        event: { node: newNode }
      });
    };

    const removeNode = (nodeId) => {
      // Remove node
      setNodes((nodes.value || []).filter(n => n.id !== nodeId));
      
      // Remove connected edges
      setEdges((edges.value || []).filter(e => 
        e.source !== nodeId && e.target !== nodeId
      ));
      
      // Clear selection if deleted
      if (selectedNodeId.value === nodeId) {
        setSelectedNodeId(null);
      }
      
      emit('trigger-event', {
        name: 'node-removed',
        event: { nodeId }
      });
    };

    const deleteNode = (nodeId) => {
      removeNode(nodeId);
    };

    const updateNode = (nodeId, data) => {
      const nodeIndex = nodes.value?.findIndex(n => n.id === nodeId);
      if (nodeIndex !== undefined && nodeIndex >= 0) {
        const updatedNodes = [...(nodes.value || [])];
        updatedNodes[nodeIndex] = {
          ...updatedNodes[nodeIndex],
          data: { ...updatedNodes[nodeIndex].data, ...data }
        };
        setNodes(updatedNodes);
        
        emit('trigger-event', {
          name: 'node-updated',
          event: { nodeId, data }
        });
      }
    };

    const updateNodePosition = (nodeId, x, y) => {
      const nodeIndex = nodes.value?.findIndex(n => n.id === nodeId);
      if (nodeIndex !== undefined && nodeIndex >= 0) {
        const updatedNodes = [...(nodes.value || [])];
        updatedNodes[nodeIndex] = {
          ...updatedNodes[nodeIndex],
          position: { x, y }
        };
        setNodes(updatedNodes);
      }
    };

    const addEdge = (edgeData) => {
      const newEdge = {
        id: edgeData?.id || `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: edgeData.source,
        target: edgeData.target,
        sourceHandle: edgeData?.sourceHandle,
        targetHandle: edgeData?.targetHandle,
      };
      
      setEdges([...(edges.value || []), newEdge]);
      
      emit('trigger-event', {
        name: 'edge-added',
        event: { edge: newEdge }
      });
    };

    const removeEdge = (edgeId) => {
      setEdges((edges.value || []).filter(e => e.id !== edgeId));
      
      if (selectedEdgeId.value === edgeId) {
        setSelectedEdgeId(null);
      }
      
      emit('trigger-event', {
        name: 'edge-removed',
        event: { edgeId }
      });
    };

    const handleZoomIn = () => {
      if (!viewport.value) return;
      const newZoom = Math.min((viewport.value.zoom || 1) + 0.1, props.content?.maxZoom || 2);
      setViewport({ ...viewport.value, zoom: newZoom });
      setZoomPercentage(Math.round(newZoom * 100));
      
      emit('trigger-event', {
        name: 'zoom-changed',
        event: { zoom: newZoom, percentage: Math.round(newZoom * 100) }
      });
    };

    const handleZoomOut = () => {
      if (!viewport.value) return;
      const newZoom = Math.max((viewport.value.zoom || 1) - 0.1, props.content?.minZoom || 0.1);
      setViewport({ ...viewport.value, zoom: newZoom });
      setZoomPercentage(Math.round(newZoom * 100));
      
      emit('trigger-event', {
        name: 'zoom-changed',
        event: { zoom: newZoom, percentage: Math.round(newZoom * 100) }
      });
    };

    const handleFitView = () => {
      if (!nodes.value || nodes.value.length === 0) return;
      
      // Calculate bounding box of all nodes
      const positions = nodes.value.map(n => n.position);
      const minX = Math.min(...positions.map(p => p.x)) - 100;
      const maxX = Math.max(...positions.map(p => p.x)) + 100;
      const minY = Math.min(...positions.map(p => p.y)) - 100;
      const maxY = Math.max(...positions.map(p => p.y)) + 100;
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      if (canvasContainer.value) {
        const containerRect = canvasContainer.value.getBoundingClientRect();
        const scaleX = containerRect.width / width;
        const scaleY = containerRect.height / height;
        const scale = Math.min(scaleX, scaleY, 1) * 0.9;
        
        const centerX = (containerRect.width - width * scale) / 2 - minX * scale;
        const centerY = (containerRect.height - height * scale) / 2 - minY * scale;
        
        setViewport({ x: centerX, y: centerY, zoom: scale });
        setZoomPercentage(Math.round(scale * 100));
        
        emit('trigger-event', {
          name: 'fit-view',
          event: { zoom: scale }
        });
      }
    };

    const handleResetView = () => {
      setViewport({ x: 0, y: 0, zoom: 1 });
      setZoomPercentage(100);
      
      emit('trigger-event', {
        name: 'reset-view',
        event: {}
      });
    };

    // ========================================
    // LIFECYCLE
    // ========================================
    
    onMounted(() => {
      // Initialize zoom percentage
      setZoomPercentage(Math.round((viewport.value?.zoom || 1) * 100));
      
      // Add global mouse up listener for better drag handling
      document.addEventListener('mouseup', handleCanvasMouseUp);
    });

    onUnmounted(() => {
      document.removeEventListener('mouseup', handleCanvasMouseUp);
    });

    // ========================================
    // WATCHERS
    // ========================================
    
    // Watch for property changes that should trigger re-render
    watch(() => [
      props.content?.gridEnabled,
      props.content?.backgroundColor,
      props.content?.nodeBackgroundColor,
      props.content?.nodeBorderColor,
      props.content?.edgeColor,
      props.content?.edgePathType,
    ], () => {
      // Visual properties - handled by computed styles
    }, { deep: true });

    // ========================================
    // RETURN
    // ========================================
    
    return {
      // Refs
      canvasContainer,
      
      // Styles
      canvasStyle,
      gridStyle,
      viewportStyle,
      dropZoneStyle,
      
      // Data
      nodes,
      edges,
      viewport,
      selectedNodeId,
      selectedEdgeId,
      draggingConnection,
      draggingNodeId,
      mousePosition,
      gridSize,
      
      // Computed
      visibleEdges,
      getSelectedNodeLabel,
      connectionPreviewPath,
      
      // Methods
      getNodeStyle,
      getNodeHandles,
      getHandleStyle,
      getEdgePath,
      
      // Handlers
      handleCanvasMouseDown,
      handleCanvasMouseMove,
      handleCanvasMouseUp,
      handleWheel,
      handleNodeMouseDown,
      handleNodeClick,
      handleEdgeClick,
      handleHandleMouseDown,
      handleHandleMouseUp,
      
      // Canvas controls
      addNode,
      removeNode,
      deleteNode,
      updateNode,
      addEdge,
      removeEdge,
      handleZoomIn,
      handleZoomOut,
      handleFitView,
      handleResetView,
      
      /* wwEditor:start */
      isEditing,
      /* wwEditor:end */
    };
  },
};
</script>

<style lang="scss" scoped>
.ww-canvas-vueflow {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: var(--canvas-bg);
  overflow: hidden;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}

.canvas-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.canvas-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
  transition: transform 0.05s ease-out;
}

// ========================================
// EDGES
// ========================================

.edges-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
}

.edge-group {
  pointer-events: all;
  cursor: pointer;
}

.edge-path {
  transition: stroke 0.2s ease, stroke-width 0.2s ease;
}

.edge-hitbox {
  pointer-events: stroke;
}

.edge-preview {
  stroke-dasharray: 5, 5;
  opacity: 0.6;
  pointer-events: none;
}

.edge-selected .edge-path {
  stroke: var(--node-selected);
  stroke-width: 3;
}

// ========================================
// NODES
// ========================================

.canvas-node {
  position: absolute;
  min-width: 120px;
  min-height: 60px;
  background: var(--node-bg);
  border: 2px solid var(--node-border);
  border-radius: 8px;
  padding: 12px;
  cursor: move;
  z-index: 10;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.node-selected {
    border-color: var(--node-selected);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    z-index: 20;
  }

  &.node-dragging {
    opacity: 0.8;
    cursor: grabbing;
  }
}

.node-content {
  position: relative;
  z-index: 1;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.node-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-description {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.node-delete {
  background: transparent;
  border: none;
  color: #999;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(255, 0, 0, 0.1);
    color: #ff3b30;
  }
}

// ========================================
// HANDLES
// ========================================

.node-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  cursor: crosshair;
  z-index: 100;
  
  &.handle-source {
    cursor: crosshair;
  }
  
  &.handle-target {
    cursor: pointer;
  }
}

.handle-dot {
  width: 100%;
  height: 100%;
  background: var(--handle-bg);
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  .node-handle:hover & {
    transform: scale(1.3);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
}

// ========================================
// DROPZONE CONTROL
// ========================================

.dropzone-control {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--dropzone-bg);
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 600px;
}

.dropzone-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  white-space: nowrap;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #333;
  font-weight: 600;
}

.dropzone-container {
  flex: 1;
  min-width: 150px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d0d0d0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
  padding: 6px;
  transition: all 0.2s ease;
}

.dropzone-container:empty::after {
  content: 'Drop actions here';
  color: #999;
  font-size: 12px;
  font-style: italic;
  pointer-events: none;
}

/* wwEditor:start */
.dropzone-container:hover {
  border-color: #007aff;
  background: rgba(0, 122, 255, 0.05);
}
/* wwEditor:end */

.dropzone-container:not(:empty) {
  border-style: solid;
  border-color: transparent;
  background: transparent;
  justify-content: flex-start;
}

.dropzone-container:not(:empty)::after {
  display: none;
}

// ========================================
// CANVAS CONTROLS
// ========================================

.canvas-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    border-color: #007aff;
    color: #007aff;
  }

  &:active {
    transform: scale(0.95);
  }
}

// ========================================
// RESPONSIVE
// ========================================

@media (max-width: 768px) {
  .dropzone-control {
    flex-direction: column;
    align-items: stretch;
    max-width: 300px;
    right: 8px;
    bottom: 8px;
  }

  .dropzone-container {
    min-width: 100%;
  }

  .canvas-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

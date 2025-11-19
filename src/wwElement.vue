<template>
  <div 
    ref="canvasContainer"
    class="ww-canvas-vueflow" 
    :style="canvasStyle"
    @mousedown="handleCanvasMouseDown"
    @mousemove="handleCanvasMouseMove"
    @mouseup="handleCanvasMouseUp"
    @wheel="handleWheel"
    @dblclick="handleCanvasDoubleClick"
    @contextmenu="handleCanvasRightClick"
  >
    <!-- #region Background Grid -->
    <svg 
      v-if="content?.showGrid && content?.gridPattern !== 'none'"
      class="canvas-grid"
      :style="gridStyle"
    >
      <defs>
        <!-- Vignette Radial Gradient Mask -->
        <radialGradient 
          id="vignette-gradient" 
          cx="50%" 
          cy="50%" 
          :r="content?.vignetteSize !== undefined ? `${content.vignetteSize}%` : '70%'"
        >
          <stop offset="0%" stop-opacity="1" stop-color="white" />
          <stop 
            offset="70%" 
            :stop-opacity="content?.vignetteIntensity !== undefined ? (1 - (content.vignetteIntensity / 100) * 0.4) : 0.7" 
            stop-color="white" 
          />
          <stop 
            offset="90%" 
            :stop-opacity="content?.vignetteIntensity !== undefined ? (1 - (content.vignetteIntensity / 100) * 0.7) : 0.4" 
            stop-color="white" 
          />
          <stop 
            offset="100%" 
            :stop-opacity="content?.vignetteIntensity !== undefined ? (1 - (content.vignetteIntensity / 100) * 0.9) : 0.1" 
            stop-color="white" 
          />
        </radialGradient>

        <!-- Mask for applying vignette effect -->
        <mask id="vignette-mask">
          <rect width="100%" height="100%" fill="url(#vignette-gradient)" />
        </mask>

        <!-- Lines Pattern (Squared Grid) -->
        <pattern 
          v-if="content?.gridPattern === 'lines' || !content?.gridPattern"
          id="grid-pattern-lines" 
          :width="20" 
          :height="20" 
          patternUnits="userSpaceOnUse"
          :patternTransform="`translate(${(viewport?.x || 0) % 20}, ${(viewport?.y || 0) % 20}) scale(${viewport?.zoom || 1})`"
        >
          <path 
            :d="`M 20 0 L 0 0 0 20`" 
            fill="none" 
            :stroke="content?.gridColor || '#e0e0e0'" 
            stroke-width="0.5"
          />
        </pattern>

        <!-- Dots Pattern (Along Lines) -->
        <pattern 
          v-if="content?.gridPattern === 'dots'"
          id="grid-pattern-dots" 
          :width="20" 
          :height="20" 
          patternUnits="userSpaceOnUse"
          :patternTransform="`translate(${(viewport?.x || 0) % 20}, ${(viewport?.y || 0) % 20}) scale(${viewport?.zoom || 1})`"
        >
          <circle 
            v-for="(pos, idx) in dotPositions" 
            :key="idx"
            :cx="pos.x" 
            :cy="pos.y" 
            r="1" 
            :fill="content?.gridColor || '#e0e0e0'"
          />
        </pattern>

        <!-- Cross Pattern (Vertices Only) -->
        <pattern 
          v-if="content?.gridPattern === 'cross'"
          id="grid-pattern-cross" 
          :width="20" 
          :height="20" 
          patternUnits="userSpaceOnUse"
          :patternTransform="`translate(${(viewport?.x || 0) % 20}, ${(viewport?.y || 0) % 20}) scale(${viewport?.zoom || 1})`"
        >
          <circle 
            cx="0" 
            cy="0" 
            r="1.5" 
            :fill="content?.gridColor || '#e0e0e0'"
          />
        </pattern>
      </defs>
      <rect 
        width="100%" 
        height="100%" 
        :fill="gridPatternFill"
        :mask="content?.enableVignette !== false ? 'url(#vignette-mask)' : undefined"
      />
    </svg>
    <!-- #endregion -->

    <!-- #region Canvas Content -->
    <div 
      class="canvas-viewport"
      :style="viewportStyle"
    >
      <!-- #region Edges Layer -->
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

        <!-- Rendered Edges using wwEdge component -->
        <wwEdge
          v-for="edge in visibleEdges"
          :key="edge.id"
          :edge="edge"
          :source-node="getNodeById(edge.source)"
          :target-node="getNodeById(edge.target)"
          :is-selected="selectedEdgeId === edge.id"
          :is-dragging="isEdgeDragging(edge)"
          :path-type="content?.pathType || 'bezier'"
          :all-nodes="nodes"
          :config="edgeConfig"
          @edge-click="handleEdgeClick"
        />
      </svg>
      <!-- #endregion -->

      <!-- #region Nodes Layer -->
      <wwNode
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        :is-selected="selectedNodeIds?.includes(node.id)"
        :is-dragging="draggingNodeId === node.id"
        :is-hovered="hoveredNodeId === node.id"
        :viewport="viewport"
        :config="nodeConfig"
        :cursor-position="cursorCanvasPosition"
        :global-node-type="content?.globalNodeType || 'default'"
        :connection-dragging="draggingConnection !== null"
        :allow-resize="content?.allowNodeResize !== false"
        @node-mousedown="handleNodeMouseDown"
        @node-click="handleNodeClick"
        @node-mouseenter="handleNodeMouseEnter"
        @node-mouseleave="handleNodeMouseLeave"
        @handle-mousedown="handleHandleMouseDown"
        @handle-mouseup="handleHandleMouseUp"
        @delete-node="deleteNode"
        @update-node="handleNodeUpdate"
        @edit-media="handleEditMedia"
        @edit-url="handleEditUrl"
        @resize-node="handleNodeResize"
      />
      <!-- #endregion -->
    </div>
    <!-- #endregion -->

    <!-- #region Multi-Selection Box -->
    <div
      v-if="selectionBox"
      class="selection-box"
      :style="{
        left: `${selectionBox.left}px`,
        top: `${selectionBox.top}px`,
        width: `${selectionBox.width}px`,
        height: `${selectionBox.height}px`
      }"
    />
    <!-- #endregion -->

    <!-- #region Drop Zone Control -->
    <div 
      v-if="content?.actionsDropzoneEnabled"
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
        path="actionsDropzoneContent" 
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
          <i :class="ICONS.zoomIn" />
        </button>
        <button 
          class="control-btn"
          @click="handleZoomOut"
          title="Zoom Out"
        >
          <i :class="ICONS.zoomOut" />
        </button>
        <button 
          class="control-btn"
          @click="handleFitView"
          title="Fit View"
        >
          <i :class="ICONS.fitView" />
        </button>
        <button 
          class="control-btn"
          @click="handleResetView"
          title="Reset View"
        >
          <i :class="ICONS.reset" />
        </button>
      </div>
    </div>
    <!-- #endregion -->

    <!-- #region Selection Actions Menu -->
    <SelectionActionsMenu
      v-if="content?.selectionMenuEnabled"
      :selected-nodes="selectedNodesData"
      :selected-edges="selectedEdgesData"
      :default-node-actions="content?.defaultNodeActions || []"
      :default-edge-actions="content?.defaultEdgeActions || []"
      :node-type-actions="nodeTypeActionsMap"
      :mode="content?.selectionMenuMode || 'default'"
      :enabled="content?.selectionMenuEnabled !== false"
      :config="selectionMenuConfig"
      :action-button-dropzones="content?.actionButtonDropzones || {}"
      :canvas-rect="canvasRect"
      :viewport="viewport"
      :is-dragging="draggingNodeId !== null"
      @action-execute="handleActionExecute"
      @menu-opened="handleSelectionMenuOpened"
      @menu-closed="handleSelectionMenuClosed"
    />
    <!-- #endregion -->

    <!-- #region Canvas Toolbar -->
    <CanvasToolbar
      v-if="content?.toolbarEnabled"
      :enabled="content?.toolbarEnabled !== false"
      :position="content?.toolbarPosition || 'bottom-left'"
      :mode="content?.globalNodeType || 'default'"
      @add-node="handleToolbarAddNode"
    />
    <!-- #endregion -->

    <!-- #region Context Menu -->
    <ContextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      @add-node="handleContextMenuAddNode"
      @paste="() => {}"
      @close="handleContextMenuClose"
    />
    <!-- #endregion -->

    <!-- #region Modals -->
    <InputModal
      :visible="mediaModalVisible"
      title="Add Media"
      input-label="Media URL"
      placeholder="https://example.com/image.jpg"
      submit-label="Add Media"
      helper-text="Enter the URL of an image, video, or PDF"
      :initial-value="modalInitialValue"
      :initial-type="modalInitialType"
      :show-type-selector="true"
      @submit="handleMediaModalSubmit"
      @close="handleModalClose"
    />

    <InputModal
      :visible="urlModalVisible"
      title="Add Web Page"
      input-label="Web Page URL"
      placeholder="https://example.com"
      submit-label="Add URL"
      helper-text="Enter the URL of the web page to embed"
      :initial-value="modalInitialValue"
      :show-type-selector="false"
      @submit="handleUrlModalSubmit"
      @close="handleModalClose"
    />
    <!-- #endregion -->
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import wwNode from './components/wwNode.vue';
import wwEdge from './components/wwEdge.vue';
import SelectionActionsMenu from './components/SelectionActionsMenu.vue';
import CanvasToolbar from './components/CanvasToolbar.vue';
import ContextMenu from './components/ContextMenu.vue';
import InputModal from './components/InputModal.vue';
import { NODE_TYPES, createNodeData } from './utils/nodeTypes';
import { ICONS } from './utils/icons';

// CRITICAL: Import wwLayout for dropzone functionality
const wwLayout = window.wwLib?.wwLayout;

//#region Helper Functions
/**
 * Generate a UUID for nodes and edges
 */
const generateUUID = () => {
  return crypto.randomUUID();
};
//#endregion

export default {
  components: {
    wwNode,
    wwEdge,
    SelectionActionsMenu,
    CanvasToolbar,
    ContextMenu,
    InputModal,
    wwLayout, // CRITICAL: Register wwLayout component for dropzone
  },
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
    //#region DOM References
    const canvasContainer = ref(null);
    //#endregion

    //#region Internal Variables
    
    // UNIFIED CANVAS STATE - Single object containing all canvas data
    const { value: canvasState, setValue: setCanvasState } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'canvas',
      type: 'object',
      defaultValue: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        selectedNodeIds: [],
        selectedEdgeId: null,
        zoomPercentage: 100,
        draggingConnection: null
      },
    });
    //#endregion

    //#region Local State
    const draggingNodeId = ref(null);
    const dragOffset = ref({ x: 0, y: 0 });
    const isPanning = ref(false);
    const panStart = ref({ x: 0, y: 0 });
    const mousePosition = ref({ x: 0, y: 0 });
    const cursorCanvasPosition = ref({ x: 0, y: 0 }); // For handle proximity detection
    const hoveredNodeId = ref(null);
    const nodeSpacing = { horizontal: 250, vertical: 150 }; // Spacing for tree layout
    
    // Multi-selection state
    const isSelecting = ref(false);
    const selectionStart = ref({ x: 0, y: 0 });
    const selectionEnd = ref({ x: 0, y: 0 });

    // Context menu state
    const contextMenuVisible = ref(false);
    const contextMenuPosition = ref({ x: 0, y: 0 });

    // Modal state
    const mediaModalVisible = ref(false);
    const urlModalVisible = ref(false);
    const editingNodeId = ref(null);
    const modalInitialValue = ref('');
    const modalInitialType = ref('image');

    /* wwEditor:start */
    const isEditing = computed(() => props.wwEditorState?.isEditing);
    /* wwEditor:end */
    //#endregion

    //#region Initialization
    // Helper functions for unified state updates
    const updateCanvasState = (updates) => {
      setCanvasState({ ...canvasState.value, ...updates });
    };

    const nodes = computed(() => canvasState.value?.nodes || []);
    const edges = computed(() => canvasState.value?.edges || []);
    const viewport = computed(() => canvasState.value?.viewport || { x: 0, y: 0, zoom: 1 });
    const selectedNodeIds = computed(() => canvasState.value?.selectedNodeIds || []);
    const selectedEdgeId = computed(() => canvasState.value?.selectedEdgeId || null);
    const draggingConnection = computed(() => canvasState.value?.draggingConnection || null);
    const zoomPercentage = computed(() => canvasState.value?.zoomPercentage || 100);
    
    // Backward compatible: first selected node for single-selection UX
    const selectedNodeId = computed(() => selectedNodeIds.value?.[0] || null);

    // Calculate hierarchical levels for tree layout
    const calculateTreeLayout = (nodesList, edgesList) => {
      if (!nodesList?.length) return nodesList;
      
      const direction = props.content?.treeLayoutDirection || 'vertical';
      const isHorizontal = direction === 'horizontal';
      
      // Find root nodes (nodes with no incoming edges)
      const targetNodeIds = new Set(edgesList?.map(e => e.target) || []);
      const rootNodes = nodesList.filter(n => !targetNodeIds.has(n.id));
      
      if (rootNodes.length === 0) {
        // No clear roots, use first node
        rootNodes.push(nodesList[0]);
      }
      
      // Build adjacency list
      const children = {};
      edgesList?.forEach(edge => {
        if (!children[edge.source]) children[edge.source] = [];
        children[edge.source].push(edge.target);
      });
      
      // Calculate levels using BFS
      const levels = {};
      const queue = rootNodes.map(n => ({ id: n.id, level: 0 }));
      const visited = new Set();
      
      while (queue.length > 0) {
        const { id, level } = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        
        levels[id] = level;
        
        const childNodes = children[id] || [];
        childNodes.forEach(childId => {
          if (!visited.has(childId)) {
            queue.push({ id: childId, level: level + 1 });
          }
        });
      }
      
      // Group nodes by level
      const nodesByLevel = {};
      nodesList.forEach(node => {
        const level = levels[node.id] ?? 0;
        if (!nodesByLevel[level]) nodesByLevel[level] = [];
        nodesByLevel[level].push(node);
      });
      
      // Position nodes based on direction
      const positionedNodes = [];
      Object.keys(nodesByLevel).sort((a, b) => Number(a) - Number(b)).forEach(level => {
        const nodesAtLevel = nodesByLevel[level];
        const levelNum = Number(level);
        
        if (isHorizontal) {
          // Horizontal: Left to Right
          const totalHeight = nodesAtLevel.length * nodeSpacing.vertical;
          const startY = -totalHeight / 2 + nodeSpacing.vertical / 2;
          
          nodesAtLevel.forEach((node, index) => {
            positionedNodes.push({
              ...node,
              position: {
                x: levelNum * nodeSpacing.horizontal + 100,
                y: startY + (index * nodeSpacing.vertical)
              },
              data: {
                ...node.data,
                level: levelNum
              }
            });
          });
        } else {
          // Vertical: Top to Bottom
          const totalWidth = nodesAtLevel.length * nodeSpacing.horizontal;
          const startX = -totalWidth / 2 + nodeSpacing.horizontal / 2;
          
          nodesAtLevel.forEach((node, index) => {
            positionedNodes.push({
              ...node,
              position: {
                x: startX + (index * nodeSpacing.horizontal),
                y: levelNum * nodeSpacing.vertical + 100
              },
              data: {
                ...node.data,
                level: levelNum
              }
            });
          });
        }
      });
      
      return positionedNodes;
    };

    // Transform and initialize nodes from props
    watch(() => props.content?.initialNodes, (newNodes) => {
      if (newNodes && Array.isArray(newNodes) && newNodes.length > 0) {
        // Transform flattened structure to VueFlow format with UUID generation
        let transformedNodes = newNodes.map(node => ({
          id: generateUUID(), // Always generate new UUID on initialization
          type: node?.type || 'default',
          position: {
            x: node?.positionX ?? node?.position?.x ?? 100,
            y: node?.positionY ?? node?.position?.y ?? 100
          },
          data: {
            label: node?.label ?? node?.data?.label ?? 'Node',
            description: node?.description ?? node?.data?.description ?? '',
            level: node?.data?.level ?? 0
          }
        }));
        
        // Apply tree layout if enabled
        if (props.content?.gridLayout === 'tree') {
          transformedNodes = calculateTreeLayout(transformedNodes, canvasState.value?.edges || []);
        }
        
        updateCanvasState({ nodes: transformedNodes });
      }
    }, { immediate: true });

    // Initialize edges from props
    watch(() => props.content?.initialEdges, (newEdges) => {
      if (newEdges && Array.isArray(newEdges) && newEdges.length > 0) {
        // Generate new UUIDs for all edges on initialization
        const transformedEdges = newEdges.map(edge => ({
          ...edge,
          id: generateUUID()
        }));
        updateCanvasState({ edges: transformedEdges });
        
        // Recalculate tree layout when edges change
        if (props.content?.gridLayout === 'tree' && canvasState.value?.nodes?.length) {
          const repositionedNodes = calculateTreeLayout(canvasState.value.nodes, transformedEdges);
          updateCanvasState({ nodes: repositionedNodes });
        }
      }
    }, { immediate: true });
    
    // Watch for layout mode changes
    watch(() => props.content?.gridLayout, (newLayout) => {
      if (newLayout === 'tree' && canvasState.value?.nodes?.length) {
        const repositionedNodes = calculateTreeLayout(
          canvasState.value.nodes,
          canvasState.value.edges || []
        );
        updateCanvasState({ nodes: repositionedNodes });
      }
    });
    //#endregion

    //#region Computed Styles
    const canvasStyle = computed(() => ({
      '--canvas-bg': props.content?.backgroundColor || '#ffffff',
      '--node-bg': props.content?.nodeBackgroundColor || '#f9f9f9',
      '--node-border': props.content?.nodeBorderColor || '#d0d0d0',
      '--node-selected-border': props.content?.selectedNodeBorderColor || '#007aff',
      '--handle-bg': props.content?.handleColor || '#007aff',
      '--handle-border': props.content?.handleBorderColor || '#ffffff',
      '--handle-selected': props.content?.selectedHandleColor || '#0066ff',
      '--edge-color': props.content?.edgeColor || '#999999',
      '--edge-selected': props.content?.selectedEdgeColor || '#007aff',
      '--node-dropzone-bg': props.content?.nodeDropzoneBackgroundColor || 'transparent',
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
      '--dropzone-height': props.content?.actionsDropzoneHeight || '80px',
      '--dropzone-bg': props.content?.actionsDropzoneBackground || '#f5f5f5',
    }));
    //#endregion

    //#region Computed Properties
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

    // Grid pattern fill URL
    const gridPatternFill = computed(() => {
      const pattern = props.content?.gridPattern || 'lines';
      if (pattern === 'none') return 'transparent';
      return `url(#grid-pattern-${pattern})`;
    });

    // Dot positions for dots pattern
    const dotPositions = computed(() => {
      const size = 20; // Use small grid for visual pattern
      const positions = [];
      // Create dots along the grid lines
      for (let i = 0; i <= size; i += 4) {
        positions.push({ x: i, y: 0 }); // Top edge
        positions.push({ x: 0, y: i }); // Left edge
      }
      return positions;
    });
    
    // Selection box coordinates (for multi-select)
    const selectionBox = computed(() => {
      if (!isSelecting.value) return null;
      
      const x1 = Math.min(selectionStart.value.x, selectionEnd.value.x);
      const y1 = Math.min(selectionStart.value.y, selectionEnd.value.y);
      const x2 = Math.max(selectionStart.value.x, selectionEnd.value.x);
      const y2 = Math.max(selectionStart.value.y, selectionEnd.value.y);
      
      return {
        left: x1,
        top: y1,
        width: x2 - x1,
        height: y2 - y1
      };
    });

    // Config objects for child components
    const nodeConfig = computed(() => ({
      connectableNodes: props.content?.connectableNodes,
      deletableNodes: props.content?.deletableNodes,
      nodeBackgroundColor: props.content?.nodeBackgroundColor,
      nodeBorderColor: props.content?.nodeBorderColor,
      selectedNodeBorderColor: props.content?.selectedNodeBorderColor,
      handleColor: props.content?.handleColor,
      handleBorderColor: props.content?.handleBorderColor,
      selectedHandleColor: props.content?.selectedHandleColor,
      nodeDropzoneBackgroundColor: props.content?.nodeDropzoneBackgroundColor,
      handleProximityRadius: props.content?.handleProximityRadius,
      globalNodeType: props.content?.globalNodeType,
    }));

    const edgeConfig = computed(() => ({
      edgeColor: props.content?.edgeColor,
      selectedEdgeColor: props.content?.selectedEdgeColor,
    }));

    const selectionMenuConfig = computed(() => ({
      selectionMenuBackground: props.content?.selectionMenuBackground,
      selectionMenuBorderColor: props.content?.selectionMenuBorderColor,
      selectionMenuOffset: props.content?.selectionMenuOffset,
    }));

    /**
     * Get canvas bounding rect for menu positioning
     */
    const canvasRect = computed(() => {
      return canvasContainer.value?.getBoundingClientRect() || null;
    });

    /**
     * Get data for selected nodes
     */
    const selectedNodesData = computed(() => {
      return nodes.value?.filter(n => selectedNodeIds.value?.includes(n.id)) || [];
    });

    /**
     * Get data for selected edges
     */
    const selectedEdgesData = computed(() => {
      const edgeId = selectedEdgeId.value;
      if (!edgeId) return [];
      const edge = edges.value?.find(e => e.id === edgeId);
      return edge ? [edge] : [];
    });

    /**
     * Node type actions map (inherited + specific)
     */
    const nodeTypeActionsMap = computed(() => {
      // For now, return empty map - user can extend this
      // Each node type would inherit from defaultNodeActions and add its own
      return {};
    });
    //#endregion

    //#region Helper Methods for Components
    /**
     * Get node by ID (used by wwEdge component)
     */
    const getNodeById = (nodeId) => {
      return nodes.value?.find(n => n.id === nodeId) || null;
    };

    /**
     * Check if edge is being dragged (connected nodes are dragging)
     */
    const isEdgeDragging = (edge) => {
      return draggingNodeId.value === edge.source || draggingNodeId.value === edge.target;
    };

    /**
     * Get handle position on a node (for connection preview)
     */
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

    /**
     * Create a Bezier curve path (for connection preview)
     */
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
    //#endregion

    //#region Interaction Handlers
    const handleCanvasMouseDown = (event) => {
      // Middle-click (button 1) for panning
      if (event.button === 1 && props.content?.enablePan !== false) {
        event.preventDefault();
        isPanning.value = true;
        panStart.value = {
          x: event.clientX - (viewport.value?.x || 0),
          y: event.clientY - (viewport.value?.y || 0),
        };
        return;
      }
      
      // Left-click (button 0) on canvas background for multi-select
      if (event.button === 0 && (event.target === canvasContainer.value || event.target.closest('.canvas-grid') || event.target.closest('.canvas-viewport'))) {
        isSelecting.value = true;
        
        if (canvasContainer.value && viewport.value) {
          const rect = canvasContainer.value.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          
          selectionStart.value = { x, y };
          selectionEnd.value = { x, y };
        }
        
        // Deselect when clicking canvas (if not holding Ctrl/Cmd)
        if (!event.ctrlKey && !event.metaKey) {
          updateCanvasState({ selectedNodeIds: [], selectedEdgeId: null });
        }
      }
    };

    const handleCanvasMouseMove = (event) => {
      // Update mouse position for connection preview
      if (canvasContainer.value && viewport.value) {
        const rect = canvasContainer.value.getBoundingClientRect();
        const x = (event.clientX - rect.left - (viewport.value.x || 0)) / (viewport.value.zoom || 1);
        const y = (event.clientY - rect.top - (viewport.value.y || 0)) / (viewport.value.zoom || 1);
        mousePosition.value = { x, y };
        
        // Also update cursor position in canvas coordinates for handle proximity detection
        cursorCanvasPosition.value = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      }
      
      // Handle panning (middle-click)
      if (isPanning.value && viewport.value) {
        const newX = event.clientX - panStart.value.x;
        const newY = event.clientY - panStart.value.y;
        updateCanvasState({ 
          viewport: { ...viewport.value, x: newX, y: newY }
        });
      }
      
      // Handle multi-selection box
      if (isSelecting.value && canvasContainer.value) {
        const rect = canvasContainer.value.getBoundingClientRect();
        selectionEnd.value = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
        
        // Calculate nodes within selection box
        if (selectionBox.value && viewport.value) {
          const box = selectionBox.value;
          const selectedIds = nodes.value?.filter(node => {
            const nodeScreenX = node.position.x * viewport.value.zoom + viewport.value.x;
            const nodeScreenY = node.position.y * viewport.value.zoom + viewport.value.y;
            
            return nodeScreenX >= box.left && 
                   nodeScreenX <= box.left + box.width &&
                   nodeScreenY >= box.top && 
                   nodeScreenY <= box.top + box.height;
          }).map(n => n.id) || [];
          
          updateCanvasState({ selectedNodeIds: selectedIds });
        }
      }
      
      // Handle node dragging
      if (draggingNodeId.value) {
        const node = nodes.value?.find(n => n.id === draggingNodeId.value);
        if (node) {
          let newX = mousePosition.value.x;
          let newY = mousePosition.value.y;
          
          // Tree layout: constrain based on direction
          if (props.content?.gridLayout === 'tree') {
            const direction = props.content?.treeLayoutDirection || 'vertical';
            const level = node.data?.level ?? 0;
            
            if (direction === 'horizontal') {
              // Horizontal: Lock X to level, snap Y to grid
              newX = level * nodeSpacing.horizontal + 100;
              newY = Math.round(newY / nodeSpacing.vertical) * nodeSpacing.vertical;
            } else {
              // Vertical: Lock Y to level, snap X to grid
              newY = level * nodeSpacing.vertical + 100;
              newX = Math.round(newX / nodeSpacing.horizontal) * nodeSpacing.horizontal;
            }
          } else if (props.content?.snapToGrid) {
            // Free layout: snap to grid if enabled
            newX = Math.round(newX / 20) * 20;
            newY = Math.round(newY / 20) * 20;
          }
          
          updateNodePosition(draggingNodeId.value, newX, newY);
        }
      }
    };

    const handleCanvasMouseUp = () => {
      if (isPanning.value) {
        isPanning.value = false;
      }
      
      if (isSelecting.value) {
        isSelecting.value = false;
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
        updateCanvasState({ draggingConnection: null });
      }
    };

    const handleWheel = (event) => {
      if (props.content?.enableZoom === false || !viewport.value) return;
      
      event.preventDefault();
      
      const delta = -event.deltaY * 0.001;
      const newZoom = Math.min(
        Math.max((viewport.value.zoom || 1) + delta, props.content?.minZoom || 0.1),
        props.content?.maxZoom || 2
      );
      
      updateCanvasState({ 
        viewport: { ...viewport.value, zoom: newZoom },
        zoomPercentage: Math.round(newZoom * 100)
      });
      
      emit('trigger-event', {
        name: 'zoom-changed',
        event: { zoom: newZoom, percentage: Math.round(newZoom * 100) }
      });
    };

    const handleCanvasDoubleClick = (event) => {
      if (!canvasContainer.value || !viewport.value) return;

      // Get click position in canvas coordinates
      const rect = canvasContainer.value.getBoundingClientRect();
      const x = (event.clientX - rect.left - (viewport.value.x || 0)) / (viewport.value.zoom || 1);
      const y = (event.clientY - rect.top - (viewport.value.y || 0)) / (viewport.value.zoom || 1);

      const nodeType = props.content?.doubleClickNodeType || NODE_TYPES.DEFAULT;
      const newNode = {
        type: nodeType,
        position: { x, y },
        data: createNodeData(nodeType),
      };

      addNode(newNode);

      emit('trigger-event', {
        name: 'double-click-canvas',
        event: { position: { x, y }, node: newNode }
      });
    };

    const handleCanvasRightClick = (event) => {
      if (!props.content?.contextMenuEnabled) return;

      event.preventDefault();
      event.stopPropagation();

      if (canvasContainer.value) {
        const rect = canvasContainer.value.getBoundingClientRect();
        contextMenuPosition.value = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        contextMenuVisible.value = true;

        emit('trigger-event', {
          name: 'context-menu-opened',
          event: { position: contextMenuPosition.value }
        });
      }
    };

    const handleContextMenuClose = () => {
      contextMenuVisible.value = false;
    };

    const handleToolbarAddNode = ({ type }) => {
      // Add node at center of viewport
      const centerX = (-viewport.value.x + (canvasContainer.value?.clientWidth || 800) / 2) / viewport.value.zoom;
      const centerY = (-viewport.value.y + (canvasContainer.value?.clientHeight || 600) / 2) / viewport.value.zoom;

      const newNode = {
        type,
        position: { x: centerX, y: centerY },
        data: createNodeData(type),
      };

      addNode(newNode);
    };

    const handleContextMenuAddNode = ({ type }) => {
      // Add node at context menu position
      const x = (contextMenuPosition.value.x - (viewport.value.x || 0)) / (viewport.value.zoom || 1);
      const y = (contextMenuPosition.value.y - (viewport.value.y || 0)) / (viewport.value.zoom || 1);

      const newNode = {
        type,
        position: { x, y },
        data: createNodeData(type),
      };

      addNode(newNode);
    };

    const handleNodeUpdate = ({ nodeId, data }) => {
      updateNode(nodeId, data);

      // Emit content-edited event for text nodes
      if (data.richTextContent !== undefined) {
        emit('trigger-event', {
          name: 'node-content-edited',
          event: {
            nodeId,
            content: data.richTextContent,
            node: nodes.value?.find(n => n.id === nodeId)
          }
        });
      }
    };

    const handleNodeResize = ({ nodeId, width, height }) => {
      updateNode(nodeId, { width, height });

      emit('trigger-event', {
        name: 'node-resized',
        event: {
          nodeId,
          width,
          height,
          node: nodes.value?.find(n => n.id === nodeId)
        }
      });
    };

    const handleEditMedia = ({ nodeId, currentUrl, currentType }) => {
      editingNodeId.value = nodeId;
      modalInitialValue.value = currentUrl || '';
      modalInitialType.value = currentType || 'image';
      mediaModalVisible.value = true;
    };

    const handleEditUrl = ({ nodeId, currentUrl }) => {
      editingNodeId.value = nodeId;
      modalInitialValue.value = currentUrl || '';
      urlModalVisible.value = true;
    };

    const handleMediaModalSubmit = ({ url, type }) => {
      if (editingNodeId.value) {
        updateNode(editingNodeId.value, {
          mediaUrl: url,
          mediaType: type,
        });

        emit('trigger-event', {
          name: 'media-changed',
          event: {
            nodeId: editingNodeId.value,
            mediaUrl: url,
            mediaType: type,
            node: nodes.value?.find(n => n.id === editingNodeId.value)
          }
        });
      }

      mediaModalVisible.value = false;
      editingNodeId.value = null;
    };

    const handleUrlModalSubmit = ({ url }) => {
      if (editingNodeId.value) {
        updateNode(editingNodeId.value, {
          webUrl: url,
        });

        emit('trigger-event', {
          name: 'url-changed',
          event: {
            nodeId: editingNodeId.value,
            url,
            node: nodes.value?.find(n => n.id === editingNodeId.value)
          }
        });
      }

      urlModalVisible.value = false;
      editingNodeId.value = null;
    };

    const handleModalClose = () => {
      mediaModalVisible.value = false;
      urlModalVisible.value = false;
      editingNodeId.value = null;
    };

    const handleNodeMouseDown = (payload) => {
      const { event, nodeId } = payload;
      event.stopPropagation();
      draggingNodeId.value = nodeId;
      const node = nodes.value?.find(n => n.id === nodeId);
      if (node) {
        dragOffset.value = {
          x: mousePosition.value.x - node.position.x,
          y: mousePosition.value.y - node.position.y,
        };
      }
    };

    const handleNodeClick = (payload) => {
      const { event, nodeId } = payload;
      event.stopPropagation();
      
      // Multi-select with Ctrl/Cmd
      if (event.ctrlKey || event.metaKey) {
        const currentSelected = selectedNodeIds.value || [];
        const newSelected = currentSelected.includes(nodeId)
          ? currentSelected.filter(id => id !== nodeId)
          : [...currentSelected, nodeId];
        updateCanvasState({ selectedNodeIds: newSelected, selectedEdgeId: null });
      } else {
        // Single select
        updateCanvasState({ selectedNodeIds: [nodeId], selectedEdgeId: null });
      }
      
      emit('trigger-event', {
        name: 'node-selected',
        event: { nodeId, node: nodes.value?.find(n => n.id === nodeId), selectedNodeIds: selectedNodeIds.value }
      });
    };

    const handleNodeMouseEnter = (nodeId) => {
      hoveredNodeId.value = nodeId;
    };

    const handleNodeMouseLeave = (nodeId) => {
      hoveredNodeId.value = null;
    };

    const handleEdgeClick = (edgeId) => {
      updateCanvasState({ selectedEdgeId: edgeId, selectedNodeIds: [] });
      
      emit('trigger-event', {
        name: 'edge-selected',
        event: { edgeId, edge: edges.value?.find(e => e.id === edgeId) }
      });
    };

    const handleHandleMouseDown = (payload) => {
      const { event, nodeId, handle } = payload;
      if (handle.type === 'source') {
        event.stopPropagation();
        updateCanvasState({
          draggingConnection: {
            sourceNodeId: nodeId,
            handle: handle,
            sourceHandle: handle.id,
          }
        });
      }
    };

    const handleHandleMouseUp = (payload) => {
      const { event, nodeId, handle } = payload;
      if (draggingConnection.value && handle.type === 'target') {
        event.stopPropagation();
        
        // Create new edge
        const newEdge = {
          id: generateUUID(),
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
        
        updateCanvasState({ draggingConnection: null });
      }
    };
    //#endregion

    //#region Selection Menu Handlers
    /**
     * Handle action execution from selection menu
     */
    const handleActionExecute = ({ action, items, allSelected }) => {
      const behaviorMode = props.content?.actionBehaviorMode || 'both';
      
      // Execute built-in behavior if enabled
      if (behaviorMode === 'builtin' || behaviorMode === 'both') {
        executeBuiltInAction(action, items);
      }
      
      // Emit trigger event if enabled
      if (behaviorMode === 'trigger' || behaviorMode === 'both') {
        emit('trigger-event', {
          name: 'action-executed',
          event: {
            actionId: action.id,
            action,
            items,
            allSelected,
          }
        });
      }
    };

    /**
     * Execute built-in action behaviors
     */
    const executeBuiltInAction = (action, items) => {
      switch (action.id) {
        case 'delete':
          items.forEach(item => {
            if (item.type === 'node') {
              removeNode(item.id);
            } else if (item.type === 'edge') {
              removeEdge(item.id);
            }
          });
          break;
        
        case 'duplicate':
          items.forEach(item => {
            if (item.type === 'node') {
              const node = item.data;
              const newNode = {
                ...node,
                id: generateUUID(),
                position: {
                  x: (node?.position?.x || 0) + 50,
                  y: (node?.position?.y || 0) + 50,
                },
                data: {
                  ...node.data,
                  label: `${node?.data?.label || 'Node'} (Copy)`,
                },
              };
              addNode(newNode);
            }
          });
          break;
        
        case 'lock':
          // Future: Add locked state to nodes
          console.log('Lock action:', items);
          break;
        
        case 'unlock':
          // Future: Remove locked state from nodes
          console.log('Unlock action:', items);
          break;
        
        case 'color':
          // User should handle this via trigger event
          break;
        
        case 'path-type':
          // User should handle this via trigger event or UI
          break;
        
        default:
          // Custom actions handled by user via trigger events
          break;
      }
    };

    const handleSelectionMenuOpened = ({ selectedItems }) => {
      emit('trigger-event', {
        name: 'selection-menu-opened',
        event: { selectedItems }
      });
    };

    const handleSelectionMenuClosed = () => {
      emit('trigger-event', {
        name: 'selection-menu-closed',
        event: {}
      });
    };
    //#endregion

    //#region Canvas Control Methods
    const addNode = (nodeData) => {
      let newNode = {
        id: generateUUID(),
        type: nodeData?.type || 'default',
        position: nodeData?.position || { x: 100, y: 100 },
        data: nodeData?.data || { label: 'New Node' },
      };
      
      // Apply tree layout positioning if enabled
      if (props.content?.gridLayout === 'tree') {
        const updatedNodes = [...(nodes.value || []), newNode];
        const repositioned = calculateTreeLayout(updatedNodes, edges.value || []);
        newNode = repositioned[repositioned.length - 1]; // Get the repositioned new node
        updateCanvasState({ nodes: repositioned });
      } else {
        updateCanvasState({ nodes: [...(nodes.value || []), newNode] });
      }
      
      emit('trigger-event', {
        name: 'node-added',
        event: { node: newNode }
      });
    };

    const removeNode = (nodeId) => {
      // Remove node
      const updatedNodes = (nodes.value || []).filter(n => n.id !== nodeId);
      
      // Remove connected edges
      const updatedEdges = (edges.value || []).filter(e => 
        e.source !== nodeId && e.target !== nodeId
      );
      
      // Clear selection if deleted
      const updatedSelectedIds = (selectedNodeIds.value || []).filter(id => id !== nodeId);
      
      updateCanvasState({ 
        nodes: updatedNodes, 
        edges: updatedEdges,
        selectedNodeIds: updatedSelectedIds
      });
      
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
        updateCanvasState({ nodes: updatedNodes });
        
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
        updateCanvasState({ nodes: updatedNodes });
      }
    };

    const addEdge = (edgeData) => {
      const newEdge = {
        id: generateUUID(),
        source: edgeData.source,
        target: edgeData.target,
        sourceHandle: edgeData?.sourceHandle,
        targetHandle: edgeData?.targetHandle,
      };
      
      const updatedEdges = [...(edges.value || []), newEdge];
      updateCanvasState({ edges: updatedEdges });
      
      // Recalculate tree layout when edge is added
      if (props.content?.gridLayout === 'tree' && nodes.value?.length) {
        const repositionedNodes = calculateTreeLayout(nodes.value, updatedEdges);
        updateCanvasState({ nodes: repositionedNodes });
      }
      
      emit('trigger-event', {
        name: 'edge-added',
        event: { edge: newEdge }
      });
    };
    
    const removeEdge = (edgeId) => {
      const updatedEdges = (edges.value || []).filter(e => e.id !== edgeId);
      
      const updates = { edges: updatedEdges };
      if (selectedEdgeId.value === edgeId) {
        updates.selectedEdgeId = null;
      }
      
      updateCanvasState(updates);
      
      // Recalculate tree layout when edge is removed
      if (props.content?.gridLayout === 'tree' && nodes.value?.length) {
        const repositionedNodes = calculateTreeLayout(nodes.value, updatedEdges);
        updateCanvasState({ nodes: repositionedNodes });
      }
      
      emit('trigger-event', {
        name: 'edge-removed',
        event: { edgeId }
      });
    };

    const handleZoomIn = () => {
      if (!viewport.value) return;
      const newZoom = Math.min((viewport.value.zoom || 1) + 0.1, props.content?.maxZoom || 2);
      updateCanvasState({ 
        viewport: { ...viewport.value, zoom: newZoom },
        zoomPercentage: Math.round(newZoom * 100)
      });
      
      emit('trigger-event', {
        name: 'zoom-changed',
        event: { zoom: newZoom, percentage: Math.round(newZoom * 100) }
      });
    };

    const handleZoomOut = () => {
      if (!viewport.value) return;
      const newZoom = Math.max((viewport.value.zoom || 1) - 0.1, props.content?.minZoom || 0.1);
      updateCanvasState({ 
        viewport: { ...viewport.value, zoom: newZoom },
        zoomPercentage: Math.round(newZoom * 100)
      });
      
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
        
        updateCanvasState({ 
          viewport: { x: centerX, y: centerY, zoom: scale },
          zoomPercentage: Math.round(scale * 100)
        });
        
        emit('trigger-event', {
          name: 'fit-view',
          event: { zoom: scale }
        });
      }
    };

    const handleResetView = () => {
      updateCanvasState({ 
        viewport: { x: 0, y: 0, zoom: 1 },
        zoomPercentage: 100
      });
      
      emit('trigger-event', {
        name: 'reset-view',
        event: {}
      });
    };
    //#endregion

    //#region Lifecycle
    onMounted(() => {
      // Initialize zoom percentage
      updateCanvasState({ zoomPercentage: Math.round((viewport.value?.zoom || 1) * 100) });
      
      // Add global mouse up listener for better drag handling
      document.addEventListener('mouseup', handleCanvasMouseUp);
    });

    onUnmounted(() => {
      document.removeEventListener('mouseup', handleCanvasMouseUp);
    });
    //#endregion

    //#region Watchers
    // Note: Visual property changes are automatically handled by computed styles
    // No explicit watchers needed for reactive CSS variables
    //#endregion

    //#region Return
    return {
      // Refs
      canvasContainer,
      
      // Icons
      ICONS,
      
      // Styles
      canvasStyle,
      gridStyle,
      viewportStyle,
      dropZoneStyle,
      
      // Data - Exposed from unified canvas state
      canvasState,
      nodes,
      edges,
      viewport,
      selectedNodeIds,
      selectedNodeId,
      selectedEdgeId,
      draggingConnection,
      zoomPercentage,
      
      // Local state
      draggingNodeId,
      hoveredNodeId,
      mousePosition,
      cursorCanvasPosition,
      selectionBox,
      contextMenuVisible,
      contextMenuPosition,
      mediaModalVisible,
      urlModalVisible,
      editingNodeId,
      modalInitialValue,
      modalInitialType,
      
      // Computed
      visibleEdges,
      getSelectedNodeLabel,
      connectionPreviewPath,
      gridPatternFill,
      dotPositions,
      nodeConfig,
      edgeConfig,
      selectionMenuConfig,
      canvasRect,
      selectedNodesData,
      selectedEdgesData,
      nodeTypeActionsMap,
      
      // Helper methods for components
      getNodeById,
      isEdgeDragging,
      
      // Handlers
      handleCanvasMouseDown,
      handleCanvasMouseMove,
      handleCanvasMouseUp,
      handleWheel,
      handleCanvasDoubleClick,
      handleCanvasRightClick,
      handleContextMenuClose,
      handleToolbarAddNode,
      handleContextMenuAddNode,
      handleNodeUpdate,
      handleNodeResize,
      handleEditMedia,
      handleEditUrl,
      handleMediaModalSubmit,
      handleUrlModalSubmit,
      handleModalClose,
      handleNodeMouseDown,
      handleNodeClick,
      handleNodeMouseEnter,
      handleNodeMouseLeave,
      handleEdgeClick,
      handleHandleMouseDown,
      handleHandleMouseUp,
      handleActionExecute,
      handleSelectionMenuOpened,
      handleSelectionMenuClosed,
      
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
    //#endregion
  },
};
</script>

<style lang="scss" scoped>
//#region Base Container
.ww-canvas-vueflow {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: var(--canvas-bg);
  overflow: hidden;
  cursor: default;
  user-select: none;

  &:active {
    cursor: default;
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
//#endregion

//#region Edges
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

.edge-preview {
  stroke-dasharray: 5, 5;
  opacity: 0.6;
  pointer-events: none;
}
//#endregion

//#region Dropzone Control
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
//#endregion

//#region Canvas Controls
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
  font-size: 18px;
  color: #333;
  transition: all 0.2s ease;

  i {
    line-height: 1;
    transition: color 0.2s ease;
  }

  &:hover {
    background: #f0f0f0;
    border-color: #007aff;
    color: #007aff;
    
    i {
      color: #007aff;
    }
  }

  &:active {
    transform: scale(0.95);
  }
}
//#endregion

//#region Responsive
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
//#endregion

//#region Multi-Selection Box
.selection-box {
  position: absolute;
  border: 2px dashed #007aff;
  background: rgba(0, 122, 255, 0.1);
  pointer-events: none;
  z-index: 999;
}
//#endregion
</style>

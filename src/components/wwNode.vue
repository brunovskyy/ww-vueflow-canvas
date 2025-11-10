<template>
  <div
    :class="['canvas-node', { 
      'node-selected': isSelected,
      'node-dragging': isDragging,
      'node-hovered': isHovered
    }]"
    :style="nodeStyle"
    @mousedown.stop="handleMouseDown"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click.stop="handleClick"
  >
    <!-- Node Handles -->
    <wwHandle
      v-for="handle in nodeHandles"
      :key="handle.id"
      :handle="handle"
      :node-id="node?.id"
      :is-visible="handlesVisible"
      :config="config"
      @handle-mousedown="onHandleMouseDown"
      @handle-mouseup="onHandleMouseUp"
    />

    <!-- Node Content: Custom Dropzone or Default Card -->
    <div v-if="nodeDropzoneEnabled" class="node-dropzone-wrapper">
      <wwLayout 
        :path="`nodeDropzoneContent`" 
        direction="column"
        class="node-dropzone"
      />
    </div>
    <div v-else class="node-content">
      <div class="node-header">
        <span class="node-title">{{ nodeLabel }}</span>
        <button 
          v-if="config?.deletableNodes"
          class="node-delete"
          @click.stop="handleDelete"
        >
          ×
        </button>
      </div>
      <div v-if="nodeDescription" class="node-description">
        {{ nodeDescription }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import wwHandle from './wwHandle.vue';

export default {
  name: 'wwNode',
  components: {
    wwHandle,
  },
  props: {
    node: {
      type: Object,
      required: true,
      // Shape: { id, type, position: { x, y }, data: { label, description } }
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    isDragging: {
      type: Boolean,
      default: false,
    },
    isHovered: {
      type: Boolean,
      default: false,
    },
    viewport: {
      type: Object,
      default: () => ({ x: 0, y: 0, zoom: 1 }),
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    nodeDropzoneEnabled: {
      type: Boolean,
      default: false,
    },
    connectionDragging: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'node-mousedown',
    'node-click',
    'node-mouseenter',
    'node-mouseleave',
    'handle-mousedown',
    'handle-mouseup',
    'delete-node',
  ],
  setup(props, { emit }) {
    //#region Computed Properties
    const nodeStyle = computed(() => ({
      position: 'absolute',
      left: `${props.node?.position?.x || 0}px`,
      top: `${props.node?.position?.y || 0}px`,
      transform: 'translate(-50%, -50%)',
    }));

    const nodeLabel = computed(() => {
      return props.node?.data?.label || 
             props.node?.data?.title || 
             `Node ${props.node?.id || ''}`;
    });

    const nodeDescription = computed(() => {
      return props.node?.data?.description || '';
    });

    const nodeHandles = computed(() => {
      const connectable = props.config?.connectableNodes !== false;
      
      if (!connectable) return [];
      
      // Custom handles from node data
      if (props.node?.data?.handles && Array.isArray(props.node.data.handles)) {
        return props.node.data.handles;
      }
      
      // Default handles configuration
      return [
        { id: 'top', type: 'target', position: 'top' },
        { id: 'bottom', type: 'source', position: 'bottom' },
        { id: 'left', type: 'target', position: 'left' },
        { id: 'right', type: 'source', position: 'right' },
      ];
    });

    const handlesVisible = computed(() => {
      return props.isHovered || props.connectionDragging || props.isSelected;
    });
    //#endregion

    //#region Event Handlers
    const handleMouseDown = (event) => {
      emit('node-mousedown', {
        event,
        nodeId: props.node?.id,
      });
    };

    const handleClick = (event) => {
      emit('node-click', {
        event,
        nodeId: props.node?.id,
      });
    };

    const handleMouseEnter = () => {
      emit('node-mouseenter', props.node?.id);
    };

    const handleMouseLeave = () => {
      emit('node-mouseleave', props.node?.id);
    };

    const handleDelete = () => {
      emit('delete-node', props.node?.id);
    };

    const onHandleMouseDown = (payload) => {
      emit('handle-mousedown', payload);
    };

    const onHandleMouseUp = (payload) => {
      emit('handle-mouseup', payload);
    };
    //#endregion

    return {
      nodeStyle,
      nodeLabel,
      nodeDescription,
      nodeHandles,
      handlesVisible,
      handleMouseDown,
      handleClick,
      handleMouseEnter,
      handleMouseLeave,
      handleDelete,
      onHandleMouseDown,
      onHandleMouseUp,
    };
  },
};
</script>

<style lang="scss" scoped>
.canvas-node {
  position: absolute;
  min-width: 120px;
  min-height: 60px;
  background: var(--node-bg, #f9f9f9);
  border: 2px solid var(--node-border, #d0d0d0);
  border-radius: 8px;
  padding: 12px;
  cursor: move;
  z-index: 10;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.node-selected {
    border-color: var(--node-selected-border, #007aff);
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

.node-dropzone-wrapper {
  position: relative;
  z-index: 1;
  min-width: 100px;
  min-height: 40px;
}

.node-dropzone {
  background: var(--node-dropzone-bg, transparent);
  border-radius: 6px;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>

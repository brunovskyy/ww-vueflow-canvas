<template>
  <div
    :class="['node-handle', `handle-${handle?.position}`, `handle-${handle?.type}`, {
      'handle-visible': shouldShowHandle
    }]"
    :style="handleContainerStyle"
    @mousedown.stop="handleMouseDown"
    @mouseup.stop="handleMouseUp"
  >
    <div class="handle-dot" :style="handleDotStyle" />
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'wwHandle',
  props: {
    handle: {
      type: Object,
      required: true,
      // Shape: { id: string, type: 'source' | 'target', position: 'top' | 'bottom' | 'left' | 'right' }
    },
    nodeId: {
      type: String,
      required: true,
    },
    nodePosition: {
      type: Object,
      default: () => ({ x: 0, y: 0 }),
    },
    nodeSize: {
      type: Object,
      default: () => ({ width: 200, height: 100 }),
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    viewport: {
      type: Object,
      default: () => ({ x: 0, y: 0, zoom: 1 }),
    },
    cursorPosition: {
      type: Object,
      default: () => ({ x: 0, y: 0 }),
    },
  },
  emits: ['handle-mousedown', 'handle-mouseup'],
  setup(props, { emit }) {
    //#region Computed Styles
    const proximityRadius = computed(() => {
      const radius = props.config?.handleProximityRadius || '20px';
      // Parse the value to extract number (e.g., "20px" -> 20)
      const numericValue = parseInt(radius, 10);
      return isNaN(numericValue) ? 20 : numericValue;
    });

    /**
     * Calculate if cursor is within proximity radius of this handle
     */
    const isWithinProximity = computed(() => {
      if (!props.nodePosition || !props.viewport || !props.cursorPosition) return false;
      
      const radius = proximityRadius.value;
      const zoom = props.viewport.zoom || 1;
      const viewportX = props.viewport.x || 0;
      const viewportY = props.viewport.y || 0;
      
      // Calculate handle screen position
      const nodeScreenX = props.nodePosition.x * zoom + viewportX;
      const nodeScreenY = props.nodePosition.y * zoom + viewportY;
      
      // Parse node dimensions
      const nodeWidth = typeof props.nodeSize.width === 'string' 
        ? parseFloat(props.nodeSize.width) 
        : props.nodeSize.width;
      const nodeHeight = typeof props.nodeSize.height === 'string'
        ? parseFloat(props.nodeSize.height)
        : props.nodeSize.height;
      
      // Handle offset from node center based on position (using actual node size)
      let handleOffsetX = 0;
      let handleOffsetY = 0;
      
      switch (props.handle?.position) {
        case 'top':
          handleOffsetY = -(nodeHeight / 2) * zoom;
          break;
        case 'bottom':
          handleOffsetY = (nodeHeight / 2) * zoom;
          break;
        case 'left':
          handleOffsetX = -(nodeWidth / 2) * zoom;
          break;
        case 'right':
          handleOffsetX = (nodeWidth / 2) * zoom;
          break;
      }
      
      const handleScreenX = nodeScreenX + handleOffsetX;
      const handleScreenY = nodeScreenY + handleOffsetY;
      
      // Calculate distance from cursor to handle
      const dx = props.cursorPosition.x - handleScreenX;
      const dy = props.cursorPosition.y - handleScreenY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance <= radius;
    });

    /**
     * Handle should be visible if:
     * - isVisible prop is true (legacy behavior for connection dragging/selection)
     * - OR cursor is within proximity radius (new proximity detection)
     */
    const shouldShowHandle = computed(() => {
      return props.isVisible || isWithinProximity.value;
    });

    const handleContainerStyle = computed(() => {
      const radius = proximityRadius.value;
      const positions = {
        top: { 
          top: '0', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: `${radius * 2}px`,
          height: `${radius * 2}px`
        },
        bottom: { 
          bottom: '0', 
          left: '50%', 
          transform: 'translate(-50%, 50%)',
          width: `${radius * 2}px`,
          height: `${radius * 2}px`
        },
        left: { 
          left: '0', 
          top: '50%', 
          transform: 'translate(-50%, -50%)',
          width: `${radius * 2}px`,
          height: `${radius * 2}px`
        },
        right: { 
          right: '0', 
          top: '50%', 
          transform: 'translate(50%, -50%)',
          width: `${radius * 2}px`,
          height: `${radius * 2}px`
        },
      };
      return positions[props.handle?.position] || positions.right;
    });

    const handleDotStyle = computed(() => ({
      width: '12px',
      height: '12px',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }));
    //#endregion

    //#region Event Handlers
    const handleMouseDown = (event) => {
      if (props.handle?.type === 'source') {
        emit('handle-mousedown', {
          event,
          nodeId: props.nodeId,
          handle: props.handle,
        });
      }
    };

    const handleMouseUp = (event) => {
      if (props.handle?.type === 'target') {
        emit('handle-mouseup', {
          event,
          nodeId: props.nodeId,
          handle: props.handle,
        });
      }
    };
    //#endregion

    return {
      shouldShowHandle,
      handleContainerStyle,
      handleDotStyle,
      handleMouseDown,
      handleMouseUp,
    };
  },
};
</script>

<style lang="scss" scoped>
.node-handle {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: crosshair;
  z-index: 100;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  
  &.handle-source {
    cursor: crosshair;
  }
  
  &.handle-target {
    cursor: pointer;
  }

  &.handle-visible {
    opacity: 1;
    pointer-events: all;
  }
}

.handle-dot {
  background: var(--handle-bg, #007aff);
  border: 2px solid var(--handle-border, #ffffff);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  .node-handle:hover & {
    transform: scale(1.3);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    background: var(--handle-selected, #0066ff);
  }
}
</style>

<template>
  <div
    :class="['node-handle', `handle-${handle?.position}`, `handle-${handle?.type}`, {
      'handle-visible': isVisible
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
    isVisible: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Object,
      default: () => ({}),
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

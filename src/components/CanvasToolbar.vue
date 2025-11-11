<template>
  <div 
    v-if="enabled" 
    :class="['canvas-toolbar', positionClass]"
    :style="toolbarStyle"
  >
    <button
      v-for="nodeType in nodeTypes"
      :key="nodeType.value"
      class="toolbar-btn"
      :title="`Add ${nodeType.label}`"
      @click="handleAddNode(nodeType.value)"
    >
      <span class="btn-icon">{{ nodeType.icon }}</span>
      <span class="btn-label">{{ nodeType.label }}</span>
    </button>
  </div>
</template>

<script>
import { computed } from 'vue';
import { getNodeTypeOptions } from '../utils/nodeTypes';

export default {
  name: 'CanvasToolbar',
  props: {
    enabled: {
      type: Boolean,
      default: true,
    },
    position: {
      type: String,
      default: 'top-left',
      // top-left | top-center | top-right | bottom-left | bottom-center | bottom-right
    },
  },
  emits: ['add-node'],
  setup(props, { emit }) {
    //#region Computed
    const nodeTypes = computed(() => {
      return getNodeTypeOptions();
    });

    const positionClass = computed(() => {
      return `toolbar-${props.position || 'top-left'}`;
    });

    const toolbarStyle = computed(() => ({
      // Additional dynamic styles if needed
    }));
    //#endregion

    //#region Methods
    const handleAddNode = (nodeType) => {
      emit('add-node', { type: nodeType });
    };
    //#endregion

    return {
      nodeTypes,
      positionClass,
      toolbarStyle,
      handleAddNode,
    };
  },
};
</script>

<style lang="scss" scoped>
.canvas-toolbar {
  position: absolute;
  display: flex;
  gap: 8px;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  // Position variants
  &.toolbar-top-left {
    top: 12px;
    left: 12px;
  }
  
  &.toolbar-top-center {
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  &.toolbar-top-right {
    top: 12px;
    right: 12px;
  }
  
  &.toolbar-bottom-left {
    bottom: 12px;
    left: 12px;
  }
  
  &.toolbar-bottom-center {
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  &.toolbar-bottom-right {
    bottom: 12px;
    right: 12px;
  }
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #f5f5f5;
    border-color: #007aff;
    color: #007aff;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
}

.btn-icon {
  font-size: 16px;
  line-height: 1;
}

.btn-label {
  font-size: 13px;
}

// Responsive: Stack vertically on small screens
@media (max-width: 768px) {
  .canvas-toolbar {
    flex-direction: column;
    gap: 6px;
    padding: 6px;
    
    &.toolbar-top-center,
    &.toolbar-bottom-center {
      left: 8px;
      transform: none;
    }
  }
  
  .toolbar-btn {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>

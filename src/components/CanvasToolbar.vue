<template>
  <div 
    v-if="enabled" 
    :class="['canvas-toolbar', positionClass, { 'toolbar-custom-mode': mode === 'custom' }]"
    :style="toolbarStyle"
  >
    <!-- Custom Mode: Single "+" Button -->
    <button
      v-if="mode === 'custom'"
      class="toolbar-btn toolbar-btn-add"
      title="Add Custom Node"
      @click="handleAddNode('custom')"
    >
      <i :class="addIcon" />
      <span class="btn-label">Add Node</span>
    </button>

    <!-- Default Mode: Multiple Node Type Buttons -->
    <template v-else>
      <button
        v-for="nodeType in nodeTypes"
        :key="nodeType.value"
        class="toolbar-btn"
        :title="`Add ${nodeType.label}`"
        @click="handleAddNode(nodeType.value)"
      >
        <i :class="nodeType.icon" />
        <span class="btn-label">{{ nodeType.label }}</span>
      </button>
    </template>
  </div>
</template>

<script>
import { computed } from 'vue';
import { getNodeTypeOptions } from '../utils/nodeTypes';
import { ICONS } from '../utils/icons';

export default {
  name: 'CanvasToolbar',
  props: {
    enabled: {
      type: Boolean,
      default: true,
    },
    position: {
      type: String,
      default: 'bottom-left',
      // top-left | top-center | top-right | bottom-left | bottom-center | bottom-right
    },
    mode: {
      type: String,
      default: 'default',
      // default | custom
    },
  },
  emits: ['add-node'],
  setup(props, { emit }) {
    //#region Computed
    const nodeTypes = computed(() => {
      // Only show non-custom types in default mode
      return getNodeTypeOptions().filter(type => type.value !== 'custom');
    });

    const positionClass = computed(() => {
      return `toolbar-${props.position || 'bottom-left'}`;
    });

    const addIcon = computed(() => {
      return ICONS.add;
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
      addIcon,
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
  
  &.toolbar-custom-mode {
    padding: 6px;
  }
  
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
    
    i {
      color: #007aff;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  i {
    font-size: 18px;
    line-height: 1;
    color: #333;
    transition: color 0.2s ease;
  }
}

.toolbar-btn-add {
  min-width: 120px;
  justify-content: center;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: white;
  border-color: #007aff;
  
  i {
    color: white;
  }
  
  &:hover {
    background: linear-gradient(135deg, #0066dd 0%, #0045b8 100%);
    border-color: #0066dd;
    color: white;
    
    i {
      color: white;
    }
  }
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
  
  .toolbar-btn-add {
    width: 100%;
  }
}
</style>

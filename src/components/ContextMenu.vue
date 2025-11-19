<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="menuStyle"
    @click.stop
  >
    <div
      v-for="nodeType in nodeTypes"
      :key="nodeType.value"
      class="menu-item"
      @click="handleAddNode(nodeType.value)"
    >
      <i :class="nodeType.icon" class="menu-icon" />
      <span class="menu-label">Add {{ nodeType.label }}</span>
    </div>
    
    <div class="menu-divider"></div>
    
    <div class="menu-item" @click="handlePaste">
      <i :class="pasteIcon" class="menu-icon" />
      <span class="menu-label">Paste</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { getNodeTypeOptions } from '../utils/nodeTypes';
import { ICONS } from '../utils/icons';

export default {
  name: 'ContextMenu',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0 }),
    },
  },
  emits: ['add-node', 'paste', 'close'],
  setup(props, { emit }) {
    //#region Constants
    const pasteIcon = ICONS.duplicate;
    //#endregion
    
    //#region Computed
    const nodeTypes = computed(() => {
      return getNodeTypeOptions();
    });

    const menuStyle = computed(() => ({
      left: `${props.position?.x || 0}px`,
      top: `${props.position?.y || 0}px`,
    }));
    //#endregion

    //#region Methods
    const handleAddNode = (nodeType) => {
      emit('add-node', { type: nodeType });
      emit('close');
    };

    const handlePaste = () => {
      emit('paste');
      emit('close');
    };

    const handleClickOutside = (event) => {
      if (props.visible) {
        emit('close');
      }
    };
    //#endregion

    //#region Lifecycle
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });
    //#endregion

    return {
      nodeTypes,
      menuStyle,
      pasteIcon,
      handleAddNode,
      handlePaste,
    };
  },
};
</script>

<style lang="scss" scoped>
.context-menu {
  position: absolute;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 180px;
  z-index: 10000;
  animation: menuFadeIn 0.15s ease;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  transition: all 0.15s ease;
  
  &:hover {
    background: #f5f5f5;
    color: #007aff;
  }
}

.menu-icon {
  font-size: 16px;
  line-height: 1;
  min-width: 20px;
  text-align: center;
}

.menu-label {
  flex: 1;
  white-space: nowrap;
}

.menu-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 8px;
}
</style>

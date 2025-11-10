<template>
  <div
    v-if="isVisible"
    class="selection-actions-menu"
    :style="menuStyle"
  >
    <!-- Default Mode: Built-in Action Buttons -->
    <template v-if="mode === 'default'">
      <button
        v-for="action in availableActions"
        :key="action.id"
        class="action-button"
        :title="action.label"
        @click="handleActionClick(action)"
        @mouseenter="hoveredAction = action"
        @mouseleave="hoveredAction = null"
      >
        <span class="action-icon">{{ getActionIcon(action.icon) }}</span>
        <span class="action-label">{{ action.label }}</span>
      </button>
    </template>

    <!-- Custom Mode: Dropzone for Each Action -->
    <template v-else-if="mode === 'custom'">
      <div
        v-for="action in availableActions"
        :key="action.id"
        class="action-dropzone-slot"
        @mouseenter="hoveredAction = action"
        @mouseleave="hoveredAction = null"
      >
        <wwLayout 
          :path="`actionButtonDropzones.${action.id}`" 
          direction="row"
          class="action-dropzone"
          @click="handleActionClick(action)"
        />
        <div v-if="!hasCustomButton(action.id)" class="action-placeholder">
          {{ action.label }}
        </div>
      </div>
    </template>

    <!-- Hover Tooltip: Item Applicability List -->
    <div
      v-if="hoveredAction && showTooltip"
      class="action-tooltip"
      :style="tooltipStyle"
    >
      <div class="tooltip-header">{{ hoveredAction.label }}</div>
      <div class="tooltip-items">
        <div
          v-for="item in selectedItemsList"
          :key="item.id"
          class="tooltip-item"
        >
          <span :class="['tooltip-icon', { 'applicable': isActionApplicableToItem(hoveredAction, item) }]">
            {{ isActionApplicableToItem(hoveredAction, item) ? '✓' : '✗' }}
          </span>
          <span class="tooltip-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'SelectionActionsMenu',
  props: {
    // Selection data
    selectedNodes: {
      type: Array,
      default: () => [],
    },
    selectedEdges: {
      type: Array,
      default: () => [],
    },
    
    // Actions configuration
    defaultNodeActions: {
      type: Array,
      default: () => [],
    },
    defaultEdgeActions: {
      type: Array,
      default: () => [],
    },
    nodeTypeActions: {
      type: Object,
      default: () => ({}),
    },
    
    // Display settings
    mode: {
      type: String,
      default: 'default', // 'default' | 'custom'
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    
    // Styling
    config: {
      type: Object,
      default: () => ({}),
    },
    
    // Custom button content
    actionButtonDropzones: {
      type: Object,
      default: () => ({}),
    },
    
    // Canvas bounds for positioning
    canvasRect: {
      type: Object,
      default: () => null,
    },
    viewport: {
      type: Object,
      default: () => ({ x: 0, y: 0, zoom: 1 }),
    },
  },
  emits: ['action-execute', 'menu-opened', 'menu-closed'],
  setup(props, { emit }) {
    //#region Local State
    const hoveredAction = ref(null);
    const showTooltip = ref(true);
    //#endregion

    //#region Computed Properties
    const isVisible = computed(() => {
      return props.enabled && (props.selectedNodes?.length > 0 || props.selectedEdges?.length > 0);
    });

    /**
     * Get all selected items with metadata
     */
    const selectedItemsList = computed(() => {
      const items = [];
      
      // Add nodes
      props.selectedNodes?.forEach(node => {
        items.push({
          id: node.id,
          type: 'node',
          nodeType: node?.type || 'default',
          label: node?.data?.label || node?.data?.title || `Node ${node.id}`,
          data: node,
        });
      });
      
      // Add edges
      props.selectedEdges?.forEach(edge => {
        items.push({
          id: edge.id,
          type: 'edge',
          label: `Edge: ${edge.source} → ${edge.target}`,
          data: edge,
        });
      });
      
      return items;
    });

    /**
     * Merge and filter actions based on selection
     */
    const availableActions = computed(() => {
      const actionsMap = new Map();
      
      // Add default node actions
      props.defaultNodeActions?.forEach(action => {
        if (!actionsMap.has(action.id)) {
          actionsMap.set(action.id, { ...action, source: 'node-global' });
        }
      });
      
      // Add default edge actions
      props.defaultEdgeActions?.forEach(action => {
        if (!actionsMap.has(action.id)) {
          actionsMap.set(action.id, { ...action, source: 'edge-global' });
        }
      });
      
      // Add node-type-specific actions
      props.selectedNodes?.forEach(node => {
        const nodeType = node?.type || 'default';
        const typeActions = props.nodeTypeActions?.[nodeType] || [];
        
        typeActions.forEach(action => {
          if (!actionsMap.has(action.id)) {
            actionsMap.set(action.id, { ...action, source: `node-type-${nodeType}` });
          }
        });
      });
      
      // Filter actions applicable to at least one selected item
      const allActions = Array.from(actionsMap.values());
      return allActions.filter(action => {
        return selectedItemsList.value.some(item => isActionApplicableToItem(action, item));
      });
    });

    /**
     * Calculate menu position based on selection bounds
     */
    const menuStyle = computed(() => {
      if (!props.canvasRect || selectedItemsList.value.length === 0) {
        return {
          position: 'absolute',
          bottom: '80px',
          right: '20px',
        };
      }
      
      // Calculate center of all selected items
      const positions = [
        ...props.selectedNodes.map(n => n.position),
        ...props.selectedEdges.map(e => {
          // Approximate edge center (would need source/target nodes for exact)
          return { x: 0, y: 0 };
        }),
      ].filter(p => p.x !== undefined);
      
      if (positions.length === 0) {
        return {
          position: 'absolute',
          bottom: '80px',
          right: '20px',
        };
      }
      
      const sumX = positions.reduce((sum, p) => sum + p.x, 0);
      const sumY = positions.reduce((sum, p) => sum + p.y, 0);
      const centerX = sumX / positions.length;
      const centerY = sumY / positions.length;
      
      // Transform to screen coordinates
      const screenX = centerX * props.viewport.zoom + props.viewport.x;
      const screenY = centerY * props.viewport.zoom + props.viewport.y;
      
      // Position above selection
      const offset = props.config?.selectionMenuOffset || 60;
      
      return {
        position: 'absolute',
        left: `${screenX}px`,
        top: `${screenY - offset}px`,
        transform: 'translate(-50%, -100%)',
        '--menu-bg': props.config?.selectionMenuBackground || '#ffffff',
        '--menu-border': props.config?.selectionMenuBorderColor || '#d0d0d0',
      };
    });

    const tooltipStyle = computed(() => ({
      '--tooltip-bg': props.config?.tooltipBackground || '#333333',
      '--tooltip-color': props.config?.tooltipColor || '#ffffff',
    }));
    //#endregion

    //#region Helper Methods
    /**
     * Check if action applies to a specific item
     */
    const isActionApplicableToItem = (action, item) => {
      const applicableTo = action?.applicableTo || 'both';
      
      if (applicableTo === 'both') return true;
      if (applicableTo === 'node' && item.type === 'node') return true;
      if (applicableTo === 'edge' && item.type === 'edge') return true;
      
      // Check if action requires single selection
      if (action?.requiresSingleSelection && selectedItemsList.value.length > 1) {
        return false;
      }
      
      return false;
    };

    /**
     * Check if action has custom button content
     */
    const hasCustomButton = (actionId) => {
      const dropzoneContent = props.actionButtonDropzones?.[actionId];
      return Array.isArray(dropzoneContent) && dropzoneContent.length > 0;
    };

    /**
     * Get icon character for action
     */
    const getActionIcon = (iconName) => {
      const iconMap = {
        edit: '✎',
        delete: '🗑',
        duplicate: '⎘',
        lock: '🔒',
        unlock: '🔓',
        color: '🎨',
        'path-type': '↝',
        'bring-front': '⬆',
        'send-back': '⬇',
        group: '⊡',
        ungroup: '⊟',
      };
      return iconMap[iconName] || '•';
    };
    //#endregion

    //#region Event Handlers
    const handleActionClick = (action) => {
      // Filter items this action applies to
      const applicableItems = selectedItemsList.value.filter(item => 
        isActionApplicableToItem(action, item)
      );
      
      emit('action-execute', {
        action,
        items: applicableItems,
        allSelected: selectedItemsList.value,
      });
    };
    //#endregion

    //#region Watchers
    watch(isVisible, (newValue, oldValue) => {
      if (newValue && !oldValue) {
        emit('menu-opened', { selectedItems: selectedItemsList.value });
      } else if (!newValue && oldValue) {
        emit('menu-closed');
      }
    });
    //#endregion

    return {
      isVisible,
      hoveredAction,
      showTooltip,
      selectedItemsList,
      availableActions,
      menuStyle,
      tooltipStyle,
      isActionApplicableToItem,
      hasCustomButton,
      getActionIcon,
      handleActionClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.selection-actions-menu {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--menu-bg, #ffffff);
  border: 1px solid var(--menu-border, #d0d0d0);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 200px;
  pointer-events: all;
}

//#region Default Mode Buttons
.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #333;
  white-space: nowrap;

  &:hover {
    background: #e8e8e8;
    border-color: #007aff;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
}

.action-icon {
  font-size: 16px;
  line-height: 1;
}

.action-label {
  font-weight: 500;
}
//#endregion

//#region Custom Mode Dropzones
.action-dropzone-slot {
  position: relative;
  min-width: 80px;
  min-height: 40px;
}

.action-dropzone {
  min-width: 80px;
  min-height: 40px;
  border: 2px dashed #d0d0d0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #007aff;
    background: rgba(0, 122, 255, 0.05);
  }

  &:not(:empty) {
    border-style: solid;
    border-color: transparent;
    background: transparent;
  }
}

.action-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  color: #999;
  font-style: italic;
  pointer-events: none;
  white-space: nowrap;
}

.action-dropzone:not(:empty) + .action-placeholder {
  display: none;
}
//#endregion

//#region Hover Tooltip
.action-tooltip {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translate(-50%, -100%);
  background: var(--tooltip-bg, #333333);
  color: var(--tooltip-color, #ffffff);
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 200px;
  max-width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1002;
  pointer-events: none;
}

.tooltip-header {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.tooltip-icon {
  font-weight: bold;
  font-size: 14px;
  width: 16px;
  text-align: center;
  
  &.applicable {
    color: #4cd964;
  }
  
  &:not(.applicable) {
    color: #ff3b30;
  }
}

.tooltip-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
//#endregion

//#region Responsive
@media (max-width: 768px) {
  .selection-actions-menu {
    flex-direction: column;
    min-width: 150px;
  }
  
  .action-button {
    width: 100%;
    justify-content: flex-start;
  }
}
//#endregion
</style>

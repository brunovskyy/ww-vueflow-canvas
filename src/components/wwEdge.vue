<template>
  <g
    :class="['edge-group', { 'edge-selected': isSelected }]"
    @click="handleClick"
  >
    <!-- Visible Edge Path -->
    <path
      :d="edgePath"
      class="edge-path"
      :stroke="edgeColor"
      :stroke-width="isSelected ? 3 : 2"
      fill="none"
    />
    <!-- Edge Interaction Area (invisible, larger hitbox) -->
    <path
      :d="edgePath"
      class="edge-hitbox"
      stroke="transparent"
      stroke-width="15"
      fill="none"
    />
  </g>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'wwEdge',
  props: {
    edge: {
      type: Object,
      required: true,
      // Shape: { id, source, target, sourceHandle, targetHandle }
    },
    sourceNode: {
      type: Object,
      required: true,
      // Shape: { id, position: { x, y }, data, type }
    },
    targetNode: {
      type: Object,
      required: true,
      // Shape: { id, position: { x, y }, data, type }
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    pathType: {
      type: String,
      default: 'bezier',
      // 'bezier' | 'straight'
    },
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['edge-click'],
  setup(props, { emit }) {
    //#region Computed Properties
    const edgeColor = computed(() => {
      if (props.isSelected) {
        return props.config?.selectedEdgeColor || '#007aff';
      }
      return props.config?.edgeColor || '#999999';
    });

    const edgePath = computed(() => {
      const sourcePos = getHandlePosition(
        props.sourceNode,
        props.edge?.sourceHandle || 'bottom'
      );
      const targetPos = getHandlePosition(
        props.targetNode,
        props.edge?.targetHandle || 'top'
      );

      if (props.pathType === 'straight') {
        return createStraightPath(sourcePos, targetPos);
      }

      return createBezierPath(sourcePos, targetPos);
    });
    //#endregion

    //#region Helper Methods
    /**
     * Calculate the position of a handle on a node
     */
    const getHandlePosition = (node, handlePosition) => {
      const nodeX = node?.position?.x || 0;
      const nodeY = node?.position?.y || 0;

      // Approximate offsets based on handle position
      const offsets = {
        top: { x: 0, y: -30 },
        bottom: { x: 0, y: 30 },
        left: { x: -60, y: 0 },
        right: { x: 60, y: 0 },
      };

      const offset = offsets[handlePosition] || { x: 0, y: 0 };

      return {
        x: nodeX + offset.x,
        y: nodeY + offset.y,
      };
    };

    /**
     * Create a straight path between two points
     */
    const createStraightPath = (source, target) => {
      return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
    };

    /**
     * Create a Bezier curve path between two points
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

    //#region Event Handlers
    const handleClick = () => {
      emit('edge-click', props.edge?.id);
    };
    //#endregion

    return {
      edgeColor,
      edgePath,
      handleClick,
    };
  },
};
</script>

<style lang="scss" scoped>
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

.edge-selected .edge-path {
  stroke: var(--edge-selected, #007aff);
  stroke-width: 3;
}
</style>

<template>
  <div
    :class="['canvas-node', `node-type-${nodeType}`, { 
      'node-selected': isSelected,
      'node-dragging': isDragging,
      'node-hovered': isHovered,
      'dark-theme': isDarkTheme,
      'node-resizable': isResizable
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
      :node-position="node?.position"
      :node-size="nodeDimensions"
      :is-visible="handlesVisible"
      :config="config"
      :viewport="viewport"
      :cursor-position="cursorPosition"
      @handle-mousedown="onHandleMouseDown"
      @handle-mouseup="onHandleMouseUp"
    />

    <!-- Node Content: Type-Based Rendering -->
    <!-- Custom Dropzone Mode: Only render for custom type nodes in custom mode -->
    <div v-if="isCustomNodeWithDropzone" class="node-dropzone-wrapper">
      <wwLayout 
        path="nodeDropzoneContent" 
        direction="column"
        class="node-dropzone"
      />
    </div>
    
    <!-- Default Flow Node -->
    <div v-else-if="nodeType === 'default'" class="node-content node-content-default">
      <div class="node-header">
        <span class="node-title">{{ nodeLabel }}</span>
        <button 
          v-if="config?.deletableNodes"
          class="node-delete"
          @click.stop="handleDelete"
        >
          <i :class="deleteIcon" />
        </button>
      </div>
      <div v-if="nodeDescription" class="node-description">
        {{ nodeDescription }}
      </div>
    </div>
    
    <!-- Text Note Node -->
    <div v-else-if="nodeType === 'text'" class="node-content node-content-text">
      <div class="node-header">
        <span class="node-title">{{ nodeLabel }}</span>
        <button 
          v-if="config?.deletableNodes"
          class="node-delete"
          @click.stop="handleDelete"
        >
          <i :class="deleteIcon" />
        </button>
      </div>
      <div 
        ref="quillEditorRef"
        class="text-editor-container"
        @dblclick.stop="enterEditMode"
      ></div>
      <div v-if="!isEditingText" class="edit-hint">Double-click to edit</div>
    </div>
    
    <!-- Media Node -->
    <div v-else-if="nodeType === 'media'" class="node-content node-content-media">
      <div class="node-header">
        <span class="node-title">{{ nodeLabel }}</span>
        <button 
          v-if="config?.deletableNodes"
          class="node-delete"
          @click.stop="handleDelete"
        >
          <i :class="deleteIcon" />
        </button>
      </div>
      
      <div class="media-container">
        <!-- Image -->
        <img 
          v-if="mediaType === 'image' && mediaUrl"
          :src="mediaUrl"
          :alt="nodeLabel"
          class="media-content"
          @error="handleMediaError"
        />
        
        <!-- Video -->
        <video 
          v-else-if="mediaType === 'video' && mediaUrl"
          :src="mediaUrl"
          class="media-content"
          controls
          @error="handleMediaError"
        />
        
        <!-- PDF -->
        <iframe 
          v-else-if="mediaType === 'pdf' && mediaUrl"
          :src="mediaUrl"
          class="media-content"
          frameborder="0"
        />
        
        <!-- Placeholder -->
        <div v-else class="media-placeholder">
          <span class="placeholder-icon">🖼️</span>
          <span class="placeholder-text">No media</span>
        </div>
      </div>
      
      <button class="edit-media-btn" @click.stop="handleEditMedia">
        {{ mediaUrl ? 'Change Media' : 'Add Media' }}
      </button>
    </div>
    
    <!-- Web Node -->
    <div v-else-if="nodeType === 'web'" class="node-content node-content-web">
      <div class="node-header">
        <span class="node-title">{{ nodeLabel }}</span>
        <button 
          v-if="config?.deletableNodes"
          class="node-delete"
          @click.stop="handleDelete"
        >
          <i :class="deleteIcon" />
        </button>
      </div>
      
      <div class="web-container">
        <iframe 
          v-if="webUrl"
          :src="webUrl"
          class="web-content"
          frameborder="0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
        
        <div v-else class="web-placeholder">
          <span class="placeholder-icon">🌐</span>
          <span class="placeholder-text">No URL</span>
        </div>
      </div>
      
      <div class="web-controls">
        <a 
          v-if="webUrl" 
          :href="webUrl" 
          target="_blank" 
          class="web-control-btn"
          @click.stop
        >
          ↗ Open
        </a>
        <button class="web-control-btn" @click.stop="handleEditUrl">
          ✎ {{ webUrl ? 'Edit URL' : 'Add URL' }}
        </button>
      </div>
    </div>
    
    <!-- Resize Handles (if resizable) -->
    <div v-if="isResizable && isSelected" class="resize-handles">
      <div 
        v-for="handle in resizeHandles" 
        :key="handle"
        :class="['resize-handle', `resize-${handle}`]"
        @mousedown.stop="handleResizeStart($event, handle)"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import wwHandle from './wwHandle.vue';
import { isDarkColor } from '../utils/colorHelpers';
import { getNodeTypeConfig, getNodeDimensions, getNodeHandles } from '../utils/nodeTypes';
import { ICONS } from '../utils/icons';

// CRITICAL: Import wwLayout for node dropzone functionality
const wwLayout = window.wwLib?.wwLayout;

export default {
  name: 'wwNode',
  components: {
    wwHandle,
    wwLayout, // CRITICAL: Register wwLayout component for node dropzone
  },
  props: {
    node: {
      type: Object,
      required: true,
      // Shape: { id, type, position: { x, y }, data: { label, description, richTextContent, mediaUrl, webUrl, etc. } }
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
    cursorPosition: {
      type: Object,
      default: () => ({ x: 0, y: 0 }),
    },
    globalNodeType: {
      type: String,
      default: 'default',
    },
    connectionDragging: {
      type: Boolean,
      default: false,
    },
    allowResize: {
      type: Boolean,
      default: true,
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
    'update-node',
    'edit-media',
    'edit-url',
    'resize-node',
  ],
  setup(props, { emit }) {
    //#region Refs
    const quillEditorRef = ref(null);
    const quillInstance = ref(null);
    const isEditingText = ref(false);
    const isResizing = ref(false);
    const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });
    //#endregion

    //#region Computed Properties
    const nodeType = computed(() => {
      return props.node?.type || 'default';
    });

    const isCustomNodeWithDropzone = computed(() => {
      return props.globalNodeType === 'custom' && nodeType.value === 'custom';
    });

    const deleteIcon = computed(() => {
      return ICONS.close;
    });

    const nodeStyle = computed(() => {
      const dimensions = getNodeDimensions(props.node);
      
      return {
        position: 'absolute',
        left: `${props.node?.position?.x || 0}px`,
        top: `${props.node?.position?.y || 0}px`,
        transform: 'translate(-50%, -50%)',
        width: props.node?.data?.width || `${dimensions.width}px`,
        height: props.node?.data?.height || `${dimensions.height}px`,
      };
    });

    const nodeLabel = computed(() => {
      return props.node?.data?.label || 
             props.node?.data?.title || 
             `Node ${props.node?.id || ''}`;
    });

    const nodeDescription = computed(() => {
      return props.node?.data?.description || '';
    });

    const richTextContent = computed(() => {
      return props.node?.data?.richTextContent || '<p>Start typing...</p>';
    });

    const mediaUrl = computed(() => {
      return props.node?.data?.mediaUrl || '';
    });

    const mediaType = computed(() => {
      return props.node?.data?.mediaType || 'image';
    });

    const webUrl = computed(() => {
      return props.node?.data?.webUrl || '';
    });

    const nodeHandles = computed(() => {
      // Use standardized handle configuration from utilities
      return getNodeHandles(props.node, props.config);
    });

    const nodeDimensions = computed(() => {
      return getNodeDimensions(props.node);
    });

    const handlesVisible = computed(() => {
      // Only show handles during connection dragging or when node is selected
      // Proximity detection is handled by wwHandle component itself
      return props.connectionDragging || props.isSelected;
    });

    /**
     * Detect if dark theme is active based on node background color
     */
    const isDarkTheme = computed(() => {
      const bgColor = props.config?.nodeBackgroundColor || '#f9f9f9';
      return isDarkColor(bgColor);
    });

    /**
     * Check if node is resizable
     * CRITICAL: Only text, media, and web nodes should be resizable
     */
    const isResizable = computed(() => {
      if (!props.allowResize) return false;
      const type = nodeType.value;
      return type === 'text' || type === 'media' || type === 'web';
    });

    const resizeHandles = ['nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w'];
    //#endregion

    //#region Text Editor (Quill)
    const initQuillEditor = () => {
      if (nodeType.value !== 'text' || !quillEditorRef.value) return;
      
      // CRITICAL: Prevent duplicate initialization
      if (quillInstance.value) {
        return; // Already initialized
      }

      // Initialize Quill with floating toolbar configuration
      nextTick(() => {
        if (!quillEditorRef.value || quillInstance.value) return;

        quillInstance.value = new Quill(quillEditorRef.value, {
          theme: 'snow',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'header': [1, 2, 3, false] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link'],
              ['clean']
            ]
          },
          placeholder: 'Start typing...',
          readOnly: true, // Start as read-only
        });

        // Set initial content
        if (richTextContent.value) {
          quillInstance.value.root.innerHTML = richTextContent.value;
        }

        // Listen for content changes
        quillInstance.value.on('text-change', () => {
          if (isEditingText.value) {
            const html = quillInstance.value.root.innerHTML;
            emit('update-node', {
              nodeId: props.node?.id,
              data: { richTextContent: html }
            });
          }
        });
      });
    };

    const enterEditMode = () => {
      if (nodeType.value !== 'text') return;
      
      isEditingText.value = true;
      
      if (quillInstance.value) {
        quillInstance.value.enable();
        nextTick(() => {
          quillInstance.value.focus();
        });
      }
    };

    const exitEditMode = () => {
      if (nodeType.value !== 'text') return;
      
      isEditingText.value = false;
      
      if (quillInstance.value) {
        quillInstance.value.disable();
      }
    };
    //#endregion

    //#region Event Handlers
    const handleMouseDown = (event) => {
      // Don't allow node dragging while editing text or resizing
      if (isEditingText.value || isResizing.value) return;
      
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

    const handleEditMedia = () => {
      emit('edit-media', {
        nodeId: props.node?.id,
        currentUrl: mediaUrl.value,
        currentType: mediaType.value,
      });
    };

    const handleEditUrl = () => {
      emit('edit-url', {
        nodeId: props.node?.id,
        currentUrl: webUrl.value,
      });
    };

    const handleMediaError = () => {
      console.error('Failed to load media:', mediaUrl.value);
    };

    const handleResizeStart = (event, handle) => {
      event.stopPropagation();
      event.preventDefault();
      
      // CRITICAL: Signal to parent that resize operation is starting
      emit('node-mousedown', {
        event,
        nodeId: props.node?.id,
        isResize: true
      });
      
      isResizing.value = true;
      
      const nodeElement = event.target.closest('.canvas-node');
      const currentWidth = parseFloat(props.node?.data?.width) || nodeElement.offsetWidth;
      const currentHeight = parseFloat(props.node?.data?.height) || nodeElement.offsetHeight;
      
      resizeStart.value = {
        x: event.clientX,
        y: event.clientY,
        width: currentWidth,
        height: currentHeight,
        handle: handle,
      };
      
      // CRITICAL: Use global listeners for cursor lock during resize
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      
      // Prevent text selection during resize
      document.body.style.userSelect = 'none';
      document.body.style.cursor = getResizeCursor(handle);
    };

    const handleResizeMove = (event) => {
      if (!isResizing.value) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      const dx = (event.clientX - resizeStart.value.x) / (props.viewport?.zoom || 1);
      const dy = (event.clientY - resizeStart.value.y) / (props.viewport?.zoom || 1);
      
      const handle = resizeStart.value.handle;
      let newWidth = resizeStart.value.width;
      let newHeight = resizeStart.value.height;
      
      // Minimum dimensions based on node type
      const minWidth = nodeType.value === 'text' ? 200 : 120;
      const minHeight = nodeType.value === 'text' ? 100 : 60;
      
      // Handle width changes
      if (handle.includes('e')) {
        newWidth = Math.max(minWidth, resizeStart.value.width + dx);
      } else if (handle.includes('w')) {
        newWidth = Math.max(minWidth, resizeStart.value.width - dx);
      }
      
      // Handle height changes
      if (handle.includes('s')) {
        newHeight = Math.max(minHeight, resizeStart.value.height + dy);
      } else if (handle.includes('n')) {
        newHeight = Math.max(minHeight, resizeStart.value.height - dy);
      }
      
      // Real-time update for immediate visual feedback
      emit('update-node', {
        nodeId: props.node?.id,
        data: {
          width: `${Math.round(newWidth)}px`,
          height: `${Math.round(newHeight)}px`,
        }
      });
    };

    const handleResizeEnd = (event) => {
      if (!isResizing.value) return;
      
      event?.preventDefault();
      event?.stopPropagation();
      
      isResizing.value = false;
      
      // Emit final resize event
      emit('resize-node', {
        nodeId: props.node?.id,
        width: props.node?.data?.width,
        height: props.node?.data?.height,
      });
      
      // CRITICAL: Clean up global state
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    
    /**
     * Get appropriate cursor for resize handle
     */
    const getResizeCursor = (handle) => {
      const cursors = {
        'nw': 'nw-resize',
        'ne': 'ne-resize',
        'sw': 'sw-resize',
        'se': 'se-resize',
        'n': 'n-resize',
        'e': 'e-resize',
        's': 's-resize',
        'w': 'w-resize',
      };
      return cursors[handle] || 'default';
    };
    //#endregion

    //#region Watchers
    // Initialize Quill when node becomes text type (ONLY ONCE)
    watch([() => props.node?.type, quillEditorRef], ([newType]) => {
      if (newType === 'text' && !quillInstance.value) {
        nextTick(() => {
          initQuillEditor();
        });
      }
    }, { immediate: true });

    // Update Quill content when richTextContent changes externally
    watch(richTextContent, (newContent) => {
      if (quillInstance.value && !isEditingText.value) {
        const currentContent = quillInstance.value.root.innerHTML;
        if (currentContent !== newContent) {
          quillInstance.value.root.innerHTML = newContent;
        }
      }
    });

    // Exit edit mode when node is deselected
    watch(() => props.isSelected, (newSelected) => {
      if (!newSelected && isEditingText.value) {
        exitEditMode();
      }
    });
    //#endregion

    //#region Lifecycle
    onMounted(() => {
      if (nodeType.value === 'text' && !quillInstance.value) {
        initQuillEditor();
      }
    });

    onUnmounted(() => {
      // Properly destroy Quill instance
      if (quillInstance.value) {
        try {
          quillInstance.value.off('text-change');
          const toolbar = quillEditorRef.value?.querySelector('.ql-toolbar');
          if (toolbar) {
            toolbar.remove();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        quillInstance.value = null;
      }
      
      // Clean up resize listeners
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    });
    //#endregion

    return {
      quillEditorRef,
      isEditingText,
      nodeType,
      isCustomNodeWithDropzone,
      deleteIcon,
      nodeStyle,
      nodeLabel,
      nodeDescription,
      richTextContent,
      mediaUrl,
      mediaType,
      webUrl,
      nodeHandles,
      nodeDimensions,
      handlesVisible,
      isDarkTheme,
      isResizable,
      resizeHandles,
      handleMouseDown,
      handleClick,
      handleMouseEnter,
      handleMouseLeave,
      handleDelete,
      onHandleMouseDown,
      onHandleMouseUp,
      handleEditMedia,
      handleEditUrl,
      handleMediaError,
      handleResizeStart,
      enterEditMode,
      exitEditMode,
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
  display: flex;
  flex-direction: column;

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

  &.node-resizable.node-selected {
    cursor: default;
  }
}

//#region Node Type Variants
.node-type-text {
  min-width: 200px;
  min-height: 100px;
}

.node-type-media {
  min-width: 200px;
  min-height: 150px;
  padding: 8px;
}

.node-type-web {
  min-width: 300px;
  min-height: 200px;
  padding: 8px;
}
//#endregion

.node-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.node-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .dark-theme & {
    color: #e0e0e0;
  }
}

.node-description {
  font-size: 12px;
  color: #666;
  margin-top: 4px;

  .dark-theme & {
    color: #999;
  }
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
  transition: all 0.2s ease;
  opacity: 0;
  pointer-events: none;
  flex-shrink: 0;

  .canvas-node:hover & {
    opacity: 1;
    pointer-events: all;
  }

  &:hover {
    background: rgba(255, 0, 0, 0.1);
    color: #ff3b30;
  }

  .dark-theme & {
    color: #bbb;

    &:hover {
      background: rgba(255, 0, 0, 0.2);
      color: #ff6b60;
    }
  }
}

//#region Text Node Styles
.node-content-text {
  overflow: hidden;
  position: relative;
  
  .text-editor-container {
    flex: 1;
    min-height: 60px;
    max-height: 100%;
    border: 1px solid transparent;
    border-radius: 4px;
    transition: border-color 0.2s ease;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    &:hover {
      border-color: #e0e0e0;
    }
    
    :deep(.ql-container) {
      border: none;
      font-size: 13px;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    :deep(.ql-editor) {
      padding: 8px;
      min-height: 60px;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      word-wrap: break-word;
      
      &.ql-blank::before {
        font-style: italic;
        color: #999;
      }
      
      p, h1, h2, h3 {
        margin: 0 0 8px 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
    }
    
    // CRITICAL: Only show ONE toolbar, hide when not editing
    :deep(.ql-toolbar) {
      border: none;
      border-bottom: 1px solid #e0e0e0;
      padding: 4px;
      background: #fafafa;
      border-radius: 4px 4px 0 0;
      flex-shrink: 0;
      opacity: 0;
      max-height: 0;
      overflow: hidden;
      transition: opacity 0.2s ease, max-height 0.2s ease;
    }
  }
  
  // Show toolbar only when node is being edited
  .canvas-node.node-selected .text-editor-container :deep(.ql-toolbar) {
    opacity: 1;
    max-height: 50px;
  }
  
  .edit-hint {
    font-size: 11px;
    color: #999;
    font-style: italic;
    text-align: center;
    margin-top: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    
    .canvas-node:hover & {
      opacity: 1;
    }
  }
}
//#endregion

//#region Media Node Styles
.node-content-media {
  .media-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 8px;
    min-height: 100px;
  }
  
  .media-content {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .media-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #999;
    padding: 20px;
    
    .placeholder-icon {
      font-size: 32px;
      opacity: 0.5;
    }
    
    .placeholder-text {
      font-size: 13px;
      font-style: italic;
    }
  }
  
  .edit-media-btn {
    width: 100%;
    padding: 8px 12px;
    background: white;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f5f5f5;
      border-color: #007aff;
      color: #007aff;
    }
  }
}
//#endregion

//#region Web Node Styles
.node-content-web {
  .web-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 8px;
    min-height: 150px;
  }
  
  .web-content {
    width: 100%;
    height: 100%;
    border: none;
  }
  
  .web-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #999;
    padding: 20px;
    
    .placeholder-icon {
      font-size: 32px;
      opacity: 0.5;
    }
    
    .placeholder-text {
      font-size: 13px;
      font-style: italic;
    }
  }
  
  .web-controls {
    display: flex;
    gap: 8px;
  }
  
  .web-control-btn {
    flex: 1;
    padding: 8px 12px;
    background: white;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    
    &:hover {
      background: #f5f5f5;
      border-color: #007aff;
      color: #007aff;
    }
  }
}
//#endregion

//#region Dropzone Styles
.node-dropzone-wrapper {
  position: relative;
  z-index: 1;
  min-width: 100px;
  min-height: 40px;
  flex: 1;
}

.node-dropzone {
  background: var(--node-dropzone-bg, transparent);
  border-radius: 6px;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
//#endregion

//#region Resize Handles
.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  background: #007aff;
  border: 1px solid white;
  pointer-events: all;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0066dd;
    transform: scale(1.2);
  }
}

// Corner handles (larger)
.resize-nw {
  top: -4px;
  left: -4px;
  width: 8px;
  height: 8px;
  cursor: nw-resize;
  border-radius: 50%;
}

.resize-ne {
  top: -4px;
  right: -4px;
  width: 8px;
  height: 8px;
  cursor: ne-resize;
  border-radius: 50%;
}

.resize-sw {
  bottom: -4px;
  left: -4px;
  width: 8px;
  height: 8px;
  cursor: sw-resize;
  border-radius: 50%;
}

.resize-se {
  bottom: -4px;
  right: -4px;
  width: 8px;
  height: 8px;
  cursor: se-resize;
  border-radius: 50%;
}

// Edge handles (smaller)
.resize-n {
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 6px;
  cursor: n-resize;
  border-radius: 3px;
}

.resize-e {
  right: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 20px;
  cursor: e-resize;
  border-radius: 3px;
}

.resize-s {
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 6px;
  cursor: s-resize;
  border-radius: 3px;
}

.resize-w {
  left: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 20px;
  cursor: w-resize;
  border-radius: 3px;
}
//#endregion
</style>

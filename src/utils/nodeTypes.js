/**
 * Node Type Configurations
 * Defines properties and behaviors for different node types
 */
import { ICONS } from './icons';

export const NODE_TYPES = {
  DEFAULT: 'default',
  TEXT: 'text',
  MEDIA: 'media',
  WEB: 'web',
  CUSTOM: 'custom',
};

export const NODE_TYPE_CONFIG = {
  [NODE_TYPES.DEFAULT]: {
    label: 'Flow Node',
    icon: ICONS.flowNode,
    description: 'Standard flow node with label and description',
    defaultData: {
      label: 'New Flow Node',
      description: '',
    },
    minWidth: 120,
    minHeight: 60,
    defaultWidth: 200,
    defaultHeight: 100,
  },
  [NODE_TYPES.TEXT]: {
    label: 'Text Note',
    icon: ICONS.textNote,
    description: 'Rich text content card (Obsidian-style note)',
    defaultData: {
      label: 'New Note',
      richTextContent: '<p>Start typing...</p>',
    },
    minWidth: 200,
    minHeight: 100,
    defaultWidth: 300,
    defaultHeight: 200,
  },
  [NODE_TYPES.MEDIA]: {
    label: 'Media',
    icon: ICONS.media,
    description: 'Image, video, or PDF embedded in canvas',
    defaultData: {
      label: 'New Media',
      mediaUrl: '',
      mediaType: 'image', // image | video | pdf
    },
    minWidth: 200,
    minHeight: 150,
    defaultWidth: 400,
    defaultHeight: 300,
  },
  [NODE_TYPES.WEB]: {
    label: 'Web Page',
    icon: ICONS.web,
    description: 'Embedded web page via URL',
    defaultData: {
      label: 'New Web Page',
      webUrl: '',
    },
    minWidth: 300,
    minHeight: 200,
    defaultWidth: 600,
    defaultHeight: 400,
  },
  [NODE_TYPES.CUSTOM]: {
    label: 'Custom',
    icon: ICONS.custom,
    description: 'Custom node with dropzone content',
    defaultData: {
      label: 'Custom Node',
    },
    minWidth: 120,
    minHeight: 80,
    defaultWidth: 200,
    defaultHeight: 120,
  },
};

/**
 * Get node type configuration
 */
export const getNodeTypeConfig = (type) => {
  return NODE_TYPE_CONFIG[type] || NODE_TYPE_CONFIG[NODE_TYPES.DEFAULT];
};

/**
 * Create default node data for a type
 */
export const createNodeData = (type, overrides = {}) => {
  const config = getNodeTypeConfig(type);
  return {
    ...config.defaultData,
    ...overrides,
  };
};

/**
 * Detect media type from URL
 */
export const detectMediaType = (url) => {
  if (!url) return 'image';
  
  const lower = url.toLowerCase();
  
  // Video extensions
  if (lower.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/)) {
    return 'video';
  }
  
  // PDF extensions
  if (lower.match(/\.pdf$/)) {
    return 'pdf';
  }
  
  // Image by default (jpg, png, gif, webp, svg, etc.)
  return 'image';
};

/**
 * Validate URL format
 */
export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * Convert node to different type
 */
export const convertNodeType = (node, newType) => {
  const newConfig = getNodeTypeConfig(newType);
  const oldData = node?.data || {};
  
  // Preserve common fields
  const baseData = {
    label: oldData.label || newConfig.defaultData.label,
  };
  
  // Add type-specific defaults
  const typeDefaults = createNodeData(newType);
  
  return {
    ...node,
    type: newType,
    data: {
      ...typeDefaults,
      ...baseData,
    },
  };
};

/**
 * Get node dimensions (with fallbacks)
 */
export const getNodeDimensions = (node) => {
  const config = getNodeTypeConfig(node?.type);
  
  return {
    width: node?.data?.width || config.defaultWidth,
    height: node?.data?.height || config.defaultHeight,
  };
};

/**
 * Check if node type requires resizing
 */
export const isResizableType = (type) => {
  return type === NODE_TYPES.TEXT || 
         type === NODE_TYPES.MEDIA || 
         type === NODE_TYPES.WEB;
};

/**
 * Get all available node types as options array
 */
export const getNodeTypeOptions = () => {
  return Object.entries(NODE_TYPE_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
    icon: config.icon,
  }));
};

/**
 * Get standardized handle configuration for a node
 * All node types use the same handle configuration for consistency
 */
export const getStandardHandles = () => {
  return [
    { id: 'top', type: 'target', position: 'top' },
    { id: 'bottom', type: 'source', position: 'bottom' },
    { id: 'left', type: 'target', position: 'left' },
    { id: 'right', type: 'source', position: 'right' },
  ];
};

/**
 * Get handles for a specific node
 * Checks node data for custom handles, otherwise returns standard configuration
 */
export const getNodeHandles = (node, config = {}) => {
  const connectable = config?.connectableNodes !== false;
  
  if (!connectable) return [];
  
  // Custom handles from node data (advanced use case)
  if (node?.data?.handles && Array.isArray(node.data.handles)) {
    return node.data.handles;
  }
  
  // Standard handles for all node types
  return getStandardHandles();
};

/**
 * Check if a handle type and position combination is valid
 */
export const isValidHandle = (handle) => {
  if (!handle || !handle.id || !handle.type || !handle.position) {
    return false;
  }
  
  const validTypes = ['source', 'target'];
  const validPositions = ['top', 'bottom', 'left', 'right'];
  
  return validTypes.includes(handle.type) && validPositions.includes(handle.position);
};

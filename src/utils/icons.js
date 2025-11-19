/**
 * Centralized Phosphor Icon Configuration
 * All icons use the deprecated WeWeb icon asset format: "ph ph-{icon-name}"
 * 
 * Usage:
 * import { ICONS, getIconClass } from './icons'
 * <i :class="getIconClass('edit')" />
 */

// Icon name to Phosphor class mapping
export const ICONS = {
  // Node Types
  flowNode: 'ph ph-flow-arrow',
  textNote: 'ph ph-note-pencil',
  media: 'ph ph-image',
  web: 'ph ph-globe',
  custom: 'ph ph-square-half',
  
  // Actions
  edit: 'ph ph-pencil-simple',
  delete: 'ph ph-trash',
  duplicate: 'ph ph-copy',
  lock: 'ph ph-lock',
  unlock: 'ph ph-lock-open',
  color: 'ph ph-palette',
  pathType: 'ph ph-git-branch',
  bringFront: 'ph ph-arrow-up',
  sendBack: 'ph ph-arrow-down',
  group: 'ph ph-unite',
  ungroup: 'ph ph-exclude',
  
  // Controls
  add: 'ph ph-plus',
  remove: 'ph ph-minus',
  close: 'ph ph-x',
  zoomIn: 'ph ph-plus-circle',
  zoomOut: 'ph ph-minus-circle',
  fitView: 'ph ph-frame-corners',
  reset: 'ph ph-arrows-clockwise',
  
  // UI Elements
  menu: 'ph ph-list',
  dots: 'ph ph-dots-three',
  check: 'ph ph-check',
  warning: 'ph ph-warning',
  info: 'ph ph-info',
  
  // Arrows & Navigation
  arrowUp: 'ph ph-arrow-up',
  arrowDown: 'ph ph-arrow-down',
  arrowLeft: 'ph ph-arrow-left',
  arrowRight: 'ph ph-arrow-right',
  openExternal: 'ph ph-arrow-square-out',
  
  // Editor
  bold: 'ph ph-text-b',
  italic: 'ph ph-text-italic',
  underline: 'ph ph-text-underline',
  link: 'ph ph-link',
  image: 'ph ph-image',
  
  // Media Types
  video: 'ph ph-video-camera',
  pdf: 'ph ph-file-pdf',
  file: 'ph ph-file',
};

/**
 * Get full icon class string from icon key
 * @param {string} iconKey - Key from ICONS object
 * @returns {string} - Full Phosphor icon class (e.g., "ph ph-pencil-simple")
 */
export const getIconClass = (iconKey) => {
  return ICONS[iconKey] || 'ph ph-question';
};

/**
 * Get all available icon options for node types
 * @returns {Array} - Array of {value, label, icon} objects for TextSelect
 */
export const getNodeTypeIconOptions = () => {
  return [
    { value: 'flowNode', label: 'Flow Node', icon: ICONS.flowNode },
    { value: 'textNote', label: 'Text Note', icon: ICONS.textNote },
    { value: 'media', label: 'Media', icon: ICONS.media },
    { value: 'web', label: 'Web Page', icon: ICONS.web },
    { value: 'custom', label: 'Custom', icon: ICONS.custom },
  ];
};

/**
 * Get all available icon options for actions
 * @returns {Array} - Array of {value, label, icon} objects for TextSelect
 */
export const getActionIconOptions = () => {
  return [
    { value: 'edit', label: 'Edit', icon: ICONS.edit },
    { value: 'delete', label: 'Delete', icon: ICONS.delete },
    { value: 'duplicate', label: 'Duplicate', icon: ICONS.duplicate },
    { value: 'lock', label: 'Lock', icon: ICONS.lock },
    { value: 'unlock', label: 'Unlock', icon: ICONS.unlock },
    { value: 'color', label: 'Color', icon: ICONS.color },
    { value: 'pathType', label: 'Path Type', icon: ICONS.pathType },
    { value: 'bringFront', label: 'Bring to Front', icon: ICONS.bringFront },
    { value: 'sendBack', label: 'Send to Back', icon: ICONS.sendBack },
    { value: 'group', label: 'Group', icon: ICONS.group },
    { value: 'ungroup', label: 'Ungroup', icon: ICONS.ungroup },
  ];
};

/**
 * Create icon element helper for rendering
 * @param {string} iconKey - Icon key from ICONS
 * @param {string} additionalClass - Optional additional CSS classes
 * @returns {string} - HTML string for icon element
 */
export const createIconElement = (iconKey, additionalClass = '') => {
  const iconClass = getIconClass(iconKey);
  return `<i class="${iconClass} ${additionalClass}"></i>`;
};

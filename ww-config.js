export default {
  editor: {
    label: {
      en: "Node Canvas",
    },
    icon: "canvas",
    customStylePropertiesOrder: [
      {
        label: "Canvas",
        isCollapsible: true,
        properties: [
          "backgroundColor",
          "gridColor",
          "gridPattern",
          "gridLayout"
        ],
      },
      {
        label: "Nodes",
        isCollapsible: true,
        properties: [
          "nodeBackgroundColor",
          "nodeBorderColor",
          "selectedNodeBorderColor",
          "handleColor",
          "handleBorderColor",
          "selectedHandleColor",
          "nodeDropzoneBackgroundColor",
        ],
      },
      {
        label: "Edges",
        isCollapsible: true,
        properties: [
          "edgeColor",
          "selectedEdgeColor",
        ],
      },
      {
        label: "Actions Panel",
        isCollapsible: true,
        properties: [
          "actionsDropzoneHeight",
          "actionsDropzoneBackground",
        ],
      },
    ],
    customSettingsPropertiesOrder: [
      {
        label: "Canvas",
        isCollapsible: true,
        properties: [
          "showGrid",
          "snapToGrid",
          "enableZoom",
          "enablePan",
          "minZoom",
          "maxZoom",
        ],
      },
      {
        label: "Nodes",
        isCollapsible: true,
        properties: [
          "connectableNodes",
          "deletableNodes",
          "nodeDropzoneEnabled",
          "initialNodes",
        ],
      },
      {
        label: "Edges",
        isCollapsible: true,
        properties: [
          "pathType",
          "initialEdges",
        ],
      },
      {
        label: "Actions Panel",
        isCollapsible: true,
        properties: [
          "actionsDropzoneEnabled",
        ],
      },
    ],
  },
  //#region Properties
  properties: {
    //#region Initial Nodes
    initialNodes: {
      label: { en: 'Initial Nodes' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        {
          id: crypto.randomUUID(),
          type: 'default',
          positionX: 250,
          positionY: 100,
          label: 'Start Node',
          description: 'This is the starting point.'
        },
        {
          id: crypto.randomUUID(),
          type: 'default',
          positionX: 250,
          positionY: 250,
          label: 'Process Node',
          description: 'Processing data.'
        },
        {
          id: crypto.randomUUID(),
          type: 'default',
          positionX: 250,
          positionY: 400,
          label: 'End Node',
          description: 'This is the final result node.'
        }
      ],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item?.label || item?.title || `Node ${item?.id || 'Unknown'}`;
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: crypto.randomUUID(),
            type: 'default',
            positionX: 100,
            positionY: 100,
            label: 'New Node',
            description: ''
          },
          options: {
            item: {
              id: {
                label: { en: 'Node ID' },
                type: 'Text',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Unique identifier for the node'
                },
                /* wwEditor:end */
              },
              type: {
                label: { en: 'Node Type' },
                type: 'Text',
                defaultValue: 'default',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Type of node (default, input, output, process)'
                },
                /* wwEditor:end */
              },
              positionX: {
                label: { en: 'X Position' },
                type: 'Number',
                defaultValue: 100,
                /* wwEditor:start */
                bindingValidation: {
                  type: 'number',
                  tooltip: 'X coordinate on canvas'
                },
                /* wwEditor:end */
              },
              positionY: {
                label: { en: 'Y Position' },
                type: 'Number',
                defaultValue: 100,
                /* wwEditor:start */
                bindingValidation: {
                  type: 'number',
                  tooltip: 'Y coordinate on canvas'
                },
                /* wwEditor:end */
              },
              label: {
                label: { en: 'Node Label' },
                type: 'Text',
                defaultValue: 'Node',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Display label for the node'
                },
                /* wwEditor:end */
              },
              description: {
                label: { en: 'Description' },
                type: 'Text',
                defaultValue: '',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Optional description text'
                },
                /* wwEditor:end */
              }
            }
          }
        }
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of node objects with id, type, position, and data'
      },
      propertyHelp: 'Define the initial nodes to display on the canvas. Each node should have an id, type, position {x, y}, and data {label, description}.'
      /* wwEditor:end */
    },
    //#endregion

    //#region Initial Edges
    initialEdges: {
      label: { en: 'Initial Edges' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      options: {
        expandable: true,
        getItemLabel(item) {
          return `${item?.source || '?'} → ${item?.target || '?'}`;
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: crypto.randomUUID(),
            source: '',
            target: '',
            sourceHandle: 'bottom',
            targetHandle: 'top'
          },
          options: {
            item: {
              id: {
                label: { en: 'Edge ID' },
                type: 'Text',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Unique identifier for the edge'
                },
                /* wwEditor:end */
              },
              source: {
                label: { en: 'Source Node ID' },
                type: 'Text',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'ID of the source node'
                },
                /* wwEditor:end */
              },
              target: {
                label: { en: 'Target Node ID' },
                type: 'Text',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'ID of the target node'
                },
                /* wwEditor:end */
              },
              sourceHandle: {
                label: { en: 'Source Handle' },
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'top', label: 'Top' },
                    { value: 'bottom', label: 'Bottom' },
                    { value: 'left', label: 'Left' },
                    { value: 'right', label: 'Right' }
                  ]
                },
                defaultValue: 'bottom',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Handle position on source node'
                },
                /* wwEditor:end */
              },
              targetHandle: {
                label: { en: 'Target Handle' },
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'top', label: 'Top' },
                    { value: 'bottom', label: 'Bottom' },
                    { value: 'left', label: 'Left' },
                    { value: 'right', label: 'Right' }
                  ]
                },
                defaultValue: 'top',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Handle position on target node'
                },
                /* wwEditor:end */
              }
            }
          }
        }
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of edge objects connecting nodes'
      },
      propertyHelp: 'Define the initial edges (connections) between nodes. Each edge should have an id, source node id, and target node id.'
      /* wwEditor:end */
    },
    //#endregion

    //#region Canvas Behavior
    showGrid: {
      label: { en: 'Show Grid' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Toggle grid visibility'
      },
      propertyHelp: 'Enable or disable the background grid on the canvas'
      /* wwEditor:end */
    },

    snapToGrid: {
      label: { en: 'Snap to Grid' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: false,
      bindable: true,
      hidden: content => !content?.showGrid,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Snap nodes to grid when dragging'
      },
      propertyHelp: 'When enabled, nodes will snap to grid intersections when moved'
      /* wwEditor:end */
    },

    enableZoom: {
      label: { en: 'Enable Zoom' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable zoom interaction'
      },
      propertyHelp: 'Allow users to zoom (mouse wheel) the canvas view'
      /* wwEditor:end */
    },

    enablePan: {
      label: { en: 'Enable Pan' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable pan interaction'
      },
      propertyHelp: 'Allow users to pan (drag canvas) the view'
      /* wwEditor:end */
    },

    minZoom: {
      label: { en: 'Minimum Zoom' },
      type: 'Number',
      section: 'settings',
      defaultValue: 0.1,
      min: 0.05,
      max: 1,
      step: 0.05,
      bindable: true,
      hidden: content => !content?.enableZoom,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Minimum zoom level (0.05 - 1.0)'
      },
      /* wwEditor:end */
    },

    maxZoom: {
      label: { en: 'Maximum Zoom' },
      type: 'Number',
      section: 'settings',
      defaultValue: 2,
      min: 1,
      max: 5,
      step: 0.1,
      bindable: true,
      hidden: content => !content?.enableZoom,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Maximum zoom level (1.0 - 5.0)'
      },
      /* wwEditor:end */
    },
    //#endregion

    connectableNodes: {
      label: { en: 'Connectable Nodes' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Allow creating connections between nodes'
      },
      propertyHelp: 'Enable node handles for creating connections between nodes'
      /* wwEditor:end */
    },

    deletableNodes: {
      label: { en: 'Deletable Nodes' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show delete button on nodes'
      },
      propertyHelp: 'Display a delete button on each node for quick removal'
      /* wwEditor:end */
    },

    nodeDropzoneEnabled: {
      label: { en: 'Enable Node Custom Content' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: false,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable custom content dropzone for nodes'
      },
      propertyHelp: 'When enabled, replaces default node cards with custom dropzone content. Handles remain visible for connections.'
      /* wwEditor:end */
    },

    pathType: {
      label: { en: 'Edge Path Type' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'bezier', label: 'Bezier (Curved)' },
          { value: 'straight', label: 'Straight' }
        ]
      },
      defaultValue: 'bezier',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: bezier | straight'
      },
      propertyHelp: 'Choose the visual style for edges connecting nodes'
      /* wwEditor:end */
    },
    //#endregion

    //#region Actions Dropzone Settings
    actionsDropzoneEnabled: {
      label: { en: 'Enable Actions Dropzone' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show actions control dropzone area'
      },
      propertyHelp: 'Display a dropzone area for canvas controls, buttons, and custom actions'
      /* wwEditor:end */
    },

    actionsDropzoneContent: {
      hidden: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of elements to display in actions dropzone'
      },
      /* wwEditor:end */
    },

    actionsDropzoneHeight: {
      label: { en: 'Actions Dropzone Height' },
      type: 'Length',
      section: 'style',
      defaultValue: '80px',
      bindable: true,
      hidden: content => !content?.actionsDropzoneEnabled,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'CSS height value'
      },
      /* wwEditor:end */
    },

    actionsDropzoneBackground: {
      label: { en: 'Actions Dropzone Background' },
      type: 'Color',
      section: 'style',
      defaultValue: '#f5f5f5',
      bindable: true,
      hidden: content => !content?.actionsDropzoneEnabled,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Background color for actions dropzone'
      },
      /* wwEditor:end */
    },
    //#endregion

    //#region Node Dropzone Settings
    nodeDropzoneContent: {
      hidden: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of elements to display inside node dropzone'
      },
      /* wwEditor:end */
    },

    nodeDropzoneBackgroundColor: {
      label: { en: 'Node Dropzone Background' },
      type: 'Color',
      section: 'style',
      defaultValue: 'transparent',
      bindable: true,
      hidden: content => !content?.nodeDropzoneEnabled,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Background color for node custom content'
      },
      /* wwEditor:end */
    },
    //#endregion

    //#region Canvas Styling
    backgroundColor: {
      label: { en: 'Canvas Background' },
      type: 'Color',
      section: 'style',
      defaultValue: '#ffffff',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Background color of the canvas'
      },
      /* wwEditor:end */
    },

    gridColor: {
      label: { en: 'Grid Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#e0e0e0',
      bindable: true,
      hidden: content => !content?.showGrid,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of grid lines'
      },
      /* wwEditor:end */
    },

    gridPattern: {
      label: { en: 'Grid Pattern' },
      type: 'TextSelect',
      section: 'style',
      options: {
        options: [
          { value: 'lines', label: 'Lines (Squared Grid)' },
          { value: 'dots', label: 'Dots (Along Lines)' },
          { value: 'cross', label: 'Cross (Vertices Only)' },
          { value: 'none', label: 'None (Hidden)' }
        ]
      },
      defaultValue: 'lines',
      bindable: true,
      hidden: content => !content?.showGrid,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: lines | dots | cross | none'
      },
      propertyHelp: 'Choose the visual pattern for the background grid'
      /* wwEditor:end */
    },

    gridLayout: {
      label: { en: 'Grid Layout' },
      type: 'TextSelect',
      section: 'style',
      options: {
        options: [
          { value: 'free', label: 'Free (Manual Positioning)' },
          { value: 'tree', label: 'Tree (Hierarchical Auto-Layout)' }
        ]
      },
      defaultValue: 'free',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: free | tree'
      },
      propertyHelp: 'Choose layout mode: Free allows manual positioning, Tree automatically arranges nodes hierarchically based on connections'
      /* wwEditor:end */
    },
    //#endregion

    //#region Node Styling
    nodeBackgroundColor: {
      label: { en: 'Node Background' },
      type: 'Color',
      section: 'style',
      defaultValue: '#f9f9f9',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Background color of nodes'
      },
      /* wwEditor:end */
    },

    nodeBorderColor: {
      label: { en: 'Node Border' },
      type: 'Color',
      section: 'style',
      defaultValue: '#d0d0d0',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Border color of nodes'
      },
      /* wwEditor:end */
    },

    selectedNodeBorderColor: {
      label: { en: 'Selected Node Border Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#007aff',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Border color for selected nodes'
      },
      /* wwEditor:end */
    },

    handleColor: {
      label: { en: 'Handle Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#007aff',
      bindable: true,
      hidden: content => !content?.connectableNodes,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of connection handles'
      },
      /* wwEditor:end */
    },

    handleBorderColor: {
      label: { en: 'Handle Border Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#ffffff',
      bindable: true,
      hidden: content => !content?.connectableNodes,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Border color of connection handles'
      },
      /* wwEditor:end */
    },
    //#endregion

    //#region Edge Styling
    selectedHandleColor: {
      label: { en: 'Selected Handle Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#0066ff',
      bindable: true,
      hidden: content => !content?.connectableNodes,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of handles when selected or active'
      },
      /* wwEditor:end */
    },

    edgeColor: {
      label: { en: 'Edge Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#999999',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of edges connecting nodes'
      },
      /* wwEditor:end */
    },

    selectedEdgeColor: {
      label: { en: 'Selected Edge Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#007aff',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of selected edges'
      },
      /* wwEditor:end */
    },
  },
  //#endregion

  //#region Trigger Events
  triggerEvents: [
    {
      name: 'node-added',
      label: { en: 'On Node Added' },
      event: { node: {} },
      /* wwEditor:start */
      description: 'Triggered when a new node is added to the canvas'
      /* wwEditor:end */
    },
    {
      name: 'node-removed',
      label: { en: 'On Node Removed' },
      event: { nodeId: '' },
      /* wwEditor:start */
      description: 'Triggered when a node is removed from the canvas'
      /* wwEditor:end */
    },
    {
      name: 'node-updated',
      label: { en: 'On Node Updated' },
      event: { nodeId: '', data: {} },
      /* wwEditor:start */
      description: 'Triggered when node data is updated'
      /* wwEditor:end */
    },
    {
      name: 'node-selected',
      label: { en: 'On Node Selected' },
      event: { nodeId: '', node: {} },
      /* wwEditor:start */
      description: 'Triggered when a node is clicked and selected'
      /* wwEditor:end */
    },
    {
      name: 'node-moved',
      label: { en: 'On Node Moved' },
      event: { nodeId: '', position: {} },
      /* wwEditor:start */
      description: 'Triggered when a node is moved to a new position'
      /* wwEditor:end */
    },
    {
      name: 'edge-added',
      label: { en: 'On Edge Added' },
      event: { edge: {} },
      /* wwEditor:start */
      description: 'Triggered when a new edge is created'
      /* wwEditor:end */
    },
    {
      name: 'edge-removed',
      label: { en: 'On Edge Removed' },
      event: { edgeId: '' },
      /* wwEditor:start */
      description: 'Triggered when an edge is removed'
      /* wwEditor:end */
    },
    {
      name: 'edge-selected',
      label: { en: 'On Edge Selected' },
      event: { edgeId: '', edge: {} },
      /* wwEditor:start */
      description: 'Triggered when an edge is clicked and selected'
      /* wwEditor:end */
    },
    {
      name: 'connection-made',
      label: { en: 'On Connection Made' },
      event: { edge: {} },
      /* wwEditor:start */
      description: 'Triggered when a new connection is made between nodes'
      /* wwEditor:end */
    },
    {
      name: 'zoom-changed',
      label: { en: 'On Zoom Changed' },
      event: { zoom: 1, percentage: 100 },
      /* wwEditor:start */
      description: 'Triggered when the zoom level changes'
      /* wwEditor:end */
    },
    {
      name: 'fit-view',
      label: { en: 'On Fit View' },
      event: { zoom: 1 },
      /* wwEditor:start */
      description: 'Triggered when fit view is executed'
      /* wwEditor:end */
    },
    {
      name: 'reset-view',
      label: { en: 'On Reset View' },
      event: {},
      /* wwEditor:start */
      description: 'Triggered when view is reset to default'
      /* wwEditor:end */
    }
  ]
  //#endregion
};

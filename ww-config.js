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
          "gridLayout",
          "enableVignette",
          "vignetteIntensity",
          "vignetteSize"
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
        label: "Selection Actions Menu",
        isCollapsible: true,
        properties: [
          "selectionMenuBackground",
          "selectionMenuBorderColor",
          "selectionMenuOffset",
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
          "handleProximityRadius",
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
        label: "Selection Actions Menu",
        isCollapsible: true,
        properties: [
          "selectionMenuEnabled",
          "selectionMenuMode",
          "actionBehaviorMode",
          "defaultNodeActions",
          "defaultEdgeActions",
        ],
      },
      {
        label: "Actions Panel",
        isCollapsible: true,
        properties: [
          "actionsDropzoneEnabled",
        ],
      },
      {
        label: "Toolbar",
        isCollapsible: true,
        properties: [
          "toolbarEnabled",
          "toolbarPosition",
        ],
      },
      {
        label: "Interactions",
        isCollapsible: true,
        properties: [
          "contextMenuEnabled",
          "doubleClickNodeType",
          "allowNodeResize",
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
          id: 'node-1',
          type: 'default',
          positionX: 250,
          positionY: 100,
          label: 'Start Node',
          description: 'This is the starting point.'
        },
        {
          id: 'node-2',
          type: 'default',
          positionX: 250,
          positionY: 250,
          label: 'Process Node',
          description: 'Processing data.'
        },
        {
          id: 'node-3',
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
            id: 'new-node',
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
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'default', label: 'Flow Node' },
                    { value: 'text', label: 'Text Note' },
                    { value: 'media', label: 'Media' },
                    { value: 'web', label: 'Web Page' }
                  ]
                },
                defaultValue: 'default',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Valid values: default | text | media | web'
                },
                propertyHelp: 'Choose the type of node: Flow (default diagrams), Text (rich notes), Media (images/video), or Web (embedded pages)'
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
              },
              // Text Node Fields
              richTextContent: {
                label: { en: 'Rich Text Content' },
                type: 'LongText',
                defaultValue: '<p>Start typing...</p>',
                hidden: (item) => item?.type !== 'text',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'HTML content for text nodes'
                },
                propertyHelp: 'Rich text content for text note nodes'
                /* wwEditor:end */
              },
              // Media Node Fields
              mediaUrl: {
                label: { en: 'Media URL' },
                type: 'Text',
                defaultValue: '',
                hidden: (item) => item?.type !== 'media',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'URL of the media file'
                },
                propertyHelp: 'URL of the image, video, or PDF to display'
                /* wwEditor:end */
              },
              mediaType: {
                label: { en: 'Media Type' },
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'image', label: 'Image' },
                    { value: 'video', label: 'Video' },
                    { value: 'pdf', label: 'PDF' }
                  ]
                },
                defaultValue: 'image',
                hidden: (item) => item?.type !== 'media',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Valid values: image | video | pdf'
                },
                propertyHelp: 'Type of media to display'
                /* wwEditor:end */
              },
              // Web Node Fields
              webUrl: {
                label: { en: 'Web URL' },
                type: 'Text',
                defaultValue: '',
                hidden: (item) => item?.type !== 'web',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'URL of the web page to embed'
                },
                propertyHelp: 'URL of the web page to display in iframe'
                /* wwEditor:end */
              },
              // Sizing Fields (for all types)
              width: {
                label: { en: 'Node Width' },
                type: 'Length',
                defaultValue: '200px',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'CSS width value'
                },
                propertyHelp: 'Custom width for the node'
                /* wwEditor:end */
              },
              height: {
                label: { en: 'Node Height' },
                type: 'Length',
                defaultValue: '100px',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'CSS height value'
                },
                propertyHelp: 'Custom height for the node'
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
            id: 'new-edge',
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable custom content dropzone for nodes'
      },
      propertyHelp: 'When enabled, replaces default node cards with custom dropzone content. Handles remain visible for connections.'
      /* wwEditor:end */
    },

    //#region Toolbar Configuration
    toolbarEnabled: {
      label: { en: 'Show Toolbar' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      states: true,
      classes: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show/hide the canvas toolbar'
      },
      propertyHelp: 'Display toolbar with buttons to add different node types'
      /* wwEditor:end */
    },

    toolbarPosition: {
      label: { en: 'Toolbar Position' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'top-left', label: 'Top Left' },
          { value: 'top-center', label: 'Top Center' },
          { value: 'top-right', label: 'Top Right' },
          { value: 'bottom-left', label: 'Bottom Left' },
          { value: 'bottom-center', label: 'Bottom Center' },
          { value: 'bottom-right', label: 'Bottom Right' }
        ]
      },
      defaultValue: 'top-left',
      bindable: true,
      states: true,
      classes: true,
      hidden: content => !content?.toolbarEnabled,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: top-left | top-center | top-right | bottom-left | bottom-center | bottom-right'
      },
      propertyHelp: 'Position of the toolbar on the canvas'
      /* wwEditor:end */
    },
    //#endregion

    //#region Interaction Configuration
    contextMenuEnabled: {
      label: { en: 'Enable Context Menu' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      states: true,
      classes: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable right-click context menu'
      },
      propertyHelp: 'Show context menu on right-click for creating nodes'
      /* wwEditor:end */
    },

    doubleClickNodeType: {
      label: { en: 'Double-Click Node Type' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'default', label: 'Flow Node' },
          { value: 'text', label: 'Text Note' },
          { value: 'media', label: 'Media' },
          { value: 'web', label: 'Web Page' }
        ]
      },
      defaultValue: 'default',
      bindable: true,
      states: true,
      classes: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: default | text | media | web'
      },
      propertyHelp: 'Type of node created when double-clicking the canvas'
      /* wwEditor:end */
    },

    allowNodeResize: {
      label: { en: 'Allow Node Resizing' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      states: true,
      classes: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable node resizing handles'
      },
      propertyHelp: 'Allow users to resize nodes by dragging resize handles'
      /* wwEditor:end */
    },
    //#endregion

    pathType: {
      label: { en: 'Edge Path Type' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'bezier', label: 'Bezier (Curved)' },
          { value: 'straight', label: 'Straight' },
          { value: 'step', label: 'Step (Orthogonal)' },
          { value: 'step-smart', label: 'Step Smart (Collision Avoidance)' }
        ]
      },
      defaultValue: 'bezier',
      bindable: true,
      states: true,
      classes: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: bezier | straight | step | step-smart'
      },
      propertyHelp: 'Choose the visual style for edges. Step Smart uses pathfinding to avoid nodes but requires more processing.'
      /* wwEditor:end */
    },
    //#endregion

    //#region Selection Actions Menu Settings
    selectionMenuEnabled: {
      label: { en: 'Enable Selection Menu' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true,
      states: true,
      classes: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show/hide the selection actions menu'
      },
      propertyHelp: 'Display a contextual menu when nodes or edges are selected'
      /* wwEditor:end */
    },

    selectionMenuMode: {
      label: { en: 'Menu Mode' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'default', label: 'Default (Built-in Buttons)' },
          { value: 'custom', label: 'Custom (Dropzones)' }
        ]
      },
      defaultValue: 'default',
      bindable: true,
      states: true,
      classes: true,
      hidden: content => !content?.selectionMenuEnabled,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: default | custom'
      },
      propertyHelp: 'Default shows built-in action buttons, Custom allows dropping your own button components'
      /* wwEditor:end */
    },

    actionBehaviorMode: {
      label: { en: 'Action Behavior' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'builtin', label: 'Built-in Only' },
          { value: 'trigger', label: 'Trigger Event Only' },
          { value: 'both', label: 'Both (Built-in + Trigger)' }
        ]
      },
      defaultValue: 'both',
      bindable: true,
      states: true,
      classes: true,
      hidden: content => !content?.selectionMenuEnabled,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: builtin | trigger | both'
      },
      propertyHelp: 'Control how actions behave: execute built-in logic, emit trigger events, or both'
      /* wwEditor:end */
    },

    defaultNodeActions: {
      label: { en: 'Default Node Actions' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      hidden: content => !content?.selectionMenuEnabled,
      defaultValue: [
        { id: 'edit', label: 'Edit', icon: 'edit', applicableTo: 'node', requiresSingleSelection: true },
        { id: 'duplicate', label: 'Duplicate', icon: 'duplicate', applicableTo: 'node', requiresSingleSelection: false },
        { id: 'delete', label: 'Delete', icon: 'delete', applicableTo: 'node', requiresSingleSelection: false },
        { id: 'lock', label: 'Lock Position', icon: 'lock', applicableTo: 'node', requiresSingleSelection: false },
        { id: 'color', label: 'Change Color', icon: 'color', applicableTo: 'node', requiresSingleSelection: false }
      ],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item?.label || item?.id || 'Action';
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: 'custom-action',
            label: 'Custom Action',
            icon: 'edit',
            applicableTo: 'node',
            requiresSingleSelection: false
          },
          options: {
            item: {
              id: {
                label: { en: 'Action ID' },
                type: 'Text',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Unique identifier for this action'
                },
                /* wwEditor:end */
              },
              label: {
                label: { en: 'Label' },
                type: 'Text',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Display label for the action'
                },
                /* wwEditor:end */
              },
              icon: {
                label: { en: 'Icon' },
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'edit', label: '✎ Edit' },
                    { value: 'delete', label: '🗑 Delete' },
                    { value: 'duplicate', label: '⎘ Duplicate' },
                    { value: 'lock', label: '🔒 Lock' },
                    { value: 'unlock', label: '🔓 Unlock' },
                    { value: 'color', label: '🎨 Color' },
                    { value: 'path-type', label: '↝ Path Type' },
                    { value: 'bring-front', label: '⬆ Bring Front' },
                    { value: 'send-back', label: '⬇ Send Back' },
                    { value: 'group', label: '⊡ Group' },
                    { value: 'ungroup', label: '⊟ Ungroup' }
                  ]
                },
                defaultValue: 'edit',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Icon identifier for the action'
                },
                /* wwEditor:end */
              },
              applicableTo: {
                label: { en: 'Applicable To' },
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'node', label: 'Nodes Only' },
                    { value: 'edge', label: 'Edges Only' },
                    { value: 'both', label: 'Both' }
                  ]
                },
                defaultValue: 'node',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'What this action applies to'
                },
                /* wwEditor:end */
              },
              requiresSingleSelection: {
                label: { en: 'Single Selection Only' },
                type: 'OnOff',
                defaultValue: false,
                /* wwEditor:start */
                bindingValidation: {
                  type: 'boolean',
                  tooltip: 'Action only works with one item selected'
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
        tooltip: 'Array of action objects for nodes'
      },
      propertyHelp: 'Define actions that appear for selected nodes'
      /* wwEditor:end */
    },

    defaultEdgeActions: {
      label: { en: 'Default Edge Actions' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      hidden: content => !content?.selectionMenuEnabled,
      defaultValue: [
        { id: 'path-type', label: 'Change Path', icon: 'path-type', applicableTo: 'edge', requiresSingleSelection: false },
        { id: 'delete', label: 'Delete', icon: 'delete', applicableTo: 'edge', requiresSingleSelection: false }
      ],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item?.label || item?.id || 'Action';
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: 'custom-action',
            label: 'Custom Action',
            icon: 'path-type',
            applicableTo: 'edge',
            requiresSingleSelection: false
          },
          options: {
            item: {
              id: {
                label: { en: 'Action ID' },
                type: 'Text',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Unique identifier for this action'
                },
                /* wwEditor:end */
              },
              label: {
                label: { en: 'Label' },
                type: 'Text',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Display label for the action'
                },
                /* wwEditor:end */
              },
              icon: {
                label: { en: 'Icon' },
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'edit', label: '✎ Edit' },
                    { value: 'delete', label: '🗑 Delete' },
                    { value: 'duplicate', label: '⎘ Duplicate' },
                    { value: 'lock', label: '🔒 Lock' },
                    { value: 'unlock', label: '🔓 Unlock' },
                    { value: 'color', label: '🎨 Color' },
                    { value: 'path-type', label: '↝ Path Type' },
                    { value: 'bring-front', label: '⬆ Bring Front' },
                    { value: 'send-back', label: '⬇ Send Back' }
                  ]
                },
                defaultValue: 'path-type',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'Icon identifier for the action'
                },
                /* wwEditor:end */
              },
              applicableTo: {
                label: { en: 'Applicable To' },
                type: 'TextSelect',
                options: {
                  options: [
                    { value: 'node', label: 'Nodes Only' },
                    { value: 'edge', label: 'Edges Only' },
                    { value: 'both', label: 'Both' }
                  ]
                },
                defaultValue: 'edge',
                /* wwEditor:start */
                bindingValidation: {
                  type: 'string',
                  tooltip: 'What this action applies to'
                },
                /* wwEditor:end */
              },
              requiresSingleSelection: {
                label: { en: 'Single Selection Only' },
                type: 'OnOff',
                defaultValue: false,
                /* wwEditor:start */
                bindingValidation: {
                  type: 'boolean',
                  tooltip: 'Action only works with one item selected'
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
        tooltip: 'Array of action objects for edges'
      },
      propertyHelp: 'Define actions that appear for selected edges'
      /* wwEditor:end */
    },

    actionButtonDropzones: {
      hidden: true,
      defaultValue: {},
      /* wwEditor:start */
      bindingValidation: {
        type: 'object',
        tooltip: 'Dropzones for custom action buttons (custom mode)'
      },
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      defaultValue: 'cross',
      bindable: true,
      states: true,
      classes: true,
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
      states: true,
      classes: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: free | tree'
      },
      propertyHelp: 'Choose layout mode: Free allows manual positioning, Tree automatically arranges nodes hierarchically based on connections'
      /* wwEditor:end */
    },

    enableVignette: {
      label: { en: 'Enable Vignette Effect' },
      type: 'OnOff',
      section: 'style',
      defaultValue: true,
      bindable: true,
      states: true,
      classes: true,
      hidden: content => !content?.showGrid,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Toggle vignette effect on grid'
      },
      propertyHelp: 'Creates an infinite board appearance by fading out the grid pattern towards the edges'
      /* wwEditor:end */
    },

    vignetteIntensity: {
      label: { en: 'Vignette Intensity' },
      type: 'Number',
      section: 'style',
      defaultValue: 70,
      min: 0,
      max: 100,
      step: 1,
      bindable: true,
      states: true,
      classes: true,
      hidden: content => !content?.showGrid || content?.enableVignette === false,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Fade intensity from 0 (subtle) to 100 (strong)'
      },
      propertyHelp: 'Controls how strongly the grid fades at the edges. Higher values create a stronger fade effect.'
      /* wwEditor:end */
    },

    vignetteSize: {
      label: { en: 'Vignette Size' },
      type: 'Number',
      section: 'style',
      defaultValue: 70,
      min: 0,
      max: 100,
      step: 1,
      bindable: true,
      states: true,
      classes: true,
      hidden: content => !content?.showGrid || content?.enableVignette === false,
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Vignette radius from 0% to 100%'
      },
      propertyHelp: 'Controls the size of the vignette effect. Lower values create a smaller visible area (more fade), higher values show more grid.'
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
      hidden: content => !content?.connectableNodes,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Border color of connection handles'
      },
      /* wwEditor:end */
    },

    handleProximityRadius: {
      label: { en: 'Handle Proximity Radius' },
      type: 'Length',
      section: 'settings',
      defaultValue: '20px',
      bindable: true,
      states: true,
      classes: true,
      hidden: content => !content?.connectableNodes,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'CSS length value for handle interaction area'
      },
      propertyHelp: 'Sets the invisible interaction radius around handles. Larger values make it easier to grab handles without pixel-perfect precision. Visual handle size remains 12px.'
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
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
      states: true,
      classes: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of selected edges'
      },
      /* wwEditor:end */
    },

    selectionMenuBackground: {
      label: { en: 'Selection Menu Background' },
      type: 'Color',
      section: 'style',
      defaultValue: '#ffffff',
      bindable: true,
      states: true,
      classes: true,
      hidden: content => !content?.selectionMenuEnabled,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Background color of selection menu'
      },
      /* wwEditor:end */
    },

    selectionMenuBorderColor: {
      label: { en: 'Selection Menu Border' },
      type: 'Color',
      section: 'style',
      defaultValue: '#d0d0d0',
      bindable: true,
      states: true,
      classes: true,
      hidden: content => !content?.selectionMenuEnabled,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Border color of selection menu'
      },
      /* wwEditor:end */
    },

    selectionMenuOffset: {
      label: { en: 'Selection Menu Offset' },
      type: 'Length',
      section: 'style',
      defaultValue: '60px',
      bindable: true,
      states: true,
      classes: true,
      hidden: content => !content?.selectionMenuEnabled,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Distance from selection center'
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
    },
    {
      name: 'action-executed',
      label: { en: 'On Action Executed' },
      event: { actionId: '', action: {}, items: [], allSelected: [] },
      /* wwEditor:start */
      description: 'Triggered when a selection menu action is executed'
      /* wwEditor:end */
    },
    {
      name: 'selection-menu-opened',
      label: { en: 'On Selection Menu Opened' },
      event: { selectedItems: [] },
      /* wwEditor:start */
      description: 'Triggered when selection menu appears'
      /* wwEditor:end */
    },
    {
      name: 'selection-menu-closed',
      label: { en: 'On Selection Menu Closed' },
      event: {},
      /* wwEditor:start */
      description: 'Triggered when selection menu closes'
      /* wwEditor:end */
    },
    {
      name: 'node-type-changed',
      label: { en: 'On Node Type Changed' },
      event: { nodeId: '', oldType: '', newType: '', node: {} },
      /* wwEditor:start */
      description: 'Triggered when a node type is converted'
      /* wwEditor:end */
    },
    {
      name: 'node-content-edited',
      label: { en: 'On Node Content Edited' },
      event: { nodeId: '', content: '', node: {} },
      /* wwEditor:start */
      description: 'Triggered when text node content is edited'
      /* wwEditor:end */
    },
    {
      name: 'media-changed',
      label: { en: 'On Media Changed' },
      event: { nodeId: '', mediaUrl: '', mediaType: '', node: {} },
      /* wwEditor:start */
      description: 'Triggered when media node URL or type is changed'
      /* wwEditor:end */
    },
    {
      name: 'url-changed',
      label: { en: 'On URL Changed' },
      event: { nodeId: '', url: '', node: {} },
      /* wwEditor:start */
      description: 'Triggered when web node URL is changed'
      /* wwEditor:end */
    },
    {
      name: 'node-resized',
      label: { en: 'On Node Resized' },
      event: { nodeId: '', width: '', height: '', node: {} },
      /* wwEditor:start */
      description: 'Triggered when a node is resized'
      /* wwEditor:end */
    },
    {
      name: 'double-click-canvas',
      label: { en: 'On Double-Click Canvas' },
      event: { position: {}, node: {} },
      /* wwEditor:start */
      description: 'Triggered when canvas is double-clicked (node created)'
      /* wwEditor:end */
    },
    {
      name: 'context-menu-opened',
      label: { en: 'On Context Menu Opened' },
      event: { position: {} },
      /* wwEditor:start */
      description: 'Triggered when right-click context menu opens'
      /* wwEditor:end */
    }
  ]
  //#endregion
};

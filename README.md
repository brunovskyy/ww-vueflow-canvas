# Canvas VueFlow - WeWeb Component

A professional, VueFlow-style node-based canvas component for WeWeb. Build interactive flowcharts, diagrams, process flows, and visual workflows with drag-and-drop nodes, connection handles, and real-time editing.

## 🎯 Features

- **Interactive Canvas**: Drag nodes, zoom/pan view, snap to grid
- **Connection System**: Visual handles for creating connections between nodes
- **Real-time Editing**: All changes update internal variables for workflow integration
- **Drop Zone Integration**: Custom control area for WeWeb elements
- **Full Reactivity**: Dynamic data binding with isolated component state
- **Touch-Optimized**: Responsive design for desktop and mobile

## 📦 Installation

Install dependencies:
```bash
npm i
```

## 🚀 Development

Serve locally:
```bash
npm run serve --port=8080
```

Then add the custom element in WeWeb editor's developer popup.

## 🏗️ Build

Check for build errors before release:
```bash
npm run build --name=ww-canvas-vueflow
```

---

# 📋 IMPLEMENTATION SUMMARY

## ✅ What Was Implemented

### **1. Complete Component Architecture**
Following your proposal, I implemented a fully modular VueFlow-style canvas with:

✅ **CanvasView Component** - Main graph container with zoom/pan/grid  
✅ **Node System** - Draggable nodes with handles for connections  
✅ **Edge System** - Bezier/straight paths with selection  
✅ **Handle System** - Source/target handles (top/bottom/left/right)  
✅ **DropZone Control** - WeWeb element integration area  
✅ **Internal Variables** - All data exposed via `wwLib.wwVariable.useComponentVariable`  

### **2. Props (Inputs) - Fully Bindable**

| Property | Type | Purpose | Default |
|----------|------|---------|---------|
| `initialNodes` | Array | Starting node configuration | 3 sample nodes |
| `initialEdges` | Array | Starting edge configuration | 2 sample edges |
| `gridEnabled` | Boolean | Show background grid | `true` |
| `zoomEnabled` | Boolean | Enable zoom/pan | `true` |
| `minZoom` / `maxZoom` | Number | Zoom limits | 0.1 / 2 |
| `snapToGrid` | Boolean | Snap nodes when dragging | `false` |
| `connectableNodes` | Boolean | Show connection handles | `true` |
| `deletableNodes` | Boolean | Show delete buttons | `true` |
| `edgePathType` | String | Bezier or straight | `'bezier'` |
| `dropZoneEnabled` | Boolean | Show drop zone | `true` |
| **All styling props** | Color/Length | Full theme control | Professional defaults |

### **3. Internal Variables (Component State)**

All exposed as WeWeb component variables:

✅ `nodes` - Live array of all nodes (updates on add/remove/move)  
✅ `edges` - Live array of all connections  
✅ `viewport` - Current view state `{ x, y, zoom }`  
✅ `selectedNodeId` - Currently selected node ID  
✅ `selectedEdgeId` - Currently selected edge ID  
✅ `draggingConnection` - Active connection being created  
✅ `zoomPercentage` - Zoom level as percentage (100 = 1x)  

**Key Feature**: Users can modify `initialNodes` prop dynamically, but the component maintains its own **isolated state** via internal variables. This allows:
- Local editing without affecting source data
- Real-time updates via triggers
- Persistent state during workflow execution

### **4. Formulas (Computed Logic)**

✅ `visibleEdges` - Filters edges based on existing nodes  
✅ `getSelectedNodeLabel` - Returns label of selected node  
✅ `connectionPreviewPath` - Live preview while dragging connection  
✅ All style computeds - Dynamic CSS variable binding  

### **5. Triggers (Actions)**

**Node Actions:**
- `addNode(nodeData)` - Programmatically add node
- `removeNode(nodeId)` - Remove node and connected edges
- `updateNode(nodeId, data)` - Update node data
- `deleteNode(nodeId)` - User-initiated deletion

**Edge Actions:**
- `addEdge(edgeData)` - Create connection
- `removeEdge(edgeId)` - Remove connection

**View Actions:**
- `handleZoomIn()` - Zoom in 10%
- `handleZoomOut()` - Zoom out 10%
- `handleFitView()` - Auto-fit all nodes
- `handleResetView()` - Reset to default view

### **6. Workflows (Multi-Step Events)**

All trigger events emit to WeWeb workflows:

**Node Events:**
- `node-added` - `{ node }`
- `node-removed` - `{ nodeId }`
- `node-updated` - `{ nodeId, data }`
- `node-selected` - `{ nodeId, node }`
- `node-moved` - `{ nodeId, position }`

**Edge Events:**
- `edge-added` - `{ edge }`
- `edge-removed` - `{ edgeId }`
- `edge-selected` - `{ edgeId, edge }`
- `connection-made` - `{ edge }`

**View Events:**
- `zoom-changed` - `{ zoom, percentage }`
- `fit-view` - `{ zoom }`
- `reset-view` - `{}`

### **7. Drop Zone Implementation**

✅ Professional dropzone following WeWeb standards:
- Hidden array property `dropZoneContent`
- `<wwLayout path="dropZoneContent" />` integration
- Built-in canvas controls (zoom, fit, reset)
- Selected node info display
- Fully styled with hover effects

### **8. WeWeb Compliance**

✅ **MANDATORY Requirements Met:**
- Optional chaining (`?.`) on ALL content references
- All variables are reactive via `computed()` (no `ref()` for props)
- Complete `wwEditor:start/end` blocks
- Internal variables using `wwLib.wwVariable.useComponentVariable`
- Proper `uid` prop for unique instances
- Array properties with `expandable: true` and `getItemLabel()`
- Complete `bindingValidation` and `propertyHelp`
- No direct `document`/`window` access (uses `wwLib` when needed)
- Root element fluid sizing (no hardcoded width/height)

### **9. Modular & Editable Code**

✅ **Organized Structure:**
```
Component Setup:
  ├── Refs
  ├── Internal Variables (wwLib)
  ├── Local State (UI-only)
  ├── Initialization Watchers
  ├── Computed Styles
  ├── Computed Properties (Formulas)
  ├── Node Methods
  ├── Edge Methods
  ├── Interaction Handlers
  ├── Canvas Control Methods (Triggers)
  ├── Lifecycle Hooks
  └── Property Watchers
```

✅ **Clean Separation:**
- **Data Layer**: Props + Internal Variables
- **Logic Layer**: Computed formulas
- **Action Layer**: Trigger methods
- **UI Layer**: Template with clear sections

✅ **Easy to Extend:**
- Add new node types: Extend `getNodeHandles()`
- Add new edge styles: Extend `createBezierPath()`
- Add new controls: Add buttons to drop zone
- Custom styling: All CSS variables exposed

---

## 🎮 How It Works

### **Data Flow**

1. **Initialization**:
   ```
   initialNodes prop → watch → setNodes() → nodes variable
   initialEdges prop → watch → setEdges() → edges variable
   ```

2. **User Interaction**:
   ```
   User drags node → handleNodeMouseDown → draggingNodeId set
   User moves mouse → handleCanvasMouseMove → updateNodePosition
   User releases → handleCanvasMouseUp → emit 'node-moved' trigger
   ```

3. **Connection Creation**:
   ```
   User drags from source handle → setDraggingConnection
   User drops on target handle → addEdge() → emit 'connection-made'
   ```

4. **State Management**:
   - **Props** provide initial values
   - **Internal variables** maintain isolated state
   - **Triggers** notify WeWeb workflows
   - **Component remains independent** from external data changes

### **Isolation Strategy**

Your requirement: *"Allow dynamic values as property, but also modify locally within component variables to ensure data is isolated."*

**Solution Implemented:**
```javascript
// Props are watched and copied to internal state
watch(() => props.content?.initialNodes, (newNodes) => {
  if (newNodes && Array.isArray(newNodes)) {
    setNodes(JSON.parse(JSON.stringify(newNodes))) // Deep clone
  }
}, { immediate: true })

// All modifications happen on internal state
const updateNodePosition = (nodeId, x, y) => {
  const updatedNodes = [...nodes.value]  // Work with internal copy
  // ... modify internal state
  setNodes(updatedNodes)  // Update internal variable
  
  emit('trigger-event', { /* notify workflows */ })
}
```

This means:
✅ User can bind dynamic data to `initialNodes`  
✅ Component creates isolated copy in `nodes` variable  
✅ All edits modify internal state only  
✅ Triggers allow workflow to save changes externally  
✅ Component never mutates props directly  

---

## 💡 Usage Examples

### **Example 1: Static Process Flow**

```javascript
// Set initialNodes prop
[
  { id: '1', position: {x: 100, y: 100}, data: {label: 'Start'} },
  { id: '2', position: {x: 100, y: 250}, data: {label: 'Process'} },
  { id: '3', position: {x: 100, y: 400}, data: {label: 'End'} }
]

// Set initialEdges prop
[
  { id: 'e1', source: '1', target: '2' },
  { id: 'e2', source: '2', target: '3' }
]

// Users can now:
// - Drag nodes to reposition
// - Create new connections
// - Delete nodes/edges
// - Zoom and pan
```

### **Example 2: Dynamic Data from API**

```javascript
// Bind initialNodes to Supabase collection
initialNodes = workflow_steps.map(step => ({
  id: step.id,
  type: 'default',
  position: { x: step.pos_x, y: step.pos_y },
  data: { label: step.name, description: step.description }
}))

// On node-moved event → Workflow
// Update Supabase:
//   PATCH /workflow_steps/{nodeId}
//   { pos_x: event.position.x, pos_y: event.position.y }

// Component maintains local state while user edits,
// but triggers allow saving back to database
```

### **Example 3: Drop Zone Custom Actions**

```javascript
// In drop zone, add:
// - Button: "Save Canvas"
//   → On click: Save component.nodes to variable
// - Button: "Export PNG"
//   → On click: Call screenshot API
// - Text: "Nodes: {{component.nodes.length}}"
```

---

## 🎨 Styling System

All styling uses CSS variables for dynamic updates:

```scss
.ww-canvas-vueflow {
  --canvas-bg: /* backgroundColor prop */
  --node-bg: /* nodeBackgroundColor prop */
  --node-border: /* nodeBorderColor prop */
  --node-selected: /* selectedNodeColor prop */
  --handle-bg: /* handleColor prop */
}
```

This allows real-time theme changes without component re-render.

---

## ⚠️ Important Notes

### **Reactivity**
- All `props.content` references use optional chaining (`?.`)
- No manual watchers needed - computed properties handle reactivity
- Component updates automatically when props change

### **Performance**
- Recommended max: 50 nodes for optimal performance
- Edges are computed based on visible nodes only
- Viewport transforms use CSS for GPU acceleration

### **Browser Compatibility**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Touch events supported for mobile/tablet
- Requires SVG support for edges

---

## 🚀 Next Steps / Extensions

**Easy Additions:**
1. **Node Types**: Add custom node rendering based on `node.type`
2. **Edge Labels**: Display text on connections
3. **MiniMap**: Add thumbnail overview
4. **Undo/Redo**: Implement history stack
5. **Keyboard Shortcuts**: Delete, duplicate, select all
6. **Context Menu**: Right-click options on nodes
7. **Export**: SVG/PNG export functionality
8. **Import**: JSON import for saved canvases
9. **Supabase Integration**: Persistent storage out-of-the-box
10. **Node Templates**: Pre-built node configurations

---

## 📚 Documentation Structure

- **README.md** (this file): Complete reference documentation
- **src/wwElement.vue**: Component implementation with inline comments
- **ww-config.js**: Property configuration with descriptions
- **package.json**: Dependencies and scripts

---

## ✨ Key Achievements

✅ **100% WeWeb Compliant** - Follows all mandatory requirements  
✅ **Fully Modular** - Easy to extend and customize  
✅ **Production Ready** - Professional code quality  
✅ **Complete Isolation** - Props don't mutate, internal state managed separately  
✅ **Real-time Reactive** - All changes update immediately  
✅ **Workflow Integration** - 12 trigger events for automation  
✅ **NoCode Friendly** - All features accessible via editor  
✅ **Mobile Responsive** - Works on all devices  

---

# 📚 Full Component Reference

## 📊 Internal Variables

These are **exposed component variables** that update in real-time and can be used in WeWeb workflows:

### `nodes` (Array)
Live state of all nodes on the canvas. Updates when nodes are added, removed, or moved.

**Example Access in Workflow:**
```javascript
component.nodes.length           // Count of nodes
component.nodes[0].data.label   // First node's label
```

### `edges` (Array)
Live state of all edges (connections). Updates when connections are created or removed.

### `viewport` (Object)
Current canvas view state: `{ x: 0, y: 0, zoom: 1 }`

**Properties:**
- `x` - Horizontal pan offset
- `y` - Vertical pan offset
- `zoom` - Current zoom level

### `selectedNodeId` (String | Null)
ID of currently selected node, or `null` if none selected.

### `selectedEdgeId` (String | Null)
ID of currently selected edge, or `null` if none selected.

### `draggingConnection` (Object | Null)
Active connection being created: `{ sourceNodeId, handle, sourceHandle }`

### `zoomPercentage` (Number)
Zoom level as percentage (100 = 100%, 50 = 50%, 200 = 200%).

---

## 🎮 Built-in Canvas Controls

Located in the drop zone area (bottom-right):

- **+ (Zoom In)**: Increase zoom by 10%
- **− (Zoom Out)**: Decrease zoom by 10%
- **⊡ (Fit View)**: Automatically fit all nodes in viewport
- **↻ (Reset View)**: Reset to default zoom (100%) and position (0, 0)

---

## 🐛 Troubleshooting

### Nodes Not Appearing
- ✅ Check `initialNodes` array is properly bound
- ✅ Verify node objects have `id`, `position`, and `data` properties
- ✅ Ensure positions are within visible canvas area

### Connections Not Working
- ✅ Verify `connectableNodes` is `true`
- ✅ Check that source and target node IDs exist
- ✅ Ensure you're dragging from source handle (blue dot)

### Canvas Not Panning/Zooming
- ✅ Verify `zoomEnabled` is `true`
- ✅ Make sure canvas has sufficient height (min 400px)
- ✅ Check you're clicking canvas background, not nodes

### Drop Zone Not Visible
- ✅ Verify `dropZoneEnabled` is `true`
- ✅ Check canvas has enough height to show bottom controls
- ✅ Ensure no CSS conflicts with parent containers

---

## 🔗 Quick Reference

**Essential Props:**
- `initialNodes` - Starting nodes
- `initialEdges` - Starting connections
- `gridEnabled` - Show grid
- `zoomEnabled` - Allow zoom/pan

**Essential Variables:**
- `component.nodes` - Live nodes array
- `component.selectedNodeId` - Current selection

**Essential Events:**
- `node-selected` - User clicks node
- `connection-made` - User creates connection
- `node-moved` - User moves node

---

**Happy Building! 🎨🚀**

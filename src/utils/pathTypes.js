/**
 * Path Type Utilities for VueFlow Canvas
 * Contains all edge path calculation algorithms
 */

//#region Straight Path
/**
 * Create a straight line path between two points
 * @param {Object} source - { x, y }
 * @param {Object} target - { x, y }
 * @returns {string} SVG path string
 */
export const createStraightPath = (source, target) => {
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
};
//#endregion

//#region Bezier Path
/**
 * Create a smooth Bezier curve path between two points
 * @param {Object} source - { x, y }
 * @param {Object} target - { x, y }
 * @returns {string} SVG path string
 */
export const createBezierPath = (source, target) => {
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

//#region Step Path (Simple Orthogonal)
/**
 * Create an orthogonal (right-angle) path between two points
 * Simple version without collision detection
 * @param {Object} source - { x, y }
 * @param {Object} target - { x, y }
 * @returns {string} SVG path string
 */
export const createStepPath = (source, target) => {
  const midY = source.y + (target.y - source.y) / 2;
  
  return `M ${source.x} ${source.y} 
          L ${source.x} ${midY} 
          L ${target.x} ${midY} 
          L ${target.x} ${target.y}`;
};
//#endregion

//#region Step Path with Smart Routing (A* Pathfinding)

/**
 * Grid-based pathfinding node for A* algorithm
 */
class GridNode {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.g = 0; // Cost from start
    this.h = 0; // Heuristic cost to end
    this.f = 0; // Total cost (g + h)
    this.parent = null;
    this.walkable = true;
  }
}

/**
 * Create a grid for pathfinding
 * @param {Array} nodes - Array of canvas nodes to avoid
 * @param {Object} bounds - { minX, maxX, minY, maxY }
 * @param {number} gridSize - Size of each grid cell
 * @returns {Array<Array<GridNode>>} 2D grid array
 */
const createPathfindingGrid = (nodes, bounds, gridSize = 20) => {
  const cols = Math.ceil((bounds.maxX - bounds.minX) / gridSize);
  const rows = Math.ceil((bounds.maxY - bounds.minY) / gridSize);
  
  const grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = new GridNode(x, y);
    }
  }
  
  // Mark nodes as obstacles
  nodes.forEach(node => {
    const nodeX = node?.position?.x || 0;
    const nodeY = node?.position?.y || 0;
    
    // Node collision bounds (with padding)
    const nodePadding = 80; // Extra space around nodes
    const nodeWidth = 120 + nodePadding * 2;
    const nodeHeight = 60 + nodePadding * 2;
    
    const startGridX = Math.floor((nodeX - nodeWidth / 2 - bounds.minX) / gridSize);
    const endGridX = Math.ceil((nodeX + nodeWidth / 2 - bounds.minX) / gridSize);
    const startGridY = Math.floor((nodeY - nodeHeight / 2 - bounds.minY) / gridSize);
    const endGridY = Math.ceil((nodeY + nodeHeight / 2 - bounds.minY) / gridSize);
    
    // Mark grid cells as non-walkable
    for (let y = startGridY; y <= endGridY; y++) {
      for (let x = startGridX; x <= endGridX; x++) {
        if (y >= 0 && y < rows && x >= 0 && x < cols) {
          grid[y][x].walkable = false;
        }
      }
    }
  });
  
  return grid;
};

/**
 * Manhattan distance heuristic for A*
 */
const heuristic = (nodeA, nodeB) => {
  return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
};

/**
 * Get neighboring grid nodes (4-directional: up, down, left, right)
 */
const getNeighbors = (grid, node) => {
  const neighbors = [];
  const { x, y } = node;
  
  // Up
  if (y > 0) neighbors.push(grid[y - 1][x]);
  // Down
  if (y < grid.length - 1) neighbors.push(grid[y + 1][x]);
  // Left
  if (x > 0) neighbors.push(grid[y][x - 1]);
  // Right
  if (x < grid[0].length - 1) neighbors.push(grid[y][x + 1]);
  
  return neighbors.filter(n => n.walkable);
};

/**
 * A* pathfinding algorithm
 * @param {Array<Array<GridNode>>} grid - Pathfinding grid
 * @param {GridNode} start - Start node
 * @param {GridNode} end - End node
 * @returns {Array<GridNode>} Path from start to end
 */
const aStar = (grid, start, end) => {
  const openList = [start];
  const closedList = [];
  
  start.g = 0;
  start.h = heuristic(start, end);
  start.f = start.h;
  
  while (openList.length > 0) {
    // Find node with lowest f score
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    const current = openList[currentIndex];
    
    // Reached goal
    if (current.x === end.x && current.y === end.y) {
      const path = [];
      let temp = current;
      while (temp) {
        path.push(temp);
        temp = temp.parent;
      }
      return path.reverse();
    }
    
    // Move current from open to closed
    openList.splice(currentIndex, 1);
    closedList.push(current);
    
    // Check neighbors
    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      if (closedList.includes(neighbor)) continue;
      
      const gScore = current.g + 1;
      const gScoreIsBest = !openList.includes(neighbor) || gScore < neighbor.g;
      
      if (gScoreIsBest) {
        neighbor.parent = current;
        neighbor.g = gScore;
        neighbor.h = heuristic(neighbor, end);
        neighbor.f = neighbor.g + neighbor.h;
        
        if (!openList.includes(neighbor)) {
          openList.push(neighbor);
        }
      }
    }
  }
  
  // No path found - return straight line approximation
  return [start, end];
};

/**
 * Simplify path by removing unnecessary intermediate points
 * Only keeps points where direction changes
 */
const simplifyPath = (path) => {
  if (path.length <= 2) return path;
  
  const simplified = [path[0]];
  
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];
    
    // Check if direction changed
    const dirX1 = current.x - prev.x;
    const dirY1 = current.y - prev.y;
    const dirX2 = next.x - current.x;
    const dirY2 = next.y - current.y;
    
    // Only keep point if direction changed
    if (dirX1 !== dirX2 || dirY1 !== dirY2) {
      simplified.push(current);
    }
  }
  
  simplified.push(path[path.length - 1]);
  return simplified;
};

/**
 * Create a step path with smart routing and collision avoidance
 * Uses A* pathfinding to route around nodes
 * @param {Object} source - { x, y }
 * @param {Object} target - { x, y }
 * @param {Array} allNodes - Array of all nodes on canvas
 * @param {Object} options - { gridSize: number }
 * @returns {string} SVG path string
 */
export const createStepSmartPath = (source, target, allNodes = [], options = {}) => {
  const gridSize = options.gridSize || 20;
  
  // If no nodes to avoid, use simple step path
  if (!allNodes || allNodes.length === 0) {
    return createStepPath(source, target);
  }
  
  // Calculate bounds with padding
  const padding = 200;
  const allX = [source.x, target.x, ...allNodes.map(n => n?.position?.x || 0)];
  const allY = [source.y, target.y, ...allNodes.map(n => n?.position?.y || 0)];
  
  const bounds = {
    minX: Math.min(...allX) - padding,
    maxX: Math.max(...allX) + padding,
    minY: Math.min(...allY) - padding,
    maxY: Math.max(...allY) + padding,
  };
  
  // Create pathfinding grid
  const grid = createPathfindingGrid(allNodes, bounds, gridSize);
  
  // Convert source/target to grid coordinates
  const startX = Math.floor((source.x - bounds.minX) / gridSize);
  const startY = Math.floor((source.y - bounds.minY) / gridSize);
  const endX = Math.floor((target.x - bounds.minX) / gridSize);
  const endY = Math.floor((target.y - bounds.minY) / gridSize);
  
  // Clamp to grid bounds
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const safeStartX = clamp(startX, 0, grid[0].length - 1);
  const safeStartY = clamp(startY, 0, grid.length - 1);
  const safeEndX = clamp(endX, 0, grid[0].length - 1);
  const safeEndY = clamp(endY, 0, grid.length - 1);
  
  // Find start/end nodes - if blocked, find nearest walkable
  const findNearestWalkable = (x, y, maxRadius = 5) => {
    if (grid[y][x].walkable) return grid[y][x];
    
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
            if (grid[ny][nx].walkable) {
              return grid[ny][nx];
            }
          }
        }
      }
    }
    return grid[y][x]; // Return original if no walkable found
  };
  
  const startNode = findNearestWalkable(safeStartX, safeStartY);
  const endNode = findNearestWalkable(safeEndX, safeEndY);
  
  // Run A* pathfinding
  const path = aStar(grid, startNode, endNode);
  
  // Simplify path
  const simplifiedPath = simplifyPath(path);
  
  // Convert grid path back to canvas coordinates
  const canvasPath = simplifiedPath.map(node => ({
    x: node.x * gridSize + bounds.minX,
    y: node.y * gridSize + bounds.minY,
  }));
  
  // Ensure start and end match exactly
  canvasPath[0] = source;
  canvasPath[canvasPath.length - 1] = target;
  
  // Create SVG path with slight corner rounding
  if (canvasPath.length === 2) {
    return createStraightPath(source, target);
  }
  
  let pathString = `M ${canvasPath[0].x} ${canvasPath[0].y}`;
  
  for (let i = 1; i < canvasPath.length; i++) {
    pathString += ` L ${canvasPath[i].x} ${canvasPath[i].y}`;
  }
  
  return pathString;
};
//#endregion

//#region Path Type Router
/**
 * Get the appropriate path based on type
 * @param {string} pathType - 'straight' | 'bezier' | 'step' | 'step-smart'
 * @param {Object} source - { x, y }
 * @param {Object} target - { x, y }
 * @param {Array} allNodes - Array of all nodes (for step-smart)
 * @returns {string} SVG path string
 */
export const getPath = (pathType, source, target, allNodes = []) => {
  switch (pathType) {
    case 'straight':
      return createStraightPath(source, target);
    case 'bezier':
      return createBezierPath(source, target);
    case 'step':
      return createStepPath(source, target);
    case 'step-smart':
      return createStepSmartPath(source, target, allNodes);
    default:
      return createBezierPath(source, target);
  }
};
//#endregion

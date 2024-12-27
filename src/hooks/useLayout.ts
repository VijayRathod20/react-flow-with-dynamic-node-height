import { useEffect, useRef } from "react";
import {
  useReactFlow,
  useStore,
  Node,
  Edge,
  ReactFlowState,
  Position,
} from "reactflow";
import { timer } from "d3-timer";
import dagre from "dagre";

const nodeWidth = 210;
const nodeHeight = 100;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) => {
  const dagreGraph = new dagre.graphlib.Graph();

  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((el) => {
    dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((el) => {
    dagreGraph.setEdge(el.source, el.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((el) => {
    const nodeWithPosition = dagreGraph.node(el.id);
    el.targetPosition = isHorizontal ? Position.Left : Position.Bottom;
    el.sourcePosition = isHorizontal ? Position.Right : Position.Top;

    // unfortunately we need this little hack to pass a slighltiy different position
    // to notify react flow about the change. More over we are shifting the dagre node position
    // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
    el.position = {
      x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return el;
  });

  const newEdges = edges.map((edge) => {
    return {
      ...edge,
      sourceHandle: direction === "TB" ? Position.Bottom : Position.Right,
      targetHandle: direction === "TB" ? Position.Top : Position.Left,
    };
  });
  return { newNodes, newEdges };
};

const options = { duration: 300 };

// this is the store selector that is used for triggering the layout, this returns the number of nodes once they change
const nodeCountSelector = (state: ReactFlowState) => state.nodeInternals.size;

function useLayout(direction: "TB" | "LR") {
  // this ref is used to fit the nodes in the first run
  // after first run, this is set to false
  const initial = useRef(true);

  // we are using nodeCount as the trigger for the re-layouting
  // whenever the nodes length changes, we calculate the new layout
  const nodeCount = useStore(nodeCountSelector);

  const { getNodes, getNode, setNodes, setEdges, getEdges, fitView } =
    useReactFlow();

  useEffect(() => {
    // get the current nodes and edges
    const nodes = getNodes();
    const edges = getEdges();

    // run the layout and get back the nodes with their updated positions
    const { newEdges, newNodes } = getLayoutedElements(nodes, edges, direction);

    // if you do not want to animate the nodes, you can uncomment the following line
    // return setNodes(targetNodes);
    setEdges(newEdges);

    // to interpolate and animate the new positions, we create objects that contain the current and target position of each node
    const transitions = newNodes.map((node) => {
      return {
        id: node.id,
        // this is where the node currently is placed
        from: getNode(node.id)?.position || node.position,
        // this is where we want the node to be placed
        to: node.position,
        node,
      };
    });

    // create a timer to animate the nodes to their new positions
    const t = timer((elapsed: number) => {
      const s = elapsed / options.duration;

      const currNodes = transitions.map(({ node, from, to }) => {
        return {
          id: node.id,
          position: {
            // simple linear interpolation
            x: from.x + (to.x - from.x) * s,
            y: from.y + (to.y - from.y) * s,
          },
          data: { ...node.data },
          type: node.type,
        };
      });

      setNodes(currNodes);

      // this is the final step of the animation
      if (elapsed > options.duration) {
        // we are moving the nodes to their destination
        // this needs to happen to avoid glitches
        const finalNodes = transitions.map(({ node, to }) => {
          return {
            id: node.id,
            position: {
              x: to.x,
              y: to.y,
            },
            data: { ...node.data },
            type: node.type,
          };
        });

        setNodes(finalNodes);

        // stop the animation
        t.stop();

        // in the first run, fit the view
        if (!initial.current) {
          fitView({ duration: 200, padding: 0.2 });
        }
        initial.current = false;
      }
    });

    return () => {
      t.stop();
    };
  }, [
    nodeCount,
    getEdges,
    getNodes,
    getNode,
    setNodes,
    fitView,
    setEdges,
    direction,
  ]);
}

export default useLayout;

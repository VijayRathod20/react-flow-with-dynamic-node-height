import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import cx from "classnames";

import styles from "./NodeTypes.module.css";
import usePlaceholderClick from "../hooks/usePlaceholderClick";

const PlaceholderNode = ({ id, data }: NodeProps) => {
  // see the hook implementation for details of the click handler
  // calling onClick turns this node and the connecting edge into a workflow node
  const onClick = usePlaceholderClick(id);

  const nodeClasses = cx(styles.node, styles.placeholder);

  return (
    <div onClick={onClick} className={nodeClasses} title="click to add a node">
      {data.label}
      <Handle
        id="top"
        className={styles.handle}
        type="target"
        position={Position.Top}
        isConnectable={false}
      />
      <Handle
        id="bottom"
        className={styles.handle}
        type="source"
        position={Position.Bottom}
        isConnectable={false}
      />
      <Handle
        id="right"
        className={styles.handle}
        type="source"
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        id="left"
        className={styles.handle}
        type="target"
        position={Position.Left}
        isConnectable={false}
      />
    </div>
  );
};

export default memo(PlaceholderNode);

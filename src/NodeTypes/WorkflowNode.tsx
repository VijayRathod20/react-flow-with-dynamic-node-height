import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import cx from "classnames";

import styles from "./NodeTypes.module.css";
import useNodeClickHandler from "../hooks/useNodeClick";

const WorkflowNode = ({ id, data }: NodeProps) => {
  // see the hook implementation for details of the click handler
  // calling onClick adds a child node to this node
  const onClick = useNodeClickHandler(id);

  return (
    <div
      onClick={onClick}
      className={cx(styles.node)}
      title="click to add a child node"
    >
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

export default memo(WorkflowNode);

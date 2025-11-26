import React from 'react';
import '../styles/ResourceList.css';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

interface ResourceHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  headingLevel?: HeadingLevel;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ResourceHeader: React.FC<ResourceHeaderProps> = ({
  title,
  actionLabel,
  onAction,
  headingLevel = 'h1',
  style,
  children,
}) => {
  const HeadingTag = headingLevel as keyof JSX.IntrinsicElements;
  const showActions = Boolean(children || (actionLabel && onAction));

  return (
    <div className="resource-header" style={style}>
      <HeadingTag>{title}</HeadingTag>
      {showActions && (
        <div className="resource-header-actions">
          {children}
          {actionLabel && onAction && (
            <button className="btn-primary" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

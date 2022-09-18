import React from 'react';

const IconLoading: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg viewBox="0 0 120 120" width="1em" height="1em" {...props}>
      <defs>
        <line
          id="l"
          x1="60"
          x2="60"
          y1="7"
          y2="27"
          stroke="currentColor"
          strokeWidth="11"
          strokeLinecap="round"
        />
      </defs>
      <g>
        <use xlinkHref="#l" opacity=".27" />
        <use xlinkHref="#l" opacity=".27" transform="rotate(30 60,60)" />
        <use xlinkHref="#l" opacity=".27" transform="rotate(60 60,60)" />
        <use xlinkHref="#l" opacity=".27" transform="rotate(90 60,60)" />
        <use xlinkHref="#l" opacity=".27" transform="rotate(120 60,60)" />
        <use xlinkHref="#l" opacity=".27" transform="rotate(150 60,60)" />
        <use xlinkHref="#l" opacity=".37" transform="rotate(180 60,60)" />
        <use xlinkHref="#l" opacity=".46" transform="rotate(210 60,60)" />
        <use xlinkHref="#l" opacity=".56" transform="rotate(240 60,60)" />
        <use xlinkHref="#l" opacity=".66" transform="rotate(270 60,60)" />
        <use xlinkHref="#l" opacity=".75" transform="rotate(300 60,60)" />
        <use xlinkHref="#l" opacity=".85" transform="rotate(330 60,60)" />
      </g>
    </svg>
  );
};

export default IconLoading;

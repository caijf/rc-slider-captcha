import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('<Foo />', () => {
  it('render Foo with dumi', () => {
    const msg = 'dumi';

    render(<div>{msg}</div>);
    expect(screen.queryByText(msg)).toBeInTheDocument();
  });
});

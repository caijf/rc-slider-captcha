import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Foo from '../src';

describe('<Foo />', () => {
  it('render Foo with dumi', () => {
    const msg = 'dumi';

    render(<div>{msg}</div>);
    expect(screen.queryByText(msg)).toBeInTheDocument();
  });
});

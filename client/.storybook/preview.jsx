/** @type { import('@storybook/react-vite').Preview } */
import '../src/index.css';
import '../src/App.css';

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "todo"
    }
  },
};

export default preview;
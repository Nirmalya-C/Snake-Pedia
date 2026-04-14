# Contributing to Snake-Pedia

Thank you for your interest in contributing to Snake-Pedia! This document provides guidelines for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Snake-Pedia.git
   cd Snake-Pedia
   ```
3. **Open the project** in your browser:
   ```bash
   python -m http.server 8080
   # Visit http://localhost:8080
   ```
   Or simply open `index.html` directly in your browser.

## How to Contribute

### Reporting Bugs

Before submitting a bug report:
- Check if the issue has already been reported
- Test with the latest version from the main branch
- Gather relevant information (browser version, OS, steps to reproduce)

Submit bug reports via [GitHub Issues](https://github.com/Nirmalya-C/Snake-Pedia/issues) with:
- Clear, descriptive title
- Detailed description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:
- Use a clear, descriptive title
- Provide detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include mockups or examples if applicable

### Code Contributions

1. **Check existing issues** or create a new one to discuss your idea
2. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our development guidelines
4. **Test thoroughly** in multiple browsers
5. **Commit your changes** with clear, descriptive messages
6. **Push to your fork** and submit a pull request

## Development Guidelines

### Code Style

**HTML:**
- Use semantic HTML5 elements
- Maintain consistent indentation (4 spaces)
- Include appropriate ARIA labels for accessibility
- Keep markup clean and readable

**CSS:**
- Use CSS custom properties for theming
- Follow BEM or semantic class naming
- Keep selectors specific but not overly complex
- Maintain mobile-first responsive design
- Group related styles together

**JavaScript:**
- Use ES6+ features
- Follow consistent naming conventions:
  - `camelCase` for variables and functions
  - `UPPER_CASE` for constants
- Add comments for complex logic
- Keep functions small and focused
- Avoid global scope pollution

### Project Structure

The project follows this structure:
```
.
├── index.html          # Entry point
├── assets/
│   ├── css/
│   │   └── style.css   # All styling
│   └── js/
│       └── game.js     # Game logic
├── .github/
│   └── workflows/
│       └── pages.yml   # GitHub Pages deployment
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── LICENSE
```

### Testing

Since this is a static web application:
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on different screen sizes (mobile, tablet, desktop)
- Verify keyboard controls work correctly
- Check for console errors
- Ensure game logic behaves as expected

### Accessibility

- Maintain keyboard navigation support
- Use semantic HTML
- Include appropriate ARIA labels
- Ensure sufficient color contrast
- Test with screen readers when possible

## Pull Request Process

1. **Update documentation** if you've made changes that affect it
2. **Test your changes** thoroughly
3. **Ensure your code follows** the project's style guidelines
4. **Write a clear PR description** that includes:
   - What changes you made
   - Why you made them
   - How to test them
   - Screenshots/GIFs for visual changes
5. **Link to related issues** using keywords like "Fixes #123"
6. **Be responsive** to feedback and questions

### PR Review Process

- Maintainers will review your PR as soon as possible
- Address any requested changes
- Once approved, a maintainer will merge your PR
- Your contribution will be included in the next release

## Questions?

Feel free to ask questions by:
- Opening an issue with the "question" label
- Reaching out to the maintainers

Thank you for contributing to Snake-Pedia! 🐍

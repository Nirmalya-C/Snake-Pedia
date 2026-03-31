# Contributing to Snake-Pedia

Thank you for your interest in contributing to Snake-Pedia! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- Use the bug report template
- Describe the exact steps to reproduce the problem
- Provide specific examples
- Describe the behavior you observed and what you expected to see
- Include browser version and operating system information

### Suggesting Features

Feature suggestions are welcome! Please:

- Use the feature request template
- Provide a clear description of the feature
- Explain why this feature would be useful
- Consider how it fits with the project's goals

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the code style guidelines
3. **Test your changes** thoroughly in multiple browsers
4. **Update documentation** if you're changing functionality
5. **Submit a pull request** using the provided template

## Development Guidelines

### Project Structure

```
Snake-Pedia/
├── assets/
│   ├── css/
│   │   └── style.css    # All styling and theming
│   └── js/
│       └── game.js      # Game logic and rendering
└── index.html           # Main HTML file
```

### Code Style

#### JavaScript

- Use `const` and `let` instead of `var`
- Use meaningful variable names (e.g., `playerScore` not `ps`)
- Add JSDoc comments for functions
- Keep functions small and focused on a single task
- Use ES6+ features where appropriate

**Example:**
```javascript
/**
 * Spawns food at a random unoccupied position on the game board
 * @param {Array<{x: number, y: number}>} occupiedSegments - All snake segments
 */
function spawnFood(occupiedSegments) {
    // Implementation
}
```

#### CSS

- Use CSS custom properties (variables) for colors and repeated values
- Follow the existing naming convention (kebab-case)
- Group related properties together
- Add comments for complex styling sections

#### HTML

- Use semantic HTML elements
- Include proper accessibility attributes (ARIA labels, alt text)
- Keep the structure clean and well-indented

### Testing Your Changes

Since this is a pure HTML/CSS/JS project with no build system, testing is straightforward:

1. **Open `index.html` in your browser** (or use a local server)
2. **Test all game functionality:**
   - Player controls (WASD and Arrow keys)
   - AI behavior
   - Score tracking
   - Food spawning
   - Wrap-around at board edges
3. **Test in multiple browsers:**
   - Chrome/Edge (Chromium)
   - Firefox
   - Safari (if available)
4. **Test on mobile devices** if your changes affect responsive behavior

### Local Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/Snake-Pedia.git
cd Snake-Pedia

# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Start a local server (optional but recommended)
python -m http.server 8080
# or
npx serve

# Open http://localhost:8080 in your browser
```

### Commit Messages

Write clear and meaningful commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests where appropriate

**Examples:**
```
Add pause functionality to game loop
Fix AI pathfinding bug when food spawns in corner
Update README with installation instructions
```

### Branch Naming

Use descriptive branch names:

- `feature/` - New features (e.g., `feature/pause-button`)
- `fix/` - Bug fixes (e.g., `fix/collision-detection`)
- `docs/` - Documentation updates (e.g., `docs/contributing-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/game-state`)

## What to Work On

Check the [Issues](https://github.com/Nirmalya-C/Snake-Pedia/issues) page for:

- Issues labeled `good first issue` - Great for newcomers
- Issues labeled `help wanted` - We'd love your input
- Issues labeled `bug` - Help us fix problems
- Issues labeled `enhancement` - Help us add new features

## Questions?

Feel free to:

- Open a [Discussion](https://github.com/Nirmalya-C/Snake-Pedia/discussions)
- Comment on existing issues
- Reach out to the maintainers

## Recognition

Contributors will be recognized in the project. Thank you for making Snake-Pedia better!

---

**Happy Contributing! 🐍🎮**

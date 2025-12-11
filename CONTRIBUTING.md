# 🤝 Contributing to Forsale AI

Thank you for your interest in contributing to Forsale AI! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Be collaborative and constructive
- Focus on what is best for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unethical or unprofessional conduct

---

## 🚀 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

1. **Clear title** describing the problem
2. **Steps to reproduce** the bug
3. **Expected behavior** vs actual behavior
4. **Screenshots** if applicable
5. **Environment details** (OS, browser, Pi Browser version)

### Suggesting Features

For feature requests:

1. Check if the feature already exists
2. Explain **why** this feature would be useful
3. Provide **examples** of how it would work
4. Consider **implementation** details

### Contributing Code

1. **Fork** the repository
2. **Create a branch** (`git checkout -b feature/AmazingFeature`)
3. **Make your changes**
4. **Test** thoroughly
5. **Commit** (`git commit -m 'Add AmazingFeature'`)
6. **Push** (`git push origin feature/AmazingFeature`)
7. **Open a Pull Request**

---

## 💻 Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Pi Browser (for testing)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/forsale-ai.git
cd forsale-ai

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/forsale-ai.git

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your Pi API key

# Start development server
npm run dev
```

### Project Structure

```
forsale-ai/
├── index.html          # Frontend UI
├── style.css           # Styles
├── script.js           # Frontend Logic
├── server.js           # Backend API
├── package.json        # Dependencies
└── README.md           # Documentation
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No merge conflicts
- [ ] Commits are clean and descriptive

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this?

## Screenshots
If applicable

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Review Process

1. Automated tests will run
2. Maintainer will review code
3. Address any feedback
4. Once approved, PR will be merged

---

## 📝 Coding Standards

### JavaScript

```javascript
// Use meaningful variable names
const productPrice = 100; // ✅ Good
const x = 100; // ❌ Bad

// Use camelCase
const userName = 'John'; // ✅ Good
const user_name = 'John'; // ❌ Bad

// Add comments for complex logic
// Calculate AI score based on multiple factors
const aiScore = (quality * 0.4) + (price * 0.3) + (demand * 0.3);

// Use async/await instead of callbacks
async function fetchData() {
    const response = await fetch(url);
    return response.json();
}

// Handle errors properly
try {
    await riskyOperation();
} catch (error) {
    console.error('Error:', error);
}
```

### HTML/CSS

```html
<!-- Use semantic HTML -->
<section class="products-section">
    <h2>Products</h2>
    <article class="product-card">...</article>
</section>

<!-- Add ARIA labels for accessibility -->
<button aria-label="Close modal" onclick="closeModal()">
    <i class="fa-solid fa-xmark"></i>
</button>
```

```css
/* Use CSS variables */
:root {
    --primary: #FFD700;
    --accent: #00f2ff;
}

/* Organize CSS logically */
.product-card {
    /* Layout */
    display: flex;
    padding: 10px;
    
    /* Visual */
    background: var(--glass-bg);
    border-radius: 8px;
    
    /* Typography */
    font-size: 14px;
    
    /* Interaction */
    cursor: pointer;
    transition: all 0.3s;
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add AI price analysis
fix: resolve payment callback issue
docs: update README installation steps
style: format code with prettier
refactor: simplify product rendering logic
test: add unit tests for AI module
chore: update dependencies
```

---

## 🧪 Testing

### Manual Testing

```bash
# Start server
npm start

# Test in Pi Browser (Sandbox)
# Open: http://localhost:3000
```

### Test Checklist

- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms submit properly
- [ ] Pi authentication works
- [ ] Payment flow completes
- [ ] Mobile responsive
- [ ] No console errors

### Writing Tests (Future)

```javascript
// Example test structure
describe('Product Rendering', () => {
    test('should display products correctly', () => {
        const products = renderProducts();
        expect(products.length).toBeGreaterThan(0);
    });
});
```

---

## 📚 Documentation

### Code Documentation

```javascript
/**
 * Analyzes product images using AI
 * @param {Array<string>} images - Array of base64 encoded images
 * @param {string} description - User provided description
 * @returns {Object} AI analysis result
 */
async function analyzeProduct(images, description) {
    // Implementation
}
```

### README Updates

When adding features, update:
- Features list
- Usage examples
- API documentation
- Configuration options

---

## 🌟 Areas We Need Help

### High Priority

- [ ] Implement real AI integration (OpenAI, Claude)
- [ ] Add database integration (MongoDB/PostgreSQL)
- [ ] Build mobile app (React Native)
- [ ] Add more languages
- [ ] Improve test coverage

### Medium Priority

- [ ] Add analytics dashboard
- [ ] Implement referral system
- [ ] Add wishlist feature
- [ ] Create seller analytics
- [ ] Add product categories

### Low Priority

- [ ] Dark/Light theme toggle
- [ ] Add emoji reactions
- [ ] Create blog section
- [ ] Add social sharing

---

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Featured on our website
- Eligible for bounties (if applicable)

---

## 📞 Questions?

- **Discord**: [Join our community](https://discord.gg/forsale-ai)
- **Email**: dev@forsale-ai.com
- **GitHub Discussions**: Ask in discussions tab

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Forsale AI! 🚀

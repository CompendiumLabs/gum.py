# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`gum.py` is a Python wrapper for the `gum.js` visualization library. It allows you to programmatically generate JSX code from Python, which is then evaluated by a Node.js subprocess running `gum.js` to produce SVG or PNG output. The library supports terminal display (kitty image protocol) and Jupyter notebook rendering.

See `../gum.js/CLAUDE.md` for details on the underlying gum.js library and its component system.

## Commands

### Running from CLI

```bash
# Run a demo
python -m gum --demo plot --size 50 --theme dark

# Pipe JSX code from stdin
cat test.jsx | python -m gum

# CLI options:
# -d, --demo <name>   run a named demo (see dem.py DEMOS dict)
# -s, --size <size>   terminal display size (default: 50)
# -t, --theme <theme> theme: dark or light (default: dark)
```

### Python API

```python
import gum

# Display a component (terminal or Jupyter)
gum.display(element, size='80x25', theme='dark', format='svg')

# Evaluate JSX to SVG string
svg = gum.evaluate(element)

# Render to PNG bytes
png = gum.render(element, pixels=500)

# Run a demo
elem = gum.demo('plot')
```

## Architecture

### File Organization

- `gum/gum.py` - Core server interface and terminal display
- `gum/utl.py` - Base classes (Element, Group, Var, Con) and utilities
- `gum/gen.py` - Gum component wrappers (Plot, Box, Line, etc.)
- `gum/viz.py` - High-level plotting interface (lines, points, bars)
- `gum/dem.py` - Demo functions for each component type
- `gum/__main__.py` - CLI entry point

### Core Classes (utl.py)

**Element** - Base class for all components
- Stores `tag`, `unary`, and `args`
- `__str__()` generates JSX: `<Tag prop={value} />`
- `DisplayMixin` provides `_ipython_display_()` for Jupyter

**Group** - Container for child elements
- Converts children to JSX via `inner()`
- `DataGroup` - for data array children (Line, Points)
- `RawGroup` - for raw text children (Latex, Equation)

**Var** - Named variable with data
- Creates: `const name = [data]` in JSX preamble
- Supports arithmetic via `AlgMixin`: `x + y` → `(x)+(y)`

**Con** - Constant/expression reference
- References gum.js constants: `C.sin`, `C.blue`, `C.pi`
- Also supports arithmetic operations

### Server Interface (gum.py)

**GumUnixPipe** - Singleton Node.js subprocess manager
- Spawns `node gum.js/gum.js` with JSON-over-pipes protocol
- `evaluate(code)` → SVG string
- `render(code)` → PNG bytes (base64 decoded)
- Auto-restarts on connection close

### Component Wrappers (gen.py)

Python classes that generate JSX tags. Examples:
- `Plot(*children, xlim=..., grid=True)` → `<Plot xlim={...} grid={true}>...</Plot>`
- `SymLine(fy=C.sin)` → `<SymLine fy={sin} />`
- `Edge(from_='a', to='b')` → `<Edge from="a" to="b" />` (handles Python reserved words)

### High-Level API (viz.py)

Pandas-friendly plotting functions:
- `lines(dataframe)` - line plot from DataFrame columns
- `points(dataframe)` - scatter plot
- `bars(series)` - bar chart from Series

## Important Patterns

### JSX Generation

Python objects convert to JSX strings via `__str__()`:
```python
Plot(SymLine(fy=C.sin), xlim=(0, 2*C.pi))
# → <Plot xlim={[0, 2*pi]}>\n  <SymLine fy={sin} />\n</Plot>
```

### Variable System

Use `V` and `C` generators for symbolic expressions:
```python
from gum import V, C

# V creates named variables bound to data
x = V.theta(np.linspace(0, 2*np.pi, 100))  # const theta = [0, 0.063, ...]

# C creates constant references
C.sin, C.cos, C.pi, C.blue  # → sin, cos, pi, blue

# Arithmetic builds expression strings
C.sin(x) + 0.5  # → (sin)((theta))+(0.5)
```

### Prefix Splitting

Use `prefix_split()` to separate prefixed kwargs:
```python
line_args, plot_args = prefix_split('line', {'line_stroke': 'red', 'grid': True})
# line_args = {'stroke': 'red'}
# plot_args = {'grid': True}
```

### Data Handling

`GumData` wraps DataFrames for JSX generation:
```python
data = GumData.from_frame(df)
# data.index → Var for index column
# data[0], data[1], ... → Vars for each data column
# data.define() → const statements for preamble
```

### Top-Level Gum Object

`Gum(content, vars=[...])` combines variables and content:
```python
plot = Plot(SymLine(xvals=data.index, yvals=data[0]))
gum = Gum(plot, vars=data)
# str(gum) → "const index = [...]\nconst value_0 = [...]\n\nreturn <Plot>...</Plot>"
```

## Key Differences from gum.js

- Python uses `snake_case` for props (converted to `kebab-case` in JSX)
- Python `from_` kwarg becomes JSX `from` (reserved word handling)
- Data arrays are converted via `stringify()` which handles numpy/pandas types
- Lambda functions become JS arrow functions via `Fun` class

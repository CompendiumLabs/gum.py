<div align="center">
<img src="images/logo.png" alt="gum.py" width="500" />
<br/>
</div>

<div align="center">
<img src="images/nexus.svg" alt="nexus" width="250" />
<br/><br/>
</div>

A Python wrapper for [gum.jsx](https://github.com/CompendiumLabs/gum.jsx), a language for creating visualizations using a React-like JSX dialect that evaluates to SVG. Designed for general graphics, plots, graphs, and network diagrams. Automatically renders in IPython console and Jupyter notebooks.

Head to **[compendiumlabs.ai/gum](https://compendiumlabs.ai/gum)** for a live demo and documentation on the underlying `gum.jsx` library.

# Installation

```bash
pip install gum-jsx
```

Requires `node` to be installed for the `gum.jsx` backend. Set the `GUM_JSX_RUNTIME` environment variable to use a different runtime (e.g. `bun`).

# Usage

Create visualizations using Python syntax that generates JSX:

```python
import gum
from gum import C
from gum.gen import Plot, SymLine

# create a simple sine wave plot
plot = Plot(
    SymLine(fy=C.sin, xlim=(0, 2*C.pi), stroke=C.blue, stroke_width=2),
    ylim=(-1.5, 1.5), grid=True, margin=(0.2, 0.1), aspect=2
)

# display in terminal
gum.display(plot) # or just `plot` if you're in IPython or Jupyter

# or get the SVG string
svg = gum.evaluate(plot)

# or get the JSX code
jsx = str(plot)
```

If you're in IPython or Jupyter, you don't even need to call `display`. Just type `plot` and it will automatically display the visualization inline.

## Pandas Integration

Plot DataFrames directly with high-level functions:

```python
import pandas as pd
import numpy as np
from gum import lines, points, bars

# line plot from DataFrame
th = np.linspace(0, 2*np.pi, 100)
df = pd.DataFrame({ 'sin': np.sin(th), 'cos': np.cos(th) })
lines(df, margin=0.15)

# bar chart from Series
bars(pd.Series({'A': 3, 'B': 8, 'C': 5}))
```

## Symbolic Expressions

Use `C` for constants and `V` for variables:

```python
from gum import C, V

# C references gum.jsx constants and functions
C.sin, C.cos, C.pi, C.blue, C.red

# build symbolic expressions
decay = lambda x: C.exp(-x/2) * C.sin(3*x)

# V creates named variables bound to data
theta = V.theta(np.linspace(0, 2*np.pi, 100))
```

# CLI

Display gum visualizations directly in the terminal. Requires a terminal with kitty image support, such as `kitty` or `ghostty`.

```bash
# pipe JSX code
cat input.jsx | python -m gum

# run a built-in demo
python -m gum -d plot
```

CLI options:

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --size <size>` | Terminal display size | 50 |
| `-t, --theme <theme>` | Theme: `light` or `dark` | dark |
| `-b, --background <color>` | Background color | - |
| `-d, --demo <name>` | Run a named demo | - |

Available demos (see `gum/dem.py` for code): gum, element, group, box, stack, grid, points, rect, ellipse, line, shape, spline, text, latex, titleframe, slide, sympoints, symline, symshape, symspline, symfill, graph, plot, axis, barplot, node, edge, network, math, arrays, colors

# Components

Wraps all `gum.jsx` components. Key ones include:

**Core**: `Element`, `Group`, `Svg`

**Layout**: `Box`, `Frame`, `Stack`, `HStack`, `VStack`, `Grid`, `Points`

**Shapes**: `Rect`, `Ellipse`, `Circle`, `Line`, `Shape`, `Spline`

**Text**: `Text`, `TextFrame`, `Latex`, `Equation`, `TitleFrame`, `TextStack`, `Slide`

**Plotting**: `Plot`, `Graph`, `Axis`, `HAxis`, `VAxis`, `Bars`, `BarPlot`

**Symbolic**: `SymLine`, `SymPoints`, `SymShape`, `SymSpline`, `SymFill`, `SymField`

**Network**: `Node`, `Edge`, `Network`, `Arrow`, `ArrowHead`, `ArrowSpline`

See the [gum.jsx documentation](https://compendiumlabs.ai/gum/docs) for detailed component reference.

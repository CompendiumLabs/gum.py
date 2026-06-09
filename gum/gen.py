# gum generation

from .utl import Var, Con, Element as BaseElement, Group as BaseGroup, DataGroup, RawGroup, DisplayMixin

##
## gum constructors
##

class VarGen:
    def __getattr__(self, name):
        def generator(value):
            return Var(name, value)
        return generator

class ConGen:
    def __getattr__(self, name):
        return Con(name)

    def __call__(self, value):
        return Con(value)

# singleton instances
V = VarGen()
C = ConGen()

##
## context elements
##

class Context(BaseElement):
    def __init__(self, **args):
        super().__init__('Context', True, **args)

class Element(BaseElement):
    def __init__(self, tag='Element', unary=True, **args):
        super().__init__(tag, unary, **args)

class Group(BaseGroup):
    def __init__(self, *children, tag='Group', **args):
        super().__init__(*children, tag=tag, **args)

class Svg(BaseGroup):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='Svg', **args)

class Rectangle(BaseElement):
    def __init__(self, **args):
        super().__init__('Rectangle', True, **args)

class Spacer(BaseElement):
    def __init__(self, **args):
        super().__init__('Spacer', True, **args)

## layout elements

class Box(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='Box', **args)

class Frame(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='Frame', **args)

class Stack(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='Stack', **args)

class HStack(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='HStack', **args)

class HWrap(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='HWrap', **args)

class VStack(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='VStack', **args)

class Grid(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='Grid', **args)

class Points(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Points', **kwargs)

class Anchor(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Anchor', **kwargs)

class Attach(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Attach', **kwargs)

class Absolute(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Absolute', **kwargs)

## shape elements

class Rect(Element):
    def __init__(self, **kwargs):
        super().__init__('Rect', True, **kwargs)

class Ellipse(Element):
    def __init__(self, **kwargs):
        super().__init__('Ellipse', True, **kwargs)

class Line(DataGroup):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Line', **kwargs)

class UnitLine(DataGroup):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='UnitLine', **kwargs)

class CoordLine(DataGroup):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='CoordLine', **kwargs)

class Segments(Element):
    def __init__(self, **kwargs):
        super().__init__('Segments', True, **kwargs)

class Polygon(DataGroup):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Polygon', **kwargs)

class Shape(Polygon):
    pass

class Path(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Path', **kwargs)

class Spline(DataGroup):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Spline', **kwargs)

class RoundedRect(Element):
    def __init__(self, **kwargs):
        super().__init__('RoundedRect', True, **kwargs)

class RoundedLine(Element):
    def __init__(self, **kwargs):
        super().__init__('RoundedLine', True, **kwargs)

class Square(Element):
    def __init__(self, **kwargs):
        super().__init__('Square', True, **kwargs)

class Circle(Element):
    def __init__(self, **kwargs):
        super().__init__('Circle', True, **kwargs)

class Dot(Element):
    def __init__(self, **kwargs):
        super().__init__('Dot', True, **kwargs)

class Ray(Element):
    def __init__(self, **kwargs):
        super().__init__('Ray', True, **kwargs)

class HLine(Element):
    def __init__(self, **kwargs):
        super().__init__('HLine', True, **kwargs)

class VLine(Element):
    def __init__(self, **kwargs):
        super().__init__('VLine', True, **kwargs)

class Triangle(Element):
    def __init__(self, **kwargs):
        super().__init__('Triangle', True, **kwargs)

class Fill(Element):
    def __init__(self, **kwargs):
        super().__init__('Fill', True, **kwargs)

class VFill(Element):
    def __init__(self, **kwargs):
        super().__init__('VFill', True, **kwargs)

class HFill(Element):
    def __init__(self, **kwargs):
        super().__init__('HFill', True, **kwargs)

class Arc(Element):
    def __init__(self, **kwargs):
        super().__init__('Arc', True, **kwargs)

## text elements

class Span(RawGroup):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Span', **kwargs)

class TextLine(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='TextLine', **kwargs)

class Text(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Text', **kwargs)

class TextBox(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='TextBox', **kwargs)

class TextFrame(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='TextFrame', **kwargs)

class Latex(RawGroup):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Latex', **kwargs)

class Equation(Latex):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, **kwargs)

class TextStack(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='TextStack', **args)

class Bold(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='Bold', **args)

class Italic(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='Italic', **args)

class LabelBox(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='LabelBox', **args)

class TitleBox(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='TitleBox', **args)

class TitleFrame(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='TitleFrame', **args)

class Slide(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='Slide', **args)

## data elements

class SymPoints(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='SymPoints', **kwargs)

class SymLine(Element):
    def __init__(self, *children, **kwargs):
        super().__init__('SymLine', True, **kwargs)

class SymPoly(Element):
    def __init__(self, **kwargs):
        super().__init__('SymPoly', True, **kwargs)

class SymShape(SymPoly):
    pass

class SymSpline(Element):
    def __init__(self, **kwargs):
        super().__init__('SymSpline', True, **kwargs)

class SymFill(Element):
    def __init__(self, **kwargs):
        super().__init__('SymFill', True, **kwargs)

class SymField(Element):
    def __init__(self, **kwargs):
        super().__init__('SymField', True, **kwargs)

class Field(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Field', **kwargs)

## graph elements

class Graph(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Graph', **kwargs)

class Plot(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='Plot', **args)

class Axis(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Axis', **kwargs)

class HAxis(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='HAxis', **kwargs)

class VAxis(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='VAxis', **kwargs)

class Scale(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Scale', **kwargs)

class VScale(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='VScale', **kwargs)

class HScale(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='HScale', **kwargs)

class Label(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Label', **kwargs)

class HLabel(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='HLabel', **kwargs)

class VLabel(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='VLabel', **kwargs)

class Labels(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Labels', **kwargs)

class HLabels(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='HLabels', **kwargs)

class VLabels(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='VLabels', **kwargs)

class OuterLabel(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='OuterLabel', **kwargs)

class Mesh(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Mesh', **kwargs)

class HMesh(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='HMesh', **kwargs)

class VMesh(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='VMesh', **kwargs)

class Mesh2D(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Mesh2D', **kwargs)

class Legend(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Legend', **kwargs)

##
## bar elements
##

class Bar(Element):
    def __init__(self, **kwargs):
        super().__init__('Bar', True, **kwargs)

class VBar(Element):
    def __init__(self, **kwargs):
        super().__init__('VBar', True, **kwargs)

class HBar(Element):
    def __init__(self, **kwargs):
        super().__init__('HBar', True, **kwargs)

class Bars(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Bars', **kwargs)

class VBars(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='VBars', **kwargs)

class HBars(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='HBars', **kwargs)

class BarPlot(Group):
    def __init__(self, *children, **args):
        super().__init__(*children, tag='BarPlot', **args)

## network elements

class ArrowHead(Element):
    def __init__(self, **kwargs):
        super().__init__('ArrowHead', True, **kwargs)

class Arrow(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Arrow', **kwargs)

class ArrowSpline(Arrow):
    pass

class Node(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Node', **kwargs)

class Edge(Element):
    def __init__(self, **kwargs):
        if 'from_' in kwargs:
            kwargs['from'] = kwargs.pop('from_')
        super().__init__('Edge', True, **kwargs)

class Network(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Network', **kwargs)

## math elements

class MathSpan(RawGroup):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='MathSpan', **kwargs)

class MathSymbol(RawGroup):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='MathSymbol', **kwargs)

class MathSpacer(Element):
    def __init__(self, **kwargs):
        super().__init__('MathSpacer', True, **kwargs)

class MathRow(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='MathRow', **kwargs)

class MathCol(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='MathCol', **kwargs)

class MathBox(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='MathBox', **kwargs)

class MathRule(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='MathRule', **kwargs)

class MathText(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='MathText', **kwargs)

class SupSub(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='SupSub', **kwargs)

class Frac(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Frac', **kwargs)

class Sqrt(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Sqrt', **kwargs)

class Accent(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Accent', **kwargs)

class Bracket(Group):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Bracket', **kwargs)

class Tex(RawGroup):
    def __init__(self, *children, **kwargs):
        super().__init__(*children, tag='Tex', **kwargs)

## image elements

class PngImage(Element):
    def __init__(self, **kwargs):
        super().__init__('PngImage', True, **kwargs)

class SvgImage(Element):
    def __init__(self, **kwargs):
        super().__init__('SvgImage', True, **kwargs)

##
## dataframe notion
##

def ensure_var(var, name=None):
    import numpy as np
    import pandas as pd
    if isinstance(var, (np.ndarray, list, tuple)):
        var = pd.Series(var)
    elif isinstance(var, pd.Index):
        var = var.to_series()
    if isinstance(var, pd.Series):
        var = Var.from_series(var, name=name)
    elif not isinstance(var, Var):
        raise ValueError(f'Unsupported type: {type(var)}')
    return var

class GumData:
    def __init__(self, data, index=None):
        self.index = ensure_var(index, name='index')
        self._data = [ ensure_var(v, name=f'value_{i}') for i, v in enumerate(data) ]

    @classmethod
    def from_frame(cls, frame):
        data = [ frame[col] for col in frame ]
        return cls(data, index=frame.index)

    @classmethod
    def from_series(cls, series):
        return cls([ series ], index=series.index)

    def __iter__(self):
        return iter(self._data)

    def __len__(self):
        return len(self._data)

    def __getitem__(self, name):
        return self._data[name]

    def __setitem__(self, name, value):
        self._data[name] = ensure_var(value, name=name)

    def define(self):
        return '\n'.join([ v.define() for v in [ self.index, *self._data ] ])

##
## top level
##

class Gum(DisplayMixin):
    def __init__(self, cont, vars=None):
        if vars is None:
            vars = []
        elif not isinstance(vars, (tuple, list)):
            vars = [ vars ]
        self.vars = vars
        self.content = cont

    def __str__(self):
        header = '\n'.join([ v.define() for v in self.vars ])
        if len(header) > 0:
            return f'{header}\n\nreturn {self.content}'
        else:
            return str(self.content)

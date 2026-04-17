# main entry point

import sys
import argparse
from .dem import demo, DEMOS
from .gum import display

if __name__ == '__main__':
    # parse command line arguments
    parser = argparse.ArgumentParser(
        description='evaluate gum.jsx code from stdin and display in terminal',
        epilog='Example: cat input.jsx | python -m gum',
    )
    parser.add_argument('-s', '--size', type=int, help='display size (rows)', default=(1500, 1000))
    parser.add_argument('-t', '--theme', type=str, help='theme to use', default='dark')
    parser.add_argument('-b', '--background', type=str, help='background color', default=None)
    parser.add_argument('-d', '--demo', type=str, help=f'run demo code ({", ".join(DEMOS.keys())})', default=None)
    args = parser.parse_args()

    # dispatch commands
    code = demo(args.demo) if args.demo is not None else sys.stdin.read()
    display(code, size=args.size, theme=args.theme, background=args.background)

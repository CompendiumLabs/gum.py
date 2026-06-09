# terminal tools

import io
import os
import json
import base64
import shutil
import threading
import subprocess
from PIL import Image

##
## image handling
##

def decode_png(dat):
    img = Image.open(io.BytesIO(dat))
    img.load()
    return img

def encode_png(img):
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()

##
## error handling
##

class GumErrorType:
    PARSE = 'PARSE'
    NOCODE = 'NOCODE'
    NORETURN = 'NORETURN'
    NOELEMENT = 'NOELEMENT'

class GumError(Exception):
    def __init__(self, error_type, error_message):
        self.error_type = error_type
        self.error_message = error_message
        super().__init__(self.error_message)

##
## server interface
##

LIB_PATH = os.path.dirname(__file__)
GUM_PATH = os.path.join(LIB_PATH, 'js/pipe.ts')

# environment variables
RUN_ENV = 'GUM_JSX_RUNTIME'
RUN_DEFAULT = 'bun'

class GumUnixPipe:
    def __init__(self):
        self.proc = None
        self.debug = True
        self._pump_thread = None
        self.init()

    def __del__(self):
        self.close()

    def init(self):
        # get javascript runtime
        runtime = os.environ.get(RUN_ENV) or RUN_DEFAULT
        if shutil.which(runtime) is None:
            raise ValueError(
                f'"{runtime}" not found in PATH ({RUN_ENV}={os.environ.get(RUN_ENV)})'
            )

        # start server process
        self.proc = subprocess.Popen(
            [ runtime, GUM_PATH ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )

        # pump stderr to stdout
        self._start_pump_loop()

    def _start_pump_loop(self):
        def pump_loop():
            for line in self.proc.stderr:
                if self.debug:
                    print(f'[gum server] {line}')
        self._pump_thread = threading.Thread(target=pump_loop, daemon=True)
        self._pump_thread.start()

    def post(self, use_pil=True, **request):
        # ensure server
        if self.proc is None:
            self.init()

        # check if stdin is closed
        if self.proc.poll() is not None:
            raise ValueError('[gum server] server exited')

        # encode PIL image if needed
        if isinstance(data := request['data'], Image.Image):
            request['data'] = encode_png(data) if use_pil else data

        # encode base64 if needed
        if isinstance(data := request['data'], bytes):
            request['data'] = base64.b64encode(data).decode()

        # send request
        request1 = { k: v for k, v in request.items() if v is not None }
        self.proc.stdin.write(json.dumps(request1) + '\n')
        self.proc.stdin.flush()

        # get reply
        reply = self.proc.stdout.readline()
        if reply == '':
            raise ValueError('[gum server] connection closed')

        # read response
        response = json.loads(reply)
        ok, result = response['ok'], response['result']

        # check for errors
        if not ok:
            etype = result['error']
            emsg = result['message']
            raise GumError(etype, emsg)

        # decode base64 if needed
        if request.get('output_format') == 'png':
            result = base64.b64decode(result)
            result = decode_png(result) if use_pil else result

        # return response
        return result

    def close(self):
        if self.proc is not None:
            self.proc.stdin.close()
            self.proc.wait(timeout=1)
            self.proc = None
        self._pump_thread = None

    def restart(self):
        self.close()
        self.init()

##
## server instance
##

# singleton server instance
server = GumUnixPipe()

def restart():
    server.restart()

def set_debug(debug=True):
    server.debug = debug

def evaluate(jsx, size=(1500, 1000), **kwargs):
    return server.post(data=str(jsx), size=size, **kwargs)

def display(jsx, theme='dark', **kwargs):
    data = evaluate(jsx, theme=theme, **kwargs)
    print(data)

def display_svg(svg, **kwargs):
    data = server.post(data=svg, input_format='svg', **kwargs)
    print(data)

def display_png(png, **kwargs):
    data = server.post(data=png, input_format='png', **kwargs)
    print(data)

def readtext(path):
    with open(path, 'r') as fid:
        return fid.read()

def display_file(path, **kwargs):
    code = readtext(path)
    display(code, **kwargs)

import http.server
import socketserver
import json
import base64
import os

PORT = 8000
DIR = "prueba"

if not os.path.exists(DIR):
    os.makedirs(DIR)

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/save':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                filename = data.get('filename')
                image_b64 = data.get('image')
                
                if filename and image_b64:
                    image_data = base64.b64decode(image_b64)
                    filepath = os.path.join(DIR, filename)
                    with open(filepath, 'wb') as f:
                        f.write(image_data)
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'text/plain')
                    self.end_headers()
                    self.wfile.write(b"OK")
                else:
                    self.send_response(400)
                    self.end_headers()
            except Exception as e:
                print(f"Error: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Servidor iniciado. Abre http://localhost:{PORT} en tu navegador.")
    print(f"Las imagenes se guardaran de forma silenciosa en la carpeta '{DIR}'")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

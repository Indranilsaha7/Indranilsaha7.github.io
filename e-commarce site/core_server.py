import http.server, socketserver, os, socket, sys 
class MyHandler(http.server.SimpleHTTPRequestHandler): 
    def do_GET(self): 
        index_page = sys.argv[4] 
        if self.path == f'/{index_page}': 
            self.send_response(301) 
            self.send_header('Location', '/') 
            self.end_headers() 
            return 
        if self.path == '/': 
            self.path = f'/{index_page}' 
            return super().do_GET() 
        for ext in ['.html', '.png', '.js']: 
            if self.path.endswith(ext): 
                self.send_response(301) 
                self.send_header('Location', self.path[:-len(ext)]) 
                self.end_headers() 
                return 
        f = self.translate_path(self.path) 
        if not os.path.exists(f): 
            for ext in ['.html', '.png', '.js']: 
                if os.path.exists(f + ext): 
                    self.path += ext 
                    break 
        return super().do_GET() 
if __name__ == '__main__': 
    domain = sys.argv[1] 
    bind_host = sys.argv[2] 
    port = int(sys.argv[3]) 
    print("\n==================================================") 
    print(f"  BCSdevloper™ ENGINE RUNNING: {domain}") 
    print("==================================================") 
    if port == 80: 
        print(f"PC Domain: http://{domain}") 
    else: 
        print(f"PC Domain: http://{domain}:{port}") 
    if bind_host == "0.0.0.0": 
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) 
        try: 
            s.connect(("8.8.8.8", 80)) 
            ip = s.getsockname()[0] 
        except Exception: 
            ip = "UNKNOWN" 
        finally: 
            s.close() 
        if port == 80: 
            print(f"Wi-Fi Devices type this: http://{ip}") 
        else: 
            print(f"Wi-Fi Devices type this: http://{ip}:{port}") 
    socketserver.TCPServer((bind_host, port), MyHandler).serve_forever() 

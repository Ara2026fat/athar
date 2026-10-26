import sys,http.server,os
port=int(sys.argv[1]);sw=sys.argv[2]
R='/home/claude/athar';P=R+'/next/perf'
class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self,path):
        p=path.split('?')[0]
        if p=='/offline-home.html':return P+'/offline-home.html'
        if p=='/sw-test.js':return P+'/'+sw
        if p=='/valley/next-offline.html':return P+'/valley-offline.html'
        if p=='/valley/sw-test.js':return P+'/'+sw
        return http.server.SimpleHTTPRequestHandler.translate_path(self,path)
    def end_headers(self):
        self.send_header('Service-Worker-Allowed','/');self.send_header('Cache-Control','no-store');super().end_headers()
    def log_message(self,*a):pass
os.chdir(R)
http.server.ThreadingHTTPServer(('127.0.0.1',port),H).serve_forever()

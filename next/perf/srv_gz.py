import sys,http.server,os,gzip,io,mimetypes
port=int(sys.argv[1]);R='/home/claude/athar';cache={}
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        p=self.translate_path(self.path)
        if self.path.split('?')[0]=='/__home-headmove.html':p='/home/claude/athar/next/perf/home-headmove.html'
        if os.path.isfile(p) and 'gzip' in self.headers.get('Accept-Encoding','') and p.split('.')[-1] in ('html','js','css','json','svg'):
            mt=os.path.getmtime(p)
            if p not in cache or cache[p][0]!=mt:
                cache[p]=(mt,gzip.compress(open(p,'rb').read(),6))
            d=cache[p][1];ct=mimetypes.guess_type(p)[0] or 'text/plain'
            self.send_response(200);self.send_header('Content-Type',ct+('; charset=utf-8' if ct.startswith('text') or 'javascript' in ct else ''));self.send_header('Content-Encoding','gzip');self.send_header('Content-Length',str(len(d)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(d);return
        return super().do_GET()
    def log_message(self,*a):pass
os.chdir(R)
http.server.ThreadingHTTPServer(('127.0.0.1',port),H).serve_forever()

import subprocess
JS_C="const z=require('zlib');const b=[];process.stdin.on('data',d=>b.push(d)).on('end',()=>process.stdout.write(z.brotliCompressSync(Buffer.concat(b),{params:{[z.constants.BROTLI_PARAM_QUALITY]:11,[z.constants.BROTLI_PARAM_LGWIN]:22}})))"
JS_D="const z=require('zlib');const b=[];process.stdin.on('data',d=>b.push(d)).on('end',()=>process.stdout.write(z.brotliDecompressSync(Buffer.concat(b))))"
def compress(data, mode=0, quality=11, lgwin=22, lgblock=0):
    return subprocess.run(["node","-e",JS_C],input=bytes(data),capture_output=True,check=True).stdout
def decompress(data):
    return subprocess.run(["node","-e",JS_D],input=bytes(data),capture_output=True,check=True).stdout
MODE_GENERIC=0;MODE_TEXT=1;MODE_FONT=2

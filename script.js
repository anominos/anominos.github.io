var Code = document.getElementById("bfCode");

window.addEventListener("input", function(event) {
    updateLineNo(Code.value);
});


function updateLineNo(code){
    let lineNoTxt="1.\n";
    let c=2;
    for(let i of code){
        if(i=="\n"){
            lineNoTxt+=c+".\n";
            c++;
        }
    }
    document.getElementById("lineNo").innerHTML = lineNoTxt;
}

function brainfuckToJS(code){
    compiled = "var arr = new Uint8Array(30000);var index=0;";
    code = code.matchAll(/([\+\-\<\>\[\]\.\,])\1*/g);
    for(instruc of code){
        instruc=instruc[0]
        if(instruc[0]==="+"){
            compiled+="arr[index]+="+instruc.length+";";
        }
        else if(instruc[0]==="-"){
            compiled+="arr[index]-="+instruc.length+";";
        }
        else if(instruc[0]===">"){
            compiled+="index+="+instruc.length+";";
        }
        else if(instruc[0]==="<"){
            compiled+="index-="+instruc.length+";";
        }
        else if(instruc[0]==="."){
            compiled+="postMessage(String.fromCharCode(arr[index]).repeat("+instruc.length+"));";
        }
        else if(instruc[0]===","){
            compiled+=instruc.length>1?"for(let count=0;count<"+instruc.length+";count++){arr[index]=promptInput();}":"arr[index]=promptInput();";
        }
        else if(instruc[0]==="["){
            for(let c=0;c<instruc.length;c++){
                compiled+="while(arr[index]!==0){";
            }
        }
        else if(instruc[0]==="]"){
            for(let c=0;c<instruc.length;c++){
                compiled+="}";
            }
        }
    }
    compiled+="postMessage(arr);";
    return compiled;
}

function runBrainfuck(code){
    var compiled = brainfuckToJS(code);
    window.URL = window.URL || window.webkitURL;
    var blob;
    try {
        blob = new Blob([compiled], {type: 'application/javascript'});
    } catch (e) {
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(compiled);
        blob = blob.getBlob();
    }
    var worker = new Worker(URL.createObjectURL(blob));
    worker.onmessage = function(e){
        if (typeof e.data == "object"){
            let outHex = "";
            let c=0;
            for(let twoByte of e.data){
                if(c%8==0){
                    let b=c.toString(16);
                    outHex+="0".repeat(4-b.length)+b+" ";
                }
                let a = twoByte.toString(16);
                outHex += (a.length===1?"0":"") +a + " ";
                c++;
            }
            document.getElementById("arrOut").innerHTML=outHex;
        }
        else if (typeof e.data == "string"){
            document.getElementById("output").innerHTML+=e.data;
        }
    }
}
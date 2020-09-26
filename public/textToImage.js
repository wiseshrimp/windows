let getLines =  (ctx, text, maxWidth) => {
    var words = text.split(" ")
    var lines = []
    var currentLine = words[0]

    for (var i = 1; i < words.length; i++) {
        var word = words[i]
        var width = ctx.measureText(currentLine + " " + word).width
        if (width < maxWidth) {
            currentLine += " " + word
        } else {
            lines.push(currentLine)
            currentLine = word
        }
    }
    lines.push(currentLine)
    return lines
}

let canvas = document.getElementById('canvas')


let textConfig = (fontSize = 30) =>{
  let width  = canvas.width
  let height = canvas.height
  let fontSpace = fontSize + 10
  let heightCutOff = (height - fontSpace) * 0.75
  
  
  return {
    width  : width,
    height : height,
    fontSize : fontSize,
    fontSpace : fontSize+10,
    heightCutOff : (height - fontSpace) * 0.75
  }
}

let textToImage = text => {
    let textSettings = textConfig()
    let canvasEl = document.getElementById('textToImage')
    let ctx = canvasEl.getContext('2d')
    // ctx.fillStyle = '#333';
    // ctx.fillRect(0, 0, textSettings.width, textSettings.height);
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'black';
    ctx.font = `${textSettings.fontSize}px Courier`;
    let margin =  0

    let textArr = getLines(ctx,text, textSettings.width * 0.75    )
    console.log(textArr.length)

    if( textArr.length >= 6 ){
        textSettings = textConfig(30);
        ctx.font = `${textSettings.fontSize}px Courier`;
      
        textArr = getLines(ctx,text, textSettings.width * 0.75    );
          
      } else if( textArr.length >= 5 ){
        
        textSettings = textConfig(40);
        ctx.font = `${textSettings.fontSize}px Courier`;
      
        textArr = getLines(ctx,text, textSettings.width * 0.75    );
        
      } else if( textArr.length <= 5 ){
        
        textSettings = textConfig(45);
        ctx.font = `${textSettings.fontSize}px Courier`;
      
        textArr = getLines(ctx,text, textSettings.width * 0.75    );
        
      }

    for (t in textArr){
      let multipler = parseInt(t)+1;
      let yCoord = textSettings.fontSpace * multipler;
      let topMargin = (textSettings.heightCutOff - yCoord) /2;
      if(yCoord <= textSettings.heightCutOff){
          ctx.fillText(textArr[t], (margin/2), yCoord);
      }
    }
    var img = new Image()
    let imgXCoord = canvasEl.width 
    let imgYCoord = canvasEl.height 
    console.log(canvasEl.width)
    ctx.drawImage(img,imgXCoord ,imgYCoord, 0, 0)
    img.src = canvasEl.toDataURL()
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height); 
    return img
}






